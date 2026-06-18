-- Manufacturing ERP / MES Schema

-- 1. Organizations & Infrastructure
CREATE TABLE IF NOT EXISTS organizations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS plants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    organization_id INTEGER REFERENCES organizations(id),
    name TEXT NOT NULL,
    location TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS warehouses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    plant_id INTEGER REFERENCES plants(id),
    name TEXT NOT NULL,
    type TEXT, -- Raw Material, WIP, Finished Goods
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Products & BOM
CREATE TABLE IF NOT EXISTS product_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    category_id INTEGER REFERENCES product_categories(id),
    unit TEXT NOT NULL,
    cost REAL DEFAULT 0,
    selling_price REAL DEFAULT 0,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bom_headers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER REFERENCES products(id),
    version TEXT NOT NULL,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bom_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bom_header_id INTEGER REFERENCES bom_headers(id),
    component_id INTEGER REFERENCES products(id),
    quantity REAL NOT NULL,
    unit TEXT NOT NULL
);

-- 3. Sales & Demand
CREATE TABLE IF NOT EXISTS sales_orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_number TEXT NOT NULL UNIQUE,
    customer_name TEXT,
    status TEXT DEFAULT 'Draft', -- Draft, Confirmed, Shipped, Invoiced, Cancelled
    total_amount REAL DEFAULT 0,
    order_date DATE DEFAULT CURRENT_DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sales_order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sales_order_id INTEGER REFERENCES sales_orders(id),
    product_id INTEGER REFERENCES products(id),
    quantity REAL NOT NULL,
    unit_price REAL NOT NULL,
    total_price REAL NOT NULL
);

-- 4. Production Planning & MES
CREATE TABLE IF NOT EXISTS production_orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sales_order_id INTEGER REFERENCES sales_orders(id),
    product_id INTEGER REFERENCES products(id),
    quantity REAL NOT NULL,
    status TEXT DEFAULT 'Planned', -- Planned, Released, In Progress, Completed, Closed
    start_date DATE,
    end_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS work_orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    production_order_id INTEGER REFERENCES production_orders(id),
    wo_number TEXT NOT NULL UNIQUE,
    quantity REAL NOT NULL,
    status TEXT DEFAULT 'Pending',
    machine_id INTEGER,
    operator_id INTEGER,
    started_at DATETIME,
    completed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 5. Machines & Assets
CREATE TABLE IF NOT EXISTS machines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    plant_id INTEGER REFERENCES plants(id),
    name TEXT NOT NULL,
    code TEXT UNIQUE,
    status TEXT DEFAULT 'Idle', -- Running, Idle, Setup, Maintenance, Breakdown
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS machine_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    machine_id INTEGER REFERENCES machines(id),
    status TEXT NOT NULL,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS assets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    code TEXT UNIQUE,
    category TEXT,
    purchase_date DATE,
    cost REAL,
    status TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 6. Inventory & WMS
CREATE TABLE IF NOT EXISTS inventory_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    warehouse_id INTEGER REFERENCES warehouses(id),
    product_id INTEGER REFERENCES products(id),
    quantity REAL NOT NULL DEFAULT 0,
    min_quantity REAL NOT NULL DEFAULT 0,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inventory_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    inventory_item_id INTEGER REFERENCES inventory_items(id),
    type TEXT NOT NULL, -- Receipt, Issue, Transfer, Adjustment
    quantity REAL NOT NULL,
    reference_id TEXT, -- PO Number, WO Number, etc.
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 7. Procurement & Vendors
CREATE TABLE IF NOT EXISTS vendors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    contact_person TEXT,
    email TEXT,
    phone TEXT,
    rating REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS purchase_orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    po_number TEXT NOT NULL UNIQUE,
    vendor_id INTEGER REFERENCES vendors(id),
    status TEXT DEFAULT 'Draft', -- Draft, Sent, Received, Cancelled
    total_amount REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS purchase_order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    purchase_order_id INTEGER REFERENCES purchase_orders(id),
    product_id INTEGER REFERENCES products(id),
    quantity REAL NOT NULL,
    unit_price REAL NOT NULL
);

-- 8. Quality Management
CREATE TABLE IF NOT EXISTS quality_inspections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reference_type TEXT, -- Production, Receipt
    reference_id INTEGER,
    inspector_id INTEGER,
    status TEXT DEFAULT 'Pending', -- Pending, Passed, Failed
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ncr (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    inspection_id INTEGER REFERENCES quality_inspections(id),
    reason TEXT,
    action_taken TEXT,
    status TEXT DEFAULT 'Open',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 9. Maintenance Management
CREATE TABLE IF NOT EXISTS maintenance_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    machine_id INTEGER REFERENCES machines(id),
    requested_by INTEGER,
    description TEXT,
    priority TEXT,
    status TEXT DEFAULT 'Open',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS maintenance_work_orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    request_id INTEGER REFERENCES maintenance_requests(id),
    technician_id INTEGER,
    type TEXT, -- Preventive, Corrective, Emergency
    started_at DATETIME,
    completed_at DATETIME,
    status TEXT DEFAULT 'In Progress',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 10. Finance & Human Resources
CREATE TABLE IF NOT EXISTS invoices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sales_order_id INTEGER REFERENCES sales_orders(id),
    invoice_number TEXT NOT NULL UNIQUE,
    amount REAL NOT NULL,
    status TEXT DEFAULT 'Unpaid',
    due_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_id INTEGER REFERENCES invoices(id),
    amount REAL NOT NULL,
    payment_method TEXT,
    payment_date DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    department TEXT,
    join_date DATE,
    salary REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payroll (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER REFERENCES employees(id),
    month INTEGER,
    year INTEGER,
    basic_salary REAL,
    bonuses REAL DEFAULT 0,
    deductions REAL DEFAULT 0,
    net_salary REAL,
    status TEXT DEFAULT 'Processed',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 11. System
CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action TEXT NOT NULL,
    table_name TEXT,
    record_id INTEGER,
    details TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    title TEXT,
    message TEXT,
    is_read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
