/**
 * MES/ERP Microservice — Service Template
 * ═══════════════════════════════════════════
 */

const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server: SocketIO } = require('socket.io');
const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));

const server = http.createServer(app);
const io = new SocketIO(server, { cors: { origin: '*' } });

const DB_PATH = path.join(__dirname, 'db.sqlite');
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ─── MES Business Logic & Helpers ───────────────────────────

// MRP Calculation Helper
function calculateMRP(itemId, requiredQty) {
    const components = db.prepare('SELECT component_item_id, quantity FROM bom WHERE parent_item_id = ?').all(itemId);
    const requirements = [];

    for (const comp of components) {
        const needed = comp.quantity * requiredQty;
        const stock = db.prepare('SELECT quantity FROM inventory WHERE item_id = ?').get(comp.component_item_id)?.quantity || 0;
        requirements.push({
            item_id: comp.component_item_id,
            required: needed,
            available: stock,
            shortfall: Math.max(0, needed - stock)
        });
    }
    return requirements;
}

// ─── API Routes ─────────────────────────────────────────────

app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'mes-erp', tenantId: TENANT_ID, uptime: process.uptime() });
});

// Items & BOM
app.get('/items', (req, res) => {
    const items = db.prepare('SELECT * FROM items').all();
    res.json(items);
});

app.get('/items/:id/bom', (req, res) => {
    const components = db.prepare(`
        SELECT b.*, i.name, i.sku, i.unit
        FROM bom b
        JOIN items i ON b.component_item_id = i.id
        WHERE b.parent_item_id = ?
    `).all(req.params.id);
    res.json(components);
});

// Sales & Production Workflow
app.get('/sales-orders', (req, res) => {
    const orders = db.prepare('SELECT * FROM sales_orders ORDER BY created_at DESC').all();
    res.json(orders);
});

app.post('/sales-orders', (req, res) => {
    const { customer_name, items, delivery_date } = req.body;
    const order_number = 'SO-' + Date.now().toString(36).toUpperCase();

    const result = db.transaction(() => {
        const so = db.prepare('INSERT INTO sales_orders (order_number, customer_name, delivery_date) VALUES (?, ?, ?)')
            .run(order_number, customer_name, delivery_date);

        for (const item of items) {
            db.prepare('INSERT INTO sales_order_items (sales_order_id, item_id, quantity, unit_price, total_price) VALUES (?, ?, ?, ?, ?)')
                .run(so.lastInsertRowid, item.item_id, item.quantity, item.unit_price, item.quantity * item.unit_price);
        }
        return so.lastInsertRowid;
    })();

    res.json({ id: result, order_number });
});

app.get('/work-orders', (req, res) => {
    const wos = db.prepare(`
        SELECT w.*, i.name as item_name, i.sku
        FROM work_orders w
        JOIN items i ON w.item_id = i.id
        ORDER BY w.priority DESC, w.created_at ASC
    `).all();
    res.json(wos);
});

app.post('/work-orders', (req, res) => {
    const { item_id, quantity, sales_order_id, priority } = req.body;
    const wo_number = 'WO-' + Date.now().toString(36).toUpperCase();

    const result = db.prepare('INSERT INTO work_orders (wo_number, item_id, quantity, sales_order_id, priority) VALUES (?, ?, ?, ?, ?)')
        .run(wo_number, item_id, quantity, sales_order_id || null, priority || 1);

    res.json({ id: result.lastInsertRowid, wo_number });
});

app.put('/work-orders/:id/status', (req, res) => {
    const { status } = req.body;
    db.prepare('UPDATE work_orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(status, req.params.id);

    if (status === 'Completed') {
        const wo = db.prepare('SELECT item_id, quantity FROM work_orders WHERE id = ?').get(req.params.id);
        db.prepare('UPDATE inventory SET quantity = quantity + ? WHERE item_id = ?').run(wo.quantity, wo.item_id);
    }

    res.json({ success: true });
});

// MRP & AI Stubs
app.get('/mrp/calculate/:itemId', (req, res) => {
    const qty = req.query.qty || 1;
    const requirements = calculateMRP(req.params.itemId, qty);
    res.json({ itemId: req.params.itemId, quantity: qty, requirements });
});

app.get('/ai/demand-forecasting', (req, res) => {
    // Stub: Return mock forecasting data
    const forecast = [];
    const now = new Date();
    for (let i = 0; i < 6; i++) {
        const month = new Date(now.getFullYear(), now.getMonth() + i, 1);
        forecast.push({
            month: month.toLocaleString('default', { month: 'short' }),
            predicted_demand: 500 + Math.floor(Math.random() * 200),
            confidence: 0.85 + (Math.random() * 0.1)
        });
    }
    res.json(forecast);
});

app.get('/ai/predictive-maintenance', (req, res) => {
    const machines = db.prepare('SELECT id, name FROM machines').all();
    const predictions = machines.map(m => ({
        machine_id: m.id,
        machine_name: m.name,
        failure_probability: (Math.random() * 0.15).toFixed(4),
        recommended_maintenance: new Date(Date.now() + (Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
        status: 'Healthy'
    }));
    res.json(predictions);
});

// Inventory & Machines
app.get('/inventory', (req, res) => {
    const inv = db.prepare('SELECT i.*, it.name, it.sku, it.category FROM inventory i JOIN items it ON i.item_id = it.id').all();
    res.json(inv);
});

app.get('/machines', (req, res) => {
    const machines = db.prepare('SELECT * FROM machines').all();
    res.json(machines);
});

// ─── Socket.IO ──────────────────────────────────────────────
io.on('connection', (socket) => {
    console.log('Client connected to MES');
    socket.emit('status-update', { message: 'Connected to Manufacturing System' });
});

// ─── Start Server ───────────────────────────────────────────
server.listen(PORT, () => {
    console.log(`MES Service running on port ${PORT}`);
});
