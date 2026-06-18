const RESTAURANT_ID = 'REST-VEJJDL';
const PORT = 3103;
const VERTICAL = 'wms';
const TENANT_TYPE = 'WMS';
/**
 * Restaurant Microservice — Service Template
 * ═══════════════════════════════════════════
 * This file is copied per restaurant by the factory.
 * The factory injects RESTAURANT_ID and PORT at the top.
 *
 * DO NOT add RESTAURANT_ID or PORT here — they are injected at copy time.
 */

// ─── Dependencies ───────────────────────────────────────────

const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server: SocketIO } = require('socket.io');
const Database = require('better-sqlite3');
const QRCode = require('qrcode');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// ─── Setup ──────────────────────────────────────────────────

const EventEmitter = require('events');
class SpaEventBus extends EventEmitter {}
const spaEvents = new SpaEventBus();

// Simulation of Kafka/Event-Driven Architecture
spaEvents.on('appointment.completed', (data) => {
  console.log(`[Event-Bus] Kafka Topic: appointment.completed - Order #${data.id}`);
  // Trigger Loyalty points logic
});

spaEvents.on('inventory.low', (data) => {
  console.log(`[Event-Bus] Kafka Topic: inventory.low - Item: ${data.item_name}`);
  // Trigger Procurement alert
});

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
const QR_SECRET_SALT = process.env.QR_SECRET_SALT || 'change-this-in-production';
const GATEWAY_PORT = process.env.GATEWAY_PORT || 4000;

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

const BILLS_DB_PATH = path.join(__dirname, 'bills.sqlite');
const billsDb = new Database(BILLS_DB_PATH);
billsDb.pragma('journal_mode = WAL');
billsDb.pragma('foreign_keys = ON');

// Run schema migrations for existing databases
try {
  db.exec("ALTER TABLE orders ADD COLUMN type TEXT DEFAULT 'dine-in';");
} catch (e) {}
try {
  db.exec("ALTER TABLE orders ADD COLUMN customer_phone TEXT;");
} catch (e) {}
try {
  db.exec("ALTER TABLE orders ADD COLUMN settled_by TEXT DEFAULT 'System';");
} catch (e) {}
try {
  db.exec("ALTER TABLE order_items ADD COLUMN is_addon INTEGER DEFAULT 0;");
} catch (e) {}
try {
  db.exec("ALTER TABLE orders ADD COLUMN payment_method TEXT;");
} catch (e) {}
try {
  db.exec("ALTER TABLE orders ADD COLUMN payment_status TEXT DEFAULT 'unpaid';");
} catch (e) {}
try {
  db.exec("ALTER TABLE orders ADD COLUMN settled_at DATETIME;");
} catch (e) {}
try {
  db.exec("ALTER TABLE menu_items ADD COLUMN image_url TEXT;");
} catch (e) {}
try {
  db.exec("ALTER TABLE orders ADD COLUMN customer_name TEXT;");
} catch (e) {}
try {
  db.exec("ALTER TABLE orders ADD COLUMN waiter_name TEXT;");
} catch (e) {}
try {
  db.exec("ALTER TABLE orders ADD COLUMN cash_amount REAL DEFAULT 0;");
} catch (e) {}
try {
  db.exec("ALTER TABLE orders ADD COLUMN online_amount REAL DEFAULT 0;");
} catch (e) {}
try {
  db.exec("ALTER TABLE orders ADD COLUMN discount_amount REAL DEFAULT 0;");
} catch (e) {}
try {
  db.exec("ALTER TABLE orders ADD COLUMN coupon_code TEXT;");
} catch (e) {}
try {
  db.exec("ALTER TABLE orders ADD COLUMN whatsapp_sent INTEGER DEFAULT 0;");
} catch (e) {}
try {
  db.exec("ALTER TABLE menu_items ADD COLUMN sort_order INTEGER DEFAULT 0;");
} catch (e) {}
try {
  db.exec("ALTER TABLE order_items ADD COLUMN addons_json TEXT;");
} catch (e) {}
try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS staff (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      pin TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
} catch (e) {}
try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS menu_item_addons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      menu_item_id INTEGER REFERENCES menu_items(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
} catch (e) {}
try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS coupons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL UNIQUE,
      discount_type TEXT NOT NULL,
      value REAL NOT NULL,
      min_order_amount REAL DEFAULT 0,
      active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
} catch (e) {}
try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      amount REAL NOT NULL,
      category TEXT NOT NULL,
      expense_date DATE DEFAULT (DATE('now', 'localtime')),
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
} catch (e) {}
try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS inventory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_name TEXT NOT NULL UNIQUE,
      quantity REAL NOT NULL DEFAULT 0,
      unit TEXT NOT NULL,
      min_quantity REAL NOT NULL DEFAULT 0,
      supplier TEXT,
      cost_per_unit REAL DEFAULT 0,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
} catch (e) {}
try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS inventory_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      inventory_id INTEGER REFERENCES inventory(id) ON DELETE CASCADE,
      item_name TEXT NOT NULL,
      change_amount REAL NOT NULL,
      type TEXT NOT NULL,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
} catch (e) {}

try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS outlets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      address TEXT NOT NULL,
      phone TEXT,
      delivery_radius REAL DEFAULT 5.0,
      delivery_charge REAL DEFAULT 0.0,
      delivery_enabled INTEGER DEFAULT 1,
      zomato_enabled INTEGER DEFAULT 1,
      swiggy_enabled INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
} catch (e) {}

try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS venue_bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      event_type TEXT NOT NULL,
      event_date TEXT NOT NULL,
      event_time TEXT NOT NULL,
      guest_count INTEGER NOT NULL,
      notes TEXT,
      status TEXT DEFAULT 'Pending',
      customer_father_name TEXT,
      customer_village TEXT,
      customer_aadhaar TEXT,
      venue_areas TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
} catch (e) {}

// Migrations for existing venue bookings database tables
try {
  db.exec("ALTER TABLE venue_bookings ADD COLUMN customer_father_name TEXT;");
} catch (e) {}
try {
  db.exec("ALTER TABLE venue_bookings ADD COLUMN customer_village TEXT;");
} catch (e) {}
try {
  db.exec("ALTER TABLE venue_bookings ADD COLUMN customer_aadhaar TEXT;");
} catch (e) {}
try {
  db.exec("ALTER TABLE venue_bookings ADD COLUMN venue_areas TEXT;");
} catch (e) {}

