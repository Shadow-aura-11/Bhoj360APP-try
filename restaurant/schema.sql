-- Restaurant Schema

CREATE TABLE IF NOT EXISTS tables (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  number TEXT NOT NULL UNIQUE,
  capacity INTEGER NOT NULL DEFAULT 4,
  section TEXT DEFAULT 'Main',
  status TEXT DEFAULT 'available',
  qr_token TEXT,
  qr_generated_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS menu_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  price REAL NOT NULL,
  available INTEGER DEFAULT 1,
  image_placeholder TEXT,
  image_url TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS menu_item_addons (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  menu_item_id INTEGER REFERENCES menu_items(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price REAL NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS coupons (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL, -- 'percentage' or 'flat'
  value REAL NOT NULL,
  min_order_amount REAL DEFAULT 0,
  active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  table_id INTEGER REFERENCES tables(id),
  table_number TEXT,
  type TEXT DEFAULT 'dine-in',
  status TEXT DEFAULT 'pending',
  notes TEXT,
  total REAL DEFAULT 0,
  customer_phone TEXT,
  customer_name TEXT,
  waiter_name TEXT,
  payment_method TEXT,
  payment_status TEXT DEFAULT 'unpaid',
  cash_amount REAL DEFAULT 0,
  online_amount REAL DEFAULT 0,
  discount_amount REAL DEFAULT 0,
  coupon_code TEXT,
  whatsapp_sent INTEGER DEFAULT 0,
  settled_by TEXT DEFAULT 'System',
  settled_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER REFERENCES orders(id),
  menu_item_id INTEGER REFERENCES menu_items(id),
  item_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  price REAL NOT NULL,
  notes TEXT,
  status TEXT DEFAULT 'pending',
  is_addon INTEGER DEFAULT 0,
  addons_json TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reservations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  table_id INTEGER REFERENCES tables(id),
  table_number TEXT,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  customer_email TEXT,
  party_size INTEGER NOT NULL,
  reservation_date DATE NOT NULL,
  reservation_time TIME NOT NULL,
  duration_minutes INTEGER DEFAULT 90,
  status TEXT DEFAULT 'confirmed',
  notes TEXT,
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

CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  role TEXT NOT NULL,
  started_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inventory (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  item_name TEXT NOT NULL UNIQUE,
  quantity REAL NOT NULL DEFAULT 0,
  unit TEXT NOT NULL,
  min_quantity REAL NOT NULL DEFAULT 0,
  supplier TEXT,
  cost_per_unit REAL DEFAULT 0,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inventory_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  inventory_id INTEGER REFERENCES inventory(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  change_amount REAL NOT NULL,
  type TEXT NOT NULL,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS outlets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT,
  delivery_radius REAL DEFAULT 5.0,
  delivery_charge REAL DEFAULT 0.0,
  delivery_enabled INTEGER DEFAULT 1,
  zomato_enabled INTEGER DEFAULT 1,
  swiggy_enabled INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS venue_bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_date TEXT NOT NULL,
  event_time TEXT NOT NULL,
  guest_count INTEGER NOT NULL,
  notes TEXT,
  status TEXT DEFAULT 'Pending',
  customer_father_name TEXT,
  customer_village TEXT,
  customer_aadhaar TEXT,
  venue_areas TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
