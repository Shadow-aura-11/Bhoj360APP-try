/**
 * Restaurant Factory — Creates new restaurant microservices.
 * Generates unique ID, assigns port, initialises database, seeds data,
 * copies the service template, and spawns the microservice process.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawn } = require('child_process');
const Database = require('better-sqlite3');

const REGISTRY_PATH = path.join(__dirname, 'registry.json');
const RESTAURANTS_DIR = path.join(__dirname, '..', 'restaurants');
const RESTAURANT_TEMPLATE_PATH = path.join(__dirname, 'service-template.js');
const PMS_TEMPLATE_PATH = path.join(__dirname, 'pms-service-template.js');
const PMS_SCHEMA_PATH = path.join(__dirname, 'pms-schema.sql');
const BASE_PORT = 3100;
const QR_SECRET_SALT = process.env.QR_SECRET_SALT || 'change-this-in-production';

// ─── Helpers ────────────────────────────────────────────────

function readRegistry() {
  try {
    return JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
  } catch {
    return { restaurants: [] };
  }
}

function writeRegistry(data) {
  fs.writeFileSync(REGISTRY_PATH, JSON.stringify(data, null, 2), 'utf8');
}

function generateId(type = 'restaurant') {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = '';
  for (let i = 0; i < 6; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  const prefix = type === 'pms' ? 'PMS' : 'REST';
  return `${prefix}-${id}`;
}

function generateQrToken(restaurantId, tableNumber) {
  return crypto
    .createHash('sha256')
    .update(restaurantId + tableNumber + QR_SECRET_SALT)
    .digest('hex');
}

// ─── Main Factory Function ──────────────────────────────────

async function createRestaurant(options = {}) {
  const registry = readRegistry();
  const tenantType = options.tenantType || 'restaurant';
  const vertical = options.vertical || 'restaurant';

  // 1. Generate unique ID
  let id;
  const existingIds = new Set(registry.restaurants.map((r) => r.id));
  do {
    id = generateId(vertical);
  } while (existingIds.has(id));

  // 2. Auto-assign port
  let port = BASE_PORT;
  if (registry.restaurants.length > 0) {
    const maxPort = Math.max(...registry.restaurants.map((r) => r.port));
    port = maxPort + 1;
  }

  // 3. Create directory
  const restaurantDir = path.join(RESTAURANTS_DIR, id);
  fs.mkdirSync(restaurantDir, { recursive: true });

  // 4. Create config.json
  const name = options.name || (tenantType === 'tms' ? 'Unnamed TMS' : 'Unnamed Restaurant');
  const tableCount = options.tableCount || 8;
  const logo_url = options.logo_url || '';
  const description = options.description || '';
  const logout_redirect_url = options.logout_redirect_url || '';
  const login_theme_color = options.login_theme_color || '#fafaf9';
  const location = options.location || '';
  const contact_email = options.contact_email || '';
  const contact_phone = options.contact_phone || '';

  const subscription = {
    planName: 'Bronze Plan',
    price: 999,
    billingCycle: 'Monthly',
    status: 'Trial',
    startDate: new Date().toISOString().split('T')[0],
    nextBillingDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  };
  const paymentHistory = [];

  const config = {
    id,
    name,
    vertical,
    port,
    vertical,
    createdAt: new Date().toISOString(),
    active: true,
    online: true,
    logo_url,
    description,
    logout_redirect_url,
    login_theme_color,
    location,
    contact_email,
    contact_phone,
    tenantType,
    subscription,
    paymentHistory,
    blockedFeatures: options.blockedFeatures || [],
    pins: {
      admin: options.pins?.admin || 'admin123',
      waiter: options.pins?.waiter || '2222',
      counter: options.pins?.counter || '3333',
      cashier: options.pins?.cashier || '4444',
      customer: options.pins?.customer || '0000',
    },
  };

  fs.writeFileSync(
    path.join(restaurantDir, 'config.json'),
    JSON.stringify(config, null, 2),
    'utf8'
  );

  // 5. Create and initialise database
  const dbPath = path.join(restaurantDir, 'db.sqlite');
  const db = new Database(dbPath);

  // Enable WAL for better concurrency
  db.pragma('journal_mode = WAL');

  if (vertical === 'pms') {
    const schema = fs.readFileSync(PMS_SCHEMA_PATH, 'utf8');
    db.exec(schema);

    // PMS Seeding
    const propertyInsert = db.prepare('INSERT INTO properties (name, type, address, city, country) VALUES (?, ?, ?, ?, ?)');
    const buildingInsert = db.prepare('INSERT INTO buildings (property_id, name) VALUES (?, ?)');
    const floorInsert = db.prepare('INSERT INTO floors (building_id, floor_number) VALUES (?, ?)');
    const unitInsert = db.prepare('INSERT INTO units (floor_id, unit_number, type, rent, status) VALUES (?, ?, ?, ?, ?)');

    const seedPMS = db.transaction(() => {
        const prop1 = propertyInsert.run('Skyline Apartments', 'Residential', '123 Tech Park', 'San Francisco', 'USA').lastInsertRowid;
        const bld1 = buildingInsert.run(prop1, 'Tower A').lastInsertRowid;
        const flr1 = floorInsert.run(bld1, '1').lastInsertRowid;
        unitInsert.run(flr1, '101', '2BR', 2500, 'Vacant');
        unitInsert.run(flr1, '102', 'Studio', 1500, 'Vacant');

        const prop2 = propertyInsert.run('Innovation Hub', 'Commercial', '456 Innovation Way', 'Palo Alto', 'USA').lastInsertRowid;
        const bld2 = buildingInsert.run(prop2, 'Main Block').lastInsertRowid;
        const flr2 = floorInsert.run(bld2, 'G').lastInsertRowid;
        unitInsert.run(flr2, 'S-1', 'Shop', 5000, 'Vacant');
    });
    seedPMS();

  } else {
    // Create restaurant tables
    db.exec(`
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
  if (tenantType === 'tms') {
    const schemaPath = path.join(__dirname, '..', 'tms', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    db.exec(schema);

    // Seed TMS initial data
    const policyInsert = db.prepare('INSERT INTO policies (name, description, max_flight_class, max_hotel_stars, daily_allowance) VALUES (?, ?, ?, ?, ?)');
    policyInsert.run('Standard', 'Default corporate travel policy', 'economy', 3, 50);
    policyInsert.run('Executive', 'Executive corporate travel policy', 'business', 5, 150);

    const employeeInsert = db.prepare('INSERT INTO employees (employee_id, name, email, department, role, policy_id) VALUES (?, ?, ?, ?, ?, ?)');
    employeeInsert.run('EMP001', 'Admin User', 'admin@tms.com', 'IT', 'admin', 2);
    employeeInsert.run('EMP002', 'Manager User', 'manager@tms.com', 'Sales', 'manager', 2);
    employeeInsert.run('EMP003', 'Employee User', 'employee@tms.com', 'Marketing', 'employee', 1);

    const vendorInsert = db.prepare('INSERT INTO vendors (name, type, rating) VALUES (?, ?, ?)');
    vendorInsert.run('Global Airlines', 'airline', 4.5);
    vendorInsert.run('Luxury Hotels', 'hotel_chain', 4.8);
  } else {
    // Create Restaurant tables
    db.exec(`
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
    `);

    // Seed menu items (16 items across 4 categories)
    const menuInsert = db.prepare(
      'INSERT INTO menu_items (name, description, category, price, image_placeholder, image_url) VALUES (?, ?, ?, ?, ?, ?)'
    );

  if (vertical === 'spa') {
    const spaSchemaPath = path.join(__dirname, '..', 'spa-wellness', 'schema.sql');
    const spaSchema = fs.readFileSync(spaSchemaPath, 'utf8');
    db.exec(spaSchema);

    // Seed Spa Data
    const serviceInsert = db.prepare(
      'INSERT INTO services (name, description, category, duration_minutes, price, image_url) VALUES (?, ?, ?, ?, ?, ?)'
    );

    const spaServices = [
      ['Swedish Massage', 'Classic full body massage for relaxation', 'Massage', 60, 1500, 'https://images.unsplash.com/photo-1544161515-4ae6b91829d2?w=400'],
      ['Deep Tissue Massage', 'Focuses on realigning deeper layers of muscles', 'Massage', 90, 2200, 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=400'],
      ['Aromatherapy Facial', 'Rejuvenating facial with essential oils', 'Facial', 45, 1800, 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400'],
      ['Hot Stone Therapy', 'Warm stones placed on key points of the body', 'Body Treatment', 75, 2500, 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=400'],
      ['Reflexology', 'Pressure applied to specific points on feet', 'Massage', 30, 1000, 'https://images.unsplash.com/photo-1519824141121-997454a93f78?w=400'],
    ];

    const seedSpaServices = db.transaction(() => {
      for (const service of spaServices) {
        serviceInsert.run(...service);
      }
    });
    seedSpaServices();

    const therapistInsert = db.prepare(
      'INSERT INTO therapists (name, specialization, phone, status) VALUES (?, ?, ?, ?)'
    );
    const seedTherapists = db.transaction(() => {
      therapistInsert.run('Sarah Johnson', 'Massage Specialist', '+91-9876543230', 'active');
      therapistInsert.run('Michael Chen', 'Skin Care Expert', '+91-9876543231', 'active');
      therapistInsert.run('Emma Davis', 'Holistic Therapist', '+91-9876543232', 'active');
    });
    seedTherapists();

    const membershipInsert = db.prepare(
      'INSERT INTO memberships (name, description, price, duration_months, benefits_json) VALUES (?, ?, ?, ?, ?)'
    );
    const seedMemberships = db.transaction(() => {
      membershipInsert.run('Wellness Silver', '1 Treatment per month', 1200, 12, JSON.stringify(['1x 60min Swedish Massage', '10% off retail']));
      membershipInsert.run('Wellness Gold', '2 Treatments per month', 2000, 12, JSON.stringify(['2x 60min Treatments', '15% off retail', 'Free Sauna access']));
    });
    seedMemberships();

    // Enterprise Seeding
    const orgInsert = db.prepare('INSERT INTO organizations (name, country, currency) VALUES (?, ?, ?)');
    const orgResult = orgInsert.run(name, 'India', 'INR');
    const orgId = orgResult.lastInsertRowid;

    const branchInsert = db.prepare('INSERT INTO branches (organization_id, name, address) VALUES (?, ?, ?)');
    const branchResult = branchInsert.run(orgId, 'Main Branch', 'City Center');
    const branchId = branchResult.lastInsertRowid;

    const roomInsert = db.prepare('INSERT INTO rooms (branch_id, name, type) VALUES (?, ?, ?)');
    const seedRooms = db.transaction(() => {
      roomInsert.run(branchId, 'Massage Suite 1', 'Massage');
      roomInsert.run(branchId, 'Facial Room A', 'Facial');
      roomInsert.run(branchId, 'Medical Consultation', 'Consultation');
    });
    seedRooms();

    const campaignInsert = db.prepare('INSERT INTO campaigns (name, type, status) VALUES (?, ?, ?)');
    const seedCampaigns = db.transaction(() => {
      campaignInsert.run('Summer Glow Promo', 'Email', 'sent');
      campaignInsert.run('Membership Renewal Reminder', 'WhatsApp', 'draft');
    });
    seedCampaigns();

  } else {
    // Default: Restaurant / POS vertical
    // Create tables
    db.exec(`
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
    `);

    // Seed menu items (16 items across 4 categories)
    const menuInsert = db.prepare(
      'INSERT INTO menu_items (name, description, category, price, image_placeholder, image_url) VALUES (?, ?, ?, ?, ?, ?)'
    );

    const menuItems = [
      // Starters
      ['Garlic Bread', 'Crispy bread with garlic butter and herbs', 'Starters', 120, '🧄🍞', 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=400'],
      ['Soup of the Day', 'Chef\'s special soup served with croutons', 'Starters', 150, '🍲', 'https://images.unsplash.com/photo-1547592165-e1d17fed6005?w=400'],
      ['Spring Rolls', 'Crispy vegetable spring rolls with sweet chili sauce', 'Starters', 160, '🥟', 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400'],
      ['Bruschetta', 'Toasted bread topped with tomatoes, basil, and olive oil', 'Starters', 140, '🍅', 'https://images.unsplash.com/photo-1572448868306-1810ea24c46f?w=400'],
      // Mains
      ['Grilled Chicken', 'Herb-marinated chicken breast with seasonal vegetables', 'Mains', 380, '🍗', 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=400'],
      ['Pasta Arrabiata', 'Penne in spicy tomato sauce with fresh basil', 'Mains', 290, '🍝', 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400'],
      ['Paneer Tikka', 'Tandoor-grilled cottage cheese with mint chutney', 'Mains', 320, '🧀', 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400'],
      ['Fish & Chips', 'Beer-battered fish with crispy fries and tartar sauce', 'Mains', 420, '🐟', 'https://images.unsplash.com/photo-1582236968798-e7e0e7a17726?w=400'],
      ['Veg Biryani', 'Fragrant basmati rice with mixed vegetables and raita', 'Mains', 280, '🍚', 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=400'],
      // Drinks
      ['Fresh Lime Soda', 'Freshly squeezed lime with soda water', 'Drinks', 80, '🍋', 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400'],
      ['Mango Lassi', 'Creamy yogurt smoothie with fresh mango pulp', 'Drinks', 110, '🥭', 'https://images.unsplash.com/photo-1571006682862-3936b2884a57?w=400'],
      ['Cold Coffee', 'Chilled coffee blended with ice cream', 'Drinks', 130, '☕', 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400'],
      ['Mineral Water', 'Premium bottled mineral water', 'Drinks', 40, '💧', 'https://images.unsplash.com/photo-1608885898957-a599fb18de37?w=400'],
      // Desserts
      ['Chocolate Lava Cake', 'Warm chocolate cake with molten center and vanilla ice cream', 'Desserts', 220, '🍫', 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400'],
      ['Gulab Jamun', 'Soft milk dumplings in warm rose-scented syrup', 'Desserts', 120, '🍯', 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400'],
      ['Ice Cream (2 scoops)', 'Choice of vanilla, chocolate, or strawberry', 'Desserts', 160, '🍨', 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400'],
    ];

    const seedMenu = db.transaction(() => {
      for (const item of menuItems) {
        menuInsert.run(...item);
      }
    });
    seedMenu();

    // Seed tables based on tableCount
    const tableInsert = db.prepare(
      'INSERT INTO tables (number, capacity, section, qr_token, qr_generated_at) VALUES (?, ?, ?, ?, ?)'
    );

    const indoorCount = Math.ceil(tableCount / 3);
    const outdoorCount = Math.ceil(tableCount / 3);
    const vipCount = tableCount - indoorCount - outdoorCount;

    const seedTables = db.transaction(() => {
      // Indoor tables
      for (let i = 1; i <= indoorCount; i++) {
        const number = `T${i}`;
        const token = generateQrToken(id, number);
        tableInsert.run(number, 4, 'Indoor', token, new Date().toISOString());
      }
      // Outdoor tables
      for (let i = 1; i <= outdoorCount; i++) {
        const number = `O${i}`;
        const token = generateQrToken(id, number);
        tableInsert.run(number, 4, 'Outdoor', token, new Date().toISOString());
      }
      // VIP tables
      for (let i = 1; i <= vipCount; i++) {
        const number = `VIP-${i}`;
        const token = generateQrToken(id, number);
        tableInsert.run(number, 6, 'VIP', token, new Date().toISOString());
      }
    });
    seedTables();

    // Seed 3 sample reservations for today
    const today = new Date().toISOString().split('T')[0];
    const reservationInsert = db.prepare(
      'INSERT INTO reservations (table_id, table_number, customer_name, customer_phone, party_size, reservation_date, reservation_time, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );

    const seedReservations = db.transaction(() => {
      reservationInsert.run(1, 'T1', 'Rahul Sharma', '+91-9876543210', 2, today, '13:00', 'confirmed', 'Window seat preferred');
      reservationInsert.run(2, 'T2', 'Priya Patel', '+91-9876543211', 4, today, '19:00', 'confirmed', 'Birthday celebration');
      reservationInsert.run(3, 'T3', 'Amit Kumar', '+91-9876543212', 6, today, '20:30', 'confirmed', 'Business dinner');
    });
    seedReservations();

    // Seed default outlets
    const outletInsert = db.prepare(
      'INSERT INTO outlets (name, address, phone, delivery_radius, delivery_charge, delivery_enabled, zomato_enabled, swiggy_enabled) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    );
    const seedOutlets = db.transaction(() => {
      outletInsert.run('Main Outlet', config.restaurant?.address || '123 Main Street', config.restaurant?.phone || '+91-9876543210', 5.0, 40.0, 1, 1, 1);
      outletInsert.run('Downtown Hub', '456 Business District', '+91-9876543215', 7.5, 60.0, 1, 0, 1);
    });
    seedOutlets();

  // Seed sample venue bookings
  const venueInsert = db.prepare(
    'INSERT INTO venue_bookings (customer_name, customer_phone, event_type, event_date, event_time, guest_count, notes, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  );
  const seedVenues = db.transaction(() => {
    venueInsert.run('Rajesh Gupta', '+91-9876543220', 'Marriage', today, 'Full Day', 250, 'Grand Hall, standard decor needed', 'Confirmed');
    venueInsert.run('Sneha Reddy', '+91-9876543221', 'Party', today, 'Dinner', 50, 'Birthday Party with cake cutting setup', 'Discussion');
  });
  seedVenues();
    // Seed sample venue bookings
    const venueInsert = db.prepare(
      'INSERT INTO venue_bookings (customer_name, customer_phone, event_type, event_date, event_time, guest_count, notes, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    );
    const seedVenues = db.transaction(() => {
      venueInsert.run('Rajesh Gupta', '+91-9876543220', 'Marriage', today, 'Full Day', 250, 'Grand Hall, standard decor needed', 'Confirmed');
      venueInsert.run('Sneha Reddy', '+91-9876543221', 'Party', today, 'Dinner', 50, 'Birthday Party with cake cutting setup', 'Discussion');
    });
    seedVenues();
  }

  db.close();

  // 6. Copy service template and inject config
  const templatePath = vertical === 'pms' ? PMS_TEMPLATE_PATH : RESTAURANT_TEMPLATE_PATH;
  let template = fs.readFileSync(templatePath, 'utf8');
  const templateToUse = tenantType === 'tms'
    ? path.join(__dirname, 'tms-service-template.js')
    : TEMPLATE_PATH;
  let template = fs.readFileSync(templateToUse, 'utf8');

  // Inject restaurant-specific constants at the top
  const injection = `const RESTAURANT_ID = '${id}';\nconst PORT = ${port};\n`;
  template = injection + template;

  const servicePath = path.join(restaurantDir, 'service.js');
  fs.writeFileSync(servicePath, template, 'utf8');

  // 7. Update registry
  registry.restaurants.push({
    id,
    name,
    vertical,
    port,
    vertical,
    active: true,
    online: true,
    logo_url,
    description,
    logout_redirect_url,
    login_theme_color,
    location,
    contact_email,
    contact_phone,
    tenantType,
    subscription,
    paymentHistory,
    blockedFeatures: options.blockedFeatures || []
  });
  writeRegistry(registry);

  // 8. Spawn the microservice
  try {
    const child = spawn('node', [servicePath], {
      detached: true,
      stdio: 'ignore',
      env: { ...process.env, NODE_PATH: path.join(__dirname, 'node_modules') },
    });
    child.unref();
    console.log(`  [Factory] ✓ Restaurant ${id} (${name}) created and running on port ${port}`);
  } catch (err) {
    console.error(`  [Factory] ✗ Created ${id} but failed to start: ${err.message}`);
  }

  // 9. Return config
  return config;
}

module.exports = { createRestaurant };
