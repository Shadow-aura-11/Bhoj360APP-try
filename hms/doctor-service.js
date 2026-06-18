/**
 * HMS Doctor Microservice Template
 */
const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const DB_PATH = path.join(__dirname, 'doctor.sqlite');
const db = new Database(DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS doctors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    specialization TEXT NOT NULL,
    qualification TEXT,
    experience_years INTEGER,
    phone TEXT,
    email TEXT,
    department TEXT,
    availability_json TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

app.get('/doctors', (req, res) => {
  const doctors = db.prepare('SELECT * FROM doctors').all();
  res.json(doctors);
});

app.post('/doctors', (req, res) => {
  const { name, specialization, qualification, experience_years, phone, email, department, availability_json } = req.body;
  const result = db.prepare(`
    INSERT INTO doctors (name, specialization, qualification, experience_years, phone, email, department, availability_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(name, specialization, qualification, experience_years, phone, email, department, availability_json);
  res.status(201).json({ id: result.lastInsertRowid });
});

app.listen(PORT, () => {
  console.log(`Doctor Service for ${TENANT_ID} running on port ${PORT}`);
});
