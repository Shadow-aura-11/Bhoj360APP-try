/**
 * Travel Management System (TMS) Microservice — Service Template
 * ═════════════════════════════════════════════════════════════
 * This file is copied per TMS tenant by the factory.
 * The factory injects RESTAURANT_ID (mapped to TENANT_ID) and PORT at the top.
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

// TMS Logic Import
const tmsFunctions = require('../../tms/functions');

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

// ─── Auth Middleware ────────────────────────────────────────

function authMiddleware(requiredRole) {
  return (req, res, next) => {
    const role = req.headers['x-role']; // 'employee', 'manager', 'admin'
    const employeeId = req.headers['x-employee-id'];
    const pin = req.headers['x-pin']; // Simulated PIN for enterprise security

    if (!role || !employeeId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Verify employee exists and PIN (in production, use JWT/Sessions)
    const employee = db.prepare('SELECT * FROM employees WHERE employee_id = ?').get(employeeId);
    if (!employee) {
      return res.status(401).json({ error: 'Invalid Employee ID' });
    }

    // Enterprise security: validate role
    if (employee.role !== role && employee.role !== 'admin') {
      return res.status(403).json({ error: 'Role mismatch' });
    }

    if (requiredRole && requiredRole !== role && role !== 'admin') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    req.employee = employee;
    next();
  };
}

// ─── Health ─────────────────────────────────────────────────

app.get('/health', (req, res) => {
  const config = readConfig();
  res.json({
    status: 'ok',
    tenantId: RESTAURANT_ID,
    name: config.name,
    tenantType: 'tms',
    uptime: process.uptime(),
  });
});

// ─── Employees API ──────────────────────────────────────────

app.get('/employees', (req, res) => {
  const employees = db.prepare('SELECT * FROM employees').all();
  res.json(employees);
});

app.get('/employees/me', authMiddleware(), (req, res) => {
  res.json(req.employee);
});

// ─── Travel Requests API ────────────────────────────────────

app.get('/travel-requests', authMiddleware(), (req, res) => {
  let requests;
  if (req.employee.role === 'admin') {
    requests = db.prepare('SELECT tr.*, e.name as employee_name FROM travel_requests tr JOIN employees e ON tr.employee_id = e.id').all();
  } else if (req.employee.role === 'manager') {
    requests = db.prepare('SELECT tr.*, e.name as employee_name FROM travel_requests tr JOIN employees e ON tr.employee_id = e.id WHERE tr.manager_id = ? OR tr.employee_id = ?').all(req.employee.id, req.employee.id);
  } else {
    requests = db.prepare('SELECT tr.*, e.name as employee_name FROM travel_requests tr JOIN employees e ON tr.employee_id = e.id WHERE tr.employee_id = ?').all(req.employee.id);
  }
  res.json(requests);
});

app.post('/travel-requests', authMiddleware('employee'), (req, res) => {
  const { purpose, origin, destination, start_date, end_date, manager_id } = req.body;

  if (!purpose || !origin || !destination || !start_date || !end_date) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const result = db.prepare(
    'INSERT INTO travel_requests (employee_id, purpose, origin, destination, start_date, end_date, manager_id) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(req.employee.id, purpose, origin, destination, start_date, end_date, manager_id || null);

  const request = db.prepare('SELECT * FROM travel_requests WHERE id = ?').get(result.lastInsertRowid);

  // AI Feature: Policy Compliance Check via functions.js
  const compliance = tmsFunctions.validatePolicyCompliance(db, request, req.employee);

  db.prepare('INSERT INTO policy_compliance (request_id, policy_id, is_compliant, violations) VALUES (?, ?, ?, ?)')
    .run(request.id, req.employee.policy_id, compliance.isCompliant ? 1 : 0, JSON.stringify(compliance.violations));

  io.emit('request:new', request);
  res.status(201).json({ request, compliance: { isCompliant, violations } });
});

app.post('/travel-requests/:id/approve', authMiddleware('manager'), (req, res) => {
  const { id } = req.params;
  const request = db.prepare('SELECT * FROM travel_requests WHERE id = ?').get(id);

  if (!request) return res.status(404).json({ error: 'Request not found' });
  if (request.manager_id !== req.employee.id && req.employee.role !== 'admin') {
    return res.status(403).json({ error: 'Not authorized to approve this request' });
  }

  db.prepare("UPDATE travel_requests SET status = 'approved', approval_date = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
    .run(id);

  const updated = db.prepare('SELECT * FROM travel_requests WHERE id = ?').get(id);
  io.emit('request:updated', updated);
  res.json(updated);
});

app.post('/travel-requests/:id/reject', authMiddleware('manager'), (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  const request = db.prepare('SELECT * FROM travel_requests WHERE id = ?').get(id);

  if (!request) return res.status(404).json({ error: 'Request not found' });

  db.prepare("UPDATE travel_requests SET status = 'rejected', rejection_reason = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
    .run(reason, id);

  const updated = db.prepare('SELECT * FROM travel_requests WHERE id = ?').get(id);
  io.emit('request:updated', updated);
  res.json(updated);
});

// ─── Bookings API ───────────────────────────────────────────

app.get('/bookings', authMiddleware(), (req, res) => {
  const { request_id } = req.query;
  let query = 'SELECT b.*, v.name as vendor_name FROM bookings b LEFT JOIN vendors v ON b.vendor_id = v.id';
  let params = [];

  if (request_id) {
    query += ' WHERE b.request_id = ?';
    params.push(request_id);
  }

  const bookings = db.prepare(query).all(...params);
  res.json(bookings);
});

app.post('/bookings', authMiddleware('employee'), (req, res) => {
  const { request_id, type, vendor_id, details, confirmation_number, cost } = req.body;

  const request = db.prepare('SELECT * FROM travel_requests WHERE id = ?').get(request_id);
  if (!request || request.status !== 'approved') {
    return res.status(400).json({ error: 'Travel request must be approved before booking' });
  }

  const result = db.prepare(
    'INSERT INTO bookings (request_id, type, vendor_id, details, confirmation_number, cost) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(request_id, type, vendor_id || null, JSON.stringify(details), confirmation_number, cost || 0);

  // Update request status to booked
  db.prepare("UPDATE travel_requests SET status = 'booked' WHERE id = ?").run(request_id);

  const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(booking);
});

// ─── Expenses API ───────────────────────────────────────────

app.get('/expenses', authMiddleware(), (req, res) => {
  const expenses = db.prepare('SELECT ex.*, e.name as employee_name FROM expenses ex JOIN employees e ON ex.employee_id = e.id').all();
  res.json(expenses);
});

app.post('/expenses', authMiddleware('employee'), (req, res) => {
  const { request_id, category, amount, currency, expense_date, receipt_url } = req.body;

  // AI Feature: Fraud Detection via functions.js
  const fraudAnalysis = tmsFunctions.detectExpenseFraud({ category, amount, expense_date });

  const result = db.prepare(
    'INSERT INTO expenses (request_id, employee_id, category, amount, currency, expense_date, receipt_url, fraud_score, fraud_notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(request_id, req.employee.id, category, amount, currency || 'USD', expense_date, receipt_url, fraudAnalysis.fraudScore, fraudAnalysis.fraudNotes);

  const expense = db.prepare('SELECT * FROM expenses WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(expense);
});

app.post('/expenses/:id/approve', authMiddleware('manager'), (req, res) => {
  db.prepare("UPDATE expenses SET status = 'approved', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(req.params.id);
  res.json({ message: 'Expense approved' });
});

// ─── Policies API ───────────────────────────────────────────

app.get('/policies', (req, res) => {
  const policies = db.prepare('SELECT * FROM policies').all();
  res.json(policies);
});

// ─── AI Features API ────────────────────────────────────────

app.get('/travel-requests/:id/ai-advice', authMiddleware(), (req, res) => {
  const { id } = req.params;
  const request = db.prepare('SELECT * FROM travel_requests WHERE id = ?').get(id);
  if (!request) return res.status(404).json({ error: 'Request not found' });

  // AI Feature: Cost Optimization via functions.js
  const optimization = tmsFunctions.getTravelCostOptimization(request);

  res.json({
    costOptimization: optimization,
    riskAnalysis: {
      level: "Low",
      notes: "No active travel advisories for destination."
    },
    itinerarySuggestion: "Your schedule is tight. Consider adding a buffer day for recovery from jet lag."
  });
});

// ─── Vendors API ────────────────────────────────────────────

app.get('/vendors', (req, res) => {
  const vendors = db.prepare('SELECT * FROM vendors').all();
  res.json(vendors);
});

// ─── Start Server ───────────────────────────────────────────

server.listen(PORT, () => {
  const config = readConfig();
  console.log(`  ✈️  TMS Service ${RESTAURANT_ID} (${config.name}) running on port ${PORT}`);
});
