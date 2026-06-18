/**
 * HMS Factory — Creates new Hospital Management System tenants.
 * Spawns 10 microservices per hospital.
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const Database = require('better-sqlite3');

const REGISTRY_PATH = path.join(__dirname, 'registry.json');
const HOSPITALS_DIR = path.join(__dirname, '..', 'hospitals');
const HMS_TEMPLATES_DIR = path.join(__dirname, '..', 'hms');

const BASE_HMS_PORT = 5000;

function readRegistry() {
  try {
    return JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
  } catch {
    return { restaurants: [], hospitals: [] };
  }
}

function writeRegistry(data) {
  fs.writeFileSync(REGISTRY_PATH, JSON.stringify(data, null, 2), 'utf8');
}

function generateId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = '';
  for (let i = 6; i < 12; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return `HMS-${id}`;
}

async function createHospital(options = {}) {
  const registry = readRegistry();
  if (!registry.hospitals) registry.hospitals = [];

  const id = generateId();

  // Assign a block of 10 ports
  let startPort = BASE_HMS_PORT;
  if (registry.hospitals.length > 0) {
    const maxPort = Math.max(...registry.hospitals.map(h => h.ports.max));
    startPort = maxPort + 1;
  }

  const ports = {
    patient: startPort,
    doctor: startPort + 1,
    appointment: startPort + 2,
    emr: startPort + 3,
    lab: startPort + 4,
    pharmacy: startPort + 5,
    billing: startPort + 6,
    insurance: startPort + 7,
    inventory: startPort + 8,
    ai: startPort + 9,
    min: startPort,
    max: startPort + 9
  };

  const hospitalDir = path.join(HOSPITALS_DIR, id);
  fs.mkdirSync(hospitalDir, { recursive: true });

  const config = {
    id,
    name: options.name || 'Unnamed Hospital',
    ports,
    type: 'hms',
    createdAt: new Date().toISOString(),
    active: true
  };

  fs.writeFileSync(
    path.join(hospitalDir, 'config.json'),
    JSON.stringify(config, null, 2),
    'utf8'
  );

  // Spawn services
  const services = [
    { name: 'patient', file: 'patient-service.js' },
    { name: 'doctor', file: 'doctor-service.js' },
    { name: 'appointment', file: 'appointment-service.js' },
    { name: 'emr', file: 'emr-service.js' },
    { name: 'lab', file: 'lab-service.js' },
    { name: 'pharmacy', file: 'pharmacy-service.js' },
    { name: 'billing', file: 'billing-service.js' },
    { name: 'insurance', file: 'insurance-service.js' },
    { name: 'inventory', file: 'inventory-service.js' },
    { name: 'ai', file: 'ai-service.js' }
  ];

  for (const svc of services) {
    const templateContent = fs.readFileSync(path.join(HMS_TEMPLATES_DIR, svc.file), 'utf8');
    const port = ports[svc.name];
    const injection = `const PORT = ${port};\nconst TENANT_ID = '${id}';\n`;
    const finalContent = injection + templateContent;

    fs.writeFileSync(path.join(hospitalDir, svc.file), finalContent, 'utf8');

    const child = spawn('node', [path.join(hospitalDir, svc.file)], {
      detached: true,
      stdio: 'ignore',
      env: { ...process.env, NODE_PATH: path.join(__dirname, 'node_modules') }
    });
    child.unref();
  }

  registry.hospitals.push(config);
  writeRegistry(registry);

  return config;
}

module.exports = { createHospital };
