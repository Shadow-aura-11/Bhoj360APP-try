/**
 * HMS Insurance Microservice Template
 */
const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const DB_PATH = path.join(__dirname, 'insurance.sqlite');
const db = new Database(DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS insurance_claims (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_id INTEGER NOT NULL,
    patient_id INTEGER NOT NULL,
    insurance_provider TEXT NOT NULL,
    policy_number TEXT NOT NULL,
    claim_amount REAL NOT NULL,
    status TEXT DEFAULT 'pending',
    approved_amount REAL,
    rejection_reason TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

app.get('/claims', (req, res) => {
  const claims = db.prepare('SELECT * FROM insurance_claims').all();
  res.json(claims);
});

app.listen(PORT, () => {
  console.log(`Insurance Service for ${TENANT_ID} running on port ${PORT}`);
});
