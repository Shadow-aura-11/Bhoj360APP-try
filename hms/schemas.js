/**
 * HMS Microservices Database Schemas
 */

const PATIENT_SCHEMA = `
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
`;

const DOCTOR_SCHEMA = `
  CREATE TABLE IF NOT EXISTS doctors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    specialization TEXT NOT NULL,
    qualification TEXT,
    experience_years INTEGER,
    phone TEXT,
    email TEXT,
    department TEXT,
    availability_json TEXT, -- { "Mon": ["09:00-12:00"], ... }
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`;

const APPOINTMENT_SCHEMA = `
  CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL,
    doctor_id INTEGER NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    status TEXT DEFAULT 'scheduled', -- scheduled, completed, cancelled, no-show
    type TEXT DEFAULT 'OPD', -- OPD, Telemedicine, Follow-up
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`;

const EMR_SCHEMA = `
  CREATE TABLE IF NOT EXISTS medical_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL,
    doctor_id INTEGER NOT NULL,
    visit_date DATE DEFAULT (DATE('now')),
    vitals_json TEXT, -- { "bp": "120/80", "temp": "98.6", "weight": "70kg" }
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
`;

const LAB_SCHEMA = `
  CREATE TABLE IF NOT EXISTS lab_tests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL,
    doctor_id INTEGER NOT NULL,
    test_name TEXT NOT NULL,
    category TEXT, -- Biochemistry, Haematology, etc.
    status TEXT DEFAULT 'pending', -- pending, sample-collected, processing, completed
    results_json TEXT,
    report_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`;

const RADIOLOGY_SCHEMA = `
  CREATE TABLE IF NOT EXISTS radiology_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL,
    doctor_id INTEGER NOT NULL,
    imaging_type TEXT NOT NULL, -- X-Ray, MRI, CT Scan, Ultrasound
    body_part TEXT,
    status TEXT DEFAULT 'pending',
    findings TEXT,
    image_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`;

const PHARMACY_SCHEMA = `
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
`;

const BILLING_SCHEMA = `
  CREATE TABLE IF NOT EXISTS invoices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL,
    appointment_id INTEGER,
    total_amount REAL NOT NULL,
    tax_amount REAL DEFAULT 0,
    discount_amount REAL DEFAULT 0,
    grand_total REAL NOT NULL,
    status TEXT DEFAULT 'unpaid', -- unpaid, partial, paid, cancelled
    payment_method TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS invoice_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_id INTEGER NOT NULL,
    item_description TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    unit_price REAL NOT NULL,
    amount REAL NOT NULL,
    category TEXT -- Consultation, Lab, Pharmacy, Room, etc.
  );
`;

const INSURANCE_SCHEMA = `
  CREATE TABLE IF NOT EXISTS insurance_claims (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_id INTEGER NOT NULL,
    patient_id INTEGER NOT NULL,
    insurance_provider TEXT NOT NULL,
    policy_number TEXT NOT NULL,
    claim_amount REAL NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, approved, rejected, settled
    approved_amount REAL,
    rejection_reason TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`;

const INVENTORY_SCHEMA = `
  CREATE TABLE IF NOT EXISTS hospital_inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_name TEXT NOT NULL UNIQUE,
    category TEXT, -- Medical Supplies, Consumables, Equipment
    quantity REAL DEFAULT 0,
    unit TEXT,
    min_quantity REAL DEFAULT 0,
    supplier TEXT,
    last_restock_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`;

const AI_SCHEMA = `
  CREATE TABLE IF NOT EXISTS ai_predictions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL,
    prediction_type TEXT NOT NULL, -- disease-prediction, mortality-risk, etc.
    input_data_json TEXT,
    result_json TEXT,
    confidence_score REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`;

module.exports = {
  PATIENT_SCHEMA,
  DOCTOR_SCHEMA,
  APPOINTMENT_SCHEMA,
  EMR_SCHEMA,
  LAB_SCHEMA,
  RADIOLOGY_SCHEMA,
  PHARMACY_SCHEMA,
  BILLING_SCHEMA,
  INSURANCE_SCHEMA,
  INVENTORY_SCHEMA,
  AI_SCHEMA
};
