/**
 * Warehouse Management & Operations System (WMOS) Microservice — Service Template
 * ══════════════════════════════════════════════════════════════════════════════
 * This file is copied per warehouse by the factory.
 * The factory injects RESTAURANT_ID (used as WAREHOUSE_ID) and PORT at the top.
 */

// ─── Dependencies ───────────────────────────────────────────

const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server: SocketIO } = require('socket.io');
const Database = require('better-sqlite3');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// ─── Setup ──────────────────────────────────────────────────

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}
app.use('/uploads', express.static(uploadsDir));

const server = http.createServer(app);
const io = new SocketIO(server, {
  cors: { origin: '*' },
});

const DB_PATH = path.join(__dirname, 'db.sqlite');
const CONFIG_PATH = path.join(__dirname, 'config.json');

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function readConfig() {
  return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
}

// ─── Schema Initialization ──────────────────────────────────
// (Included directly to keep the service self-contained)

function initializeSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS locations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL UNIQUE,
      type TEXT NOT NULL,
      zone TEXT,
      aisle TEXT,
      rack TEXT,
      shelf TEXT,
      bin TEXT,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sku TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      description TEXT,
      category TEXT,
      unit TEXT DEFAULT 'pcs',
      barcode TEXT,
      rfid_tag TEXT,
      weight REAL,
      dimensions TEXT,
      min_stock_level REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS inventory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_id INTEGER REFERENCES items(id),
      location_id INTEGER REFERENCES locations(id),
      quantity REAL NOT NULL DEFAULT 0,
      batch_number TEXT,
      expiry_date DATE,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(item_id, location_id, batch_number)
    );

    CREATE TABLE IF NOT EXISTS receipts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      receipt_number TEXT NOT NULL UNIQUE,
      supplier_name TEXT,
      status TEXT DEFAULT 'pending',
      received_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS receipt_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      receipt_id INTEGER REFERENCES receipts(id) ON DELETE CASCADE,
      item_id INTEGER REFERENCES items(id),
      expected_qty REAL NOT NULL,
      received_qty REAL DEFAULT 0,
      status TEXT DEFAULT 'pending'
    );

    CREATE TABLE IF NOT EXISTS shipments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      shipment_number TEXT NOT NULL UNIQUE,
      customer_name TEXT,
      destination_address TEXT,
      status TEXT DEFAULT 'pending',
      shipped_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS shipment_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      shipment_id INTEGER REFERENCES shipments(id) ON DELETE CASCADE,
      item_id INTEGER REFERENCES items(id),
      ordered_qty REAL NOT NULL,
      picked_qty REAL DEFAULT 0,
      status TEXT DEFAULT 'pending'
    );

    CREATE TABLE IF NOT EXISTS staff (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      pin TEXT NOT NULL,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      priority INTEGER DEFAULT 1,
      status TEXT DEFAULT 'pending',
      assigned_to INTEGER REFERENCES staff(id),
      item_id INTEGER REFERENCES items(id),
      from_location_id INTEGER REFERENCES locations(id),
      to_location_id INTEGER REFERENCES locations(id),
      quantity REAL,
      related_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      started_at DATETIME,
      completed_at DATETIME
    );

    CREATE TABLE IF NOT EXISTS docks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL UNIQUE,
      type TEXT NOT NULL,
      status TEXT DEFAULT 'available',
      current_vehicle_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS yard_spots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL UNIQUE,
      status TEXT DEFAULT 'empty',
      vehicle_id TEXT,
      trailer_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS labor_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      staff_id INTEGER REFERENCES staff(id),
      task_id INTEGER REFERENCES tasks(id),
      action TEXT,
      details TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS equipment (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      type TEXT,
      status TEXT DEFAULT 'available',
      last_maintenance DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS inventory_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_id INTEGER REFERENCES items(id),
      location_id INTEGER REFERENCES locations(id),
      change_qty REAL NOT NULL,
      type TEXT,
      reference_id INTEGER,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS forecasts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      target_date DATE NOT NULL,
      forecasted_value REAL NOT NULL,
      confidence_interval TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

initializeSchema();

// ─── Auth Middleware ────────────────────────────────────────

function authMiddleware(requiredRole) {
  return (req, res, next) => {
    const role = req.headers['x-role'];
    const pin = req.headers['x-pin'];
    const username = req.headers['x-username'];
    const config = readConfig();

    if (!role || !pin) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    let authenticated = false;

    if (config.pins[role] && config.pins[role] === pin.toString()) {
      authenticated = true;
    } else if (username) {
      const user = db.prepare('SELECT * FROM staff WHERE username = ? AND pin = ? AND role = ?').get(username, pin, role);
      if (user) {
        authenticated = true;
        req.staffName = user.name;
      }
    }

    if (!authenticated) {
      return res.status(401).json({ error: 'Invalid PIN or credentials' });
    }

    req.role = role;
    next();
  };
}

// ─── Items API ──────────────────────────────────────────────

app.get('/items', (req, res) => {
  const items = db.prepare('SELECT * FROM items ORDER BY sku').all();
  res.json(items);
});

app.get('/items/search', (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).json({ error: 'Search code required' });
  const item = db.prepare('SELECT * FROM items WHERE sku = ? OR barcode = ? OR rfid_tag = ?')
    .get(code, code, code);
  if (!item) return res.status(404).json({ error: 'Item not found' });
  res.json(item);
});

