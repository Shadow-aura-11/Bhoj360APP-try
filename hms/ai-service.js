/**
 * HMS AI Microservice Template
 * Implementation of Enterprise-grade AI Features (Mock)
 */
const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const DB_PATH = path.join(__dirname, 'ai.sqlite');
const db = new Database(DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS ai_predictions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER,
    prediction_type TEXT NOT NULL,
    input_data_json TEXT,
    result_json TEXT,
    confidence_score REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// 1. Disease Prediction AI
app.post('/predict-disease', (req, res) => {
  const { symptoms, vitals, history } = req.body;
  console.log(`[AI] Processing Disease Prediction for symptoms: ${symptoms}`);

  // Mock AI Logic based on simple keyword matching
  let result = [
    { disease: 'General Viral Infection', confidence: 0.72 },
    { disease: 'Allergic Rhinitis', confidence: 0.15 }
  ];

  if (symptoms?.toLowerCase().includes('chest pain')) {
    result = [
      { disease: 'Angina Pectoris', confidence: 0.65 },
      { disease: 'Myocardial Infarction Risk', confidence: 0.25 },
      { disease: 'Acid Reflux', confidence: 0.10 }
    ];
  }

  res.json({
    status: 'success',
    feature: 'Disease Prediction',
    predictions: result,
    timestamp: new Date().toISOString()
  });
});

// 2. Medical Coding AI (ICD-10 / CPT)
app.post('/medical-coding', (req, res) => {
  const { diagnosis_text } = req.body;
  console.log(`[AI] Generating Medical Codes for: ${diagnosis_text}`);

  // Mock Medical Coding logic
  const codes = [
    { type: 'ICD-10', code: 'J00', description: 'Acute nasopharyngitis [common cold]' },
    { type: 'CPT', code: '99213', description: 'Office visit for the evaluation and management of an established patient' }
  ];

  res.json({
    status: 'success',
    feature: 'Medical Coding AI',
    codes,
    confidence: 0.98
  });
});

// 3. Clinical Decision Support (CDS)
app.post('/cds-alert', (req, res) => {
  const { patient_id, prescribed_medication, current_diagnoses } = req.body;

  // Mock Drug-Drug Interaction or Drug-Allergy check
  const alerts = [];
  if (prescribed_medication?.toLowerCase().includes('aspirin') && current_diagnoses?.toLowerCase().includes('ulcer')) {
    alerts.push({
      severity: 'high',
      type: 'Contraindication',
      message: 'Aspirin is contraindicated in patients with active peptic ulcers.'
    });
  }

  res.json({
    status: 'success',
    feature: 'Clinical Decision Support',
    alerts: alerts.length > 0 ? alerts : null,
    recommendation: alerts.length > 0 ? 'Review alternative medications (e.g. Acetaminophen)' : 'Safe to proceed'
  });
});

// 4. Medical Document Extraction
app.post('/extract-document', (req, res) => {
  const { base64_image } = req.body;
  console.log('[AI] Extracting data from medical document...');

  // Mock OCR and Entity Extraction
  res.json({
    status: 'success',
    feature: 'Medical Document Extraction',
    extracted_data: {
      patient_name: 'John Doe',
      dob: '1985-05-12',
      report_type: 'Complete Blood Count',
      entities: [
        { label: 'Hemoglobin', value: '14.2', unit: 'g/dL', status: 'Normal' },
        { label: 'WBC Count', value: '10500', unit: '/mcL', status: 'Slightly Elevated' }
      ]
    }
  });
});

// 5. Appointment Optimization
app.get('/optimize-appointments', (req, res) => {
  // Mock logic to re-order queue based on urgency and doctor availability
  res.json({
    status: 'success',
    feature: 'Appointment Optimization',
    optimized_queue: [
      { appointment_id: 104, patient_name: 'Emergency Case', priority: 1 },
      { appointment_id: 101, patient_name: 'Regular Follow-up', priority: 2 },
      { appointment_id: 102, patient_name: 'New Consultation', priority: 3 }
    ]
  });
});

// 6. AI Medical Assistant (Chat)
app.post('/chat', (req, res) => {
  const { message, context } = req.body;

  // Mock conversational AI logic
  let response = "I'm your HMS AI Assistant. I can help you with clinical queries or coding tasks.";

  if (message.toLowerCase().includes('diabetes')) {
    response = "Diabetes management requires monitoring HbA1c levels. Current guidelines recommend a target of <7% for most non-pregnant adults.";
  }

  res.json({
    status: 'success',
    feature: 'AI Medical Assistant',
    response,
    suggestions: ['Check latest vitals', 'View lab history']
  });
});

app.listen(PORT, () => {
  console.log(`AI Service for ${TENANT_ID} running on port ${PORT}`);
});
