/**
 * HMS Inventory Microservice Template
 */
const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const DB_PATH = path.join(__dirname, 'inventory.sqlite');
const db = new Database(DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS hospital_inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_name TEXT NOT NULL UNIQUE,
    category TEXT,
    quantity REAL DEFAULT 0,
    unit TEXT,
    min_quantity REAL DEFAULT 0,
    supplier TEXT,
    last_restock_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

app.get('/items', (req, res) => {
  const items = db.prepare('SELECT * FROM hospital_inventory').all();
  res.json(items);
});

app.listen(PORT, () => {
  console.log(`Inventory Service for ${TENANT_ID} running on port ${PORT}`);
});
