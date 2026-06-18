-- Spa & Wellness Management System Schema

CREATE TABLE IF NOT EXISTS therapists (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  specialization TEXT,
  phone TEXT,
  email TEXT,
  availability_json TEXT, -- JSON representation of weekly schedule
  status TEXT DEFAULT 'active', -- active, inactive
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT, -- Massage, Facial, Body Treatment, etc.
  duration_minutes INTEGER NOT NULL,
  price REAL NOT NULL,
  available INTEGER DEFAULT 1,
  image_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS customer_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  phone TEXT UNIQUE,
  email TEXT,
  gender TEXT,
  date_of_birth DATE,
  wellness_notes TEXT,
  allergies TEXT,
  preferences_json TEXT,
  total_spend REAL DEFAULT 0,
  visit_count INTEGER DEFAULT 0,
  last_visit DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS appointments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER REFERENCES customer_profiles(id),
  therapist_id INTEGER REFERENCES therapists(id),
  service_id INTEGER REFERENCES services(id),
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  duration_minutes INTEGER,
  status TEXT DEFAULT 'scheduled', -- scheduled, confirmed, completed, cancelled, no-show
  notes TEXT,
  total_price REAL,
  payment_status TEXT DEFAULT 'unpaid', -- unpaid, partial, paid
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS memberships (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  price REAL NOT NULL,
  duration_months INTEGER NOT NULL,
  benefits_json TEXT,
  active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS customer_memberships (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER REFERENCES customer_profiles(id),
  membership_id INTEGER REFERENCES memberships(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT DEFAULT 'active', -- active, expired, cancelled
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS packages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  price REAL NOT NULL,
  services_json TEXT, -- JSON array of service_id and quantity
  validity_days INTEGER,
  active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS customer_packages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER REFERENCES customer_profiles(id),
  package_id INTEGER REFERENCES packages(id),
  purchase_date DATE DEFAULT CURRENT_TIMESTAMP,
  expiry_date DATE,
  remaining_credits_json TEXT, -- Track usage per service
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS treatment_plans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER REFERENCES customer_profiles(id),
  therapist_id INTEGER REFERENCES therapists(id),
  title TEXT NOT NULL,
  description TEXT,
  goals TEXT,
  recommended_services_json TEXT,
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  appointment_id INTEGER REFERENCES appointments(id),
  customer_id INTEGER REFERENCES customer_profiles(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comments TEXT,
  staff_performance_rating INTEGER,
  facility_rating INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inventory (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  item_name TEXT NOT NULL UNIQUE,
  category TEXT, -- Professional Use, Retail
  quantity REAL NOT NULL DEFAULT 0,
  unit TEXT NOT NULL,
  min_quantity REAL NOT NULL DEFAULT 0,
  supplier TEXT,
  cost_per_unit REAL DEFAULT 0,
  price_retail REAL DEFAULT 0,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inventory_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  inventory_id INTEGER REFERENCES inventory(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  change_amount REAL NOT NULL,
  type TEXT NOT NULL, -- stock-in, usage, sale, adjustment
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS billing_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  appointment_id INTEGER REFERENCES appointments(id),
  customer_id INTEGER REFERENCES customer_profiles(id),
  total_amount REAL NOT NULL,
  discount_amount REAL DEFAULT 0,
  tax_amount REAL DEFAULT 0,
  grand_total REAL NOT NULL,
  payment_method TEXT, -- Cash, Card, Online, Membership, Package
  payment_status TEXT DEFAULT 'paid',
  transaction_id TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS staff (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL, -- admin, receptionist, therapist
  pin TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  role TEXT NOT NULL,
  started_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
