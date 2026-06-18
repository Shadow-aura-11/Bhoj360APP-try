/**
 * Startup — Boots all registered restaurant microservices.
 */

const fs = require('fs');
const path = require('path');
const { spawn, exec, execSync } = require('child_process');

const REGISTRY_PATH = path.join(__dirname, 'registry.json');
const runningProcesses = {};

function readRegistry() {
  try {
    return JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
  } catch {
    return { restaurants: [] };
  }
}

function killPort(port) {
  return new Promise((resolve) => {
    if (process.platform !== 'win32') {
      exec(`lsof -t -i:${port} | xargs kill -9`, () => resolve());
      return;
    }
    exec(`netstat -ano | findstr :${port}`, (err, stdout) => {
      if (stdout) {
        const lines = stdout.split('\r\n').filter(l => l.trim());
        for (const line of lines) {
          if (!line.includes('LISTENING')) continue;
          const parts = line.trim().split(/\s+/);
          const pid = parts[parts.length - 1];
          if (pid && !isNaN(pid) && pid !== '0') {
            try {
              execSync(`taskkill /F /PID ${pid}`);
              console.log(`[Startup] Killed process ${pid} on port ${port}`);
            } catch (e) {
              // ignore
            }
          }
        }
      }
      resolve();
    });
  });
}

async function startRestaurant(restaurant) {
  const servicePath = path.join(__dirname, '..', 'restaurants', restaurant.id, 'service.js');
  const templateType = restaurant.templateType || 'restaurant';
  const templateDir = path.join(__dirname, '..', templateType);

  let templatePath = path.join(templateDir, 'service-template.js');
  if (!fs.existsSync(templatePath)) {
    templatePath = path.join(__dirname, 'service-template.js');
  }

  if (!fs.existsSync(templatePath)) {
    console.warn(`  [Startup] Service template not found for ${templateType}.`);
    return;
  }

  // 1. Await killing port before creating/starting service
  await killPort(restaurant.port);

  // 2. Ensure directory exists
  const restaurantDir_fix = path.join(__dirname, '..', 'restaurants', restaurant.id);
  if (!fs.existsSync(restaurantDir_fix)) {
    fs.mkdirSync(restaurantDir_fix, { recursive: true });
  }

  // 3. Sync template to service.js
  try {
    let template = fs.readFileSync(templatePath, 'utf8');
    const injection = `const RESTAURANT_ID = '${restaurant.id}';\nconst PORT = ${restaurant.port};\nconst TEMPLATE_TYPE = '${templateType}';\n`;
    template = injection + template;
    fs.writeFileSync(servicePath, template, 'utf8');

    // Also sync functions.js if it exists in template
    const functionsPath = path.join(templateDir, 'functions.js');
    if (fs.existsSync(functionsPath)) {
        const targetFunctionsPath = path.join(__dirname, '..', 'restaurants', restaurant.id, 'functions.js');
        fs.copyFileSync(functionsPath, targetFunctionsPath);
    }

    console.log(`  [Startup] Synced service.js template for ${restaurant.id} [${templateType}]`);
  } catch (err) {
    console.error(`  [Startup] Failed to sync template for ${restaurant.id}: ${err.message}`);
  }

  // 4. Spawn node process
  try {
    const child = spawn('node', [servicePath], {
      detached: true,
      stdio: 'ignore',
      env: { ...process.env, NODE_PATH: path.join(__dirname, 'node_modules') },
    });
    child.unref();
    runningProcesses[restaurant.id] = child;
    console.log(`  [Startup] ✓ ${restaurant.id} (${restaurant.name}) → port ${restaurant.port}`);
  } catch (err) {
    console.error(`  [Startup] ✗ Failed to start ${restaurant.id}: ${err.message}`);
  }
}

async function startAll() {
  const registry = readRegistry();
  const active = registry.restaurants.filter((r) => r.active);

  if (active.length === 0) {
    console.log('  [Startup] No active restaurants to boot.');
    return;
  }

  console.log(`  [Startup] Booting ${active.length} restaurant(s)...`);

  for (const restaurant of active) {
    await startRestaurant(restaurant);
  }

  console.log('  [Startup] All restaurants booted.');
  console.log('');
}

module.exports = { startAll, startRestaurant, killPort };
