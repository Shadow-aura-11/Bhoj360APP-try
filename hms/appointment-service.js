/**
 * HMS Appointment Microservice Template
 */
const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const DB_PATH = path.join(__dirname, 'appointment.sqlite');
const db = new Database(DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL,
    doctor_id INTEGER NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    status TEXT DEFAULT 'scheduled',
    type TEXT DEFAULT 'OPD',
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

app.get('/appointments', (req, res) => {
  const appointments = db.prepare('SELECT * FROM appointments').all();
  res.json(appointments);
});

app.post('/appointments', (req, res) => {
  const { patient_id, doctor_id, appointment_date, appointment_time, type, notes } = req.body;
  const result = db.prepare(`
    INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, type, notes)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(patient_id, doctor_id, appointment_date, appointment_time, type, notes);
  res.status(201).json({ id: result.lastInsertRowid });
});

app.listen(PORT, () => {
  console.log(`Appointment Service for ${TENANT_ID} running on port ${PORT}`);
});
