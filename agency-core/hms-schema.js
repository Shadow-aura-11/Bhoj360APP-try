const hmsSchema = `
  CREATE TABLE IF NOT EXISTS patients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    dob DATE,
    gender TEXT,
    blood_group TEXT,
    contact TEXT,
    email TEXT,
    address TEXT,
    allergies_json TEXT,
    emergency_contact TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS doctors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    specialization TEXT,
    fee REAL,
    availability_json TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER REFERENCES patients(id),
    doctor_id INTEGER REFERENCES doctors(id),
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    status TEXT DEFAULT 'scheduled', -- scheduled, checked-in, completed, cancelled
    type TEXT DEFAULT 'OPD', -- OPD, Telemedicine
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS vitals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER REFERENCES patients(id),
    visit_id INTEGER,
    weight REAL,
    height REAL,
    blood_pressure TEXT,
    temperature REAL,
    pulse INTEGER,
    recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS visits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    appointment_id INTEGER REFERENCES appointments(id),
    patient_id INTEGER REFERENCES patients(id),
    doctor_id INTEGER REFERENCES doctors(id),
    diagnosis TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS prescriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    visit_id INTEGER REFERENCES visits(id),
    medications_json TEXT, -- array of {name, dosage, frequency, duration}
    instructions TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS lab_orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    visit_id INTEGER REFERENCES visits(id),
    test_name TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, sample-collected, processing, completed
    results_json TEXT,
    ordered_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS bills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER REFERENCES patients(id),
    visit_id INTEGER REFERENCES visits(id),
    total_amount REAL DEFAULT 0,
    discount REAL DEFAULT 0,
    tax REAL DEFAULT 0,
    grand_total REAL DEFAULT 0,
    status TEXT DEFAULT 'unpaid', -- unpaid, partial, paid
    items_json TEXT, -- array of {description, amount}
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_name TEXT NOT NULL UNIQUE,
    category TEXT, -- Medicine, Supply, Equipment
    quantity REAL DEFAULT 0,
    unit TEXT,
    price REAL DEFAULT 0,
    min_quantity REAL DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS staff (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    pin TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role TEXT NOT NULL,
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`;

function seedHMS(db) {
  // Seed Doctors
  const doctorInsert = db.prepare('INSERT INTO doctors (name, specialization, fee) VALUES (?, ?, ?)');
  doctorInsert.run('Dr. Smith', 'Cardiology', 500);
  doctorInsert.run('Dr. Johnson', 'Pediatrics', 400);
  doctorInsert.run('Dr. Williams', 'Orthopedics', 450);

  // Seed Patients
  const patientInsert = db.prepare('INSERT INTO patients (patient_id, name, dob, gender, blood_group, contact) VALUES (?, ?, ?, ?, ?, ?)');
  patientInsert.run('PAT-001', 'John Doe', '1985-05-15', 'Male', 'O+', '1234567890');
  patientInsert.run('PAT-002', 'Jane Roe', '1990-08-22', 'Female', 'A-', '0987654321');

  // Seed Inventory
  const inventoryInsert = db.prepare('INSERT INTO inventory (item_name, category, quantity, unit, price) VALUES (?, ?, ?, ?, ?)');
  inventoryInsert.run('Paracetamol', 'Medicine', 1000, 'Tablets', 5);
  inventoryInsert.run('Syringe 5ml', 'Supply', 500, 'Pieces', 10);
}

module.exports = { hmsSchema, seedHMS };
