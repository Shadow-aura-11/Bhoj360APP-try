/**
 * HMS Pharmacy Microservice Template
 */
const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const DB_PATH = path.join(__dirname, 'pharmacy.sqlite');
const db = new Database(DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS pharmacy_inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    medicine_name TEXT NOT NULL UNIQUE,
    generic_name TEXT,
    category TEXT,
    manufacturer TEXT,
    batch_number TEXT,
    expiry_date DATE,
    quantity INTEGER DEFAULT 0,
    unit_price REAL,
    reorder_level INTEGER DEFAULT 10,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS pharmacy_sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    prescription_id INTEGER,
    patient_id INTEGER,
    total_amount REAL,
    payment_status TEXT DEFAULT 'unpaid',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

app.get('/inventory', (req, res) => {
  const inventory = db.prepare('SELECT * FROM pharmacy_inventory').all();
  res.json(inventory);
});

app.listen(PORT, () => {
  console.log(`Pharmacy Service for ${TENANT_ID} running on port ${PORT}`);
});
