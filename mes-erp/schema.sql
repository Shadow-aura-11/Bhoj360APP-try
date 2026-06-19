-- MES/ERP Schema

-- Items (Raw Materials, Components, Assemblies, Finished Goods)
CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sku TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL, -- 'Raw Material', 'Component', 'Assembly', 'Finished Good'
    unit TEXT NOT NULL, -- 'pcs', 'kg', 'm', etc.
    cost REAL DEFAULT 0,
    price REAL DEFAULT 0,
    min_stock_level REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Bill of Materials (BOM)
CREATE TABLE IF NOT EXISTS bom (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    parent_item_id INTEGER REFERENCES items(id) ON DELETE CASCADE,
    component_item_id INTEGER REFERENCES items(id) ON DELETE CASCADE,
    quantity REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(parent_item_id, component_item_id)
);

-- Inventory & Warehouse
CREATE TABLE IF NOT EXISTS inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id INTEGER REFERENCES items(id) ON DELETE CASCADE,
    warehouse_location TEXT DEFAULT 'Main Warehouse',
    quantity REAL NOT NULL DEFAULT 0,
    last_restocked_at DATETIME,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Sales Orders
CREATE TABLE IF NOT EXISTS sales_orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_number TEXT NOT NULL UNIQUE,
    customer_name TEXT NOT NULL,
    status TEXT DEFAULT 'Draft', -- 'Draft', 'Confirmed', 'In Production', 'Quality Check', 'Ready for Dispatch', 'Dispatched'
    total_amount REAL DEFAULT 0,
    order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    delivery_date DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sales_order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sales_order_id INTEGER REFERENCES sales_orders(id) ON DELETE CASCADE,
    item_id INTEGER REFERENCES items(id),
    quantity REAL NOT NULL,
    unit_price REAL NOT NULL,
    total_price REAL NOT NULL
);

-- Production Planning & MRP
CREATE TABLE IF NOT EXISTS production_plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    plan_name TEXT NOT NULL,
    start_date DATE,
    end_date DATE,
    status TEXT DEFAULT 'Draft', -- 'Draft', 'Active', 'Completed'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Work Orders
CREATE TABLE IF NOT EXISTS work_orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    wo_number TEXT NOT NULL UNIQUE,
    production_plan_id INTEGER REFERENCES production_plans(id),
    sales_order_id INTEGER REFERENCES sales_orders(id),
    item_id INTEGER REFERENCES items(id),
    quantity INTEGER NOT NULL,
    status TEXT DEFAULT 'Pending', -- 'Pending', 'In Progress', 'Quality Check', 'Completed', 'Cancelled'
    start_date DATETIME,
    end_date DATETIME,
    priority INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Machine Monitoring
CREATE TABLE IF NOT EXISTS machines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT,
    status TEXT DEFAULT 'Idle', -- 'Idle', 'Running', 'Maintenance', 'Down'
    last_maintenance DATE,
    next_maintenance DATE,
    oee REAL DEFAULT 0, -- Overall Equipment Effectiveness
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Quality Control
CREATE TABLE IF NOT EXISTS quality_checks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    work_order_id INTEGER REFERENCES work_orders(id),
    inspector_name TEXT,
    check_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'Pending', -- 'Pending', 'Passed', 'Failed'
    defects_found TEXT,
    notes TEXT
);

-- Maintenance Logs
CREATE TABLE IF NOT EXISTS maintenance_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    machine_id INTEGER REFERENCES machines(id),
    maintenance_type TEXT, -- 'Routine', 'Repair', 'Predictive'
    description TEXT,
    cost REAL DEFAULT 0,
    performed_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- HR & Payroll
CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    department TEXT NOT NULL,
    salary REAL DEFAULT 0,
    joined_at DATE,
    status TEXT DEFAULT 'Active'
);

CREATE TABLE IF NOT EXISTS payroll_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER REFERENCES employees(id),
    amount REAL NOT NULL,
    payment_date DATE,
    status TEXT DEFAULT 'Paid'
);

-- Finance
CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL, -- 'Income', 'Expense'
    category TEXT,
    amount REAL NOT NULL,
    reference_id TEXT, -- e.g., Sales Order ID or Purchase Order ID
    transaction_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    description TEXT
);