app.post('/items', authMiddleware('admin'), (req, res) => {
  const { sku, name, description, category, unit, barcode, rfid_tag, weight, dimensions, min_stock_level } = req.body;
  if (!sku || !name) return res.status(400).json({ error: 'SKU and Name are required' });

  try {
    const result = db.prepare(`
      INSERT INTO items (sku, name, description, category, unit, barcode, rfid_tag, weight, dimensions, min_stock_level)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(sku, name, description, category, unit, barcode, rfid_tag, weight, dimensions, min_stock_level);
    res.status(201).json({ id: result.lastInsertRowid, sku, name });
  } catch (err) {
    res.status(400).json({ error: 'SKU must be unique' });
  }
});

// ─── Locations API ──────────────────────────────────────────

app.get('/locations', (req, res) => {
  const locations = db.prepare('SELECT * FROM locations ORDER BY code').all();
  res.json(locations);
});

app.post('/locations', authMiddleware('admin'), (req, res) => {
  const { code, type, zone, aisle, rack, shelf, bin } = req.body;
  if (!code || !type) return res.status(400).json({ error: 'Code and Type are required' });

  try {
    const result = db.prepare(`
      INSERT INTO locations (code, type, zone, aisle, rack, shelf, bin)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(code, type, zone, aisle, rack, shelf, bin);
    res.status(201).json({ id: result.lastInsertRowid, code });
  } catch (err) {
    res.status(400).json({ error: 'Location code must be unique' });
  }
});

// ─── Inventory API ──────────────────────────────────────────

app.get('/inventory', (req, res) => {
  const inventory = db.prepare(`
    SELECT i.*, items.name as item_name, items.sku, l.code as location_code
    FROM inventory i
    JOIN items ON i.item_id = items.id
    JOIN locations l ON i.location_id = l.id
  `).all();
  res.json(inventory);
});

// ─── Receipts (Receiving) ───────────────────────────────────

app.get('/receipts', (req, res) => {
  const receipts = db.prepare('SELECT * FROM receipts ORDER BY created_at DESC').all();
  res.json(receipts);
});

app.post('/receipts', authMiddleware('staff'), (req, res) => {
  const { receipt_number, supplier_name, items } = req.body;
  if (!receipt_number) return res.status(400).json({ error: 'Receipt number is required' });

  const createReceipt = db.transaction(() => {
    const result = db.prepare('INSERT INTO receipts (receipt_number, supplier_name) VALUES (?, ?)')
      .run(receipt_number, supplier_name);
    const receiptId = result.lastInsertRowid;

    if (items && Array.isArray(items)) {
      const stmt = db.prepare('INSERT INTO receipt_items (receipt_id, item_id, expected_qty) VALUES (?, ?, ?)');
      for (const item of items) {
        stmt.run(receiptId, item.item_id, item.expected_qty);
      }
    }
    return receiptId;
  });

  try {
    const id = createReceipt();
    res.status(201).json({ id, receipt_number });
  } catch (err) {
    res.status(400).json({ error: 'Receipt number must be unique' });
  }
});

app.post('/receipts/:id/receive', authMiddleware('staff'), (req, res) => {
  const { items } = req.body; // Array of { item_id, received_qty, location_id }
  const receiptId = req.params.id;

  const receiveItems = db.transaction(() => {
    for (const entry of items) {
      // Update receipt_items
      db.prepare("UPDATE receipt_items SET received_qty = received_qty + ?, status = 'received' WHERE receipt_id = ? AND item_id = ?")
        .run(entry.received_qty, receiptId, entry.item_id);

      // Update inventory
      const existing = db.prepare('SELECT id, quantity FROM inventory WHERE item_id = ? AND location_id = ?')
        .get(entry.item_id, entry.location_id);

      if (existing) {
        db.prepare('UPDATE inventory SET quantity = quantity + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
          .run(entry.received_qty, existing.id);
      } else {
        db.prepare('INSERT INTO inventory (item_id, location_id, quantity) VALUES (?, ?, ?)')
          .run(entry.item_id, entry.location_id, entry.received_qty);
      }

      // Log movement
      db.prepare("INSERT INTO inventory_logs (item_id, location_id, change_qty, type, reference_id, notes) VALUES (?, ?, ?, 'receipt', ?, 'Received from shipment')")
        .run(entry.item_id, entry.location_id, entry.received_qty, receiptId);
    }

    db.prepare("UPDATE receipts SET status = 'received', received_at = CURRENT_TIMESTAMP WHERE id = ?").run(receiptId);
  });

  try {
    receiveItems();
    res.json({ message: 'Items received successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Shipments (Shipping & Packing) ─────────────────────────

app.get('/shipments', (req, res) => {
  const shipments = db.prepare('SELECT * FROM shipments ORDER BY created_at DESC').all();
  res.json(shipments);
});

app.post('/shipments', authMiddleware('staff'), (req, res) => {
  const { shipment_number, customer_name, destination_address, items } = req.body;
  if (!shipment_number) return res.status(400).json({ error: 'Shipment number is required' });

  const createShipment = db.transaction(() => {
    const result = db.prepare('INSERT INTO shipments (shipment_number, customer_name, destination_address) VALUES (?, ?, ?)')
      .run(shipment_number, customer_name, destination_address);
    const shipmentId = result.lastInsertRowid;

    if (items && Array.isArray(items)) {
      const stmt = db.prepare('INSERT INTO shipment_items (shipment_id, item_id, ordered_qty) VALUES (?, ?, ?)');
      for (const item of items) {
        stmt.run(shipmentId, item.item_id, item.ordered_qty);
      }
    }
    return shipmentId;
  });

  try {
    const id = createShipment();
    res.status(201).json({ id, shipment_number });
  } catch (err) {
    res.status(400).json({ error: 'Shipment number must be unique' });
  }
});

app.post('/shipments/:id/pack', authMiddleware('staff'), (req, res) => {
  db.prepare("UPDATE shipments SET status = 'packed' WHERE id = ?").run(req.params.id);
  res.json({ message: 'Shipment marked as packed' });
});

app.post('/shipments/:id/ship', authMiddleware('staff'), (req, res) => {
  db.prepare("UPDATE shipments SET status = 'shipped', shipped_at = CURRENT_TIMESTAMP WHERE id = ?").run(req.params.id);
  res.json({ message: 'Shipment marked as shipped' });
});

// ─── Returns API ────────────────────────────────────────────

app.post('/returns', authMiddleware('staff'), (req, res) => {
  const { item_id, location_id, quantity, notes } = req.body;
  if (!item_id || !location_id || !quantity) return res.status(400).json({ error: 'Item, Location, and Quantity required' });

  const processReturn = db.transaction(() => {
    // Update inventory
    const existing = db.prepare('SELECT id FROM inventory WHERE item_id = ? AND location_id = ?')
      .get(item_id, location_id);

    if (existing) {
      db.prepare('UPDATE inventory SET quantity = quantity + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        .run(quantity, existing.id);
    } else {
      db.prepare('INSERT INTO inventory (item_id, location_id, quantity) VALUES (?, ?, ?)')
        .run(item_id, location_id, quantity);
    }

    // Log movement
    db.prepare('INSERT INTO inventory_logs (item_id, location_id, change_qty, type, notes) VALUES (?, ?, ?, "return", ?)')
      .run(item_id, location_id, quantity, notes || 'Customer return');
  });

  try {
    processReturn();
    res.json({ message: 'Return processed successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Cycle Counting ─────────────────────────────────────────

app.post('/inventory/cycle-count', authMiddleware('staff'), (req, res) => {
  const { item_id, location_id, actual_qty, notes } = req.body;
  if (!item_id || !location_id || actual_qty === undefined) return res.status(400).json({ error: 'Item, Location, and Actual Quantity required' });

  const processCount = db.transaction(() => {
    const existing = db.prepare('SELECT id, quantity FROM inventory WHERE item_id = ? AND location_id = ?')
      .get(item_id, location_id);

    const oldQty = existing ? existing.quantity : 0;
    const diff = actual_qty - oldQty;

    if (existing) {
      db.prepare('UPDATE inventory SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        .run(actual_qty, existing.id);
    } else {
      db.prepare('INSERT INTO inventory (item_id, location_id, quantity) VALUES (?, ?, ?)')
        .run(item_id, location_id, actual_qty);
    }

    // Log adjustment
    db.prepare("INSERT INTO inventory_logs (item_id, location_id, change_qty, type, notes) VALUES (?, ?, ?, 'adjustment', ?)")
      .run(item_id, location_id, diff, notes || 'Cycle count adjustment');
  });

  try {
    processCount();
    res.json({ message: 'Cycle count updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Dock Management ────────────────────────────────────────

app.get('/docks', (req, res) => {
  const docks = db.prepare('SELECT * FROM docks').all();
  res.json(docks);
});

app.post('/docks/:id/assign', authMiddleware('staff'), (req, res) => {
  const { vehicle_id } = req.body;
  db.prepare("UPDATE docks SET status = 'occupied', current_vehicle_id = ? WHERE id = ?")
    .run(vehicle_id, req.params.id);
  res.json({ message: 'Vehicle assigned to dock' });
});

app.post('/docks/:id/release', authMiddleware('staff'), (req, res) => {
  db.prepare("UPDATE docks SET status = 'available', current_vehicle_id = NULL WHERE id = ?")
    .run(req.params.id);
  res.json({ message: 'Dock released' });
});

// ─── Yard Management ────────────────────────────────────────

app.get('/yard', (req, res) => {
  const spots = db.prepare('SELECT * FROM yard_spots').all();
  res.json(spots);
});

app.post('/yard/:id/assign', authMiddleware('staff'), (req, res) => {
  const { vehicle_id, trailer_id } = req.body;
  db.prepare("UPDATE yard_spots SET status = 'occupied', vehicle_id = ?, trailer_id = ? WHERE id = ?")
    .run(vehicle_id, trailer_id, req.params.id);
  res.json({ message: 'Vehicle assigned to yard spot' });
});

// ─── Task Management ────────────────────────────────────────

app.get('/tasks', (req, res) => {
  const tasks = db.prepare(`
    SELECT t.*, i.name as item_name, i.sku, fl.code as from_code, tl.code as to_code, s.name as staff_name
    FROM tasks t
    LEFT JOIN items i ON t.item_id = i.id
    LEFT JOIN locations fl ON t.from_location_id = fl.id
    LEFT JOIN locations tl ON t.to_location_id = tl.id
    LEFT JOIN staff s ON t.assigned_to = s.id
    ORDER BY t.priority DESC, t.created_at ASC
  `).all();
  res.json(tasks);
});

app.post('/tasks/:id/start', authMiddleware('staff'), (req, res) => {
  db.prepare("UPDATE tasks SET status = 'in_progress', started_at = CURRENT_TIMESTAMP WHERE id = ?")
    .run(req.params.id);
  res.json({ message: 'Task started' });
});

app.post('/tasks/:id/complete', authMiddleware('staff'), (req, res) => {
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });

  const completeTask = db.transaction(() => {
    db.prepare("UPDATE tasks SET status = 'completed', completed_at = CURRENT_TIMESTAMP WHERE id = ?")
      .run(req.params.id);

    // If it's a putaway or movement, update inventory
    if (task.type === 'putaway' || task.type === 'movement') {
      if (task.from_location_id) {
        db.prepare('UPDATE inventory SET quantity = quantity - ? WHERE item_id = ? AND location_id = ?')
          .run(task.quantity, task.item_id, task.from_location_id);
      }

      const existing = db.prepare('SELECT id FROM inventory WHERE item_id = ? AND location_id = ?')
        .get(task.item_id, task.to_location_id);

      if (existing) {
        db.prepare('UPDATE inventory SET quantity = quantity + ? WHERE id = ?')
          .run(task.quantity, existing.id);
      } else {
        db.prepare('INSERT INTO inventory (item_id, location_id, quantity) VALUES (?, ?, ?)')
          .run(task.item_id, task.to_location_id, task.quantity);
      }
    }
  });

  try {
    completeTask();
    res.json({ message: 'Task completed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Equipment Monitoring ───────────────────────────────────

app.get('/equipment', (req, res) => {
  const equipment = db.prepare('SELECT * FROM equipment').all();
  res.json(equipment);
});

app.post('/equipment/:id/status', authMiddleware('staff'), (req, res) => {
  const { status } = req.body;
  db.prepare('UPDATE equipment SET status = ? WHERE id = ?').run(status, req.params.id);
  res.json({ message: 'Equipment status updated' });
});

// ─── AI & Optimization ──────────────────────────────────────

app.get('/ai/optimize-picking', authMiddleware('staff'), (req, res) => {
  const { shipment_id } = req.query;
  if (!shipment_id) return res.status(400).json({ error: 'Shipment ID required' });

  // Get items to pick
  const items = db.prepare(`
    SELECT si.*, i.name as item_name, i.sku, l.code as location_code, l.aisle, l.rack, l.shelf
    FROM shipment_items si
    JOIN items i ON si.item_id = i.id
    JOIN inventory inv ON i.id = inv.item_id
    JOIN locations l ON inv.location_id = l.id
    WHERE si.shipment_id = ? AND inv.quantity > 0
  `).all(shipment_id);

  // Simple S-shape routing algorithm: sort by aisle, then rack, then shelf
  // This minimizes travel distance by following a logical path through the warehouse
  const optimized = items.sort((a, b) => {
    if (a.aisle !== b.aisle) return a.aisle.localeCompare(b.aisle);
    if (a.rack !== b.rack) return a.rack.localeCompare(b.rack);
    return a.shelf.localeCompare(b.shelf);
  });

  res.json({ shipment_id, route: optimized });
});

app.get('/ai/forecast-demand', authMiddleware('admin'), (req, res) => {
  // Mock demand forecasting logic using historical inventory logs
  const historicalData = db.prepare(`
    SELECT DATE(created_at) as date, SUM(ABS(change_qty)) as volume
    FROM inventory_logs
    WHERE type IN ('receipt', 'shipment')
    GROUP BY DATE(created_at)
    ORDER BY date DESC
    LIMIT 30
  `).all();

  // Simple moving average forecast for the next 7 days
  const avg = historicalData.length > 0
    ? historicalData.reduce((sum, d) => sum + d.volume, 0) / historicalData.length
    : 100; // default baseline

  const forecast = [];
  const today = new Date();
  for (let i = 1; i <= 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    forecast.push({
      date: date.toISOString().split('T')[0],
      forecasted_volume: Math.round(avg * (1 + (Math.random() * 0.2 - 0.1))), // baseline + noise
      confidence: 0.85
    });
  }

  res.json(forecast);
});

app.get('/ai/forecast-labor', authMiddleware('admin'), (req, res) => {
  // Forecast labor needs based on upcoming shipments and receipts
  const pendingReceipts = db.prepare("SELECT COUNT(*) as count FROM receipts WHERE status = 'pending'").get();
  const pendingShipments = db.prepare("SELECT COUNT(*) as count FROM shipments WHERE status = 'pending'").get();

  const totalTasks = (pendingReceipts.count * 5) + (pendingShipments.count * 3); // weight factors
  const staffNeeded = Math.ceil(totalTasks / 20); // assume 20 tasks per staff per shift

  res.json({
    date: new Date().toISOString().split('T')[0],
    pending_receipts: pendingReceipts.count,
    pending_shipments: pendingShipments.count,
    estimated_labor_hours: totalTasks,
    recommended_staff_count: Math.max(staffNeeded, 2),
    confidence: 0.9
  });
});

// ─── Analytics Summary (for Agency Dashboard) ───────────────

app.get('/analytics/summary', (req, res) => {
  const inventoryCount = db.prepare('SELECT COUNT(*) as count FROM items').get().count;
  const pendingTasks = db.prepare("SELECT COUNT(*) as count FROM tasks WHERE status = 'pending'").get().count;
  const activeDocks = db.prepare("SELECT COUNT(*) as count FROM docks WHERE status = 'occupied'").get().count;

  res.json({
    inventoryCount,
    pendingTasks,
    activeDocks,
    ordersCount: pendingTasks, // mapping for dashboard
    revenue: inventoryCount, // mapping for dashboard
    tableTurnover: `${activeDocks} Docks`, // mapping for dashboard
  });
});

// ─── Health ─────────────────────────────────────────────────

app.get('/health', (req, res) => {
  const config = readConfig();
  res.json({
    status: 'ok',
    warehouseId: RESTAURANT_ID,
    name: config.name,
    type: 'warehouse',
    uptime: process.uptime(),
  });
});

// ─── Socket.IO ──────────────────────────────────────────────

io.on('connection', (socket) => {
  socket.join('warehouse');
  console.log('Client connected to warehouse:', RESTAURANT_ID);
});

// ─── Start Server ───────────────────────────────────────────

server.listen(PORT, () => {
  const config = readConfig();
  console.log(`  📦 Warehouse ${RESTAURANT_ID} (${config.name}) running on port ${PORT}`);
});
