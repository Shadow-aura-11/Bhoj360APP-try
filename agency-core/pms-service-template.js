/**
 * PMS Microservice — Service Template
 * ═══════════════════════════════════════════
 * This file is copied per PMS tenant by the factory.
 * The factory injects RESTAURANT_ID (TENANT_ID) and PORT at the top.
 */

// ─── Dependencies ───────────────────────────────────────────

const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server: SocketIO } = require('socket.io');
const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

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

function authMiddleware(allowedRoles) {
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
        console.error('Error validating staff credentials:', err);
      }
    }

    if (!authenticated) {
      return res.status(401).json({ error: 'Invalid PIN or credentials' });
    }

    if (allowedRoles && !allowedRoles.includes(role)) {
      return res.status(403).json({ error: 'Access denied: insufficient permissions' });
    }

    req.role = role;
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
    type: 'pms',
    uptime: process.uptime(),
  });
});

// ─── Auth API ───────────────────────────────────────────────

app.post('/auth', (req, res) => {
  const { role, pin, username } = req.body;
  const config = readConfig();

  if (role === 'admin') {
    if (config.pins.admin === pin.toString()) {
      return res.json({ role: 'admin', tenantId: RESTAURANT_ID, name: config.name, staffName: 'Admin' });
    }
  }

  if (username && pin) {
    const user = db.prepare('SELECT * FROM staff WHERE username = ? AND pin = ?').get(username, pin.toString());
    if (user) {
      return res.json({
        role: user.role,
        tenantId: RESTAURANT_ID,
        name: config.name,
        staffName: user.name,
        username: user.username,
      });
    }
  }

  return res.status(401).json({ error: 'Invalid credentials' });
});

// ─── Tenants & Leases API ───────────────────────────────────

// GET /tenants
app.get('/tenants', authMiddleware(['admin', 'staff']), (req, res) => {
  const tenants = db.prepare('SELECT * FROM tenants ORDER BY name').all();
  res.json(tenants);
});

