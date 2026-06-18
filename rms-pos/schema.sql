-- Enterprise Retail Management System (RMS/POS) Schema

-- Stores/Branches (Multi-Store Support)
CREATE TABLE IF NOT EXISTS stores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    location TEXT,
    address TEXT,
    contact_phone TEXT,
    is_main_store INTEGER DEFAULT 0, -- 1 for warehouse/main, 0 for branch
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Suppliers Management
CREATE TABLE IF NOT EXISTS suppliers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    contact_person TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    tax_id TEXT, -- GST/VAT number
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Product Catalog
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sku TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    brand TEXT,
    base_price REAL NOT NULL, -- Cost price
    sale_price REAL NOT NULL, -- Retail price
    tax_rate REAL DEFAULT 0,  -- Percentage
    barcode TEXT UNIQUE,      -- EAN/UPC or internal
    image_url TEXT,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Inventory Tracking (Per Store)
CREATE TABLE IF NOT EXISTS inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    store_id INTEGER REFERENCES stores(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 0,
    min_stock_level INTEGER DEFAULT 5, -- Reorder point
    last_restocked_at DATETIME,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, store_id)
);

-- Purchase Orders & Inventory Replenishment
CREATE TABLE IF NOT EXISTS purchases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    supplier_id INTEGER REFERENCES suppliers(id),
    store_id INTEGER REFERENCES stores(id),
    total_amount REAL NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending', 'received', 'cancelled'
    payment_status TEXT DEFAULT 'unpaid', -- 'unpaid', 'partial', 'paid'
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS purchase_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    purchase_id INTEGER REFERENCES purchases(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER NOT NULL,
    cost_price REAL NOT NULL
);

-- Customer CRM & Loyalty
CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT UNIQUE,
    address TEXT,
    loyalty_points INTEGER DEFAULT 0,
    segment TEXT, -- AI-driven segment: 'VIP', 'Regular', 'Churn-risk'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Promotions & Discount Engine
CREATE TABLE IF NOT EXISTS promotions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL, -- 'percentage', 'flat', 'bogo'
    value REAL NOT NULL,
    min_purchase_amount REAL DEFAULT 0,
    start_date DATETIME,
    end_date DATETIME,
    active INTEGER DEFAULT 1
);

-- Sales & POS Transactions
CREATE TABLE IF NOT EXISTS sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    store_id INTEGER REFERENCES stores(id),
    customer_id INTEGER REFERENCES customers(id),
    total_amount REAL NOT NULL,    -- Subtotal before discounts/tax
    discount_amount REAL DEFAULT 0,
    tax_amount REAL DEFAULT 0,
    final_amount REAL NOT NULL,    -- Grand total
    payment_method TEXT,           -- 'cash', 'card', 'upi', 'split'
    cash_received REAL DEFAULT 0,
    change_given REAL DEFAULT 0,
    status TEXT DEFAULT 'completed', -- 'completed', 'returned', 'void'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sale_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sale_id INTEGER REFERENCES sales(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER NOT NULL,
    unit_price REAL NOT NULL,      -- Price at time of sale
    discount_amount REAL DEFAULT 0,
    tax_amount REAL DEFAULT 0
);

-- Returns & Credit Notes
CREATE TABLE IF NOT EXISTS returns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sale_id INTEGER REFERENCES sales(id),
    reason TEXT,
    refund_amount REAL NOT NULL,
    refund_method TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Accounting & General Ledger
CREATE TABLE IF NOT EXISTS ledger (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,        -- 'income', 'expense'
    category TEXT,            -- 'sales', 'purchase', 'rent', 'utilities'
    amount REAL NOT NULL,
    reference_id TEXT,         -- sale_id or purchase_id
    notes TEXT,
    transaction_date DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- AI Insights & Forecasts
CREATE TABLE IF NOT EXISTS ai_insights (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,        -- 'demand_forecast', 'price_optimization', 'customer_segmentation'
    target_type TEXT NOT NULL, -- 'product', 'customer', 'category'
    target_id INTEGER,         -- Reference to products.id or customers.id
    insight_data TEXT,         -- JSON object containing predictions
    generated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
