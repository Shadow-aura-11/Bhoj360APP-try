/**
 * GMS Factory — Creates new gym microservices.
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const Database = require('better-sqlite3');

const REGISTRY_PATH = path.join(__dirname, 'registry.json');
const RESTAURANTS_DIR = path.join(__dirname, '..', 'restaurants');
const TEMPLATE_PATH = path.join(__dirname, 'gms-service-template.js');
const BASE_PORT = 3500;

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

function generateId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = '';
  for (let i = 0; i < 6; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return `GYM-${id}`;
}

async function createGym(options = {}) {
  const registry = readRegistry();
  let id = generateId();
  let port = BASE_PORT;
  if (registry.restaurants.length > 0) {
    port = Math.max(...registry.restaurants.map(r => r.port)) + 1;
  }

  const gymDir = path.join(RESTAURANTS_DIR, id);
  fs.mkdirSync(gymDir, { recursive: true });

  const config = {
    id, name: options.name || 'Alpha Gym', type: 'gym', port,
    createdAt: new Date().toISOString(), active: true, online: true,
    pins: { admin: options.pins?.admin || 'admin123', staff: options.pins?.staff || '2222' }
  };
  fs.writeFileSync(path.join(gymDir, 'config.json'), JSON.stringify(config, null, 2));

  const db = new Database(path.join(gymDir, 'db.sqlite'));
  // Schema creation is handled by service-template on boot, but we can seed initial data here if needed.
  // Note: We use the same schema definitions as in gms-service-template.js
  db.exec(`
    CREATE TABLE IF NOT EXISTS membership_plans (id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT, duration_months INTEGER NOT NULL, price REAL NOT NULL, features_json TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE IF NOT EXISTS equipment (id TEXT PRIMARY KEY, name TEXT NOT NULL, serial_number TEXT, purchase_date DATE, last_maintenance DATE, next_maintenance DATE, status TEXT DEFAULT 'operational');
  `);

  db.prepare("INSERT OR IGNORE INTO membership_plans (id, name, duration_months, price) VALUES (?, ?, ?, ?)").run('PLAN-GOLD', 'Gold Annual Pro', 12, 10000);
  db.prepare("INSERT OR IGNORE INTO equipment (id, name, status) VALUES (?, ?, ?)").run('EQP-001', 'Treadmill Matrix T5', 'operational');
  db.close();

  let template = fs.readFileSync(TEMPLATE_PATH, 'utf8');
  template = `const GYM_ID = '${id}';\nconst PORT = ${port};\n` + template;
  fs.writeFileSync(path.join(gymDir, 'service.js'), template);

  registry.restaurants.push({ id, name: config.name, type: 'gym', port, active: true, online: true });
  writeRegistry(registry);

  const child = spawn('node', [path.join(gymDir, 'service.js')], { detached: true, stdio: 'ignore', env: { ...process.env, NODE_PATH: path.join(__dirname, 'node_modules') } });
  child.unref();

  return config;
}

module.exports = { createGym };
