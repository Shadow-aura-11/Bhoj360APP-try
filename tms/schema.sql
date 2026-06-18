-- Travel Management System (TMS) Schema

-- Employee Profiles
CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    department TEXT,
    role TEXT DEFAULT 'employee', -- 'employee', 'manager', 'admin'
    policy_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Corporate Policies
CREATE TABLE IF NOT EXISTS policies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    max_flight_class TEXT DEFAULT 'economy',
    max_hotel_stars INTEGER DEFAULT 3,
    daily_allowance REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Travel Requests
CREATE TABLE IF NOT EXISTS travel_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER REFERENCES employees(id),
    purpose TEXT NOT NULL,
    origin TEXT NOT NULL,
    destination TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'booked', 'completed', 'cancelled'
    manager_id INTEGER REFERENCES employees(id),
    approval_date DATETIME,
    rejection_reason TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Bookings (Flights, Hotels, etc.)
CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    request_id INTEGER REFERENCES travel_requests(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'flight', 'hotel', 'train', 'car_rental'
    vendor_id INTEGER,
    details TEXT, -- JSON string for flight/hotel specific info
    confirmation_number TEXT,
    cost REAL DEFAULT 0,
    status TEXT DEFAULT 'confirmed',
    booking_date DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Visa Management
CREATE TABLE IF NOT EXISTS visa_management (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    request_id INTEGER REFERENCES travel_requests(id) ON DELETE CASCADE,
    country TEXT NOT NULL,
    visa_type TEXT,
    status TEXT DEFAULT 'not_started', -- 'not_started', 'in_progress', 'submitted', 'issued', 'rejected'
    expiry_date DATE,
    notes TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Expense Management
CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    request_id INTEGER REFERENCES travel_requests(id) ON DELETE CASCADE,
    employee_id INTEGER REFERENCES employees(id),
    category TEXT NOT NULL, -- 'meals', 'transport', 'hotel', 'miscellaneous'
    amount REAL NOT NULL,
    currency TEXT DEFAULT 'USD',
    expense_date DATE NOT NULL,
    receipt_url TEXT,
    status TEXT DEFAULT 'submitted', -- 'submitted', 'approved', 'reimbursed', 'rejected'
    fraud_score REAL DEFAULT 0, -- AI feature: fraud detection score
    fraud_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Vendor Management
CREATE TABLE IF NOT EXISTS vendors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT, -- 'airline', 'hotel_chain', 'travel_agency'
    contact_info TEXT,
    rating REAL DEFAULT 0
);

-- Travel Insurance
CREATE TABLE IF NOT EXISTS travel_insurance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    request_id INTEGER REFERENCES travel_requests(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,
    policy_number TEXT NOT NULL,
    coverage_details TEXT,
    cost REAL DEFAULT 0
);

-- Itinerary Builder
CREATE TABLE IF NOT EXISTS itineraries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    request_id INTEGER REFERENCES travel_requests(id) ON DELETE CASCADE,
    itinerary_json TEXT, -- Full trip schedule
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Emergency Assistance
CREATE TABLE IF NOT EXISTS emergency_assistance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER REFERENCES employees(id),
    request_id INTEGER REFERENCES travel_requests(id),
    description TEXT NOT NULL,
    status TEXT DEFAULT 'open', -- 'open', 'resolved'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Policy Compliance Logs
CREATE TABLE IF NOT EXISTS policy_compliance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    request_id INTEGER REFERENCES travel_requests(id),
    policy_id INTEGER REFERENCES policies(id),
    is_compliant INTEGER DEFAULT 1, -- 0 for non-compliant, 1 for compliant
    violations TEXT, -- JSON array of violations
    checked_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
