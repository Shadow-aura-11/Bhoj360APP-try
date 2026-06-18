const express = require('express');
const router = express.Router();

module.exports = (db, io) => {
  // ─── Patients ───────────────────────────────────────────────
  router.get('/patients', (req, res) => {
    try {
      const patients = db.prepare('SELECT * FROM patients ORDER BY created_at DESC').all();
      res.json(patients);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.post('/patients', (req, res) => {
    const { name, dob, gender, blood_group, contact, email, address, allergies, emergency_contact } = req.body;
    const patient_id = 'PAT-' + Date.now().toString().slice(-6);
    try {
      const result = db.prepare(`
        INSERT INTO patients (patient_id, name, dob, gender, blood_group, contact, email, address, allergies_json, emergency_contact)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(patient_id, name, dob, gender, blood_group, contact, email, address, JSON.stringify(allergies || []), emergency_contact);
      const patient = db.prepare('SELECT * FROM patients WHERE id = ?').get(result.lastInsertRowid);
      res.status(201).json(patient);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.get('/patients/:id', (req, res) => {
    try {
      const patient = db.prepare('SELECT * FROM patients WHERE id = ?').get(req.params.id);
      if (!patient) return res.status(404).json({ error: 'Patient not found' });

      const appointments = db.prepare('SELECT * FROM appointments WHERE patient_id = ?').all(patient.id);
      const vitals = db.prepare('SELECT * FROM vitals WHERE patient_id = ?').all(patient.id);
      const visits = db.prepare('SELECT * FROM visits WHERE patient_id = ?').all(patient.id);

      res.json({ ...patient, appointments, vitals, visits });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ─── Doctors ────────────────────────────────────────────────
  router.get('/doctors', (req, res) => {
    try {
      const doctors = db.prepare('SELECT * FROM doctors').all();
      res.json(doctors);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ─── Appointments ───────────────────────────────────────────
  router.get('/appointments', (req, res) => {
    try {
      const appointments = db.prepare(`
        SELECT a.*, p.name as patient_name, d.name as doctor_name
        FROM appointments a
        JOIN patients p ON a.patient_id = p.id
        JOIN doctors d ON a.doctor_id = d.id
        ORDER BY appointment_date DESC, appointment_time DESC
      `).all();
      res.json(appointments);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.post('/appointments', (req, res) => {
    const { patient_id, doctor_id, appointment_date, appointment_time, type, notes } = req.body;
    try {
      const result = db.prepare(`
        INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, type, notes)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(patient_id, doctor_id, appointment_date, appointment_time, type || 'OPD', notes);
      const appointment = db.prepare('SELECT * FROM appointments WHERE id = ?').get(result.lastInsertRowid);
      io.to('hms').emit('appointment:new', appointment);
      res.status(201).json(appointment);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.patch('/appointments/:id/status', (req, res) => {
    const { status } = req.body;
    try {
      db.prepare('UPDATE appointments SET status = ? WHERE id = ?').run(status, req.params.id);
      res.json({ message: 'Status updated' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ─── Vitals ─────────────────────────────────────────────────
  router.post('/vitals', (req, res) => {
    const { patient_id, visit_id, weight, height, blood_pressure, temperature, pulse } = req.body;
    try {
      const result = db.prepare(`
        INSERT INTO vitals (patient_id, visit_id, weight, height, blood_pressure, temperature, pulse)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(patient_id, visit_id, weight, height, blood_pressure, temperature, pulse);
      res.status(201).json({ id: result.lastInsertRowid });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ─── Visits & EMR ───────────────────────────────────────────
  router.post('/visits', (req, res) => {
    const { appointment_id, patient_id, doctor_id, diagnosis, notes } = req.body;
    try {
      const result = db.prepare(`
        INSERT INTO visits (appointment_id, patient_id, doctor_id, diagnosis, notes)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(appointment_id, patient_id, doctor_id, diagnosis, notes);

      if (appointment_id) {
        db.prepare("UPDATE appointments SET status = 'completed' WHERE id = ?").run(appointment_id);
      }

      res.status(201).json({ id: result.lastInsertRowid });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ─── Inventory ──────────────────────────────────────────────
  router.get('/inventory', (req, res) => {
    try {
      const items = db.prepare('SELECT * FROM inventory').all();
      res.json(items);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ─── Analytics ──────────────────────────────────────────────
  router.get('/analytics/summary', (req, res) => {
    try {
      const totalPatients = db.prepare('SELECT COUNT(*) as count FROM patients').get().count;
      const appointmentsToday = db.prepare("SELECT COUNT(*) as count FROM appointments WHERE appointment_date = DATE('now', 'localtime')").get().count;
      const revenueToday = db.prepare("SELECT SUM(grand_total) as total FROM bills WHERE DATE(created_at) = DATE('now', 'localtime') AND status = 'paid'").get().total || 0;

      res.json({
        totalPatients,
        appointmentsToday,
        revenueToday,
        offline: false
      });
    } catch (err) {
      res.json({ totalPatients: 0, appointmentsToday: 0, revenueToday: 0, offline: true });
    }
  });

  return router;
};
