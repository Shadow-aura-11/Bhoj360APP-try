/**
 * Gym Management Microservice — Service Template
 * ═══════════════════════════════════════════
 * This file is copied per gym by the factory.
 * The factory injects GYM_ID and PORT at the top.
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
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:5173', 'http://localhost:4000'];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));
app.use(express.json({ limit: '10mb' }));

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
app.use('/uploads', express.static(uploadsDir));

const server = http.createServer(app);
const io = new SocketIO(server, { cors: { origin: '*' } });

const DB_PATH = path.join(__dirname, 'db.sqlite');
const CONFIG_PATH = path.join(__dirname, 'config.json');

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ─── Database Schema Initialization ─────────────────────────
db.exec(`
  -- Users & RBAC
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT CHECK(role IN ('admin', 'staff', 'trainer')) NOT NULL,
    email TEXT,
    phone TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Trainers Info
  CREATE TABLE IF NOT EXISTS trainers (
    user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    specialization TEXT,
    bio TEXT,
    rating REAL DEFAULT 0,
    availability_status TEXT DEFAULT 'available'
  );

  -- Members
  CREATE TABLE IF NOT EXISTS members (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT UNIQUE NOT NULL,
    gender TEXT,
    dob DATE,
    address TEXT,
    photo_url TEXT,
    membership_status TEXT DEFAULT 'active' CHECK(membership_status IN ('active', 'expired', 'frozen', 'pending')),
    loyalty_points INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Membership Plans
  CREATE TABLE IF NOT EXISTS membership_plans (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    duration_months INTEGER NOT NULL,
    price REAL NOT NULL,
    features_json TEXT, -- JSON array
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Subscriptions
  CREATE TABLE IF NOT EXISTS subscriptions (
    id TEXT PRIMARY KEY,
    member_id TEXT REFERENCES members(id) ON DELETE CASCADE,
    plan_id TEXT REFERENCES membership_plans(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT DEFAULT 'active',
    paid_amount REAL,
    payment_method TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Attendance
  CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id TEXT REFERENCES members(id) ON DELETE CASCADE,
    check_in DATETIME DEFAULT CURRENT_TIMESTAMP,
    check_out DATETIME,
    method TEXT DEFAULT 'manual' -- 'manual', 'rfid', 'biometric'
  );

  -- Classes & Schedules
  CREATE TABLE IF NOT EXISTS classes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    trainer_id TEXT REFERENCES users(id),
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    capacity INTEGER DEFAULT 20,
    status TEXT DEFAULT 'scheduled'
  );

  -- Class Bookings
  CREATE TABLE IF NOT EXISTS class_bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    class_id TEXT REFERENCES classes(id) ON DELETE CASCADE,
    member_id TEXT REFERENCES members(id) ON DELETE CASCADE,
    booked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(class_id, member_id)
  );

  -- PT (Personal Training) Bookings
  CREATE TABLE IF NOT EXISTS pt_bookings (
    id TEXT PRIMARY KEY,
    trainer_id TEXT REFERENCES users(id),
    member_id TEXT REFERENCES members(id),
    session_time DATETIME NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    status TEXT DEFAULT 'confirmed'
  );

  -- Exercise Library
  CREATE TABLE IF NOT EXISTS exercises (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT, -- 'strength', 'cardio', 'flexibility'
    target_muscle TEXT,
    instructions TEXT,
    media_url TEXT
  );

  -- Workout Plans
  CREATE TABLE IF NOT EXISTS workout_plans (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    member_id TEXT REFERENCES members(id) ON DELETE CASCADE,
    trainer_id TEXT REFERENCES users(id),
    structure_json TEXT, -- Detailed exercise/set/rep structure
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Diet Plans
  CREATE TABLE IF NOT EXISTS diet_plans (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    member_id TEXT REFERENCES members(id) ON DELETE CASCADE,
    structure_json TEXT, -- Meal structure/macros
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Inventory (Supplements/Gear)
  CREATE TABLE IF NOT EXISTS inventory (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT,
    sku TEXT UNIQUE,
    price REAL NOT NULL,
    stock_quantity INTEGER DEFAULT 0,
    min_stock_level INTEGER DEFAULT 5
  );

  -- Sales (POS)
  CREATE TABLE IF NOT EXISTS sales (
    id TEXT PRIMARY KEY,
    member_id TEXT REFERENCES members(id),
    total_amount REAL NOT NULL,
    payment_method TEXT,
    items_json TEXT, -- Items sold
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- CRM Leads
  CREATE TABLE IF NOT EXISTS crm_leads (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    source TEXT,
    status TEXT DEFAULT 'new' CHECK(status IN ('new', 'contacted', 'trial', 'converted', 'lost')),
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Equipment Maintenance
  CREATE TABLE IF NOT EXISTS equipment (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    serial_number TEXT,
    purchase_date DATE,
    last_maintenance DATE,
    next_maintenance DATE,
    status TEXT DEFAULT 'operational'
  );

  -- Loyalty & Referrals
  CREATE TABLE IF NOT EXISTS referrals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    referrer_member_id TEXT REFERENCES members(id),
    referred_phone TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    reward_points INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// ─── Helpers ────────────────────────────────────────────────
function readConfig() {
  return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
}

function generateId(prefix = 'GMS') {
  return `${prefix}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
}

// ─── Auth Middleware ────────────────────────────────────────
function authMiddleware(requiredRole) {
  return (req, res, next) => {
    const role = req.headers['x-role'];
    if (!role) return res.status(401).json({ error: 'Auth required' });
    if (requiredRole === 'admin' && role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
    next();
  };
}

// ─── Core API Routes ────────────────────────────────────────

// Auth
app.post('/auth', (req, res) => {
  const { username, pin, role } = req.body;
  const config = readConfig();

  // Check against config for bootstrap admin or staff if DB is empty
  const usersCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;

  if (usersCount === 0) {
    if (username === 'admin' && pin === (config.pins?.admin || 'admin123')) {
      return res.json({ role: 'admin', staffName: 'Gym Owner', username: 'admin' });
    }
    if (pin === (config.pins?.staff || '2222')) {
      return res.json({ role: 'staff', staffName: 'Staff Member', username: username || 'staff' });
    }
  }

  // Check against Database users table
  try {
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    if (user && user.password_hash === pin) { // In prod, use bcrypt.compare
      return res.json({ role: user.role, staffName: user.full_name, username: user.username });
    }
  } catch (err) {
    return res.status(500).json({ error: 'Database authentication error' });
  }

  res.status(401).json({ error: 'Invalid Credentials' });
});

// Health & Config
app.get('/health', (req, res) => {
  const config = readConfig();
  res.json({ status: 'ok', gymId: GYM_ID, name: config.name, type: 'gym' });
});

// Member Management
app.get('/members', (req, res) => {
  const members = db.prepare('SELECT * FROM members ORDER BY created_at DESC').all();
  res.json(members);
});

app.post('/members', (req, res) => {
  const { full_name, email, phone, gender, dob, address } = req.body;
  const id = generateId('MEM');
  try {
    db.prepare('INSERT INTO members (id, full_name, email, phone, gender, dob, address) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(id, full_name, email, phone, gender, dob, address);
    res.status(201).json({ id, full_name });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Subscriptions
app.get('/subscriptions', (req, res) => {
  const subs = db.prepare(`
    SELECT s.*, m.full_name as member_name, p.name as plan_name
    FROM subscriptions s
    JOIN members m ON s.member_id = m.id
    JOIN membership_plans p ON s.plan_id = p.id
  `).all();
  res.json(subs);
});

// Attendance
app.post('/attendance/checkin', (req, res) => {
  const { member_id, method } = req.body;
  try {
    db.prepare('INSERT INTO attendance (member_id, method) VALUES (?, ?)').run(member_id, method || 'manual');
    io.emit('attendance:checkin', { member_id, time: new Date() });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/attendance/today', (req, res) => {
  const logs = db.prepare(`
    SELECT a.*, m.full_name
    FROM attendance a
    JOIN members m ON a.member_id = m.id
    WHERE DATE(a.check_in) = DATE('now')
  `).all();
  res.json(logs);
});

// Classes
app.get('/classes', (req, res) => {
  const rows = db.prepare('SELECT * FROM classes WHERE status != "cancelled"').all();
  res.json(rows);
});

app.post('/classes/book', (req, res) => {
  const { class_id, member_id } = req.body;
  try {
    db.prepare('INSERT INTO class_bookings (class_id, member_id) VALUES (?, ?)').run(class_id, member_id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: "Booking failed: Member already booked or class full." });
  }
});

// Workout & Diet Plans
app.get('/workouts', (req, res) => {
  const memberId = req.query.member_id;
  if (memberId) {
    const plans = db.prepare('SELECT * FROM workout_plans WHERE member_id = ?').all(memberId);
    return res.json(plans);
  }
  const plans = db.prepare('SELECT * FROM workout_plans').all();
  res.json(plans);
});

app.get('/diet-plans', (req, res) => {
  const memberId = req.query.member_id;
  if (memberId) {
    const plans = db.prepare('SELECT * FROM diet_plans WHERE member_id = ?').all(memberId);
    return res.json(plans);
  }
  const plans = db.prepare('SELECT * FROM diet_plans').all();
  res.json(plans);
});

app.get('/exercises', (req, res) => {
  const exercises = db.prepare('SELECT * FROM exercises').all();
  res.json(exercises);
});

app.post('/workouts', (req, res) => {
  const { name, member_id, trainer_id, structure_json } = req.body;
  const id = generateId('WKT');
  db.prepare('INSERT INTO workout_plans (id, name, member_id, trainer_id, structure_json) VALUES (?, ?, ?, ?, ?)')
    .run(id, name, member_id, trainer_id, JSON.stringify(structure_json));
  res.status(201).json({ id });
});

// AI Engine - Recommendation Logic
app.post('/ai/recommend-workout', (req, res) => {
  const { member_id } = req.body;
  const member = db.prepare('SELECT * FROM members WHERE id = ?').get(member_id);
  if (!member) return res.status(404).json({ error: 'Member not found' });

  // Heuristic-based recommendation engine (Mock Neural Output)
  const age = new Date().getFullYear() - new Date(member.dob || '1990-01-01').getFullYear();
  const intensity = age < 40 ? 'High' : 'Moderate';

  const recommendations = [
    { day: 'Monday', focus: 'Strength - Push', exercises: ['Bench Press', 'Shoulder Press', 'Tricep Dips'] },
    { day: 'Wednesday', focus: 'Strength - Pull', exercises: ['Deadlifts', 'Pullups', 'Barbell Rows'] },
    { day: 'Friday', focus: intensity + ' Intensity Cardio', exercises: ['HIIT Sprints', 'Burpees', 'Battle Ropes'] }
  ];

  res.json({
    member: member.full_name,
    intensity,
    protocol: recommendations,
    generated_at: new Date()
  });
});

app.post('/ai/recommend-diet', (req, res) => {
  const { member_id, goal } = req.body; // goal: 'bulk', 'cut', 'maintain'
  const member = db.prepare('SELECT * FROM members WHERE id = ?').get(member_id);
  if (!member) return res.status(404).json({ error: 'Member not found' });

  let calories = 2500;
  if (goal === 'cut') calories = 2000;
  if (goal === 'bulk') calories = 3000;

  const macros = {
    protein: Math.round(calories * 0.3 / 4),
    carbs: Math.round(calories * 0.45 / 4),
    fats: Math.round(calories * 0.25 / 9)
  };

  res.json({
    calories,
    macros,
    plan: [
      { meal: 'Breakfast', suggestion: 'Egg whites with oatmeal' },
      { meal: 'Lunch', suggestion: 'Grilled chicken with quinoa' },
      { meal: 'Dinner', suggestion: 'Steamed fish with broccoli' }
    ]
  });
});

// POS / Sales with Inventory Sync
app.get('/inventory', (req, res) => {
  const items = db.prepare('SELECT * FROM inventory').all();
  res.json(items);
});

app.post('/sales', (req, res) => {
  const { member_id, total_amount, payment_method, items } = req.body;
  const id = generateId('SALE');

  const transaction = db.transaction((items) => {
    // 1. Record Sale
    db.prepare('INSERT INTO sales (id, member_id, total_amount, payment_method, items_json) VALUES (?, ?, ?, ?, ?)')
      .run(id, member_id, total_amount, payment_method, JSON.stringify(items));

    // 2. Deduct Inventory
    for (const item of items) {
      db.prepare('UPDATE inventory SET stock_quantity = stock_quantity - ? WHERE id = ?')
        .run(item.qty || 1, item.id);
    }
  });

  try {
    transaction(items);
    res.status(201).json({ id, success: true });
  } catch (err) {
    res.status(400).json({ error: 'Transaction failed: ' + err.message });
  }
});

// CRM
app.get('/leads', (req, res) => {
  const leads = db.prepare('SELECT * FROM crm_leads ORDER BY created_at DESC').all();
  res.json(leads);
});

app.post('/leads', (req, res) => {
  const { name, phone, source, notes } = req.body;
  const id = generateId('LEAD');
  try {
    db.prepare('INSERT INTO crm_leads (id, name, phone, source, notes) VALUES (?, ?, ?, ?, ?)')
      .run(id, name, phone, source, notes);
    res.status(201).json({ id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Facility / Equipment
app.get('/equipment', (req, res) => {
  const equipment = db.prepare('SELECT * FROM equipment').all();
  res.json(equipment);
});

app.post('/equipment', (req, res) => {
  const { name, serial_number, status } = req.body;
  const id = generateId('EQP');
  try {
    db.prepare('INSERT INTO equipment (id, name, serial_number, status) VALUES (?, ?, ?, ?)')
      .run(id, name, serial_number, status || 'operational');
    res.status(201).json({ id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Analytics
app.get('/analytics/overview', (req, res) => {
  const activeMembers = db.prepare("SELECT COUNT(*) as count FROM members WHERE membership_status = 'active'").get().count;
  const revenueMonth = db.prepare("SELECT SUM(paid_amount) as total FROM subscriptions WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')").get().total || 0;
  const checkinsToday = db.prepare("SELECT COUNT(*) as count FROM attendance WHERE DATE(check_in) = DATE('now')").get().count;

  res.json({ activeMembers, revenueMonth, checkinsToday });
});

// ─── Start Server ───────────────────────────────────────────
server.listen(PORT, () => {
  const config = readConfig();
  console.log(`  🏋️  Gym ${GYM_ID} (${config.name}) running on port ${PORT}`);
});
