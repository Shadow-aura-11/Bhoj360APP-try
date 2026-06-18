const TENANT_ID = 'EMS-1CLWAR';
const PORT = 4100;
/**
 * Venue & Event Management System (EMS) — Service Template
 * ══════════════════════════════════════════════════════════
 * This file is copied per EMS tenant by the factory.
 * The factory injects TENANT_ID and PORT at the top.
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

// ─── Schema Initialization ──────────────────────────────────

db.exec(`
  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    event_type TEXT,
    start_date DATETIME,
    end_date DATETIME,
    status TEXT DEFAULT 'Planning', -- Planning, Active, Completed, Cancelled
    budget REAL DEFAULT 0,
    venue_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    quantity INTEGER NOT NULL,
    sold INTEGER DEFAULT 0,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS attendees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
    ticket_id INTEGER REFERENCES tickets(id),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    status TEXT DEFAULT 'Registered', -- Registered, Checked-in, Cancelled
    checked_in_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS vendors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL, -- Catering, Decor, AV, Security, etc.
    contact_person TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    rating REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS catering_orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
    vendor_id INTEGER REFERENCES vendors(id),
    menu_details TEXT,
    guest_count INTEGER,
    total_price REAL,
    status TEXT DEFAULT 'Pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS event_schedules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
    activity TEXT NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME,
    location TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS marketing_campaigns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT, -- Email, Social, SMS, Print
    status TEXT DEFAULT 'Draft',
    budget REAL DEFAULT 0,
    spent REAL DEFAULT 0,
    reach INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    start_date DATE,
    end_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS crm_contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT,
    company TEXT,
    source TEXT,
    status TEXT DEFAULT 'Lead', -- Lead, Customer, VIP, Vendor
    last_interaction DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS staff (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    role TEXT NOT NULL, -- admin, planner, staff
    pin TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role TEXT NOT NULL,
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// ─── Helpers ────────────────────────────────────────────────

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

    // 1. Check if matching role PIN fallback
    if (config.pins[role] && config.pins[role] === pin.toString()) {
      authenticated = true;
    }
    // 2. Otherwise, check staff table
    else if (username) {
      const user = db.prepare('SELECT * FROM staff WHERE username = ? AND pin = ? AND role = ?').get(username.toString().trim(), pin.toString(), role);
      if (user) {
        authenticated = true;
        req.staffName = user.name;
      }
    }

    if (!authenticated) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (requiredRole === 'admin' && role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    req.role = role;
    next();
  };
}

// ─── Health & Meta ──────────────────────────────────────────

app.get('/health', (req, res) => {
  const config = readConfig();
  res.json({
    status: 'ok',
    tenantId: TENANT_ID,
    name: config.name,
    type: 'EMS',
    uptime: process.uptime(),
  });
});

// ─── Auth Routes ────────────────────────────────────────────

app.post('/auth', (req, res) => {
  const { role, pin, username } = req.body;
  const config = readConfig();

  if (role === 'admin') {
    if (config.pins.admin === pin.toString()) {
      return res.json({ role: 'admin', tenantId: TENANT_ID, name: config.name, staffName: 'Admin' });
    }
  }

  if (username && pin) {
    const user = db.prepare('SELECT * FROM staff WHERE username = ? AND pin = ?').get(username.toString().trim(), pin.toString());
    if (user) {
      return res.json({ role: user.role, tenantId: TENANT_ID, name: config.name, staffName: user.name });
    }
  }

  return res.status(401).json({ error: 'Invalid credentials' });
});

// ─── Events API ───
app.get('/events', (req, res) => {
  try {
    const events = db.prepare('SELECT * FROM events ORDER BY start_date DESC').all();
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/events', authMiddleware('admin'), (req, res) => {
  const { id, title, description, event_type, start_date, end_date, status, budget, venue_id } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });
  try {
    if (id) {
      db.prepare(`
        UPDATE events SET title = ?, description = ?, event_type = ?, start_date = ?, end_date = ?, status = ?, budget = ?, venue_id = ?
        WHERE id = ?
      `).run(title, description, event_type, start_date, end_date, status, budget, venue_id, id);
      res.json({ message: 'Event updated' });
    } else {
      const result = db.prepare(`
        INSERT INTO events (title, description, event_type, start_date, end_date, status, budget, venue_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(title, description, event_type, start_date, end_date, status || 'Planning', budget || 0, venue_id);
      res.status(201).json({ id: result.lastInsertRowid });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/events/:id', authMiddleware('admin'), (req, res) => {
  try {
    db.prepare('DELETE FROM events WHERE id = ?').run(req.params.id);
    res.json({ message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Tickets API ───
app.get('/events/:eventId/tickets', (req, res) => {
  try {
    const tickets = db.prepare('SELECT * FROM tickets WHERE event_id = ?').all(req.params.eventId);
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/tickets', authMiddleware('admin'), (req, res) => {
  const { id, event_id, name, price, quantity, description } = req.body;
  if (!event_id || !name || price === undefined || quantity === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    if (id) {
      db.prepare(`
        UPDATE tickets SET name = ?, price = ?, quantity = ?, description = ?
        WHERE id = ?
      `).run(name, price, quantity, description, id);
      res.json({ message: 'Ticket updated' });
    } else {
      const result = db.prepare(`
        INSERT INTO tickets (event_id, name, price, quantity, description)
        VALUES (?, ?, ?, ?, ?)
      `).run(event_id, name, price, quantity, description);
      res.status(201).json({ id: result.lastInsertRowid });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Attendees API ───
app.get('/events/:eventId/attendees', (req, res) => {
  try {
    const attendees = db.prepare('SELECT * FROM attendees WHERE event_id = ?').all(req.params.eventId);
    res.json(attendees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/attendees', authMiddleware('admin'), (req, res) => {
  const { id, event_id, ticket_id, name, email, phone, status } = req.body;
  if (!event_id || !name) return res.status(400).json({ error: 'Missing required fields' });
  try {
    if (id) {
      db.prepare(`
        UPDATE attendees SET ticket_id = ?, name = ?, email = ?, phone = ?, status = ?
        WHERE id = ?
      `).run(ticket_id, name, email, phone, status, id);
      res.json({ message: 'Attendee updated' });
    } else {
      const result = db.prepare(`
        INSERT INTO attendees (event_id, ticket_id, name, email, phone, status)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(event_id, ticket_id, name, email, phone, status || 'Registered');
      res.status(201).json({ id: result.lastInsertRowid });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/attendees/:id/checkin', authMiddleware('admin'), (req, res) => {
  try {
    db.prepare("UPDATE attendees SET status = 'Checked-in', checked_in_at = CURRENT_TIMESTAMP WHERE id = ?").run(req.params.id);
    res.json({ message: 'Checked in' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Vendors API ───
app.get('/vendors', (req, res) => {
  try {
    const vendors = db.prepare('SELECT * FROM vendors ORDER BY name').all();
    res.json(vendors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/vendors', authMiddleware('admin'), (req, res) => {
  const { id, name, category, contact_person, phone, email, address, rating } = req.body;
  if (!name || !category) return res.status(400).json({ error: 'Name and Category are required' });
  try {
    if (id) {
      db.prepare(`
        UPDATE vendors SET name = ?, category = ?, contact_person = ?, phone = ?, email = ?, address = ?, rating = ?
        WHERE id = ?
      `).run(name, category, contact_person, phone, email, address, rating, id);
      res.json({ message: 'Vendor updated' });
    } else {
      const result = db.prepare(`
        INSERT INTO vendors (name, category, contact_person, phone, email, address, rating)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(name, category, contact_person, phone, email, address, rating || 0);
      res.status(201).json({ id: result.lastInsertRowid });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Catering API ───
app.get('/catering-orders', (req, res) => {
  try {
    const orders = db.prepare(`
      SELECT co.*, e.title as event_title, v.name as vendor_name
      FROM catering_orders co
      LEFT JOIN events e ON co.event_id = e.id
      LEFT JOIN vendors v ON co.vendor_id = v.id
    `).all();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/catering-orders', authMiddleware('admin'), (req, res) => {
  const { id, event_id, vendor_id, menu_details, guest_count, total_price, status } = req.body;
  try {
    if (id) {
      db.prepare(`
        UPDATE catering_orders SET event_id = ?, vendor_id = ?, menu_details = ?, guest_count = ?, total_price = ?, status = ?
        WHERE id = ?
      `).run(event_id, vendor_id, menu_details, guest_count, total_price, status, id);
      res.json({ message: 'Catering order updated' });
    } else {
      const result = db.prepare(`
        INSERT INTO catering_orders (event_id, vendor_id, menu_details, guest_count, total_price, status)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(event_id, vendor_id, menu_details, guest_count, total_price, status || 'Pending');
      res.status(201).json({ id: result.lastInsertRowid });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── CRM API ───
app.get('/crm/contacts', (req, res) => {
  try {
    const contacts = db.prepare('SELECT * FROM crm_contacts ORDER BY name').all();
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/crm/contacts', authMiddleware('admin'), (req, res) => {
  const { id, name, email, phone, company, source, status } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  try {
    if (id) {
      db.prepare(`
        UPDATE crm_contacts SET name = ?, email = ?, phone = ?, company = ?, source = ?, status = ?
        WHERE id = ?
      `).run(name, email, phone, company, source, status, id);
      res.json({ message: 'Contact updated' });
    } else {
      const result = db.prepare(`
        INSERT INTO crm_contacts (name, email, phone, company, source, status)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(name, email, phone, company, source, status || 'Lead');
      res.status(201).json({ id: result.lastInsertRowid });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Marketing API ───
app.get('/marketing/campaigns', (req, res) => {
  try {
    const campaigns = db.prepare('SELECT * FROM marketing_campaigns ORDER BY created_at DESC').all();
    res.json(campaigns);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/marketing/campaigns', authMiddleware('admin'), (req, res) => {
  const { id, name, type, status, budget, spent, reach, conversions, start_date, end_date } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  try {
    if (id) {
      db.prepare(`
        UPDATE marketing_campaigns SET name = ?, type = ?, status = ?, budget = ?, spent = ?, reach = ?, conversions = ?, start_date = ?, end_date = ?
        WHERE id = ?
      `).run(name, type, status, budget, spent, reach, conversions, start_date, end_date, id);
      res.json({ message: 'Campaign updated' });
    } else {
      const result = db.prepare(`
        INSERT INTO marketing_campaigns (name, type, status, budget, spent, reach, conversions, start_date, end_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(name, type, status || 'Draft', budget || 0, spent || 0, reach || 0, conversions || 0, start_date, end_date);
      res.status(201).json({ id: result.lastInsertRowid });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── AI Features (Simulated) ───
app.get('/ai/attendance-prediction/:eventId', (req, res) => {
  const event = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.eventId);
  if (!event) return res.status(404).json({ error: 'Event not found' });

  const attendeesCount = db.prepare('SELECT COUNT(*) as count FROM attendees WHERE event_id = ?').get(req.params.eventId).count;
  const ticketsSold = db.prepare('SELECT SUM(sold) as sold FROM tickets WHERE event_id = ?').get(req.params.eventId).sold || 0;

  const factor = 0.75 + Math.random() * 0.2;
  const predicted = Math.round((attendeesCount + ticketsSold) * factor);

  res.json({
    eventId: req.params.eventId,
    registered: attendeesCount,
    ticketsSold,
    predictedAttendance: predicted,
    confidence: "85%",
    insight: "High engagement on social media suggests a better turnout than average."
  });
});

app.get('/ai/revenue-forecast/:eventId', (req, res) => {
  const tickets = db.prepare('SELECT * FROM tickets WHERE event_id = ?').all(req.params.eventId);
  let currentRevenue = 0;
  let potentialRevenue = 0;

  tickets.forEach(t => {
    currentRevenue += (t.sold * t.price);
    potentialRevenue += (t.quantity * t.price);
  });

  const forecast = currentRevenue + (potentialRevenue - currentRevenue) * (0.4 + Math.random() * 0.4);

  res.json({
    eventId: req.params.eventId,
    currentRevenue,
    forecastedTotalRevenue: Math.round(forecast),
    potentialTotalRevenue: potentialRevenue,
    recommendation: forecast < potentialRevenue * 0.7 ? "Consider a flash sale or 'Early Bird' extension to boost sales." : "Revenue is on track with targets."
  });
});

app.get('/ai/ticket-pricing/:eventId', (req, res) => {
  const tickets = db.prepare('SELECT * FROM tickets WHERE event_id = ?').all(req.params.eventId);

  const optimizedPricing = tickets.map(t => {
    const demand = t.sold / t.quantity;
    let suggestedPrice = t.price;
    if (demand > 0.8) suggestedPrice *= 1.2;
    else if (demand < 0.3) suggestedPrice *= 0.9;

    return {
      ticketId: t.id,
      name: t.name,
      currentPrice: t.price,
      suggestedPrice: Math.round(suggestedPrice),
      reason: demand > 0.8 ? "High demand detected" : "Slow sales volume"
    };
  });

  res.json(optimizedPricing);
});

// ─── Start Server ───────────────────────────────────────────

server.listen(PORT, () => {
  const config = readConfig();
  console.log(`  🎪 EMS Tenant ${TENANT_ID} (${config.name}) running on port ${PORT}`);
});
