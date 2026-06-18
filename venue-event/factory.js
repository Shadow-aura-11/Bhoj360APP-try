/**
 * EMS Factory — Creates new Venue & Event Management microservices.
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const Database = require('better-sqlite3');

const REGISTRY_PATH = path.join(__dirname, 'registry.json');
const TENANTS_DIR = path.join(__dirname, 'tenants');
const TEMPLATE_PATH = path.join(__dirname, 'service-template.js');
const BASE_PORT = 4100; // EMS starts from 4100

if (!fs.existsSync(TENANTS_DIR)) {
  fs.mkdirSync(TENANTS_DIR, { recursive: true });
}

function readRegistry() {
  try {
    return JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
  } catch {
    return { tenants: [] };
  }
}

function writeRegistry(data) {
  fs.writeFileSync(REGISTRY_PATH, JSON.stringify(data, null, 2), 'utf8');
}

function generateId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = '';
  for (let i = 0; i < 6; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return `EMS-${id}`;
}

async function createTenant(options = {}) {
  const registry = readRegistry();

  let id;
  const existingIds = new Set(registry.tenants.map((r) => r.id));
  do {
    id = generateId();
  } while (existingIds.has(id));

  let port = BASE_PORT;
  if (registry.tenants.length > 0) {
    const maxPort = Math.max(...registry.tenants.map((r) => r.port));
    port = maxPort + 1;
  }

  const tenantDir = path.join(TENANTS_DIR, id);
  fs.mkdirSync(tenantDir, { recursive: true });

  const name = options.name || 'Unnamed Venue';
  const config = {
    id,
    name,
    port,
    type: 'EMS',
    createdAt: new Date().toISOString(),
    active: true,
    pins: {
      admin: options.pins?.admin || 'admin123'
    },
  };

  fs.writeFileSync(
    path.join(tenantDir, 'config.json'),
    JSON.stringify(config, null, 2),
    'utf8'
  );

  const dbPath = path.join(tenantDir, 'db.sqlite');
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');

  // Schema creation is handled by the service-template on startup,
  // but we can pre-seed sample data here if needed.
  // For now, we'll let the service-template initialize the tables.

  db.close();

  let template = fs.readFileSync(TEMPLATE_PATH, 'utf8');
  const injection = `const TENANT_ID = '${id}';\nconst PORT = ${port};\n`;
  template = injection + template;

  const servicePath = path.join(tenantDir, 'service.js');
  fs.writeFileSync(servicePath, template, 'utf8');

  registry.tenants.push({
    id,
    name,
    port,
    active: true,
    createdAt: config.createdAt
  });
  writeRegistry(registry);

  try {
    const child = spawn('node', [servicePath], {
      detached: true,
      stdio: 'ignore',
      env: { ...process.env, NODE_PATH: path.join(__dirname, '..', 'node_modules') },
    });
    child.unref();
    console.log(`  [EMS Factory] ✓ Tenant ${id} (${name}) created and running on port ${port}`);
  } catch (err) {
    console.error(`  [EMS Factory] ✗ Created ${id} but failed to start: ${err.message}`);
  }

  return config;
}

module.exports = { createTenant };
