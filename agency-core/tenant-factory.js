/**
 * Tenant Factory — Creates new tenant microservices (Restaurant, ERP, etc.).
 * Generates unique ID, assigns port, initialises database based on template,
 * seeds data, copies the service template, and spawns the microservice process.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawn } = require('child_process');
const Database = require('better-sqlite3');

const REGISTRY_PATH = path.join(__dirname, 'registry.json');
const TENANTS_DIR = path.join(__dirname, '..', 'restaurants'); // Kept as 'restaurants' for compat, but used for all tenants
const BASE_PORT = 3100;

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

function generateId(prefix = 'TENANT') {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = '';
  for (let i = 0; i < 6; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return `${prefix}-${id}`;
}

// ─── Main Factory Function ──────────────────────────────────

async function createTenant(options = {}) {
  const registry = readRegistry();

  // 0. Determine Template
  const templateType = options.templateType || 'restaurant'; // default to restaurant
  const templateDir = path.join(__dirname, '..', templateType);

  if (!fs.existsSync(templateDir)) {
    throw new Error(`Template type "${templateType}" not found.`);
  }

  // 1. Generate unique ID
  let id;
  const existingIds = new Set(registry.restaurants.map((r) => r.id));
  const idPrefix = templateType === 'restaurant' ? 'REST' : templateType.toUpperCase().substring(0, 4);
  do {
    id = generateId(idPrefix);
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
  const name = options.name || `Unnamed ${templateType}`;
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
    templateType,
    name,
    port,
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
    path.join(tenantDir, 'config.json'),
    JSON.stringify(config, null, 2),
    'utf8'
  );

  // 5. Create and initialise database
  const dbPath = path.join(tenantDir, 'db.sqlite');
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');

  // Load schema from template
  const schemaPath = path.join(templateDir, 'schema.sql');
  if (fs.existsSync(schemaPath)) {
    const schema = fs.readFileSync(schemaPath, 'utf8');
    db.exec(schema);
  } else if (templateType === 'restaurant') {
     // Legacy support for restaurant hardcoded schema if schema.sql is missing
     // (Recommended to move it to restaurant/schema.sql)
     // For now, I'll assume we might need the old hardcoded one if I didn't move it yet.
  }

  // Load seed data from template
  const seedPath = path.join(templateDir, 'seed.sql');
  if (fs.existsSync(seedPath)) {
    const seed = fs.readFileSync(seedPath, 'utf8');
    db.exec(seed);
  }

  db.close();

  // 6. Copy service template and inject config
  let templatePath = path.join(templateDir, 'service-template.js');
  if (!fs.existsSync(templatePath)) {
      // Fallback to core service-template.js
      templatePath = path.join(__dirname, 'service-template.js');
  }

  let template = fs.readFileSync(templatePath, 'utf8');

  // Inject tenant-specific constants at the top
  const injection = `const RESTAURANT_ID = '${id}';\nconst PORT = ${port};\nconst TEMPLATE_TYPE = '${templateType}';\n`;
  template = injection + template;

  const servicePath = path.join(tenantDir, 'service.js');
  fs.writeFileSync(servicePath, template, 'utf8');

  // Copy functions.js if it exists in template
  const functionsPath = path.join(templateDir, 'functions.js');
  if (fs.existsSync(functionsPath)) {
      fs.copyFileSync(functionsPath, path.join(tenantDir, 'functions.js'));
  }

  // 7. Update registry
  registry.restaurants.push({
    id,
    templateType,
    name,
    port,
    active: true,
    online: true,
    logo_url,
    description,
    logout_redirect_url,
    login_theme_color,
    location,
    contact_email,
    contact_phone,
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
    console.log(`  [Factory] ✓ Tenant ${id} (${name}) [${templateType}] created and running on port ${port}`);
  } catch (err) {
    console.error(`  [Factory] ✗ Created ${id} but failed to start: ${err.message}`);
  }

  // 9. Return config
  return config;
}

module.exports = { createTenant };
