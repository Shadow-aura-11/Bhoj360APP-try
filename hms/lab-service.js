/**
 * HMS Lab Microservice Template
 */
const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const DB_PATH = path.join(__dirname, 'lab.sqlite');
const db = new Database(DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS lab_tests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL,
    doctor_id INTEGER NOT NULL,
    test_name TEXT NOT NULL,
    category TEXT,
    status TEXT DEFAULT 'pending',
    results_json TEXT,
    report_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

app.get('/tests', (req, res) => {
  const tests = db.prepare('SELECT * FROM lab_tests').all();
  res.json(tests);
});

app.listen(PORT, () => {
  console.log(`Lab Service for ${TENANT_ID} running on port ${PORT}`);
});