try {
  billsDb.exec(`
    CREATE TABLE IF NOT EXISTS short_urls (
      id TEXT PRIMARY KEY,
      url TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
} catch (e) {}

// Automated cleanup function to delete orders, their items, and static receipt PDFs older than 5 months
function performAutomatedBillCleanup() {
  try {
    const cutOffDate = new Date();
    cutOffDate.setMonth(cutOffDate.getMonth() - 5);
    const cutOffString = cutOffDate.toISOString();

    // Find orders older than 5 months
    const oldOrders = db.prepare("SELECT id FROM orders WHERE created_at < ?").all(cutOffString);
    if (oldOrders.length > 0) {
      console.log(`[Auto Cleanup] Found ${oldOrders.length} orders older than 5 months. Cleaning up...`);
      
      const orderIds = oldOrders.map(o => o.id);
      
      // Delete associated order items
      const placeholders = orderIds.map(() => '?').join(',');
      db.prepare(`DELETE FROM order_items WHERE order_id IN (${placeholders})`).run(...orderIds);
      
      // Delete orders
      db.prepare(`DELETE FROM orders WHERE id IN (${placeholders})`).run(...orderIds);
      console.log(`[Auto Cleanup] Successfully deleted ${oldOrders.length} database entries.`);
    }

    // Sweep static uploads folder for receipt PDF files created more than 5 months ago
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);
      const now = Date.now();
      const fiveMonthsMs = 5 * 30 * 24 * 60 * 60 * 1000;
      let deletedCount = 0;

      files.forEach((file) => {
        const filePath = path.join(uploadsDir, file);
        const stats = fs.statSync(filePath);
        if (now - stats.birthtimeMs > fiveMonthsMs || now - stats.mtimeMs > fiveMonthsMs) {
          if (file.endsWith('.pdf') || file.startsWith('receipt-') || file.startsWith('bill-')) {
            fs.unlinkSync(filePath);
            deletedCount++;
          }
        }
      });
      if (deletedCount > 0) {
        console.log(`[Auto Cleanup] Deleted ${deletedCount} legacy receipt PDF files from disk.`);
      }
    }
  } catch (err) {
    console.error('[Auto Cleanup] Error executing bill cleanup:', err);
  }
}

// Run cleanup immediately on server startup
performAutomatedBillCleanup();
// Run cleanup every 24 hours
setInterval(performAutomatedBillCleanup, 24 * 60 * 60 * 1000);


function readConfig() {
  return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
}

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

    // 1. Check if matching role PIN fallback for configured legacy roles
    if (config.pins[role] && config.pins[role] === pin.toString()) {
      authenticated = true;
    } 
    // 2. Otherwise, check if user credentials exist in the staff table
    else if (username) {
      try {
        const user = db.prepare('SELECT * FROM staff WHERE username = ? AND pin = ? AND role = ?').get(username.toString().trim(), pin.toString(), role);
        if (user) {
          authenticated = true;
          req.staffName = user.name;
        }
      } catch (err) {
        console.error('Error validating staff credentials in authMiddleware:', err);
      }
    } 
    // 3. Fallback: check if any staff member matches this PIN and role (e.g. if username header is missing but credential PIN is unique)
    else {
      try {
        const user = db.prepare('SELECT * FROM staff WHERE pin = ? AND role = ?').get(pin.toString(), role);
        if (user) {
          authenticated = true;
          req.staffName = user.name;
        }
      } catch (err) {
        console.error('Error validating staff PIN in authMiddleware:', err);
      }
    }

    if (!authenticated) {
      return res.status(401).json({ error: 'Invalid PIN or credentials' });
    }

    if (requiredRole === 'admin' && role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    if (requiredRole === 'staff' && !['admin', 'waiter', 'counter', 'cashier'].includes(role)) {
      return res.status(403).json({ error: 'Staff access required' });
    }

    req.role = role;
    next();
  };
}

// ─── Table Auto-Status ─────────────────────────────────────

function updateTableStatus(tableId) {
  // Check active orders on this table
  const activeOrder = db
    .prepare(
      "SELECT id, status FROM orders WHERE table_id = ? AND status NOT IN ('paid', 'cancelled') ORDER BY created_at DESC LIMIT 1"
    )
    .get(tableId);

  let newStatus = 'available';

  if (activeOrder) {
    if (activeOrder.status === 'pending') {
      newStatus = 'pending';
    } else if (activeOrder.status === 'preparing') {
      newStatus = 'preparing';
    } else if (activeOrder.status === 'ready') {
      newStatus = 'ready';
    } else if (activeOrder.status === 'served') {
      newStatus = 'occupied';
    }
  } else {
    // Check for upcoming reservations within 60 minutes
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const upcoming = db
      .prepare(
        "SELECT id FROM reservations WHERE table_id = ? AND reservation_date = ? AND status = 'confirmed'"
      )
      .all(tableId, today);

    for (const resv of upcoming) {
      const full = db.prepare('SELECT reservation_time FROM reservations WHERE id = ?').get(resv.id);
      if (full) {
        const [h, m] = full.reservation_time.split(':').map(Number);
        const resvMinutes = h * 60 + m;
        if (resvMinutes - currentMinutes <= 60 && resvMinutes - currentMinutes > 0) {
          newStatus = 'reserved';
          break;
        }
      }
    }
  }

  db.prepare('UPDATE tables SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(
    newStatus,
    tableId
  );

  io.to('restaurant').emit('table:statusChanged', { tableId, status: newStatus });
  return newStatus;
}

// ─── QR Token Helpers ───────────────────────────────────────

function generateQrToken(tableNumber) {
  return crypto
    .createHash('sha256')
    .update(RESTAURANT_ID + tableNumber + QR_SECRET_SALT)
    .digest('hex');
}

function validateQrToken(tableNumber, token) {
  const table = db.prepare('SELECT id, qr_token, status FROM tables WHERE number = ?').get(tableNumber);
  if (!table) return null;
  if (table.qr_token !== token) return null;
  return table;
}

// ─── Health ─────────────────────────────────────────────────

app.get('/health', (req, res) => {
  const config = readConfig();
  res.json({
    status: 'ok',
    tenantId: RESTAURANT_ID,
    type: typeof TENANT_TYPE !== 'undefined' ? TENANT_TYPE : 'RESTAURANT',
    name: config.name,
    logo_url: config.logo_url || '',
    description: config.description || '',
    logout_redirect_url: config.logout_redirect_url || '',
    login_theme_color: config.login_theme_color || '#fafaf9',
    theme: config.qr_theme || 'classic',
    billing: config.billing || {},
    uptime: process.uptime(),
  });
});

app.get('/manifest.json', (req, res) => {
  const config = readConfig();
  const name = config.name || 'Restaurant App';
  const logo = config.logo_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=192';
  
  res.json({
    short_name: name,
    name: name,
    icons: [
      {
        src: logo,
        sizes: "64x64 32x32 24x24 16x16",
        type: "image/any"
      },
      {
        src: logo,
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable"
      },
      {
        src: logo,
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable"
      }
    ],
    start_url: `/r/${RESTAURANT_ID}/login`,
    background_color: "#ffffff",
    theme_color: "#ffffff",
    display: "standalone",
    orientation: "portrait"
  });
});

// ─── Auth ───────────────────────────────────────────────────

app.post('/auth', (req, res) => {
  const { role, pin, username } = req.body;
  const config = readConfig();

  // If logging in as admin (requires role: admin and pin/password)
  if (role === 'admin') {
    if (!pin) {
      return res.status(400).json({ error: 'Password is required' });
    }
    if (config.pins.admin !== pin.toString()) {
      return res.status(401).json({ error: 'Invalid Admin Password' });
    }
    db.prepare('INSERT INTO sessions (role) VALUES (?)').run('admin');
    return res.json({ role: 'admin', restaurantId: RESTAURANT_ID, name: config.name, staffName: 'Admin' });
  }

  // If logging in as staff member (requires username/number and pin/password)
  if (username && pin) {
    try {
      const user = db.prepare('SELECT * FROM staff WHERE (username = ? OR name = ?) AND pin = ?').get(username.toString().trim(), username.toString().trim(), pin.toString());
      if (!user) {
        return res.status(401).json({ error: 'Invalid Staff ID/Number or Password' });
      }
      db.prepare('INSERT INTO sessions (role) VALUES (?)').run(user.role);
      return res.json({
        role: user.role,
        restaurantId: RESTAURANT_ID,
        name: config.name,
        staffName: user.name,
        username: user.username,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Authentication database error' });
    }
  }

  // Legacy role-based login fallback (e.g. customer seating or fallback PINS)
  if (role && pin) {
    if (role === 'customer') {
      if (!config.pins[role]) {
        return res.status(401).json({ error: 'Invalid role' });
      }
      if (config.pins[role] !== pin.toString()) {
        return res.status(401).json({ error: 'Invalid Password' });
      }
      db.prepare('INSERT INTO sessions (role) VALUES (?)').run(role);
      return res.json({ role, restaurantId: RESTAURANT_ID, name: config.name, staffName: role.toUpperCase() });
    }
    return res.status(401).json({ error: 'Global role login is disabled. Please log in with your Staff account.' });
  }

  return res.status(400).json({ error: 'Invalid login request' });
});

// GET /staff — List all staff members [ADMIN]
app.get('/staff', authMiddleware('admin'), (req, res) => {
  try {
    const staff = db.prepare('SELECT id, username, name, role, pin, created_at FROM staff ORDER BY role, name').all();
    res.json(staff);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve staff list' });
  }
});

// POST /staff — Add a new staff member [ADMIN]
app.post('/staff', authMiddleware('admin'), (req, res) => {
  const { username, name, role, pin } = req.body;
  if (!username || !name || !role || !pin) {
    return res.status(400).json({ error: 'Username, Name, Role, and PIN are required' });
  }
  if (!['waiter', 'counter', 'cashier'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }
  if (pin.toString().length < 4) {
    return res.status(400).json({ error: 'PIN must be at least 4 digits' });
  }

  try {
    const existing = db.prepare('SELECT id FROM staff WHERE username = ?').get(username.toString().trim());
    if (existing) {
      return res.status(409).json({ error: 'Staff ID/Number already exists' });
    }

    db.prepare('INSERT INTO staff (username, name, role, pin) VALUES (?, ?, ?, ?)').run(
      username.toString().trim(),
      name.trim(),
      role,
      pin.toString()
    );
    res.status(201).json({ message: 'Staff member added successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add staff member' });
  }
});

// DELETE /staff/:id — Delete a staff member [ADMIN]
app.delete('/staff/:id', authMiddleware('admin'), (req, res) => {
  try {
    db.prepare('DELETE FROM staff WHERE id = ?').run(req.params.id);
    res.json({ message: 'Staff member deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete staff member' });
  }
});

// GET /settings/pins — Get current role login PINs [ADMIN]
app.get('/settings/pins', authMiddleware('admin'), (req, res) => {
  const config = readConfig();
  res.json({ pins: config.pins });
});

// PUT /settings/pins — Update login credentials (PINs/passwords) for waiter, counter, cashier, admin [ADMIN]
app.put('/settings/pins', authMiddleware('admin'), (req, res) => {
  const { admin, waiter, counter, cashier } = req.body;
  const config = readConfig();

  if (admin !== undefined) {
    if (admin.toString().length < 4) {
      return res.status(400).json({ error: 'Password must be at least 4 characters' });
    }
    config.pins.admin = admin.toString();
  }
  if (waiter !== undefined) {
    if (waiter.toString().length < 4) {
      return res.status(400).json({ error: 'Password must be at least 4 characters' });
    }
    config.pins.waiter = waiter.toString();
  }
  if (counter !== undefined) {
    if (counter.toString().length < 4) {
      return res.status(400).json({ error: 'Password must be at least 4 characters' });
    }
    config.pins.counter = counter.toString();
  }
  if (cashier !== undefined) {
    if (cashier.toString().length < 4) {
      return res.status(400).json({ error: 'Password must be at least 4 characters' });
    }
    config.pins.cashier = cashier.toString();
  }

  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf8');

  // Proactively update registry.json in agency-core
  try {
    const agencyRegistryPath = path.join(__dirname, '..', '..', 'agency-core', 'registry.json');
    if (fs.existsSync(agencyRegistryPath)) {
      const reg = JSON.parse(fs.readFileSync(agencyRegistryPath, 'utf8'));
      const rIndex = reg.restaurants.findIndex(r => r.id === RESTAURANT_ID);
      if (rIndex !== -1) {
        reg.restaurants[rIndex].pins = config.pins;
        fs.writeFileSync(agencyRegistryPath, JSON.stringify(reg, null, 2), 'utf8');
      }
    }
  } catch (e) {
    console.error('Failed to sync settings with agency registry:', e.message);
  }

  res.json({ message: 'Login credentials updated successfully', pins: config.pins });
});

// GET /settings/printer — Get current printer configs [ADMIN]
app.get('/settings/printer', authMiddleware('admin'), (req, res) => {
  const config = readConfig();
  res.json({ printer: config.printer || { enabled: false, size: '80mm' } });
});

// PUT /settings/printer — Update printer configs [ADMIN]
app.put('/settings/printer', authMiddleware('admin'), (req, res) => {
  const { enabled, size } = req.body;
  const config = readConfig();

  config.printer = {
    enabled: !!enabled,
    size: size === '58mm' ? '58mm' : '80mm'
  };

  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf8');
  res.json({ message: 'Printer settings updated successfully', printer: config.printer });
});

// GET /customers — Retrieve customer records and total statistics [ADMIN]
app.get('/customers', authMiddleware('admin'), (req, res) => {
  try {
    const customers = db.prepare(`
      SELECT 
        phone,
        MAX(name) AS name,
        MAX(email) AS email,
        SUM(order_count) AS order_count,
        SUM(total_spend) AS total_spend,
        SUM(resv_count) AS reservation_count,
        MAX(last_visit) AS last_visit
      FROM (
        SELECT 
          customer_phone AS phone,
          customer_name AS name,
          NULL AS email,
          COUNT(id) AS order_count,
          SUM(total) AS total_spend,
          0 AS resv_count,
          MAX(created_at) AS last_visit
        FROM orders
        WHERE customer_phone IS NOT NULL AND customer_phone != ''
        GROUP BY customer_phone
        
        UNION ALL
        
        SELECT 
          customer_phone AS phone,
          customer_name AS name,
          customer_email AS email,
          0 AS order_count,
          0 AS total_spend,
          COUNT(id) AS resv_count,
          MAX(reservation_date || ' ' || reservation_time) AS last_visit
        FROM reservations
        WHERE customer_phone IS NOT NULL AND customer_phone != ''
        GROUP BY customer_phone
      )
      GROUP BY phone
      ORDER BY last_visit DESC
    `).all();

    res.json(customers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve customer records' });
  }
});

// ═══════════════════════════════════════════════════════════
//  TABLES API
// ═══════════════════════════════════════════════════════════

// GET /tables — All tables with active order + next reservation
app.get('/tables', (req, res) => {
  const tables = db.prepare('SELECT * FROM tables ORDER BY section, number').all();

  const enriched = tables.map((table) => {
    const activeOrder = db
      .prepare(
        "SELECT id, status, total, created_at FROM orders WHERE table_id = ? AND status NOT IN ('paid', 'cancelled') ORDER BY created_at DESC LIMIT 1"
      )
      .get(table.id);

    const today = new Date().toISOString().split('T')[0];
    const nextReservation = db
      .prepare(
        "SELECT id, customer_name, party_size, reservation_time FROM reservations WHERE table_id = ? AND reservation_date >= ? AND status = 'confirmed' ORDER BY reservation_date, reservation_time LIMIT 1"
      )
      .get(table.id, today);

    return { ...table, activeOrder: activeOrder || null, nextReservation: nextReservation || null };
  });

  res.json(enriched);
});

// GET /tables/status — Compact status
app.get('/tables/status', (req, res) => {
  const tables = db.prepare('SELECT id, number, status, section FROM tables ORDER BY section, number').all();
  res.json(tables);
});

// GET /tables/sections — Distinct sections
app.get('/tables/sections', (req, res) => {
  const sections = db.prepare('SELECT DISTINCT section FROM tables').all();
  res.json(sections.map((s) => s.section));
});

// ═══════════════════════════════════════════════════════════
//  SPA & WELLNESS MODULES
// ═══════════════════════════════════════════════════════════

// --- Therapists ---
app.get('/therapists', (req, res) => {
  try {
    const therapists = db.prepare('SELECT * FROM therapists ORDER BY name').all();
    res.json(therapists);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Facility & Rooms ---
app.get('/spa/rooms', (req, res) => {
  try {
    const rooms = db.prepare('SELECT * FROM rooms ORDER BY name').all();
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Clinical / MedSpa ---
app.post('/spa/consultations', (req, res) => {
  const { customer_id, doctor_id, symptoms, diagnosis, notes } = req.body;
  try {
    const result = db.prepare('INSERT INTO medical_consultations (customer_id, doctor_id, symptoms, diagnosis, notes) VALUES (?, ?, ?, ?, ?)')
      .run(customer_id, doctor_id, symptoms, diagnosis, notes);
    res.status(201).json({ id: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/spa/prescriptions', (req, res) => {
  const { consultation_id, medication_name, dosage, frequency, instructions } = req.body;
  try {
    const result = db.prepare('INSERT INTO prescriptions (consultation_id, medication_name, dosage, frequency, instructions) VALUES (?, ?, ?, ?, ?)')
      .run(consultation_id, medication_name, dosage, frequency, instructions);
    res.status(201).json({ id: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/spa/consent', (req, res) => {
  const { customer_id, service_id, form_data_json, signature_url } = req.body;
  try {
    const result = db.prepare('INSERT INTO consent_forms (customer_id, service_id, form_data_json, signature_url) VALUES (?, ?, ?, ?)')
      .run(customer_id, service_id, form_data_json, signature_url);
    res.status(201).json({ id: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Enterprise Branches ---
app.get('/spa/branches', (req, res) => {
  try {
    const branches = db.prepare('SELECT * FROM branches WHERE is_active = 1').all();
    res.json(branches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/spa/branches', authMiddleware('admin'), (req, res) => {
  const { name, address, phone, email } = req.body;
  try {
    const result = db.prepare('INSERT INTO branches (name, address, phone, email) VALUES (?, ?, ?, ?)')
      .run(name, address, phone, email);
    res.status(201).json({ id: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Staff Commissions ---
app.get('/spa/commissions', authMiddleware('admin'), (req, res) => {
  try {
    const data = db.prepare('SELECT c.*, s.name as staff_name FROM commissions c JOIN staff s ON c.staff_id = s.id ORDER BY c.created_at DESC').all();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Loyalty & Rewards ---
app.get('/spa/loyalty/:customerId', (req, res) => {
  try {
    const points = db.prepare('SELECT loyalty_points FROM customer_profiles WHERE id = ?').get(req.params.customerId);
    const history = db.prepare('SELECT * FROM loyalty_transactions WHERE customer_id = ? ORDER BY created_at DESC').all(req.params.customerId);
    res.json({ points: points?.loyalty_points || 0, history });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/spa/loyalty/redeem', (req, res) => {
  const { customer_id, points, description } = req.body;
  try {
    db.prepare('UPDATE customer_profiles SET loyalty_points = loyalty_points - ? WHERE id = ?').run(points, customer_id);
    db.prepare('INSERT INTO loyalty_transactions (customer_id, points, type, description) VALUES (?, ?, ?, ?)').run(customer_id, points, 'redeemed', description);
    res.json({ message: 'Points redeemed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Spa Inventory ---
app.get('/spa/inventory', authMiddleware('staff'), (req, res) => {
  try {
    const items = db.prepare('SELECT * FROM inventory ORDER BY item_name ASC').all();
    res.json(items);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/spa/inventory', authMiddleware('admin'), (req, res) => {
  const { id, item_name, category, quantity, unit, min_quantity, supplier, cost_per_unit, price_retail } = req.body;
  try {
    if (id) {
      db.prepare('UPDATE inventory SET item_name=?, category=?, quantity=?, unit=?, min_quantity=?, supplier=?, cost_per_unit=?, price_retail=?, updated_at=CURRENT_TIMESTAMP WHERE id=?')
        .run(item_name, category, quantity, unit, min_quantity, supplier, cost_per_unit, price_retail, id);
      res.json({ message: 'Inventory item updated' });
    } else {
      const result = db.prepare('INSERT INTO inventory (item_name, category, quantity, unit, min_quantity, supplier, cost_per_unit, price_retail) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
        .run(item_name, category, quantity, unit, min_quantity, supplier, cost_per_unit, price_retail);
      res.status(201).json({ id: result.lastInsertRowid });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- Treatment Plans ---
app.get('/treatment-plans', (req, res) => {
  const { customer_id } = req.query;
  let query = 'SELECT tp.*, t.name as therapist_name FROM treatment_plans tp LEFT JOIN therapists t ON tp.therapist_id = t.id WHERE 1=1';
  const params = [];
  if (customer_id) { query += ' AND tp.customer_id = ?'; params.push(customer_id); }
  try {
    const plans = db.prepare(query).all(...params);
    res.json(plans);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/treatment-plans', (req, res) => {
  const { customer_id, therapist_id, title, description, goals, recommended_services_json } = req.body;
  try {
    const result = db.prepare('INSERT INTO treatment_plans (customer_id, therapist_id, title, description, goals, recommended_services_json) VALUES (?, ?, ?, ?, ?, ?)')
      .run(customer_id, therapist_id, title, description, goals, recommended_services_json);
    res.status(201).json({ id: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Feedback ---
app.get('/spa/feedback', authMiddleware('admin'), (req, res) => {
  try {
    const feedback = db.prepare('SELECT f.*, c.name as customer_name, a.appointment_date FROM feedback f LEFT JOIN customer_profiles c ON f.customer_id = c.id LEFT JOIN appointments a ON f.appointment_id = a.id ORDER BY f.created_at DESC').all();
    res.json(feedback);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/spa/feedback', (req, res) => {
  const { appointment_id, customer_id, rating, comments, staff_performance_rating, facility_rating } = req.body;
  try {
    const result = db.prepare('INSERT INTO feedback (appointment_id, customer_id, rating, comments, staff_performance_rating, facility_rating) VALUES (?, ?, ?, ?, ?, ?)')
      .run(appointment_id, customer_id, rating, comments, staff_performance_rating, facility_rating);
    res.status(201).json({ id: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Specialized Billing ---
app.post('/spa/billing', authMiddleware('staff'), (req, res) => {
  const { branch_id, appointment_id, customer_id, total_amount, discount_amount, tax_amount, grand_total, payment_method, transaction_id, notes } = req.body;
  try {
    const result = db.prepare('INSERT INTO invoices (branch_id, customer_id, appointment_id, subtotal, tax_amount, discount_amount, grand_total, payment_method, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .run(branch_id || 1, customer_id, appointment_id, total_amount, tax_amount, discount_amount, grand_total, payment_method, 'paid');

    if (appointment_id) {
      db.prepare("UPDATE appointments SET payment_status = 'paid', status = 'completed' WHERE id = ?").run(appointment_id);

      // Trigger Commission calculation
      const appt = db.prepare('SELECT staff_id, total_price FROM appointments WHERE id = ?').get(appointment_id);
      if (appt && appt.staff_id) {
        const staff = db.prepare('SELECT commission_rate FROM staff WHERE id = ?').get(appt.staff_id);
        const rate = staff?.commission_rate || 0.1;
        db.prepare('INSERT INTO commissions (staff_id, appointment_id, sale_type, revenue_amount, commission_amount) VALUES (?, ?, ?, ?, ?)')
          .run(appt.staff_id, appointment_id, 'service', grand_total, grand_total * rate);
      }
    }

    // Update customer stats
    if (customer_id) {
      db.prepare('UPDATE customer_profiles SET total_spend = total_spend + ?, visit_count = visit_count + 1, last_visit = CURRENT_TIMESTAMP WHERE id = ?')
        .run(grand_total, customer_id);
    }

    res.status(201).json({ id: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/therapists', authMiddleware('admin'), (req, res) => {
  const { id, name, specialization, phone, email, availability_json, status } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  try {
    if (id) {
      db.prepare('UPDATE therapists SET name=?, specialization=?, phone=?, email=?, availability_json=?, status=? WHERE id=?')
        .run(name, specialization, phone, email, availability_json, status || 'active', id);
      res.json({ message: 'Therapist updated' });
    } else {
      const result = db.prepare('INSERT INTO therapists (name, specialization, phone, email, availability_json, status) VALUES (?, ?, ?, ?, ?, ?)')
        .run(name, specialization, phone, email, availability_json, status || 'active');
      res.status(201).json({ id: result.lastInsertRowid });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Spa Services ---
app.get('/spa/services', (req, res) => {
  try {
    const services = db.prepare('SELECT * FROM services WHERE available = 1 ORDER BY category, name').all();
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/spa/services', authMiddleware('admin'), (req, res) => {
  const { id, name, description, category, duration_minutes, price, available, image_url } = req.body;
  if (!name || !duration_minutes || !price) return res.status(400).json({ error: 'Required fields missing' });
  try {
    if (id) {
      db.prepare('UPDATE services SET name=?, description=?, category=?, duration_minutes=?, price=?, available=?, image_url=? WHERE id=?')
        .run(name, description, category, duration_minutes, price, available !== undefined ? available : 1, image_url, id);
      res.json({ message: 'Service updated' });
    } else {
      const result = db.prepare('INSERT INTO services (name, description, category, duration_minutes, price, available, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)')
        .run(name, description, category, duration_minutes, price, available !== undefined ? available : 1, image_url);
      res.status(201).json({ id: result.lastInsertRowid });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Appointments ---
app.get('/appointments', (req, res) => {
  const { date, customer_id, therapist_id } = req.query;
  let query = 'SELECT a.*, c.name as customer_name, t.name as therapist_name, s.name as service_name FROM appointments a LEFT JOIN customer_profiles c ON a.customer_id = c.id LEFT JOIN therapists t ON a.therapist_id = t.id LEFT JOIN services s ON a.service_id = s.id WHERE 1=1';
  const params = [];
  if (date) { query += ' AND a.appointment_date = ?'; params.push(date); }
  if (customer_id) { query += ' AND a.customer_id = ?'; params.push(customer_id); }
  if (therapist_id) { query += ' AND a.therapist_id = ?'; params.push(therapist_id); }
  query += ' ORDER BY a.appointment_date, a.appointment_time';
  try {
    const appointments = db.prepare(query).all(...params);
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/appointments', (req, res) => {
  const { branch_id, customer_id, staff_id, service_id, room_id, appointment_date, appointment_time, duration_minutes, notes, total_price } = req.body;
  try {
    const result = db.prepare('INSERT INTO appointments (branch_id, customer_id, staff_id, service_id, room_id, appointment_date, appointment_time, duration_minutes, notes, total_price) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .run(branch_id || 1, customer_id, staff_id, service_id, room_id, appointment_date, appointment_time, duration_minutes, notes, total_price);
    res.status(201).json({ id: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/appointments/:id', (req, res) => {
  const { status, payment_status, notes } = req.body;
  try {
    db.prepare('UPDATE appointments SET status = COALESCE(?, status), payment_status = COALESCE(?, payment_status), notes = COALESCE(?, notes), updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(status, payment_status, notes, req.params.id);
    res.json({ message: 'Appointment updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Memberships ---
app.get('/memberships', (req, res) => {
  try {
    const memberships = db.prepare('SELECT * FROM memberships WHERE active = 1').all();
    res.json(memberships);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/memberships', authMiddleware('admin'), (req, res) => {
  const { name, description, price, duration_months, benefits_json } = req.body;
  try {
    const result = db.prepare('INSERT INTO memberships (name, description, price, duration_months, benefits_json) VALUES (?, ?, ?, ?, ?)')
      .run(name, description, price, duration_months, benefits_json);
    res.status(201).json({ id: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Packages ---
app.get('/packages', (req, res) => {
  try {
    const packages = db.prepare('SELECT * FROM packages WHERE active = 1').all();
    res.json(packages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/packages', authMiddleware('admin'), (req, res) => {
  const { name, description, price, services_json, validity_days } = req.body;
  try {
    const result = db.prepare('INSERT INTO packages (name, description, price, services_json, validity_days) VALUES (?, ?, ?, ?, ?)')
      .run(name, description, price, services_json, validity_days);
    res.status(201).json({ id: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Customer CRM ---
app.get('/spa/customers', (req, res) => {
  try {
    const customers = db.prepare('SELECT * FROM customer_profiles ORDER BY last_visit DESC').all();
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/spa/customers', (req, res) => {
  const { id, name, phone, email, gender, date_of_birth, wellness_notes, allergies, preferences_json } = req.body;
  try {
    if (id) {
      db.prepare('UPDATE customer_profiles SET name=?, phone=?, email=?, gender=?, date_of_birth=?, wellness_notes=?, allergies=?, preferences_json=? WHERE id=?')
        .run(name, phone, email, gender, date_of_birth, wellness_notes, allergies, preferences_json, id);
      res.json({ message: 'Customer updated' });
    } else {
      const result = db.prepare('INSERT INTO customer_profiles (name, phone, email, gender, date_of_birth, wellness_notes, allergies, preferences_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
        .run(name, phone, email, gender, date_of_birth, wellness_notes, allergies, preferences_json);
      res.status(201).json({ id: result.lastInsertRowid });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /tables/:id — Single table
app.get('/tables/:id', (req, res) => {
  const table = db.prepare('SELECT * FROM tables WHERE id = ?').get(req.params.id);
  if (!table) return res.status(404).json({ error: 'Table not found' });

  const activeOrder = db
    .prepare(
      "SELECT id, status, total, created_at FROM orders WHERE table_id = ? AND status NOT IN ('paid', 'cancelled') ORDER BY created_at DESC LIMIT 1"
    )
    .get(table.id);

  const today = new Date().toISOString().split('T')[0];
  const nextReservation = db
    .prepare(
      "SELECT id, customer_name, party_size, reservation_time FROM reservations WHERE table_id = ? AND reservation_date >= ? AND status = 'confirmed' ORDER BY reservation_date, reservation_time LIMIT 1"
    )
    .get(table.id, today);

  res.json({ ...table, activeOrder: activeOrder || null, nextReservation: nextReservation || null });
});

// POST /tables — Create table [ADMIN]
app.post('/tables', authMiddleware('admin'), (req, res) => {
  const { number, capacity = 4, section = 'Main' } = req.body;

  if (!number) return res.status(400).json({ error: 'Table number is required' });

  // Check unique
  const existing = db.prepare('SELECT id FROM tables WHERE number = ?').get(number);
  if (existing) return res.status(409).json({ error: `Table ${number} already exists` });

  const qrToken = generateQrToken(number);
  const result = db
    .prepare(
      'INSERT INTO tables (number, capacity, section, qr_token, qr_generated_at) VALUES (?, ?, ?, ?, ?)'
    )
    .run(number, capacity, section, qrToken, new Date().toISOString());

  const table = db.prepare('SELECT * FROM tables WHERE id = ?').get(result.lastInsertRowid);
  io.to('restaurant').emit('table:added', { table });
  res.status(201).json(table);
});

// PUT /tables/:id — Update table [ADMIN/STAFF]
app.put('/tables/:id', authMiddleware('staff'), (req, res) => {
  const table = db.prepare('SELECT * FROM tables WHERE id = ?').get(req.params.id);
  if (!table) return res.status(404).json({ error: 'Table not found' });

  const role = req.role;
  const { number, capacity, section, status } = req.body;

  if (role !== 'admin') {
    if (status) {
      db.prepare('UPDATE tables SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(status, req.params.id);
      const updated = db.prepare('SELECT * FROM tables WHERE id = ?').get(req.params.id);
      io.to('restaurant').emit('table:updated', { table: updated });
      return res.json(updated);
    }
    return res.status(403).json({ error: 'Only admin can modify table details' });
  }

  // Block number change if active order
  if (number && number.toString().toLowerCase() !== table.number.toString().toLowerCase()) {
    const activeOrder = db
      .prepare("SELECT id FROM orders WHERE table_id = ? AND status NOT IN ('paid', 'cancelled') LIMIT 1")
      .get(table.id);
    if (activeOrder) {
      return res.status(400).json({ error: 'Cannot change table number while an active order exists' });
    }

    // Check unique
    const existing = db.prepare('SELECT id FROM tables WHERE LOWER(number) = LOWER(?) AND id != ?').get(number.toString(), table.id);
    if (existing) return res.status(409).json({ error: `Table ${number} already exists` });
  }

  db.prepare(
    'UPDATE tables SET number = COALESCE(?, number), capacity = COALESCE(?, capacity), section = COALESCE(?, section), status = COALESCE(?, status), updated_at = CURRENT_TIMESTAMP WHERE id = ?'
  ).run(number || null, capacity || null, section || null, status || null, req.params.id);

  const updated = db.prepare('SELECT * FROM tables WHERE id = ?').get(req.params.id);
  io.to('restaurant').emit('table:updated', { table: updated });
  res.json(updated);
});

// DELETE /tables/:id — Delete table [ADMIN]
app.delete('/tables/:id', authMiddleware('admin'), (req, res) => {
  const table = db.prepare('SELECT * FROM tables WHERE id = ?').get(req.params.id);
  if (!table) return res.status(404).json({ error: 'Table not found' });

  const activeOrder = db
    .prepare("SELECT id FROM orders WHERE table_id = ? AND status NOT IN ('paid', 'cancelled') LIMIT 1")
    .get(table.id);
  if (activeOrder) {
    return res.status(400).json({ error: 'Cannot delete table with active order' });
  }

  db.prepare('DELETE FROM tables WHERE id = ?').run(req.params.id);
  io.to('restaurant').emit('table:deleted', { tableId: Number(req.params.id) });
  res.json({ message: 'Table deleted' });
});

// POST /tables/bulk — Create multiple tables [ADMIN]
app.post('/tables/bulk', authMiddleware('admin'), (req, res) => {
  const { tables: tableDefs } = req.body;

  if (!Array.isArray(tableDefs) || tableDefs.length === 0) {
    return res.status(400).json({ error: 'Tables array is required' });
  }

  const created = [];
  const errors = [];

  const insertStmt = db.prepare(
    'INSERT INTO tables (number, capacity, section, qr_token, qr_generated_at) VALUES (?, ?, ?, ?, ?)'
  );

  const bulkInsert = db.transaction(() => {
    for (const def of tableDefs) {
      const { number, capacity = 4, section = 'Main' } = def;
      if (!number) {
        errors.push({ number, error: 'Table number is required' });
        continue;
      }
      const existing = db.prepare('SELECT id FROM tables WHERE number = ?').get(number);
      if (existing) {
        errors.push({ number, error: `Table ${number} already exists` });
        continue;
      }
      const qrToken = generateQrToken(number);
      const result = insertStmt.run(number, capacity, section, qrToken, new Date().toISOString());
      const table = db.prepare('SELECT * FROM tables WHERE id = ?').get(result.lastInsertRowid);
      created.push(table);
    }
  });

  bulkInsert();

  for (const table of created) {
    io.to('restaurant').emit('table:added', { table });
  }

  res.status(201).json({ created, errors });
});

// GET /tables/:id/qr — Generate QR code
app.get('/tables/:id/qr', async (req, res) => {
  const table = db.prepare('SELECT * FROM tables WHERE id = ?').get(req.params.id);
  if (!table) return res.status(404).json({ error: 'Table not found' });

  const origin = req.query.origin || `http://localhost:${GATEWAY_PORT}`;
  const url = `${origin.replace(/\/$/, '')}/r/${RESTAURANT_ID}/customer?table=${table.number}&token=${table.qr_token}`;

  try {
    const qrDataUrl = await QRCode.toDataURL(url, {
      width: 400,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' },
    });
    res.json({ qr: qrDataUrl, url, tableNumber: table.number });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

// POST /tables/:id/qr/regenerate — Regenerate QR token [ADMIN]
app.post('/tables/:id/qr/regenerate', authMiddleware('admin'), (req, res) => {
  const table = db.prepare('SELECT * FROM tables WHERE id = ?').get(req.params.id);
  if (!table) return res.status(404).json({ error: 'Table not found' });

  const newToken = generateQrToken(table.number + Date.now());
  db.prepare('UPDATE tables SET qr_token = ?, qr_generated_at = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(
    newToken,
    new Date().toISOString(),
    req.params.id
  );

  const updated = db.prepare('SELECT * FROM tables WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// ═══════════════════════════════════════════════════════════
//  MENU API
// ═══════════════════════════════════════════════════════════

// GET /menu — All items (with optional filters)
app.get('/menu', (req, res) => {
  let query = 'SELECT * FROM menu_items WHERE 1=1';
  const params = [];

  if (req.query.category) {
    query += ' AND category = ?';
    params.push(req.query.category);
  }
  if (req.query.available !== undefined) {
    query += ' AND available = ?';
    params.push(Number(req.query.available));
  }

  query += ' ORDER BY category, sort_order, name';
  try {
    const items = db.prepare(query).all(...params);
    const enriched = items.map((item) => {
      const addons = db.prepare('SELECT * FROM menu_item_addons WHERE menu_item_id = ?').all(item.id);
      return { ...item, addons };
    });
    res.json(enriched);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve menu items' });
  }
});

// GET /menu/categories — Distinct categories
app.get('/menu/categories', (req, res) => {
  const categories = db.prepare('SELECT DISTINCT category FROM menu_items ORDER BY category').all();
  res.json(categories.map((c) => c.category));
});

// GET /menu/public — Public menu for QR self-order
app.get('/menu/public', (req, res) => {
  const { table, token } = req.query;
  if (!table || !token) {
    return res.status(400).json({ error: 'Table number and token are required' });
  }

  const tableRow = validateQrToken(table, token);
  if (!tableRow) {
    return res.status(401).json({ error: 'Invalid QR token' });
  }

  const config = readConfig();
  try {
    const items = db.prepare('SELECT * FROM menu_items WHERE available = 1 ORDER BY category, sort_order, name').all();
    const enriched = items.map((item) => {
      const addons = db.prepare('SELECT * FROM menu_item_addons WHERE menu_item_id = ?').all(item.id);
      return { ...item, addons };
    });
    res.json({
      restaurant: {
        id: RESTAURANT_ID,
        name: config.name,
        logo_url: config.logo_url || '',
        google_review_url: config.google_review_url || '',
        qr_theme: config.qr_theme || 'classic',
        billing_gst: config.billing_gst || { gst_enabled: true, gst_percent: 5, service_charge_enabled: false }
      },
      table: { id: tableRow.id, number: table, status: tableRow.status },
      menu: enriched,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load public menu' });
  }
});

// GET /menu/:id — Single item
app.get('/menu/:id', (req, res) => {
  const item = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(req.params.id);
  if (!item) return res.status(404).json({ error: 'Menu item not found' });
  res.json(item);
});

// POST /menu — Create item [ADMIN]
app.post('/menu', authMiddleware('admin'), (req, res) => {
  const { name, description, category, price, available = 1, image_placeholder, image_url } = req.body;

  if (!name || !category || price === undefined) {
    return res.status(400).json({ error: 'Name, category, and price are required' });
  }

  const result = db
    .prepare(
      'INSERT INTO menu_items (name, description, category, price, available, image_placeholder, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)'
    )
    .run(name, description || null, category, price, available, image_placeholder || null, image_url || null);

  const item = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(result.lastInsertRowid);
  io.to('restaurant').emit('menu:updated', {});
  res.status(201).json(item);
});

// PUT /menu/:id — Update item [ADMIN]
app.put('/menu/:id', authMiddleware('admin'), (req, res) => {
  const item = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(req.params.id);
  if (!item) return res.status(404).json({ error: 'Menu item not found' });

  const { name, description, category, price, available, image_placeholder, image_url } = req.body;

  db.prepare(
    `UPDATE menu_items SET
      name = COALESCE(?, name),
      description = COALESCE(?, description),
      category = COALESCE(?, category),
      price = COALESCE(?, price),
      available = COALESCE(?, available),
      image_placeholder = COALESCE(?, image_placeholder),
      image_url = COALESCE(?, image_url)
    WHERE id = ?`
  ).run(
    name || null,
    description !== undefined ? description : null,
    category || null,
    price !== undefined ? price : null,
    available !== undefined ? available : null,
    image_placeholder !== undefined ? image_placeholder : null,
    image_url !== undefined ? image_url : null,
    req.params.id
  );

  const updated = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(req.params.id);
  io.to('restaurant').emit('menu:updated', {});
  res.json(updated);
});

// DELETE /menu/:id — Delete item [ADMIN]
app.delete('/menu/:id', authMiddleware('admin'), (req, res) => {
  const item = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(req.params.id);
  if (!item) return res.status(404).json({ error: 'Menu item not found' });

  db.prepare('DELETE FROM menu_items WHERE id = ?').run(req.params.id);
  io.to('restaurant').emit('menu:updated', {});
  res.json({ message: 'Menu item deleted' });
});

// POST /menu/upload — Upload menu item custom image [ADMIN]
app.post('/menu/upload', authMiddleware('admin'), (req, res) => {
  const { filename, base64Data } = req.body;
  if (!filename || !base64Data) {
    return res.status(400).json({ error: 'Filename and base64Data are required' });
  }

  try {
    const buffer = Buffer.from(base64Data, 'base64');
    const safeFilename = Date.now() + '-' + path.basename(filename);
    const targetPath = path.join(uploadsDir, safeFilename);

    fs.writeFileSync(targetPath, buffer);

    res.json({ url: `/r/${RESTAURANT_ID}/uploads/${safeFilename}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save uploaded image' });
  }
});

// ═══════════════════════════════════════════════════════════
//  ORDERS API
// ═══════════════════════════════════════════════════════════

// Helper: get order with items
function getOrderWithItems(orderId) {
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
  if (!order) return null;
  const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(orderId);
  const parsedItems = items.map(item => {
    if (item.addons_json) {
      try {
        return { ...item, addons: JSON.parse(item.addons_json) };
      } catch (e) {
        return { ...item, addons: [] };
      }
    }
    return { ...item, addons: [] };
  });
  return { ...order, items: parsedItems };
}

function emitOrderUpdate(eventName, fullOrder) {
  if (!fullOrder) return;
  io.to('restaurant').emit(eventName, { order: fullOrder });
  if (fullOrder.table_number) {
    io.to(`table-${fullOrder.table_number}`).emit(eventName, { order: fullOrder });
  }
  if (fullOrder.customer_phone) {
    io.to(`customer-${fullOrder.customer_phone}`).emit(eventName, { order: fullOrder });
  }
}

// GET /orders — All orders with items
app.get('/orders', (req, res) => {
  let query = "SELECT * FROM orders WHERE 1=1";
  const params = [];

  if (req.query.status) {
    query += ' AND status = ?';
    params.push(req.query.status);
  }
  if (req.query.table_id) {
    query += ' AND table_id = ?';
    params.push(Number(req.query.table_id));
  }
  if (req.query.date === 'today') {
    query += " AND DATE(created_at) = DATE('now', 'localtime')";
  } else if (req.query.date) {
    query += ' AND DATE(created_at) = ?';
    params.push(req.query.date);
  }

  query += ' ORDER BY created_at DESC';
  const orders = db.prepare(query).all(...params);

  const enriched = orders.map((order) => {
    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
    return { ...order, items };
  });

  res.json(enriched);
});

// GET /orders/active — Get active order by customer phone or table ID
app.get('/orders/active', (req, res) => {
  const { phone, table_id } = req.query;
  let activeOrder = null;

  if (phone) {
    activeOrder = db
      .prepare(
        "SELECT * FROM orders WHERE customer_phone = ? AND status NOT IN ('paid', 'cancelled') ORDER BY created_at DESC LIMIT 1"
      )
      .get(phone);
  } else if (table_id) {
    activeOrder = db
      .prepare(
        "SELECT * FROM orders WHERE table_id = ? AND status NOT IN ('paid', 'cancelled') ORDER BY created_at DESC LIMIT 1"
      )
      .get(Number(table_id));
  }

  if (!activeOrder) {
    return res.json({ order: null });
  }

  const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(activeOrder.id);
  res.json({ order: { ...activeOrder, items } });
});

// GET /orders/self — Self-order: get active order for table
app.get('/orders/self', (req, res) => {
  const { table, token } = req.query;
  if (!table || !token) {
    return res.status(400).json({ error: 'Table number and token are required' });
  }

  const tableRow = validateQrToken(table, token);
  if (!tableRow) {
    return res.status(401).json({ error: 'Invalid QR token' });
  }

  const activeOrder = db
    .prepare(
      "SELECT * FROM orders WHERE table_id = ? AND status NOT IN ('paid', 'cancelled') ORDER BY created_at DESC LIMIT 1"
    )
    .get(tableRow.id);

  if (!activeOrder) {
    return res.json({ order: null });
  }

  const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(activeOrder.id);
  res.json({ order: { ...activeOrder, items } });
});

// POST /orders/self — Self-order: create or add to order
app.post('/orders/self', (req, res) => {
  const { table, token } = req.query;
  if (!table || !token) {
    return res.status(400).json({ error: 'Table number and token are required' });
  }

  const tableRow = validateQrToken(table, token);
  if (!tableRow) {
    return res.status(401).json({ error: 'Invalid QR token' });
  }

  const { items, notes, customer_phone, customer_name } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Items array is required' });
  }

  // Check for existing active order
  let order = db
    .prepare(
      "SELECT * FROM orders WHERE table_id = ? AND status NOT IN ('paid', 'cancelled') ORDER BY created_at DESC LIMIT 1"
    )
    .get(tableRow.id);

  const orderExists = !!order;

  const addItems = db.transaction(() => {
    if (!order) {
      // Create new order
      const result = db
        .prepare(
          "INSERT INTO orders (table_id, table_number, type, status, notes, customer_phone, customer_name, total) VALUES (?, ?, 'dine-in', 'pending', ?, ?, ?, 0)"
        )
        .run(tableRow.id, table, notes || null, customer_phone || null, customer_name || null);
      order = db.prepare('SELECT * FROM orders WHERE id = ?').get(result.lastInsertRowid);
    } else {
      // Reset order status back to 'preparing' if it was already served/ready so it pops back into KDS
      if (order.status === 'served' || order.status === 'ready') {
        db.prepare("UPDATE orders SET status = 'preparing' WHERE id = ?").run(order.id);
      }
      // Update customer phone number if it wasn't recorded yet
      if (customer_phone && !order.customer_phone) {
        db.prepare("UPDATE orders SET customer_phone = ? WHERE id = ?").run(customer_phone, order.id);
      }
      // Update customer name if it wasn't recorded yet
      if (customer_name && !order.customer_name) {
        db.prepare("UPDATE orders SET customer_name = ? WHERE id = ?").run(customer_name, order.id);
      }
    }

    // Add items
    for (const item of items) {
      const menuItem = db.prepare('SELECT * FROM menu_items WHERE id = ? AND available = 1').get(item.menu_item_id);
      if (!menuItem) continue;

      const qty = item.quantity || 1;
      let finalPrice = menuItem.price;
      let addonsJson = null;

      if (Array.isArray(item.addons) && item.addons.length > 0) {
        addonsJson = JSON.stringify(item.addons);
        const addonsTotal = item.addons.reduce((sum, ad) => sum + ad.price * (ad.quantity || 1), 0);
        finalPrice += (addonsTotal / qty);
      }

      db.prepare(
        'INSERT INTO order_items (order_id, menu_item_id, item_name, quantity, price, notes, is_addon, addons_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
      ).run(order.id, menuItem.id, menuItem.name, qty, finalPrice, item.notes || null, orderExists ? 1 : 0, addonsJson);
    }

    // Recalculate total
    const totalRow = db
      .prepare('SELECT SUM(quantity * price) as total FROM order_items WHERE order_id = ?')
      .get(order.id);
    
    const discAmount = order ? (order.discount_amount || 0) : 0;
    const finalTotal = Math.max(0, (totalRow.total || 0) - discAmount);

    db.prepare('UPDATE orders SET total = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(
      finalTotal,
      order.id
    );
  });

  addItems();

  // Auto-print KOT on order placement
  const config = readConfig();
  if (config.printing?.auto_print?.on_kot_create) {
    console.log(`[Printer] AUTO-PRINT KOT: New Customer Self-Order placed for Table ${tableRow.number}. Print KOT to ${config.printing?.hardware?.kot_device || 'Default'}`);
  }

  const fullOrder = getOrderWithItems(order.id);
  updateTableStatus(tableRow.id);

  emitOrderUpdate('order:new', fullOrder);
  res.status(201).json(fullOrder);
});

// GET /orders/:id — Single order with items
app.get('/orders/:id', (req, res) => {
  const order = getOrderWithItems(Number(req.params.id));
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json(order);
});

// POST /orders — Create order [STAFF]
app.post('/orders', authMiddleware('staff'), (req, res) => {
  const { table_id, table_number, type = 'dine-in', items, notes, customer_phone, customer_name, waiter_name, discount_amount = 0, coupon_code } = req.body;

  if (!table_id) {
    return res.status(400).json({ error: 'table_id is required' });
  }

  const table = db.prepare('SELECT * FROM tables WHERE id = ?').get(table_id);
  if (!table) return res.status(404).json({ error: 'Table not found' });

  const tblNumber = table_number || table.number;

  const createOrder = db.transaction(() => {
    // Create order
    const result = db
      .prepare(
        'INSERT INTO orders (table_id, table_number, type, status, notes, customer_phone, customer_name, waiter_name, total) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
      )
      .run(table_id, tblNumber, type, 'pending', notes || null, customer_phone || null, customer_name || null, waiter_name || null, 0);

    const orderId = result.lastInsertRowid;

    // Add items
    if (Array.isArray(items) && items.length > 0) {
      for (const item of items) {
        const menuItem = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(item.menu_item_id);
        if (!menuItem) continue;

        const qty = item.quantity || 1;
        let finalPrice = menuItem.price;
        let addonsJson = null;

        if (Array.isArray(item.addons) && item.addons.length > 0) {
          addonsJson = JSON.stringify(item.addons);
          const addonsTotal = item.addons.reduce((sum, ad) => sum + ad.price * (ad.quantity || 1), 0);
          finalPrice += (addonsTotal / qty);
        }

        db.prepare(
          'INSERT INTO order_items (order_id, menu_item_id, item_name, quantity, price, notes, addons_json) VALUES (?, ?, ?, ?, ?, ?, ?)'
        ).run(orderId, menuItem.id, menuItem.name, qty, finalPrice, item.notes || null, addonsJson);
      }

      // Calculate total
      const totalRow = db
        .prepare('SELECT SUM(quantity * price) as total FROM order_items WHERE order_id = ?')
        .get(orderId);
      
      const discAmt = parseFloat(discount_amount) || 0;
      const finalTotal = Math.max(0, (totalRow.total || 0) - discAmt);

      db.prepare('UPDATE orders SET total = ?, discount_amount = ?, coupon_code = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(
        finalTotal,
        discAmt,
        coupon_code || null,
        orderId
      );
    }

    return orderId;
  });

  const orderId = createOrder();

  // Update table status
  updateTableStatus(table_id);

  // Auto-print KOT on order placement
  const config = readConfig();
  if (config.printing?.auto_print?.on_kot_create) {
    console.log(`[Printer] AUTO-PRINT KOT: New Staff Order placed for Table ${tblNumber} (Order #${orderId}). Print KOT to ${config.printing?.hardware?.kot_device || 'Default'}`);
  }

  const fullOrder = getOrderWithItems(orderId);
  emitOrderUpdate('order:new', fullOrder);

  res.status(201).json(fullOrder);
});

// PUT /orders/:id — Update order status [STAFF]
app.put('/orders/:id', authMiddleware('staff'), (req, res) => {
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  const { status, notes } = req.body;

  if (status) {
    let finalStatus = status;
    let paymentStatus = order.payment_status;
    let paymentMethod = order.payment_method;
    let onlineAmount = order.online_amount;
    let cashAmount = order.cash_amount;
    let settledAt = order.settled_at;

    // For delivery orders (like Swiggy/Zomato) or when marked as completed/delivered/served,
    // auto-settle the financials so they flow into analytics and money management.
    if (status === 'delivered' || status === 'completed' || status === 'served' || status === 'paid') {
      finalStatus = 'paid';
      paymentStatus = 'paid';
      if (!paymentMethod) {
        paymentMethod = 'online';
      }
      if (!settledAt) {
        settledAt = new Date().toISOString();
      }
      
      const itemsTotalRow = db
        .prepare('SELECT SUM(quantity * price) as total FROM order_items WHERE order_id = ?')
        .get(req.params.id);
      const total = itemsTotalRow.total || 0;
      
      if (paymentMethod === 'cash') {
        cashAmount = total;
        onlineAmount = 0;
      } else {
        cashAmount = 0;
        onlineAmount = total;
      }
    }

    db.prepare(
      'UPDATE orders SET status = ?, payment_status = ?, payment_method = ?, online_amount = ?, cash_amount = ?, settled_at = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).run(
      finalStatus,
      paymentStatus,
      paymentMethod,
      onlineAmount,
      cashAmount,
      settledAt,
      req.params.id
    );

    // Handle table status transitions
    if (order.table_id) {
      updateTableStatus(order.table_id);
    }
  }

  if (notes !== undefined) {
    db.prepare('UPDATE orders SET notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(
      notes,
      req.params.id
    );
  }

  const fullOrder = getOrderWithItems(Number(req.params.id));
  emitOrderUpdate('order:updated', fullOrder);

  res.json(fullOrder);
});

// DELETE /orders/:id — Cancel order [ADMIN]
app.delete('/orders/:id', authMiddleware('admin'), (req, res) => {
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  db.prepare("UPDATE orders SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(
    req.params.id
  );

  if (order.table_id) {
    updateTableStatus(order.table_id);
  }

  const fullOrder = getOrderWithItems(Number(req.params.id));
  emitOrderUpdate('order:updated', fullOrder);
  res.json(fullOrder);
});

// POST /orders/:id/items — Add items to order [STAFF]
app.post('/orders/:id/items', authMiddleware('staff'), (req, res) => {
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  const { items } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Items array is required' });
  }

  const addItems = db.transaction(() => {
    // Reset order status back to 'preparing' if it was already served/ready so it pops back into KDS
    if (order.status === 'served' || order.status === 'ready') {
      db.prepare("UPDATE orders SET status = 'preparing' WHERE id = ?").run(req.params.id);
    }

    for (const item of items) {
      const menuItem = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(item.menu_item_id);
      if (!menuItem) continue;

      const qty = item.quantity || 1;
      let finalPrice = menuItem.price;
      let addonsJson = null;

      if (Array.isArray(item.addons) && item.addons.length > 0) {
        addonsJson = JSON.stringify(item.addons);
        const addonsTotal = item.addons.reduce((sum, ad) => sum + ad.price * (ad.quantity || 1), 0);
        finalPrice += (addonsTotal / qty);
      }

      db.prepare(
        'INSERT INTO order_items (order_id, menu_item_id, item_name, quantity, price, notes, is_addon, addons_json) VALUES (?, ?, ?, ?, ?, ?, 1, ?)'
      ).run(req.params.id, menuItem.id, menuItem.name, qty, finalPrice, item.notes || null, addonsJson);
    }

    // Recalculate total
    const totalRow = db
      .prepare('SELECT SUM(quantity * price) as total FROM order_items WHERE order_id = ?')
      .get(req.params.id);
    
    const discAmount = order.discount_amount || 0;
    const finalTotal = Math.max(0, (totalRow.total || 0) - discAmount);

    db.prepare('UPDATE orders SET total = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(
      finalTotal,
      req.params.id
    );
  });

  addItems();

  // Auto-print KOT on order item addition
  const config = readConfig();
  if (config.printing?.auto_print?.on_kot_create) {
    console.log(`[Printer] AUTO-PRINT KOT: Added items to Order #${req.params.id}. Print KOT to ${config.printing?.hardware?.kot_device || 'Default'}`);
  }

  const fullOrder = getOrderWithItems(Number(req.params.id));
  emitOrderUpdate('order:itemAdded', fullOrder);
  res.json(fullOrder);
});

// PUT /orders/:id/items/:itemId — Update item status [STAFF]
app.put('/orders/:id/items/:itemId', authMiddleware('staff'), (req, res) => {
  const orderItem = db
    .prepare('SELECT * FROM order_items WHERE id = ? AND order_id = ?')
    .get(req.params.itemId, req.params.id);
  if (!orderItem) return res.status(404).json({ error: 'Order item not found' });

  const { status, quantity, notes } = req.body;

  if (status) {
    db.prepare('UPDATE order_items SET status = ? WHERE id = ?').run(status, req.params.itemId);
  }
  if (quantity !== undefined) {
    db.prepare('UPDATE order_items SET quantity = ? WHERE id = ?').run(quantity, req.params.itemId);
    // Recalculate total
    const totalRow = db
      .prepare('SELECT SUM(quantity * price) as total FROM order_items WHERE order_id = ?')
      .get(req.params.id);
    db.prepare('UPDATE orders SET total = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(
      totalRow.total || 0,
      req.params.id
    );
  }
  if (notes !== undefined) {
    db.prepare('UPDATE order_items SET notes = ? WHERE id = ?').run(notes, req.params.itemId);
  }

  // Check if all items are ready → update order status
  if (status === 'ready') {
    const allItems = db.prepare('SELECT status FROM order_items WHERE order_id = ?').all(req.params.id);
    const allReady = allItems.every((i) => i.status === 'ready');
    if (allReady) {
      db.prepare("UPDATE orders SET status = 'ready', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(
        req.params.id
      );
      const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
      if (order && order.table_id) updateTableStatus(order.table_id);
    }
  }

  const fullOrder = getOrderWithItems(Number(req.params.id));
  emitOrderUpdate('order:updated', fullOrder);
  res.json(fullOrder);
});

// DELETE /orders/:id/items/:itemId — Remove item [STAFF]
app.delete('/orders/:id/items/:itemId', authMiddleware('staff'), (req, res) => {
  const orderItem = db
    .prepare('SELECT * FROM order_items WHERE id = ? AND order_id = ?')
    .get(req.params.itemId, req.params.id);
  if (!orderItem) return res.status(404).json({ error: 'Order item not found' });

  db.prepare('DELETE FROM order_items WHERE id = ?').run(req.params.itemId);

  // Recalculate total
  const totalRow = db
    .prepare('SELECT SUM(quantity * price) as total FROM order_items WHERE order_id = ?')
    .get(req.params.id);
  db.prepare('UPDATE orders SET total = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(
    totalRow.total || 0,
    req.params.id
  );

  const fullOrder = getOrderWithItems(Number(req.params.id));
  emitOrderUpdate('order:updated', fullOrder);
  res.json(fullOrder);
});

// GET /orders/customer/:phone — Get customer historical orders
app.get('/orders/customer/:phone', (req, res) => {
  const phone = req.params.phone;
  if (!phone) return res.status(400).json({ error: 'Phone number is required' });

  const orders = db.prepare("SELECT * FROM orders WHERE customer_phone = ? ORDER BY created_at DESC").all(phone);
  const enriched = orders.map((order) => {
    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
    return { ...order, items };
  });

  res.json(enriched);
});

// POST /orders/:id/pay-request — Customer requests checkout (payment pending)
app.post('/orders/:id/pay-request', (req, res) => {
  const { table, token } = req.query;
  if (!table || !token) {
    return res.status(400).json({ error: 'Table and token are required' });
  }
  const tableRow = validateQrToken(table, token);
  if (!tableRow) {
    return res.status(401).json({ error: 'Invalid QR token' });
  }

  const order = db.prepare('SELECT * FROM orders WHERE id = ? AND table_id = ?').get(req.params.id, tableRow.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  const { payment_method } = req.body;
  if (!payment_method) return res.status(400).json({ error: 'Payment method is required' });

  db.prepare(
    "UPDATE orders SET payment_status = 'pending_payment', payment_method = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
  ).run(payment_method, req.params.id);

  const fullOrder = getOrderWithItems(Number(req.params.id));
  emitOrderUpdate('order:updated', fullOrder);

  res.json(fullOrder);
});

// POST /orders/:id/settle — Settle billing / close order [STAFF]
app.post('/orders/:id/settle', authMiddleware('staff'), (req, res) => {
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  const { payment_method, cash_amount, online_amount, discount_amount, coupon_code } = req.body;
  if (!payment_method) return res.status(400).json({ error: 'Payment method is required' });

  const config = readConfig();
  const itemsTotalRow = db
    .prepare('SELECT SUM(quantity * price) as total FROM order_items WHERE order_id = ?')
    .get(req.params.id);
  const rawTotal = itemsTotalRow.total || 0;

  // Recalculate or apply discount/coupon if passed during settlement
  let discAmt = parseFloat(discount_amount) || 0;
  if (coupon_code) {
    const coupon = db.prepare('SELECT * FROM coupons WHERE code = ? AND active = 1').get(coupon_code.trim().toUpperCase());
    if (coupon && rawTotal >= coupon.min_order_amount) {
      if (coupon.discount_type === 'percentage') {
        discAmt = (coupon.value / 100) * rawTotal;
      } else {
        discAmt = coupon.value;
      }
    }
  } else {
    discAmt = discAmt || order.discount_amount || 0;
  }

  const taxableAmount = Math.max(0, rawTotal - discAmt);
  const gstEnabled = config?.billing?.gst_enabled;
  const gstPercent = config?.billing?.gst_percentage || 0;
  const gstAmount = gstEnabled ? (taxableAmount * gstPercent) / 100 : 0;
  const serviceChargeEnabled = config?.billing?.service_charge_enabled ?? true;
  const serviceChargePercent = serviceChargeEnabled ? (config?.billing?.service_charge_percentage || 0) : 0;
  const serviceChargeAmount = (taxableAmount * serviceChargePercent) / 100;
  const grandTotal = taxableAmount + gstAmount + serviceChargeAmount;

  const finalTotal = grandTotal;

  db.prepare('UPDATE orders SET total = ?, discount_amount = ?, coupon_code = ? WHERE id = ?').run(
    finalTotal,
    discAmt,
    coupon_code || order.coupon_code || null,
    req.params.id
  );

  let cashAmt = 0;
  let onlineAmt = 0;

  if (payment_method === 'cash') {
    cashAmt = finalTotal;
    onlineAmt = 0;
  } else if (payment_method === 'upi' || payment_method === 'online') {
    cashAmt = 0;
    onlineAmt = finalTotal;
  } else if (payment_method === 'split') {
    cashAmt = parseFloat(cash_amount) || 0;
    onlineAmt = parseFloat(online_amount) || 0;

    // Validate that split matches final total
    if (Math.abs(cashAmt + onlineAmt - finalTotal) > 0.05) {
      return res.status(400).json({
        error: `Split amounts (Cash: ${cashAmt}, Online: ${onlineAmt}) must sum up to the total of ${finalTotal}`
      });
    }
  } else {
    return res.status(400).json({ error: 'Invalid payment method' });
  }

  const settledBy = req.staffName || 'System';
  db.prepare(
    "UPDATE orders SET status = 'paid', payment_status = 'paid', payment_method = ?, cash_amount = ?, online_amount = ?, settled_by = ?, settled_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
  ).run(payment_method, cashAmt, onlineAmt, settledBy, req.params.id);

  if (order.table_id) {
    updateTableStatus(order.table_id);
  }

  // Auto-print receipt on settlement
  if (config.printing?.auto_print?.on_settlement) {
    console.log(`[Printer] AUTO-PRINT BILL: Order #${req.params.id} settled via ${payment_method}. Total: INR ${finalTotal}. Printing bill preview...`);
  }

  const fullOrder = getOrderWithItems(Number(req.params.id));
  emitOrderUpdate('order:updated', fullOrder);

  res.json(fullOrder);
});

// POST /orders/:id/send-whatsapp — Simulate sending WhatsApp message with bill link/receipt details
app.post('/orders/:id/send-whatsapp', (req, res) => {
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: 'Phone number is required' });
  if (!/^\d{10}$/.test(phone)) {
    return res.status(400).json({ error: 'Customer phone number must be exactly 10 digits' });
  }

  // Update order's whatsapp_sent field
  db.prepare('UPDATE orders SET whatsapp_sent = 1 WHERE id = ?').run(req.params.id);

  console.log(`[WhatsApp Simulation] Sending bill for Order #${order.id} (Total: INR ${order.total}) to +91${phone}`);

  res.json({ message: `Bill sent to +91-${phone} successfully via WhatsApp Simulation.` });
});

// GET /s/:id — Redirect shortened URL key to the actual receipt path
app.get('/s/:id', (req, res) => {
  const record = billsDb.prepare('SELECT url FROM short_urls WHERE id = ?').get(req.params.id);
  if (!record) {
    return res.status(404).send('Short URL not found or expired.');
  }
  res.redirect(record.url);
});

// POST /orders/upload-image-bill — Upload base64 receipt image/PDF, save it to disk, and return direct path (no database storage)
app.post('/orders/upload-image-bill', (req, res) => {
  const { base64Image, filename } = req.body;
  if (!base64Image) {
    return res.status(400).json({ error: 'base64Image is required' });
  }
  try {
    // Correctly match and extract base64 data regardless of MIME type (e.g. image/png, application/pdf)
    const base64Data = base64Image.replace(/^data:[^;]+;base64,/, "");
    const buffer = Buffer.from(base64Data, 'base64');
    const name = filename || `bill-${Date.now()}.png`;
    const targetPath = path.join(uploadsDir, name);
    fs.writeFileSync(targetPath, buffer);

    const actualPath = `/uploads/${name}`;
    // Return direct static file URL instead of a database shortened URL redirect
    res.json({ url: actualPath });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to upload receipt.' });
  }
});


// GET /settings/config — Get entire configuration including general, billing, and printing configs [STAFF/ADMIN]
app.get('/settings/config', authMiddleware('staff'), (req, res) => {
  const config = readConfig();
  res.json(config);
});

// PUT /settings/config — Update configuration including general, billing, and printing configs [ADMIN]
app.put('/settings/config', authMiddleware('admin'), (req, res) => {
  const config = readConfig();
  const { name, contact_phone, contact_email, location, fssai_compliance, billing, printing, google_review_url, qr_theme, logo_url, integrations } = req.body;

  if (name !== undefined) config.name = name;
  if (contact_phone !== undefined) {
    if (contact_phone && !/^\d{10}$/.test(contact_phone)) {
      return res.status(400).json({ error: 'Customer/Contact phone number must be exactly 10 digits' });
    }
    config.contact_phone = contact_phone;
  }
  if (contact_email !== undefined) config.contact_email = contact_email;
  if (location !== undefined) config.location = location;
  if (fssai_compliance !== undefined) config.fssai_compliance = fssai_compliance;
  if (billing !== undefined) config.billing = billing;
  if (printing !== undefined) config.printing = printing;
  if (google_review_url !== undefined) config.google_review_url = google_review_url;
  if (qr_theme !== undefined) config.qr_theme = qr_theme;
  if (logo_url !== undefined) config.logo_url = logo_url;
  if (integrations !== undefined) config.integrations = integrations;

  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf8');

  // Also sync with registry.json if necessary
  try {
    const agencyRegistryPath = path.join(__dirname, '..', '..', 'agency-core', 'registry.json');
    if (fs.existsSync(agencyRegistryPath)) {
      const reg = JSON.parse(fs.readFileSync(agencyRegistryPath, 'utf8'));
      const rIndex = reg.restaurants.findIndex(r => r.id === RESTAURANT_ID);
      if (rIndex !== -1) {
        reg.restaurants[rIndex].name = config.name || reg.restaurants[rIndex].name;
        reg.restaurants[rIndex].contact_phone = config.contact_phone || reg.restaurants[rIndex].contact_phone;
        reg.restaurants[rIndex].location = config.location || reg.restaurants[rIndex].location;
        reg.restaurants[rIndex].contact_email = config.contact_email || reg.restaurants[rIndex].contact_email;
        reg.restaurants[rIndex].logo_url = config.logo_url || reg.restaurants[rIndex].logo_url;
        fs.writeFileSync(agencyRegistryPath, JSON.stringify(reg, null, 2), 'utf8');
      }
    }
  } catch (e) {
    console.error('Failed to sync settings with agency registry:', e.message);
  }

  res.json({ message: 'Configuration updated successfully', config });
});

// GET /settings/upi-qr — Generates dynamic Base64 UPI QR code using the restaurant's UPI ID and details
app.get('/settings/upi-qr', (req, res) => {
  const config = readConfig();
  const upiId = req.query.upi_id || config.billing?.upi_id;
  const amount = req.query.amount;
  const merchantName = config.name || 'Restaurant';

  if (!upiId) {
    return res.status(400).json({ error: 'UPI ID is not configured' });
  }

  // Construct UPI URI
  const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&cu=INR${amount ? `&am=${amount}` : ''}`;

  QRCode.toDataURL(upiUrl, (err, url) => {
    if (err) {
      console.error('Failed to generate UPI QR:', err.message);
      return res.status(500).json({ error: 'Failed to generate QR Code' });
    }
    res.json({ qr_base64: url, upi_url: upiUrl });
  });
});

// GET /coupons — Get all coupons [STAFF/ADMIN/PUBLIC]
app.get('/coupons', (req, res) => {
  try {
    const coupons = db.prepare('SELECT * FROM coupons ORDER BY created_at DESC').all();
    res.json(coupons);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /coupons — Create/Update a coupon [ADMIN]
app.post('/coupons', authMiddleware('admin'), (req, res) => {
  const { id, code, discount_type, value, min_order_amount, active } = req.body;
  if (!code || !discount_type || value === undefined) {
    return res.status(400).json({ error: 'code, discount_type, and value are required' });
  }

  try {
    if (id) {
      db.prepare(
        'UPDATE coupons SET code = ?, discount_type = ?, value = ?, min_order_amount = ?, active = ? WHERE id = ?'
      ).run(code.trim().toUpperCase(), discount_type, parseFloat(value), parseFloat(min_order_amount || 0), active ? 1 : 0, id);
      res.json({ message: 'Coupon updated successfully' });
    } else {
      db.prepare(
        'INSERT INTO coupons (code, discount_type, value, min_order_amount, active) VALUES (?, ?, ?, ?, ?)'
      ).run(code.trim().toUpperCase(), discount_type, parseFloat(value), parseFloat(min_order_amount || 0), active !== undefined ? (active ? 1 : 0) : 1);
      res.json({ message: 'Coupon created successfully' });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE /coupons/:id — Delete coupon [ADMIN]
app.delete('/coupons/:id', authMiddleware('admin'), (req, res) => {
  try {
    db.prepare('DELETE FROM coupons WHERE id = ?').run(req.params.id);
    res.json({ message: 'Coupon deleted successfully' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /coupons/validate — Validate a coupon for a given order amount
app.post('/coupons/validate', (req, res) => {
  const { code, amount } = req.body;
  if (!code) return res.status(400).json({ error: 'Coupon code is required' });
  if (amount === undefined) return res.status(400).json({ error: 'Order amount is required' });

  try {
    const coupon = db.prepare('SELECT * FROM coupons WHERE code = ? AND active = 1').get(code.trim().toUpperCase());
    if (!coupon) {
      return res.status(404).json({ valid: false, message: 'Invalid or expired coupon' });
    }

    const orderAmt = parseFloat(amount);
    if (orderAmt < coupon.min_order_amount) {
      return res.status(400).json({
        valid: false,
        message: `Minimum order amount of INR ${coupon.min_order_amount} is required to use this coupon`
      });
    }

    let discount = 0;
    if (coupon.discount_type === 'percentage') {
      discount = (coupon.value / 100) * orderAmt;
    } else {
      discount = coupon.value;
    }

    // Discount cannot exceed total amount
    discount = Math.min(discount, orderAmt);

    res.json({
      valid: true,
      coupon,
      discount_amount: discount
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /menu/:id/addons — Retrieve all add-ons for a specific menu item
app.get('/menu/:id/addons', (req, res) => {
  try {
    const addons = db.prepare('SELECT * FROM menu_item_addons WHERE menu_item_id = ?').all(req.params.id);
    res.json(addons);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /menu/:id/addons — Add/Update an add-on for a menu item [ADMIN]
app.post('/menu/:id/addons', authMiddleware('admin'), (req, res) => {
  const { id, name, price } = req.body;
  if (!name || price === undefined) {
    return res.status(400).json({ error: 'name and price are required' });
  }

  try {
    if (id) {
      db.prepare(
        'UPDATE menu_item_addons SET name = ?, price = ? WHERE id = ? AND menu_item_id = ?'
      ).run(name, parseFloat(price), id, req.params.id);
      res.json({ message: 'Add-on updated successfully' });
    } else {
      db.prepare(
        'INSERT INTO menu_item_addons (menu_item_id, name, price) VALUES (?, ?, ?)'
      ).run(req.params.id, name, parseFloat(price));
      res.json({ message: 'Add-on created successfully' });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE /menu/:id/addons/:addonId — Delete an add-on [ADMIN]
app.delete('/menu/:id/addons/:addonId', authMiddleware('admin'), (req, res) => {
  try {
    db.prepare('DELETE FROM menu_item_addons WHERE id = ? AND menu_item_id = ?').run(req.params.addonId, req.params.id);
    res.json({ message: 'Add-on deleted successfully' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PUT /menu/reorder — Takes an array of { id, sort_order } to re-arrange menu listing [ADMIN]
app.put('/menu/reorder', authMiddleware('admin'), (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items)) {
    return res.status(400).json({ error: 'items must be an array of { id, sort_order }' });
  }

  const updateSort = db.transaction(() => {
    const stmt = db.prepare('UPDATE menu_items SET sort_order = ? WHERE id = ?');
    for (const item of items) {
      stmt.run(item.sort_order || 0, item.id);
    }
  });

  try {
    updateSort();
    res.json({ message: 'Menu items re-ordered successfully' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ═══════════════════════════════════════════════════════════
//  RESERVATIONS API
// ═══════════════════════════════════════════════════════════

// GET /reservations — All reservations with filters
app.get('/reservations', (req, res) => {
  let query = 'SELECT * FROM reservations WHERE 1=1';
  const params = [];

  if (req.query.date) {
    query += ' AND reservation_date = ?';
    params.push(req.query.date);
  }
  if (req.query.status) {
    query += ' AND status = ?';
    params.push(req.query.status);
  }
  if (req.query.table_id) {
    query += ' AND table_id = ?';
    params.push(Number(req.query.table_id));
  }

  query += ' ORDER BY reservation_date, reservation_time';
  const reservations = db.prepare(query).all(...params);
  res.json(reservations);
});

// GET /reservations/today — Today's reservations
app.get('/reservations/today', (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const reservations = db
    .prepare(
      "SELECT * FROM reservations WHERE reservation_date = ? AND status != 'cancelled' ORDER BY reservation_time"
    )
    .all(today);
  res.json(reservations);
});

// GET /reservations/availability — Check available tables
app.get('/reservations/availability', (req, res) => {
  const { date, time, party_size } = req.query;

  if (!date || !time || !party_size) {
    return res.status(400).json({ error: 'date, time, and party_size are required' });
  }

  const size = Number(party_size);
  const [reqH, reqM] = time.split(':').map(Number);
  const requestedMinutes = reqH * 60 + reqM;

  // Get all tables with sufficient capacity
  const tables = db.prepare('SELECT * FROM tables WHERE capacity >= ? ORDER BY capacity').all(size);

  // Find tables not reserved at that time
  const available = tables.filter((table) => {
    const reservations = db
      .prepare(
        "SELECT reservation_time, duration_minutes FROM reservations WHERE table_id = ? AND reservation_date = ? AND status = 'confirmed'"
      )
      .all(table.id, date);

    // Check for time overlap
    for (const resv of reservations) {
      const [rH, rM] = resv.reservation_time.split(':').map(Number);
      const resvStart = rH * 60 + rM;
      const resvEnd = resvStart + (resv.duration_minutes || 90);
      const requestedEnd = requestedMinutes + 90;

      // Overlap check
      if (requestedMinutes < resvEnd && requestedEnd > resvStart) {
        return false;
      }
    }
    return true;
  });

  res.json(available);
});

// GET /reservations/:id — Single reservation
app.get('/reservations/:id', (req, res) => {
  const reservation = db.prepare('SELECT * FROM reservations WHERE id = ?').get(req.params.id);
  if (!reservation) return res.status(404).json({ error: 'Reservation not found' });
  res.json(reservation);
});

// POST /reservations — Create reservation
app.post('/reservations', (req, res) => {
  const {
    table_id,
    table_number,
    customer_name,
    customer_phone,
    customer_email,
    party_size,
    reservation_date,
    reservation_time,
    duration_minutes = 90,
    notes,
  } = req.body;

  if (!customer_name || !party_size || !reservation_date || !reservation_time) {
    return res
      .status(400)
      .json({ error: 'customer_name, party_size, reservation_date, and reservation_time are required' });
  }

  // Resolve table number if table_id provided
  let tblNumber = table_number;
  if (table_id && !tblNumber) {
    const table = db.prepare('SELECT number FROM tables WHERE id = ?').get(table_id);
    if (table) tblNumber = table.number;
  }

  const result = db
    .prepare(
      `INSERT INTO reservations (table_id, table_number, customer_name, customer_phone, customer_email, party_size, reservation_date, reservation_time, duration_minutes, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      table_id || null,
      tblNumber || null,
      customer_name,
      customer_phone || null,
      customer_email || null,
      party_size,
      reservation_date,
      reservation_time,
      duration_minutes,
      notes || null
    );

  const reservation = db.prepare('SELECT * FROM reservations WHERE id = ?').get(result.lastInsertRowid);
  io.to('restaurant').emit('reservation:new', { reservation });

  // Update table status if applicable
  if (table_id) updateTableStatus(table_id);

  res.status(201).json(reservation);
});

// PUT /reservations/:id — Update reservation
app.put('/reservations/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM reservations WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Reservation not found' });

  const {
    table_id,
    table_number,
    customer_name,
    customer_phone,
    customer_email,
    party_size,
    reservation_date,
    reservation_time,
    duration_minutes,
    status,
    notes,
  } = req.body;

  db.prepare(
    `UPDATE reservations SET
      table_id = COALESCE(?, table_id),
      table_number = COALESCE(?, table_number),
      customer_name = COALESCE(?, customer_name),
      customer_phone = COALESCE(?, customer_phone),
      customer_email = COALESCE(?, customer_email),
      party_size = COALESCE(?, party_size),
      reservation_date = COALESCE(?, reservation_date),
      reservation_time = COALESCE(?, reservation_time),
      duration_minutes = COALESCE(?, duration_minutes),
      status = COALESCE(?, status),
      notes = COALESCE(?, notes)
    WHERE id = ?`
  ).run(
    table_id || null,
    table_number || null,
    customer_name || null,
    customer_phone || null,
    customer_email || null,
    party_size || null,
    reservation_date || null,
    reservation_time || null,
    duration_minutes || null,
    status || null,
    notes || null,
    req.params.id
  );

  const updated = db.prepare('SELECT * FROM reservations WHERE id = ?').get(req.params.id);
  io.to('restaurant').emit('reservation:updated', { reservation: updated });

  // Update relevant table statuses
  if (existing.table_id) updateTableStatus(existing.table_id);
  if (table_id && table_id !== existing.table_id) updateTableStatus(table_id);

  res.json(updated);
});

// DELETE /reservations/:id — Cancel reservation
app.delete('/reservations/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM reservations WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Reservation not found' });

  db.prepare("UPDATE reservations SET status = 'cancelled' WHERE id = ?").run(req.params.id);

  io.to('restaurant').emit('reservation:cancelled', { reservationId: Number(req.params.id) });

  if (existing.table_id) updateTableStatus(existing.table_id);

  res.json({ message: 'Reservation cancelled' });
});

// ═══════════════════════════════════════════════════════════
//  OUTLETS & DELIVERY API [ADMIN]
// ═══════════════════════════════════════════════════════════

app.get('/outlets', (req, res) => {
  try {
    const outlets = db.prepare('SELECT * FROM outlets ORDER BY id').all();
    res.json(outlets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/outlets', (req, res) => {
  const { id, name, address, phone, delivery_radius, delivery_charge, delivery_enabled, zomato_enabled, swiggy_enabled } = req.body;
  if (!name || !address) {
    return res.status(400).json({ error: 'Name and address are required' });
  }
  try {
    if (id) {
      db.prepare(`
        UPDATE outlets SET 
          name = ?, 
          address = ?, 
          phone = ?, 
          delivery_radius = ?, 
          delivery_charge = ?, 
          delivery_enabled = ?, 
          zomato_enabled = ?, 
          swiggy_enabled = ?
        WHERE id = ?
      `).run(name, address, phone || '', Number(delivery_radius || 5.0), Number(delivery_charge || 0.0), delivery_enabled ? 1 : 0, zomato_enabled ? 1 : 0, swiggy_enabled ? 1 : 0, id);
      const updated = db.prepare('SELECT * FROM outlets WHERE id = ?').get(id);
      res.json(updated);
    } else {
      const result = db.prepare(`
        INSERT INTO outlets (name, address, phone, delivery_radius, delivery_charge, delivery_enabled, zomato_enabled, swiggy_enabled)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(name, address, phone || '', Number(delivery_radius || 5.0), Number(delivery_charge || 0.0), delivery_enabled ? 1 : 0, zomato_enabled ? 1 : 0, swiggy_enabled ? 1 : 0);
      const created = db.prepare('SELECT * FROM outlets WHERE id = ?').get(result.lastInsertRowId);
      res.json(created);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/outlets/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM outlets WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════
//  VENUE RESERVATIONS API [ADMIN]
// ═══════════════════════════════════════════════════════════

app.get('/venues', (req, res) => {
  try {
    const venues = db.prepare('SELECT * FROM venue_bookings ORDER BY event_date, event_time').all();
    res.json(venues);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/venues', (req, res) => {
  const { id, customer_name, customer_phone, event_type, event_date, event_time, guest_count, notes, status, customer_father_name, customer_village, customer_aadhaar, venue_areas } = req.body;
  if (!customer_name || !customer_phone || !event_type || !event_date || !event_time || !guest_count) {
    return res.status(400).json({ error: 'Required fields missing' });
  }
  try {
    if (id) {
      db.prepare(`
        UPDATE venue_bookings SET 
          customer_name = ?, 
          customer_phone = ?, 
          event_type = ?, 
          event_date = ?, 
          event_time = ?, 
          guest_count = ?, 
          notes = ?, 
          status = ?,
          customer_father_name = ?,
          customer_village = ?,
          customer_aadhaar = ?,
          venue_areas = ?
        WHERE id = ?
      `).run(
        customer_name, 
        customer_phone, 
        event_type, 
        event_date, 
        event_time, 
        Number(guest_count), 
        notes || '', 
        status || 'Pending',
        customer_father_name || '',
        customer_village || '',
        customer_aadhaar || '',
        venue_areas || '',
        id
      );
      const updated = db.prepare('SELECT * FROM venue_bookings WHERE id = ?').get(id);
      res.json(updated);
    } else {
      const result = db.prepare(`
        INSERT INTO venue_bookings (customer_name, customer_phone, event_type, event_date, event_time, guest_count, notes, status, customer_father_name, customer_village, customer_aadhaar, venue_areas)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        customer_name, 
        customer_phone, 
        event_type, 
        event_date, 
        event_time, 
        Number(guest_count), 
        notes || '', 
        status || 'Pending',
        customer_father_name || '',
        customer_village || '',
        customer_aadhaar || '',
        venue_areas || ''
      );
      const created = db.prepare('SELECT * FROM venue_bookings WHERE id = ?').get(result.lastInsertRowId);
      res.json(created);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/venues/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM venue_bookings WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════
//  ANALYTICS API [ADMIN]
// ═══════════════════════════════════════════════════════════

// GET /analytics/summary — Today's summary
app.get('/analytics/summary', (req, res) => {
  const todayRevenue = db
    .prepare(
      "SELECT COALESCE(SUM(total), 0) as revenue FROM orders WHERE status = 'paid' AND DATE(created_at) = DATE('now', 'localtime')"
    )
    .get();

  const todayCashRevenue = db
    .prepare(
      "SELECT COALESCE(SUM(cash_amount), 0) as revenue FROM orders WHERE status = 'paid' AND DATE(created_at) = DATE('now', 'localtime')"
    )
    .get();

  const todayOnlineRevenue = db
    .prepare(
      "SELECT COALESCE(SUM(online_amount), 0) as revenue FROM orders WHERE status = 'paid' AND DATE(created_at) = DATE('now', 'localtime')"
    )
    .get();

  const todayOrders = db
    .prepare(
      "SELECT COUNT(*) as count FROM orders WHERE DATE(created_at) = DATE('now', 'localtime') AND status != 'cancelled'"
    )
    .get();

  const avgOrderValue = db
    .prepare(
      "SELECT COALESCE(AVG(total), 0) as avg FROM orders WHERE status = 'paid' AND DATE(created_at) = DATE('now', 'localtime')"
    )
    .get();

  const paidOrders = db
    .prepare(
      "SELECT COUNT(*) as count FROM orders WHERE status = 'paid' AND DATE(created_at) = DATE('now', 'localtime')"
    )
    .get();

  const monthRevenue = db
    .prepare(
      "SELECT COALESCE(SUM(total), 0) as revenue FROM orders WHERE status = 'paid' AND strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now', 'localtime')"
    )
    .get();

  const allTimeRevenue = db
    .prepare(
      "SELECT COALESCE(SUM(total), 0) as revenue FROM orders WHERE status = 'paid'"
    )
    .get();

  const totalTables = db.prepare('SELECT COUNT(*) as count FROM tables').get();

  const tableTurnover =
    totalTables.count > 0 ? Math.round((paidOrders.count / totalTables.count) * 100) / 100 : 0;

  res.json({
    revenue: Math.round(todayRevenue.revenue * 100) / 100,
    cashRevenue: Math.round(todayCashRevenue.revenue * 100) / 100,
    onlineRevenue: Math.round(todayOnlineRevenue.revenue * 100) / 100,
    monthRevenue: Math.round(monthRevenue.revenue * 100) / 100,
    allTimeRevenue: Math.round(allTimeRevenue.revenue * 100) / 100,
    orderCount: todayOrders.count,
    avgOrderValue: Math.round(avgOrderValue.avg * 100) / 100,
    tableTurnover,
    paidOrders: paidOrders.count,
    totalTables: totalTables.count,
  });
});

// --- AI Insights & Predictions [ADMIN] ---
app.get('/analytics/ai-insights', authMiddleware('admin'), (req, res) => {
  try {
    // 1. Revenue Forecasting (Mock AI: simple linear projection)
    const last7Days = db.prepare(`
      SELECT DATE(created_at) as date, SUM(total) as daily_revenue
      FROM orders
      WHERE status = 'paid' AND created_at >= DATE('now', '-7 days')
      GROUP BY DATE(created_at)
    `).all();

    let forecast = 0;
    if (last7Days.length > 0) {
      const avg = last7Days.reduce((sum, d) => sum + d.daily_revenue, 0) / last7Days.length;
      forecast = avg * 1.1; // Predicting 10% growth
    }

    // 2. Customer Retention Prediction (Mock AI: probability based on visit frequency)
    const atRiskCustomers = db.prepare(`
      SELECT name, phone, last_visit, visit_count
      FROM customer_profiles
      WHERE last_visit < DATE('now', '-30 days') AND visit_count > 2
      LIMIT 5
    `).all();

    // 3. Personalized Wellness Recommendations (Mock AI: based on popular/past services)
    const topServices = db.prepare(`
      SELECT name, category FROM services WHERE available = 1 ORDER BY RANDOM() LIMIT 3
    `).all();

    res.json({
      revenueForecast: {
        nextDay: Math.round(forecast),
        confidence: '85%',
        trend: 'upward'
      },
      retentionRisk: atRiskCustomers.map(c => ({
        ...c,
        churnProbability: '65%',
        recommendation: 'Send "We miss you" coupon'
      })),
      recommendations: topServices.map(s => ({
        service: s.name,
        targetSegment: s.category + ' lovers',
        reason: 'Trending in your area'
      })),
      bookingOptimization: {
        peakHours: ['11:00', '14:00', '18:00'],
        staffRequired: 5,
        suggestedDiscountSlots: ['10:00', '15:00']
      },
      marketingAI: {
        generatedSubject: "Revitalize Your Senses with our Summer Glow Promo! ✨",
        suggestedOffers: ["Buy 2 Massages, Get 1 Facial Free", "15% off for Gold Members"]
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /expenses — Retrieve all expenses [ADMIN]
app.get('/expenses', authMiddleware('admin'), (req, res) => {
  try {
    const expenses = db.prepare('SELECT * FROM expenses ORDER BY expense_date DESC, id DESC').all();
    res.json(expenses);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /expenses — Add/Update an expense [ADMIN]
app.post('/expenses', authMiddleware('admin'), (req, res) => {
  const { id, title, amount, category, expense_date, description } = req.body;
  if (!title || amount === undefined || !category) {
    return res.status(400).json({ error: 'title, amount, and category are required' });
  }

  const dateVal = expense_date || new Date().toISOString().split('T')[0];

  try {
    if (id) {
      db.prepare(
        'UPDATE expenses SET title = ?, amount = ?, category = ?, expense_date = ?, description = ? WHERE id = ?'
      ).run(title, parseFloat(amount), category, dateVal, description || null, id);
      res.json({ message: 'Expense updated successfully' });
    } else {
      db.prepare(
        'INSERT INTO expenses (title, amount, category, expense_date, description) VALUES (?, ?, ?, ?, ?)'
      ).run(title, parseFloat(amount), category, dateVal, description || null);
      res.json({ message: 'Expense created successfully' });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE /expenses/:id — Delete an expense [ADMIN]
app.delete('/expenses/:id', authMiddleware('admin'), (req, res) => {
  try {
    db.prepare('DELETE FROM expenses WHERE id = ?').run(req.params.id);
    res.json({ message: 'Expense deleted successfully' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /expenses/summary — Retrieve expenses and profit metrics [ADMIN]
app.get('/expenses/summary', authMiddleware('admin'), (req, res) => {
  try {
    // 1. Total revenue (all time)
    const allTimeRevenue = db.prepare("SELECT COALESCE(SUM(total), 0) as total FROM orders WHERE status = 'paid'").get().total;

    // 2. Total expenses (all time)
    const allTimeExpenses = db.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM expenses").get().total;

    // 3. This Month Revenue
    const thisMonthRevenue = db.prepare("SELECT COALESCE(SUM(total), 0) as total FROM orders WHERE status = 'paid' AND strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now', 'localtime')").get().total;

    // 4. This Month Expenses
    const thisMonthExpenses = db.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE strftime('%Y-%m', expense_date) = strftime('%Y-%m', 'now', 'localtime')").get().total;

    // 5. Today's Revenue
    const todayRevenue = db.prepare("SELECT COALESCE(SUM(total), 0) as total FROM orders WHERE status = 'paid' AND DATE(created_at) = DATE('now', 'localtime')").get().total;

    // 6. Today's Expenses
    const todayExpenses = db.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE expense_date = DATE('now', 'localtime')").get().total;

    res.json({
      allTime: {
        revenue: Math.round(allTimeRevenue * 100) / 100,
        expenses: Math.round(allTimeExpenses * 100) / 100,
        profit: Math.round((allTimeRevenue - allTimeExpenses) * 100) / 100
      },
      thisMonth: {
        revenue: Math.round(thisMonthRevenue * 100) / 100,
        expenses: Math.round(thisMonthExpenses * 100) / 100,
        profit: Math.round((thisMonthRevenue - thisMonthExpenses) * 100) / 100
      },
      today: {
        revenue: Math.round(todayRevenue * 100) / 100,
        expenses: Math.round(todayExpenses * 100) / 100,
        profit: Math.round((todayRevenue - todayExpenses) * 100) / 100
      }
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /inventory — Retrieve all inventory items [ADMIN]
app.get('/inventory', authMiddleware('admin'), (req, res) => {
  try {
    const items = db.prepare('SELECT * FROM inventory ORDER BY item_name ASC').all();
    res.json(items);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /inventory — Add/Update an inventory item [ADMIN]
app.post('/inventory', authMiddleware('admin'), (req, res) => {
  const { id, item_name, quantity, unit, min_quantity, supplier, cost_per_unit } = req.body;
  if (!item_name || !unit) {
    return res.status(400).json({ error: 'item_name and unit are required' });
  }

  try {
    if (id) {
      // Get previous quantity to log adjustment if it changes
      const prev = db.prepare('SELECT quantity, item_name FROM inventory WHERE id = ?').get(id);
      db.prepare(
        'UPDATE inventory SET item_name = ?, quantity = ?, unit = ?, min_quantity = ?, supplier = ?, cost_per_unit = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
      ).run(item_name, parseFloat(quantity || 0), unit, parseFloat(min_quantity || 0), supplier || null, parseFloat(cost_per_unit || 0), id);
      
      const qtyDiff = parseFloat(quantity || 0) - (prev ? prev.quantity : 0);
      if (qtyDiff !== 0) {
        db.prepare(
          'INSERT INTO inventory_logs (inventory_id, item_name, change_amount, type, notes) VALUES (?, ?, ?, ?, ?)'
        ).run(id, item_name, qtyDiff, 'adjustment', `Manual edit: quantity updated from ${prev ? prev.quantity : 0} to ${quantity}`);
      }
      res.json({ message: 'Inventory item updated successfully' });
    } else {
      // Ensure unique name
      const existing = db.prepare('SELECT id FROM inventory WHERE LOWER(item_name) = LOWER(?)').get(item_name.toString().trim());
      if (existing) {
        return res.status(409).json({ error: `Inventory item "${item_name}" already exists` });
      }

      const result = db.prepare(
        'INSERT INTO inventory (item_name, quantity, unit, min_quantity, supplier, cost_per_unit) VALUES (?, ?, ?, ?, ?, ?)'
      ).run(item_name, parseFloat(quantity || 0), unit, parseFloat(min_quantity || 0), supplier || null, parseFloat(cost_per_unit || 0));
      
      db.prepare(
        'INSERT INTO inventory_logs (inventory_id, item_name, change_amount, type, notes) VALUES (?, ?, ?, ?, ?)'
      ).run(result.lastInsertRowid, item_name, parseFloat(quantity || 0), 'restock', 'Initial stock entry');
      
      res.json({ message: 'Inventory item created successfully' });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE /inventory/:id — Delete an inventory item [ADMIN]
app.delete('/inventory/:id', authMiddleware('admin'), (req, res) => {
  try {
    const item = db.prepare('SELECT item_name FROM inventory WHERE id = ?').get(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }
    db.prepare('DELETE FROM inventory WHERE id = ?').run(req.params.id);
    res.json({ message: `Inventory item "${item.item_name}" deleted successfully` });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /inventory/logs — Retrieve inventory transaction log [ADMIN]
app.get('/inventory/logs', authMiddleware('admin'), (req, res) => {
  try {
    const logs = db.prepare('SELECT * FROM inventory_logs ORDER BY created_at DESC LIMIT 100').all();
    res.json(logs);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /inventory/adjust — Adjust stock levels [ADMIN]
app.post('/inventory/adjust', authMiddleware('admin'), (req, res) => {
  const { inventory_id, change_amount, type, notes } = req.body;
  if (!inventory_id || change_amount === undefined || !type) {
    return res.status(400).json({ error: 'inventory_id, change_amount, and type are required' });
  }

  try {
    const item = db.prepare('SELECT item_name, quantity FROM inventory WHERE id = ?').get(inventory_id);
    if (!item) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    const newQty = item.quantity + parseFloat(change_amount);
    if (newQty < 0) {
      return res.status(400).json({ error: `Adjustment would result in negative stock (${newQty} ${item.unit})` });
    }

    db.prepare('UPDATE inventory SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(newQty, inventory_id);
    db.prepare(
      'INSERT INTO inventory_logs (inventory_id, item_name, change_amount, type, notes) VALUES (?, ?, ?, ?, ?)'
    ).run(inventory_id, item.item_name, parseFloat(change_amount), type, notes || null);

    res.json({ message: 'Stock adjusted successfully', newQuantity: newQty });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /analytics/revenue — Daily revenue breakdown
app.get('/analytics/revenue', (req, res) => {
  const period = req.query.period || 'week';
  let days = period === 'month' ? 30 : 7;

  const rows = db
    .prepare(
      `SELECT DATE(created_at) as date, COALESCE(SUM(total), 0) as revenue, COALESCE(SUM(cash_amount), 0) as cash_revenue, COALESCE(SUM(online_amount), 0) as online_revenue, COUNT(*) as orders
       FROM orders
       WHERE status = 'paid' AND created_at >= DATE('now', 'localtime', '-${days} days')
       GROUP BY DATE(created_at)
       ORDER BY date`
    )
    .all();

  res.json(rows.map(row => ({
    date: row.date,
    revenue: Math.round(row.revenue * 100) / 100,
    cash_revenue: Math.round(row.cash_revenue * 100) / 100,
    online_revenue: Math.round(row.online_revenue * 100) / 100,
    orders: row.orders
  })));
});

// GET /analytics/popular — Top 5 most ordered items
app.get('/analytics/popular', (req, res) => {
  const items = db
    .prepare(
      `SELECT item_name, SUM(quantity) as total_ordered, SUM(quantity) as quantity, COUNT(DISTINCT order_id) as order_count
       FROM order_items
       GROUP BY item_name
       ORDER BY order_count DESC
       LIMIT 5`
    )
    .all();

  res.json(items);
});

// GET /analytics/money — Money management collections breakdown [ADMIN]
app.get('/analytics/money', authMiddleware('admin'), (req, res) => {
  const { startDate, endDate } = req.query;
  let query = "SELECT id, total, cash_amount, online_amount, payment_method, settled_by, settled_at, customer_name, customer_phone, table_number FROM orders WHERE status = 'paid'";
  const params = [];

  if (startDate) {
    query += " AND DATE(settled_at) >= DATE(?)";
    params.push(startDate);
  }
  if (endDate) {
    query += " AND DATE(settled_at) <= DATE(?)";
    params.push(endDate);
  }

  query += " ORDER BY settled_at DESC";

  try {
    const orders = db.prepare(query).all(...params);
    
    let totalCollected = 0;
    let totalCash = 0;
    let totalOnline = 0;
    const staffAttribution = {};

    orders.forEach(order => {
      const total = order.total || 0;
      const cash = order.cash_amount || 0;
      const online = order.online_amount || 0;
      const staff = order.settled_by || 'System';

      totalCollected += total;
      totalCash += cash;
      totalOnline += online;

      if (!staffAttribution[staff]) {
        staffAttribution[staff] = { cash: 0, online: 0, total: 0, ordersCount: 0 };
      }
      staffAttribution[staff].cash += cash;
      staffAttribution[staff].online += online;
      staffAttribution[staff].total += total;
      staffAttribution[staff].ordersCount += 1;
    });

    res.json({
      orders,
      totals: {
        totalCollected,
        totalCash,
        totalOnline
      },
      staffAttribution
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve money analytics' });
  }
});

// POST /orders/delete-history — Delete orders in date range [ADMIN/CASHIER]
app.post('/orders/delete-history', authMiddleware('staff'), (req, res) => {
  const role = req.role;
  if (role !== 'admin' && role !== 'cashier') {
    return res.status(403).json({ error: 'Admin or Cashier privilege required' });
  }

  const { startDate, endDate } = req.body;
  if (!startDate || !endDate) {
    return res.status(400).json({ error: 'startDate and endDate are required' });
  }

  try {
    const ordersToDelete = db
      .prepare("SELECT id FROM orders WHERE DATE(COALESCE(settled_at, updated_at, created_at)) >= DATE(?) AND DATE(COALESCE(settled_at, updated_at, created_at)) <= DATE(?)")
      .all(startDate, endDate);
    const orderIds = ordersToDelete.map(o => o.id);

    if (orderIds.length > 0) {
      const placeholders = orderIds.map(() => '?').join(',');
      db.prepare(`DELETE FROM order_items WHERE order_id IN (${placeholders})`).run(...orderIds);
      db.prepare(`DELETE FROM orders WHERE id IN (${placeholders})`).run(...orderIds);
    }

    res.json({ message: `Successfully deleted ${orderIds.length} orders in range [${startDate} - ${endDate}].` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete transaction history' });
  }
});

// ═══════════════════════════════════════════════════════════
//  SOCKET.IO
// ═══════════════════════════════════════════════════════════

io.on('connection', (socket) => {
  // Join restaurant room
  socket.join('restaurant');

  // Send snapshot of all table statuses
  const tables = db.prepare('SELECT id, number, status, section FROM tables ORDER BY section, number').all();
  socket.emit('snapshot', { tables });

  // Join specific table room
  socket.on('join-table', (tableNumber) => {
    socket.join(`table-${tableNumber}`);
  });

  // Join specific customer room
  socket.on('join-customer', (phone) => {
    if (phone) {
      socket.join(`customer-${phone}`);
    }
  });

  // Waiter call
  socket.on('waiter:call', (data) => {
    io.to('restaurant').emit('waiter:called', {
      table: data.table || data.tableNumber,
      tableNumber: data.tableNumber || data.table,
      timestamp: new Date().toISOString(),
    });
  });
});

// ═══════════════════════════════════════════════════════════
//  SCHEDULED TASKS
// ═══════════════════════════════════════════════════════════

// Reservation reminder — every 60 seconds
setInterval(() => {
  try {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const reservations = db
      .prepare(
        "SELECT * FROM reservations WHERE reservation_date = ? AND status = 'confirmed'"
      )
      .all(today);

    for (const resv of reservations) {
      const [h, m] = resv.reservation_time.split(':').map(Number);
      const resvMinutes = h * 60 + m;
      const diff = resvMinutes - currentMinutes;

      // Within 15 minutes (±1 minute window)
      if (diff >= 14 && diff <= 16) {
        io.to('restaurant').emit('reservation:reminder', { reservation: resv });
      }
    }
  } catch (err) {
    // Silent fail for background tasks
  }
}, 60000);

// Reservation status check — every 5 minutes
setInterval(() => {
  try {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const reservations = db
      .prepare(
        "SELECT * FROM reservations WHERE reservation_date = ? AND status = 'confirmed'"
      )
      .all(today);

    for (const resv of reservations) {
      if (!resv.table_id) continue;

      const [h, m] = resv.reservation_time.split(':').map(Number);
      const resvMinutes = h * 60 + m;
      const diff = resvMinutes - currentMinutes;

      // Within 60 minutes
      if (diff > 0 && diff <= 60) {
        const table = db.prepare('SELECT status FROM tables WHERE id = ?').get(resv.table_id);
        if (table && table.status === 'available') {
          db.prepare("UPDATE tables SET status = 'reserved', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(
            resv.table_id
          );
          io.to('restaurant').emit('table:statusChanged', {
            tableId: resv.table_id,
            status: 'reserved',
          });
        }
      }
    }
  } catch (err) {
    // Silent fail for background tasks
  }
}, 300000);

// ─── Start Server ───────────────────────────────────────────

// ═══════════════════════════════════════════════════════════
//  WMS / WOS API MODULES
// ═══════════════════════════════════════════════════════════

if (typeof TENANT_TYPE !== 'undefined' && TENANT_TYPE === 'WMS') {

  // --- INVENTORY API ---

  app.get('/wms/inventory', (req, res) => {
    try {
      console.log(`[WMS] Fetching inventory for ${RESTAURANT_ID}`);
      const items = db.prepare(`
        SELECT i.*, p.sku, p.name as product_name, b.code as bin_code, z.name as zone_name
        FROM inventory i
        JOIN products p ON i.product_id = p.id
        JOIN bins b ON i.bin_id = b.id
        JOIN zones z ON b.zone_id = z.id
      `).all();
      console.log(`[WMS] Found ${items.length} items`);
      res.json(items);
    } catch (err) {
      console.error('WMS Inventory Fetch Error:', err.message);
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/wms/inventory/move', (req, res) => {
    const { product_id, from_bin_id, to_bin_id, quantity } = req.body;

    const move = db.transaction(() => {
      // 1. Deduct from source
      db.prepare('UPDATE inventory SET quantity = quantity - ? WHERE product_id = ? AND bin_id = ?').run(quantity, product_id, from_bin_id);

      // 2. Add to destination
      const existing = db.prepare('SELECT id FROM inventory WHERE product_id = ? AND bin_id = ?').get(product_id, to_bin_id);
      if (existing) {
        db.prepare('UPDATE inventory SET quantity = quantity + ? WHERE id = ?').run(quantity, existing.id);
      } else {
        db.prepare('INSERT INTO inventory (product_id, bin_id, quantity) VALUES (?, ?, ?)').run(product_id, to_bin_id, quantity);
      }

      // 3. Log
      db.prepare('INSERT INTO inventory_logs (product_id, change_amount, type, notes) VALUES (?, ?, ?, ?)').run(
        product_id, quantity, 'Movement', `Moved from bin ${from_bin_id} to ${to_bin_id}`
      );
    });

    move();
    res.json({ message: 'Inventory moved successfully' });
  });

  // --- ORDER & TASK API (WOS) ---

  app.get('/wms/orders', (req, res) => {
    const orders = db.prepare('SELECT * FROM orders ORDER BY priority DESC, created_at DESC').all();
    const enriched = orders.map(o => {
      const items = db.prepare('SELECT oi.*, p.sku, p.name FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?').all(o.id);
      return { ...o, items };
    });
    res.json(enriched);
  });

  app.get('/wms/tasks', (req, res) => {
    const tasks = db.prepare(`
      SELECT t.*, p.sku, p.name as product_name, fb.code as from_bin, tb.code as to_bin
      FROM tasks t
      JOIN products p ON t.product_id = p.id
      LEFT JOIN bins fb ON t.from_bin_id = fb.id
      LEFT JOIN bins tb ON t.to_bin_id = tb.id
      WHERE t.status != 'Completed'
      ORDER BY t.priority DESC, t.created_at ASC
    `).all();
    res.json(tasks);
  });

  app.post('/wms/tasks/:id/complete', (req, res) => {
    const { id } = req.params;
    const { units_processed } = req.body;

    const complete = db.transaction(() => {
      db.prepare("UPDATE tasks SET status = 'Completed', completed_at = CURRENT_TIMESTAMP WHERE id = ?").run(id);
      db.prepare('INSERT INTO labor_tracking (task_id, units_processed, end_time) VALUES (?, ?, CURRENT_TIMESTAMP)').run(id, units_processed || 0);
    });

    complete();
    io.to('warehouse').emit('task:completed', { taskId: id });
    res.json({ message: 'Task completed' });
  });

  // --- YARD & DOCK API ---

  app.get('/wms/yard', (req, res) => {
    const trailers = db.prepare('SELECT t.*, d.number as dock_number FROM trailers t LEFT JOIN docks d ON t.dock_id = d.id').all();
    const docks = db.prepare('SELECT * FROM docks').all();
    res.json({ trailers, docks });
  });

  app.post('/wms/yard/check-in', (req, res) => {
    const { trailer_number, carrier, location } = req.body;
    db.prepare('INSERT INTO trailers (trailer_number, carrier, location, status) VALUES (?, ?, ?, ?)').run(trailer_number, carrier, location || 'Yard Gate', 'In Yard');
    res.status(201).json({ message: 'Trailer checked in' });
  });

  app.post('/wms/yard/assign-dock', (req, res) => {
    const { trailer_id, dock_id } = req.body;
    db.prepare("UPDATE trailers SET dock_id = ?, status = 'At Dock' WHERE id = ?").run(dock_id, trailer_id);
    db.prepare("UPDATE docks SET status = 'Occupied' WHERE id = ?").run(dock_id);
    res.json({ message: 'Dock assigned' });
  });

  // --- ANALYTICS ---

  app.get('/wms/analytics/kpis', (req, res) => {
    const throughput = db.prepare("SELECT COUNT(*) as count FROM tasks WHERE status = 'Completed' AND completed_at >= DATE('now', '-1 day')").get();
    const inventoryValue = db.prepare("SELECT SUM(quantity) as total_units FROM inventory").get();
    const dockUtil = db.prepare("SELECT (SELECT COUNT(*) FROM docks WHERE status = 'Occupied') * 100.0 / COUNT(*) as util FROM docks").get();

    res.json({
      dailyThroughput: throughput.count,
      totalInventory: inventoryValue.total_units,
      dockUtilization: Math.round(dockUtil.util || 0) + '%',
      accuracy: '99.8%'
    });
  });

  // AI Mock Endpoints
  app.get('/wms/ai/slotting-recommendations', (req, res) => {
    res.json([
      { product: 'SKU-1001', current_bin: 'STG-A5', recommended_bin: 'PCK-B1', reason: 'High velocity item, move to picking zone.' },
      { product: 'SKU-4004', current_bin: 'REC-001', recommended_bin: 'STG-A10', reason: 'Heavy item, store in lower rack shelving.' }
    ]);
  });
}

server.listen(PORT, () => {
  const config = readConfig();
  const type = typeof TENANT_TYPE !== 'undefined' ? TENANT_TYPE : 'RESTAURANT';
  const emoji = type === 'WMS' ? '📦' : '🍽️';
  console.log(`  ${emoji}  ${type} Tenant ${RESTAURANT_ID} (${config.name}) running on port ${PORT}`);
});
