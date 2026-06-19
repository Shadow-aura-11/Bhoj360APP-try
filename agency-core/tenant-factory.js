/**
 * Tenant Factory — Creates new multi-vertical microservices.
 * Generates unique ID, assigns port, initialises database, seeds data,
 * copies the service template, and spawns the microservice process.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawn } = require('child_process');
const Database = require('better-sqlite3');

const REGISTRY_PATH = path.join(__dirname, 'registry.json');
const TENANTS_DIR = path.join(__dirname, '..', 'restaurants'); // Reusing 'restaurants' dir as 'tenants'
const DEFAULT_TEMPLATE_PATH = path.join(__dirname, 'service-template.js');
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

function generateId(vertical = 'restaurant') {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = '';
  for (let i = 0; i < 6; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }

  const prefixes = {
    restaurant: 'REST',
    retail: 'RMS',
    pms: 'PMS',
    tms: 'TMS',
    spa: 'SPA',
    gym: 'GYM',
    mes: 'MES',
    wms: 'WMS',
    hms: 'HMS'
  };

  const prefix = prefixes[vertical.toLowerCase()] || 'OS';
  return `${prefix}-${id}`;
}

function generateQrToken(tenantId, tableNumber) {
  return crypto
    .createHash('sha256')
    .update(tenantId + tableNumber + QR_SECRET_SALT)
    .digest('hex');
}

// ─── Main Factory Function ──────────────────────────────────

async function createTenant(options = {}) {
  const registry = readRegistry();
  const vertical = (options.vertical || options.type || 'restaurant').toLowerCase();

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
  const tenantDir = path.join(TENANTS_DIR, id);
  fs.mkdirSync(tenantDir, { recursive: true });

  // 4. Create config.json
  const config = {
    id,
    name: options.name || `Unnamed ${vertical.toUpperCase()}`,
    vertical,
    port,
    createdAt: new Date().toISOString(),
    active: true,
    online: true,
    logo_url: options.logo_url || '',
    description: options.description || '',
    location: options.location || '',
    contact_email: options.contact_email || '',
    contact_phone: options.contact_phone || '',
    subscription: {
      planName: 'Bronze Plan',
      price: 999,
      billingCycle: 'Monthly',
      status: 'Trial',
      startDate: new Date().toISOString().split('T')[0],
      nextBillingDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    },
    paymentHistory: [],
    blockedFeatures: options.blockedFeatures || [],
    pins: {
      admin: options.pins?.admin || 'admin123',
      staff: options.pins?.staff || '2222',
    },
  };

  fs.writeFileSync(
    path.join(tenantDir, 'config.json'),
    JSON.stringify(config, null, 2),
    'utf8'
  );

  // 5. Create and initialise database
  const dbPath = path.join(tenantDir, 'db.sqlite');
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');

  // Load vertical-specific schema
  const verticalDirs = {
    retail: 'rms-pos',
    pms: 'pms',
    tms: 'tms',
    spa: 'spa-wellness',
    mes: 'mes-erp',
    wms: 'wms'
  };

  const schemaFolder = verticalDirs[vertical];
  if (schemaFolder) {
    const schemaPath = path.join(__dirname, '..', schemaFolder, 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, 'utf8');
      db.exec(schema);
    }
  }

  // Handle specialized seeding
  if (vertical === 'restaurant') {
    // Create restaurant tables if not exists (Legacy fallback or default)
    db.exec(`
      CREATE TABLE IF NOT EXISTS tables (id INTEGER PRIMARY KEY AUTOINCREMENT, number TEXT NOT NULL UNIQUE, capacity INTEGER NOT NULL DEFAULT 4, section TEXT DEFAULT 'Main', status TEXT DEFAULT 'available', qr_token TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);
      CREATE TABLE IF NOT EXISTS menu_items (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, description TEXT, category TEXT NOT NULL, price REAL NOT NULL, available INTEGER DEFAULT 1, image_url TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);
    `);

    // Seed some tables
    const tableInsert = db.prepare('INSERT INTO tables (number, capacity, qr_token) VALUES (?, ?, ?)');
    for (let i = 1; i <= 5; i++) {
        const num = `T${i}`;
        tableInsert.run(num, 4, generateQrToken(id, num));
    }
  }

  db.close();

  // 6. Copy service template and business logic
  const templatePath = (vertical === 'gym')
    ? path.join(__dirname, 'gms-service-template.js')
    : DEFAULT_TEMPLATE_PATH;

  let template = fs.readFileSync(templatePath, 'utf8');

  // Inject constants
  const idConst = (vertical === 'gym') ? 'GYM_ID' : 'RESTAURANT_ID';
  const injection = `const ${idConst} = '${id}';\nconst PORT = ${port};\nconst VERTICAL = '${vertical}';\n`;
  template = injection + template;

  // Sync functions.js if available
  const functionsDir = verticalDirs[vertical] || vertical;
  const functionsSrc = path.join(__dirname, '..', functionsDir, 'functions.js');
  const functionsDest = path.join(tenantDir, 'functions.js');

  if (fs.existsSync(functionsSrc)) {
    fs.copyFileSync(functionsSrc, functionsDest);
  } else {
    fs.writeFileSync(functionsDest, 'module.exports = {};', 'utf8');
  }

  const servicePath = path.join(tenantDir, 'service.js');
  fs.writeFileSync(servicePath, template, 'utf8');

  // 7. Update registry
  registry.restaurants.push(config);
  writeRegistry(registry);

  // 8. Spawn the microservice
  try {
    const child = spawn('node', [servicePath], {
      detached: true,
      stdio: 'ignore',
      env: {
        ...process.env,
        NODE_PATH: [
            path.join(__dirname, 'node_modules'),
            path.join(__dirname, '..', 'node_modules')
          ].join(path.delimiter)
      },
    });
    child.unref();
    console.log(`  [Factory] ✓ ${vertical.toUpperCase()} ${id} (${config.name}) created and running on port ${port}`);
  } catch (err) {
    console.error(`  [Factory] ✗ Created ${id} but failed to start: ${err.message}`);
  }

  return config;
}

module.exports = { createTenant };
