/**
 * Manufacturing ERP / MES Microservice — Service Template
 */

const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server: SocketIO } = require('socket.io');
const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
const { calculateProductCost, runMRPForOrder, updateMachineStatus } = require('./functions');

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));

const server = http.createServer(app);
const io = new SocketIO(server, {
  cors: { origin: '*' },
});

const DB_PATH = path.join(__dirname, 'db.sqlite');
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ─── Health ─────────────────────────────────────────────────

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    tenantId: RESTAURANT_ID,
    templateType: TEMPLATE_TYPE,
    uptime: process.uptime(),
  });
});

// ─── Analytics ──────────────────────────────────────────────

app.get('/analytics/summary', (req, res) => {
  // Mock response for agency core dashboard
  res.json({
    ordersCount: db.prepare('SELECT COUNT(*) as count FROM production_orders').get().count,
    revenue: db.prepare('SELECT COALESCE(SUM(total_amount), 0) as total FROM sales_orders WHERE status = "Confirmed"').get().total,
    tableTurnover: 'N/A'
  });
});

// ─── Products & BOM ─────────────────────────────────────────

app.get('/api/products', (req, res) => {
  const products = db.prepare('SELECT * FROM products').all();
  res.json(products);
});

app.post('/api/products', (req, res) => {
  const { product_code, name, category_id, unit, cost, selling_price, description } = req.body;
  const result = db.prepare(
    'INSERT INTO products (product_code, name, category_id, unit, cost, selling_price, description) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(product_code, name, category_id, unit, cost, selling_price, description);
  res.json({ id: result.lastInsertRowid });
});

app.get('/api/products/:id/cost', (req, res) => {
  const cost = calculateProductCost(db, req.params.id);
  res.json({ productId: req.params.id, totalCost: cost });
});

app.get('/api/bom/:productId', (req, res) => {
    const header = db.prepare('SELECT * FROM bom_headers WHERE product_id = ? AND is_active = 1').get(req.params.productId);
    if (!header) return res.status(404).json({ error: 'BOM not found' });
    const items = db.prepare('SELECT b.*, p.name as component_name FROM bom_items b JOIN products p ON b.component_id = p.id WHERE b.bom_header_id = ?').all(header.id);
    res.json({ header, items });
});

// ─── Production & MES ───────────────────────────────────────

app.get('/api/production-orders', (req, res) => {
  const orders = db.prepare('SELECT po.*, p.name as product_name FROM production_orders po JOIN products p ON po.product_id = p.id').all();
  res.json(orders);
});

app.post('/api/production-orders', (req, res) => {
  const { product_id, quantity, start_date, end_date } = req.body;
  const result = db.prepare(
    'INSERT INTO production_orders (product_id, quantity, start_date, end_date) VALUES (?, ?, ?, ?)'
  ).run(product_id, quantity, start_date, end_date);
  res.json({ id: result.lastInsertRowid });
});

app.get('/api/production-orders/:id/mrp', (req, res) => {
  const shortages = runMRPForOrder(db, req.params.id);
  res.json(shortages);
});

app.get('/api/machines', (req, res) => {
  const machines = db.prepare('SELECT * FROM machines').all();
  res.json(machines);
});

app.post('/api/machines/:id/status', (req, res) => {
  const { status, notes } = req.body;
  updateMachineStatus(db, req.params.id, status, notes);
  io.emit('machine:statusChanged', { machineId: req.params.id, status });
  res.json({ success: true });
});

// ─── Inventory ──────────────────────────────────────────────

app.get('/api/inventory', (req, res) => {
  const items = db.prepare(`
    SELECT i.*, p.name as product_name, p.product_code, w.name as warehouse_name
    FROM inventory_items i
    JOIN products p ON i.product_id = p.id
    JOIN warehouses w ON i.warehouse_id = w.id
  `).all();
  res.json(items);
});

// ─── Socket.IO ──────────────────────────────────────────────

io.on('connection', (socket) => {
  console.log('Client connected to MES-ERP socket');
});

// ─── Start Server ───────────────────────────────────────────

server.listen(PORT, () => {
  console.log(`  🏭  Manufacturing ERP ${RESTAURANT_ID} running on port ${PORT}`);
});
