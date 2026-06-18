-- Enterprise Spa & Wellness Management System Schema

-- Multi-Branch Structure
CREATE TABLE IF NOT EXISTS organizations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  logo_url TEXT,
  website TEXT,
  country TEXT,
  currency TEXT DEFAULT 'USD',
  language TEXT DEFAULT 'en',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS branches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  organization_id INTEGER REFERENCES organizations(id),
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  timezone TEXT,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Staff & Commissions
CREATE TABLE IF NOT EXISTS staff (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  branch_id INTEGER REFERENCES branches(id),
  username TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL, -- admin, receptionist, therapist, doctor, inventory_manager
  pin TEXT NOT NULL,
  specialization TEXT,
  commission_rate REAL DEFAULT 0, -- base percentage
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS commissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  staff_id INTEGER REFERENCES staff(id),
  appointment_id INTEGER,
  sale_type TEXT, -- service, product, membership
  revenue_amount REAL,
  commission_amount REAL,
  payout_status TEXT DEFAULT 'pending', -- pending, paid
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Facility Management
CREATE TABLE IF NOT EXISTS rooms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  branch_id INTEGER REFERENCES branches(id),
  name TEXT NOT NULL,
  type TEXT, -- Massage, Facial, Consultation, Sauna, Yoga Studio
  capacity INTEGER DEFAULT 1,
  status TEXT DEFAULT 'available',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- CRM & Profiles
CREATE TABLE IF NOT EXISTS customer_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  organization_id INTEGER REFERENCES organizations(id),
  name TEXT NOT NULL,
  phone TEXT UNIQUE,
  email TEXT,
  gender TEXT,
  date_of_birth DATE,
  wellness_notes TEXT,
  allergies TEXT,
  preferences_json TEXT,
  loyalty_points INTEGER DEFAULT 0,
  total_spend REAL DEFAULT 0,
  visit_count INTEGER DEFAULT 0,
  last_visit DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Services & Clinical (MedSpa)
CREATE TABLE IF NOT EXISTS services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT, -- Massage, Facial, MedSpa, Ayurveda, Yoga
  duration_minutes INTEGER NOT NULL,
  price REAL NOT NULL,
  requires_doctor INTEGER DEFAULT 0,
  room_type_required TEXT,
  available INTEGER DEFAULT 1,
  image_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS medical_consultations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER REFERENCES customer_profiles(id),
  doctor_id INTEGER REFERENCES staff(id),
  consultation_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  symptoms TEXT,
  diagnosis TEXT,
  treatment_plan_id INTEGER,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS prescriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  consultation_id INTEGER REFERENCES medical_consultations(id),
  medication_name TEXT NOT NULL,
  dosage TEXT,
  frequency TEXT,
  duration TEXT,
  instructions TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS consent_forms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER REFERENCES customer_profiles(id),
  service_id INTEGER REFERENCES services(id),
  form_data_json TEXT,
  signature_url TEXT,
  signed_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Operations
CREATE TABLE IF NOT EXISTS appointments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  branch_id INTEGER REFERENCES branches(id),
  customer_id INTEGER REFERENCES customer_profiles(id),
  staff_id INTEGER REFERENCES staff(id), -- Therapist/Beautician/Doctor
  service_id INTEGER REFERENCES services(id),
  room_id INTEGER REFERENCES rooms(id),
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  duration_minutes INTEGER,
  status TEXT DEFAULT 'scheduled', -- scheduled, confirmed, check-in, completed, cancelled
  notes TEXT,
  total_price REAL,
  payment_status TEXT DEFAULT 'unpaid',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Growth Modules
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

CREATE TABLE IF NOT EXISTS gift_cards (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  card_number TEXT UNIQUE NOT NULL,
  initial_balance REAL NOT NULL,
  current_balance REAL NOT NULL,
  expiry_date DATE,
  customer_id INTEGER REFERENCES customer_profiles(id),
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS loyalty_transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER REFERENCES customer_profiles(id),
  points INTEGER NOT NULL,
  type TEXT, -- earned, redeemed
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS campaigns (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  type TEXT, -- Email, SMS, WhatsApp
  target_segment TEXT,
  content TEXT,
  status TEXT DEFAULT 'draft', -- draft, scheduled, sent
  sent_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Inventory & Procurement
CREATE TABLE IF NOT EXISTS inventory (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  branch_id INTEGER REFERENCES branches(id),
  item_name TEXT NOT NULL,
  category TEXT, -- Professional Use, Retail
  quantity REAL DEFAULT 0,
  unit TEXT NOT NULL,
  min_quantity REAL DEFAULT 0,
  supplier_id INTEGER,
  cost_per_unit REAL DEFAULT 0,
  price_retail REAL DEFAULT 0,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS suppliers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS purchase_orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  branch_id INTEGER REFERENCES branches(id),
  supplier_id INTEGER REFERENCES suppliers(id),
  total_amount REAL,
  status TEXT DEFAULT 'pending', -- pending, approved, ordered, received
  items_json TEXT, -- array of items and quantities
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Billing
CREATE TABLE IF NOT EXISTS invoices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  branch_id INTEGER REFERENCES branches(id),
  customer_id INTEGER REFERENCES customer_profiles(id),
  appointment_id INTEGER REFERENCES appointments(id),
  subtotal REAL NOT NULL,
  tax_amount REAL DEFAULT 0,
  discount_amount REAL DEFAULT 0,
  grand_total REAL NOT NULL,
  status TEXT DEFAULT 'unpaid', -- unpaid, paid, partially_paid
  payment_method TEXT, -- Cash, Card, UPI, Membership, GiftCard
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  staff_id INTEGER REFERENCES staff(id),
  role TEXT NOT NULL,
  started_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  appointment_id INTEGER REFERENCES appointments(id),
  customer_id INTEGER REFERENCES customer_profiles(id),
  rating INTEGER,
  comments TEXT,
  staff_performance_rating INTEGER,
  facility_rating INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
