/**
 * HMS Billing Microservice Template
 */
const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const DB_PATH = path.join(__dirname, 'billing.sqlite');
const db = new Database(DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS invoices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL,
    appointment_id INTEGER,
    total_amount REAL NOT NULL,
    tax_amount REAL DEFAULT 0,
    discount_amount REAL DEFAULT 0,
    grand_total REAL NOT NULL,
    status TEXT DEFAULT 'unpaid',
    payment_method TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS invoice_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_id INTEGER NOT NULL,
    item_description TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    unit_price REAL NOT NULL,
    amount REAL NOT NULL,
    category TEXT
  );
`);

app.get('/invoices', (req, res) => {
  const invoices = db.prepare('SELECT * FROM invoices').all();
  res.json(invoices);
});

app.listen(PORT, () => {
  console.log(`Billing Service for ${TENANT_ID} running on port ${PORT}`);
});