// POST /tenants
app.post('/tenants', authMiddleware(['admin', 'staff']), (req, res) => {
  const { name, email, phone, nationality, id_number, occupation, emergency_contact } = req.body;
  const result = db.prepare(`
    INSERT INTO tenants (name, email, phone, nationality, id_number, occupation, emergency_contact)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(name, email, phone, nationality, id_number, occupation, emergency_contact);
  res.json({ id: result.lastInsertRowid, name });
});

// GET /leases
app.get('/leases', authMiddleware(['admin', 'staff']), (req, res) => {
  const leases = db.prepare(`
    SELECT l.*, t.name as tenant_name, u.unit_number, p.name as property_name
    FROM leases l
    JOIN tenants t ON l.tenant_id = t.id
    JOIN units u ON l.unit_id = u.id
    JOIN floors f ON u.floor_id = f.id
    JOIN buildings b ON f.building_id = b.id
    JOIN properties p ON b.property_id = p.id
    ORDER BY l.created_at DESC
  `).all();
  res.json(leases);
});

// POST /leases
app.post('/leases', authMiddleware(['admin']), (req, res) => {
  const { unit_id, tenant_id, start_date, end_date, rent_amount, deposit_amount } = req.body;

  const createLease = db.transaction(() => {
    const result = db.prepare(`
      INSERT INTO leases (unit_id, tenant_id, start_date, end_date, rent_amount, deposit_amount, status)
      VALUES (?, ?, ?, ?, ?, ?, 'Active')
    `).run(unit_id, tenant_id, start_date, end_date, rent_amount, deposit_amount);

    // Update unit status to Occupied
    db.prepare("UPDATE units SET status = 'Occupied' WHERE id = ?").run(unit_id);

    return result.lastInsertRowid;
  });

  const leaseId = createLease();
  res.json({ id: leaseId, status: 'Active' });
});

// PUT /leases/:id
app.put('/leases/:id', authMiddleware(['admin']), (req, res) => {
    const { status, end_date, rent_amount } = req.body;

    const updateLease = db.transaction(() => {
        db.prepare(`
            UPDATE leases SET
            status = COALESCE(?, status),
            end_date = COALESCE(?, end_date),
            rent_amount = COALESCE(?, rent_amount)
            WHERE id = ?
        `).run(status, end_date, rent_amount, req.params.id);

        if (status === 'Terminated' || status === 'Expired') {
            const lease = db.prepare('SELECT unit_id FROM leases WHERE id = ?').get(req.params.id);
            db.prepare("UPDATE units SET status = 'Vacant' WHERE id = ?").run(lease.unit_id);
        }
    });

    updateLease();
    res.json({ message: 'Lease updated' });
});

// GET /lease-applications
app.get('/lease-applications', authMiddleware(['admin', 'staff']), (req, res) => {
    const apps = db.prepare(`
        SELECT la.*, t.name as tenant_name, u.unit_number
        FROM lease_applications la
        JOIN tenants t ON la.tenant_id = t.id
        JOIN units u ON la.unit_id = u.id
        ORDER BY la.submitted_at DESC
    `).all();
    res.json(apps);
});

// POST /lease-applications
app.post('/lease-applications', (req, res) => {
    const { unit_id, tenant_id } = req.body;
    const result = db.prepare('INSERT INTO lease_applications (unit_id, tenant_id) VALUES (?, ?)').run(unit_id, tenant_id);
    res.json({ id: result.lastInsertRowid, status: 'Pending' });
});

// PATCH /lease-applications/:id/approve
app.patch('/lease-applications/:id/approve', authMiddleware(['admin']), (req, res) => {
    db.prepare("UPDATE lease_applications SET status = 'Approved' WHERE id = ?").run(req.params.id);
    res.json({ message: 'Application approved' });
});

// POST /leases/renew
app.post('/leases/renew', authMiddleware(['admin']), (req, res) => {
    const { lease_id, new_end_date, new_rent } = req.body;
    const oldLease = db.prepare('SELECT * FROM leases WHERE id = ?').get(lease_id);

    if (!oldLease) return res.status(404).json({ error: 'Lease not found' });

    const result = db.prepare(`
        INSERT INTO leases (unit_id, tenant_id, start_date, end_date, rent_amount, deposit_amount, status)
        VALUES (?, ?, ?, ?, ?, ?, 'Active')
    `).run(oldLease.unit_id, oldLease.tenant_id, oldLease.end_date, new_end_date, new_rent, oldLease.deposit_amount);

    db.prepare("UPDATE leases SET status = 'Expired' WHERE id = ?").run(lease_id);

    res.json({ id: result.lastInsertRowid, message: 'Lease renewed' });
});

// ─── Billing & Payments API ─────────────────────────────────

// GET /invoices
app.get('/invoices', authMiddleware(['admin', 'staff']), (req, res) => {
    const invoices = db.prepare(`
        SELECT i.*, t.name as tenant_name, u.unit_number
        FROM invoices i
        JOIN tenants t ON i.tenant_id = t.id
        JOIN units u ON i.unit_id = u.id
        ORDER BY i.created_at DESC
    `).all();
    res.json(invoices);
});

// POST /invoices
app.post('/invoices', authMiddleware(['admin']), (req, res) => {
    const { lease_id, tenant_id, unit_id, rent, utilities, parking, tax, due_date } = req.body;
    const invoice_no = 'INV-' + Date.now().toString(36).toUpperCase();
    const total = (rent || 0) + (utilities || 0) + (parking || 0) + (tax || 0);

    const result = db.prepare(`
        INSERT INTO invoices (lease_id, tenant_id, unit_id, invoice_no, rent, utilities, parking, tax, total, due_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(lease_id, tenant_id, unit_id, invoice_no, rent, utilities, parking, tax, total, due_date);

    res.json({ id: result.lastInsertRowid, invoice_no, total });
});

// POST /payments
app.post('/payments', authMiddleware(['admin', 'staff']), (req, res) => {
    const { invoice_id, amount, method, transaction_id } = req.body;

    const recordPayment = db.transaction(() => {
        const result = db.prepare(`
            INSERT INTO payments (invoice_id, amount, method, transaction_id, status)
            VALUES (?, ?, ?, ?, 'Completed')
        `).run(invoice_id, amount, method, transaction_id);

        // Update invoice status if fully paid
        const invoice = db.prepare('SELECT total FROM invoices WHERE id = ?').get(invoice_id);
        const payments = db.prepare('SELECT SUM(amount) as total_paid FROM payments WHERE invoice_id = ?').get(invoice_id);

        if (payments.total_paid >= invoice.total) {
            db.prepare("UPDATE invoices SET status = 'Paid' WHERE id = ?").run(invoice_id);
        }

        return result.lastInsertRowid;
    });

    const paymentId = recordPayment();
    res.json({ id: paymentId, status: 'Completed' });
});

// ─── Maintenance & Vendors API ──────────────────────────────

// GET /maintenance-requests
app.get('/maintenance-requests', authMiddleware(['admin', 'staff']), (req, res) => {
    const requests = db.prepare(`
        SELECT mr.*, t.name as tenant_name, u.unit_number
        FROM maintenance_requests mr
        JOIN tenants t ON mr.tenant_id = t.id
        JOIN units u ON mr.unit_id = u.id
        ORDER BY mr.created_at DESC
    `).all();
    res.json(requests);
});

// POST /maintenance-requests
app.post('/maintenance-requests', (req, res) => {
    const { unit_id, tenant_id, description, priority } = req.body;
    const result = db.prepare(`
        INSERT INTO maintenance_requests (unit_id, tenant_id, description, priority)
        VALUES (?, ?, ?, ?)
    `).run(unit_id, tenant_id, description, priority);
    res.json({ id: result.lastInsertRowid, status: 'Open' });
});

// GET /vendors
app.get('/vendors', authMiddleware(['admin', 'staff']), (req, res) => {
    const vendors = db.prepare('SELECT * FROM vendors ORDER BY company').all();
    res.json(vendors);
});

// POST /vendors
app.post('/vendors', authMiddleware(['admin']), (req, res) => {
    const { company, license, tax_number, services } = req.body;
    const result = db.prepare(`
        INSERT INTO vendors (company, license, tax_number, services)
        VALUES (?, ?, ?, ?)
    `).run(company, license, tax_number, services);
    res.json({ id: result.lastInsertRowid, company });
});

// POST /work-orders
app.post('/work-orders', authMiddleware(['admin']), (req, res) => {
    const { maintenance_request_id, vendor_id, description, cost, scheduled_at } = req.body;

    const createWorkOrder = db.transaction(() => {
        const result = db.prepare(`
            INSERT INTO work_orders (maintenance_request_id, vendor_id, description, cost, scheduled_at)
            VALUES (?, ?, ?, ?, ?)
        `).run(maintenance_request_id, vendor_id, description, cost, scheduled_at);

        // Update maintenance request status
        db.prepare("UPDATE maintenance_requests SET status = 'In Progress' WHERE id = ?").run(maintenance_request_id);

        return result.lastInsertRowid;
    });

    const workOrderId = createWorkOrder();
    res.json({ id: workOrderId, status: 'Assigned' });
});

// ─── Properties & Units API ─────────────────────────────────

// GET /properties
app.get('/properties', authMiddleware(['admin', 'staff']), (req, res) => {
  const properties = db.prepare('SELECT * FROM properties ORDER BY name').all();
  res.json(properties);
});

// POST /properties
app.post('/properties', authMiddleware(['admin']), (req, res) => {
  const { name, type, address, city, country } = req.body;
  const result = db.prepare('INSERT INTO properties (name, type, address, city, country) VALUES (?, ?, ?, ?, ?)').run(name, type, address, city, country);
  res.json({ id: result.lastInsertRowid, name, type });
});

// GET /properties/:id
app.get('/properties/:id', authMiddleware(['admin', 'staff']), (req, res) => {
  const property = db.prepare('SELECT * FROM properties WHERE id = ?').get(req.params.id);
  if (!property) return res.status(404).json({ error: 'Property not found' });

  const buildings = db.prepare('SELECT * FROM buildings WHERE property_id = ?').all(req.params.id);
  res.json({ ...property, buildings });
});

// POST /buildings
app.post('/buildings', authMiddleware(['admin']), (req, res) => {
  const { property_id, name } = req.body;
  const result = db.prepare('INSERT INTO buildings (property_id, name) VALUES (?, ?)').run(property_id, name);
  res.json({ id: result.lastInsertRowid, property_id, name });
});

// GET /buildings/:id/floors
app.get('/buildings/:id/floors', authMiddleware(['admin', 'staff']), (req, res) => {
  const floors = db.prepare('SELECT * FROM floors WHERE building_id = ?').all(req.params.id);
  res.json(floors);
});

// POST /floors
app.post('/floors', authMiddleware(['admin']), (req, res) => {
  const { building_id, floor_number } = req.body;
  const result = db.prepare('INSERT INTO floors (building_id, floor_number) VALUES (?, ?)').run(building_id, floor_number);
  res.json({ id: result.lastInsertRowid, building_id, floor_number });
});

// GET /units
app.get('/units', authMiddleware(['admin', 'staff']), (req, res) => {
    let query = `
        SELECT u.*, f.floor_number, b.name as building_name, p.name as property_name
        FROM units u
        JOIN floors f ON u.floor_id = f.id
        JOIN buildings b ON f.building_id = b.id
        JOIN properties p ON b.property_id = p.id
    `;
    const units = db.prepare(query).all();
    res.json(units);
});

// POST /units
app.post('/units', authMiddleware(['admin']), (req, res) => {
  const { floor_id, unit_number, type, size, bedrooms, bathrooms, rent } = req.body;
  const result = db.prepare('INSERT INTO units (floor_id, unit_number, type, size, bedrooms, bathrooms, rent) VALUES (?, ?, ?, ?, ?, ?, ?)').run(floor_id, unit_number, type, size, bedrooms, bathrooms, rent);
  res.json({ id: result.lastInsertRowid, unit_number });
});

// PUT /units/:id
app.put('/units/:id', authMiddleware(['admin', 'staff']), (req, res) => {
    const { unit_number, type, size, bedrooms, bathrooms, rent, status } = req.body;
    db.prepare(`
        UPDATE units SET
        unit_number = COALESCE(?, unit_number),
        type = COALESCE(?, type),
        size = COALESCE(?, size),
        bedrooms = COALESCE(?, bedrooms),
        bathrooms = COALESCE(?, bathrooms),
        rent = COALESCE(?, rent),
        status = COALESCE(?, status),
        updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    `).run(unit_number, type, size, bedrooms, bathrooms, rent, status, req.params.id);
    res.json({ message: 'Unit updated' });
});

// ─── Analytics Summary ──────────────────────────────────────

app.get('/analytics/summary', (req, res) => {
    const totalProperties = db.prepare('SELECT COUNT(*) as count FROM properties').get().count;
    const totalUnits = db.prepare('SELECT COUNT(*) as count FROM units').get().count;
    const occupiedUnits = db.prepare("SELECT COUNT(*) as count FROM units WHERE status = 'Occupied'").get().count;
    const totalTenants = db.prepare('SELECT COUNT(*) as count FROM tenants').get().count;

    const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;

    const totalRevenue = db.prepare("SELECT SUM(amount) as total FROM payments WHERE status = 'Completed'").get().total || 0;
    const pendingInvoices = db.prepare("SELECT COUNT(*) as count FROM invoices WHERE status = 'Unpaid'").get().count;
    const openMaintenance = db.prepare("SELECT COUNT(*) as count FROM maintenance_requests WHERE status = 'Open'").get().count;

    res.json({
        totalProperties,
        totalUnits,
        occupiedUnits,
        totalTenants,
        occupancyRate: Math.round(occupancyRate * 100) / 100,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        pendingInvoices,
        openMaintenance
    });
});

// ─── Scheduled Tasks & Business Logic ───────────────────────

// Automated Rent Invoice Generation (runs every 24h)
async function generateMonthlyInvoices() {
    try {
        const today = new Date().toISOString().split('T')[0];
        const dayOfMonth = new Date().getDate();

        // Find active leases
        const activeLeases = db.prepare("SELECT * FROM leases WHERE status = 'Active'").all();

        for (const lease of activeLeases) {
            const startDay = new Date(lease.start_date).getDate();
            if (startDay === dayOfMonth) {
                // Check if invoice already exists for this month to avoid duplicates
                const monthStr = new Date().toISOString().slice(0, 7); // YYYY-MM
                const exists = db.prepare("SELECT id FROM invoices WHERE lease_id = ? AND strftime('%Y-%m', created_at) = ?").get(lease.id, monthStr);

                if (!exists) {
                    const invoice_no = 'INV-' + Math.random().toString(36).substring(2, 9).toUpperCase();
                    const due_date = new Date();
                    due_date.setDate(due_date.getDate() + 7); // 7 days to pay

                    db.prepare(`
                        INSERT INTO invoices (lease_id, tenant_id, unit_id, invoice_no, rent, utilities, parking, tax, total, due_date)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `).run(
                        lease.id,
                        lease.tenant_id,
                        lease.unit_id,
                        invoice_no,
                        lease.rent_amount,
                        50, // Flat utility for demo
                        0,
                        lease.rent_amount * 0.05,
                        lease.rent_amount * 1.05 + 50,
                        due_date.toISOString().split('T')[0]
                    );
                    console.log(`[Billing Engine] Generated monthly invoice ${invoice_no} for Lease #${lease.id}`);
                }
            }
        }

        // Apply Late Fees to Overdue Invoices
        const overdue = db.prepare("SELECT * FROM invoices WHERE (status = 'Unpaid' OR status = 'Overdue') AND due_date < ?").all(today);
        for (const inv of overdue) {
            if (inv.status === 'Unpaid') {
              const lateFee = 100; // Flat late fee
              db.prepare("UPDATE invoices SET total = total + ?, status = 'Overdue' WHERE id = ?").run(lateFee, inv.id);
              console.log(`[Billing Engine] Applied late fee and marked as Overdue: ${inv.invoice_no}`);
            }
        }

    } catch (err) {
        console.error('[Billing Engine] Error:', err.message);
    }
}

setInterval(generateMonthlyInvoices, 24 * 60 * 60 * 1000);
// Run once on startup
setTimeout(generateMonthlyInvoices, 5000);

// ─── Start Server ───────────────────────────────────────────

server.listen(PORT, () => {
  const config = readConfig();
  console.log(`  🏢 PMS Tenant ${RESTAURANT_ID} (${config.name}) running on port ${PORT}`);
});
