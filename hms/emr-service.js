/**
 * HMS EMR Microservice Template
 */
const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const DB_PATH = path.join(__dirname, 'emr.sqlite');
const db = new Database(DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS medical_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL,
    doctor_id INTEGER NOT NULL,
    visit_date DATE DEFAULT (DATE('now')),
    vitals_json TEXT,
    symptoms TEXT,
    diagnosis TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS prescriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    record_id INTEGER NOT NULL,
    patient_id INTEGER NOT NULL,
    doctor_id INTEGER NOT NULL,
    medicine_name TEXT NOT NULL,
    dosage TEXT,
    frequency TEXT,
    duration TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

app.get('/records/:patientId', (req, res) => {
  const records = db.prepare('SELECT * FROM medical_records WHERE patient_id = ?').all(req.params.patientId);
  res.json(records);
});

app.post('/records', (req, res) => {
  const { patient_id, doctor_id, vitals_json, symptoms, diagnosis, notes } = req.body;
  const result = db.prepare(`
    INSERT INTO medical_records (patient_id, doctor_id, vitals_json, symptoms, diagnosis, notes)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(patient_id, doctor_id, JSON.stringify(vitals_json), symptoms, diagnosis, notes);
  res.status(201).json({ id: result.lastInsertRowid });
});

app.listen(PORT, () => {
  console.log(`EMR Service for ${TENANT_ID} running on port ${PORT}`);
});
