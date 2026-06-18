/**
 * HMS Patient Microservice Template
 */
const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

const DB_PATH = path.join(__dirname, 'patient.sqlite');
const db = new Database(DB_PATH);

// Initialise Schema (Assuming PATIENT_SCHEMA is available)
db.exec(`
  CREATE TABLE IF NOT EXISTS patients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    dob DATE NOT NULL,
    gender TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    blood_group TEXT,
    emergency_contact TEXT,
    insurance_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// API Routes
app.get('/patients', (req, res) => {
  const patients = db.prepare('SELECT * FROM patients').all();
  res.json(patients);
});

app.post('/patients', (req, res) => {
  const { name, dob, gender, phone, email, address, blood_group, emergency_contact, insurance_id } = req.body;
  const result = db.prepare(`
    INSERT INTO patients (name, dob, gender, phone, email, address, blood_group, emergency_contact, insurance_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(name, dob, gender, phone, email, address, blood_group, emergency_contact, insurance_id);
  res.status(201).json({ id: result.lastInsertRowid });
});

app.get('/patients/:id', (req, res) => {
  const patient = db.prepare('SELECT * FROM patients WHERE id = ?').get(req.params.id);
  if (!patient) return res.status(404).json({ error: 'Patient not found' });
  res.json(patient);
});

app.listen(PORT, () => {
  console.log(`Patient Service for ${TENANT_ID} running on port ${PORT}`);
});
