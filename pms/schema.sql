-- PMS Database Schema Initialization

CREATE TABLE IF NOT EXISTS properties (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- Residential, Commercial, etc.
    address TEXT,
    city TEXT,
    country TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS buildings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS floors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    building_id INTEGER REFERENCES buildings(id) ON DELETE CASCADE,
    floor_number TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS units (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    floor_id INTEGER REFERENCES floors(id) ON DELETE CASCADE,
    unit_number TEXT NOT NULL,
    type TEXT, -- Studio, 1BR, 2BR, Office, Shop
    size REAL,
    bedrooms INTEGER DEFAULT 0,
    bathrooms INTEGER DEFAULT 0,
    rent REAL DEFAULT 0,
    status TEXT DEFAULT 'Vacant', -- Vacant, Occupied, Reserved, Maintenance, Blocked
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tenants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    nationality TEXT,
    id_number TEXT,
    occupation TEXT,
    emergency_contact TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lease_applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    unit_id INTEGER REFERENCES units(id),
    tenant_id INTEGER REFERENCES tenants(id),
    status TEXT DEFAULT 'Pending', -- Pending, Approved, Rejected
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS leases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    unit_id INTEGER REFERENCES units(id),
    tenant_id INTEGER REFERENCES tenants(id),
    start_date DATE,
    end_date DATE,
    rent_amount REAL,
    deposit_amount REAL,
    status TEXT DEFAULT 'Active', -- Draft, Active, Expired, Terminated
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS invoices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lease_id INTEGER REFERENCES leases(id),
    tenant_id INTEGER REFERENCES tenants(id),
    unit_id INTEGER REFERENCES units(id),
    invoice_no TEXT UNIQUE,
    rent REAL DEFAULT 0,
    utilities REAL DEFAULT 0,
    parking REAL DEFAULT 0,
    tax REAL DEFAULT 0,
    total REAL DEFAULT 0,
    status TEXT DEFAULT 'Unpaid', -- Unpaid, Paid, Overdue, Cancelled
    due_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_id INTEGER REFERENCES invoices(id),
    amount REAL,
    method TEXT,
    transaction_id TEXT,
    status TEXT DEFAULT 'Completed',
    paid_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS maintenance_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    unit_id INTEGER REFERENCES units(id),
    tenant_id INTEGER REFERENCES tenants(id),
    description TEXT NOT NULL,
    priority TEXT DEFAULT 'Normal', -- Low, Normal, High, Urgent
    status TEXT DEFAULT 'Open', -- Open, In Progress, Resolved, Closed
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS work_orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    maintenance_request_id INTEGER REFERENCES maintenance_requests(id),
    vendor_id INTEGER REFERENCES vendors(id),
    description TEXT,
    cost REAL DEFAULT 0,
    status TEXT DEFAULT 'Assigned', -- Assigned, Started, Completed
    scheduled_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vendors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company TEXT NOT NULL,
    license TEXT,
    tax_number TEXT,
    services TEXT,
    rating REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS staff (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    pin TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entity_type TEXT NOT NULL, -- Property, Unit, Tenant, Lease
    entity_id INTEGER NOT NULL,
    file_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
