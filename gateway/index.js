/**
 * Gateway — Reverse proxy that unifies all services behind a single port.
 *
 * Routing:
 *   /api/*                → Agency Core (port 3000)
 *   /r/:restaurantId/*    → Restaurant microservice (dynamic port lookup)
 *   /*                    → Vite dev server (dev) or frontend/dist (production)
 */

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

const PORT = process.env.GATEWAY_PORT || 4000;
const AGENCY_PORT = process.env.AGENCY_PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const REGISTRY_PATH = path.join(__dirname, '..', 'agency-core', 'registry.json');
const EMS_REGISTRY_PATH = path.join(__dirname, '..', 'venue-event', 'registry.json');

const app = express();
app.use(cors({ origin: '*' }));

// ─── Helpers ────────────────────────────────────────────────

function readRegistry() {
  try {
    return JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
  } catch {
    return { restaurants: [] };
  }
}

function readEmsRegistry() {
  try {
    return JSON.parse(fs.readFileSync(EMS_REGISTRY_PATH, 'utf8'));
  } catch {
    return { tenants: [] };
  }
}

function findRestaurantPort(restaurantId) {
  const registry = readRegistry();
  const entry = registry.restaurants.find((r) => r.id === restaurantId);
  return entry ? entry.port : null;
}

function findEmsPort(tenantId) {
  const registry = readEmsRegistry();
  const entry = registry.tenants.find((t) => t.id === tenantId);
  return entry ? entry.port : null;
function findHospitalServicePort(hospitalId, serviceName) {
  const registry = readRegistry();
  const entry = registry.hospitals?.find((h) => h.id === hospitalId);
  return entry ? entry.ports[serviceName] : null;
}

// ─── 1. Agency Core Proxy: /api/* → :3000 ──────────────────

app.use(
  '/api',
  createProxyMiddleware({
    target: `http://localhost:${AGENCY_PORT}`,
    changeOrigin: true,
    pathRewrite: (reqPath) => '/api' + reqPath,
    on: {
      error: (err, req, res) => {
        console.error('[Gateway] Agency Core proxy error:', err.message);
        if (res.writeHead) {
          res.writeHead(502, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Agency Core is unavailable' }));
        }
      },
    },
  })
);

// ─── 2. Restaurant Proxy: /r/:restaurantId/* → :31XX ───────

// Handle Socket.IO connections for restaurants and gyms
app.use(['/r/:restaurantId/socket.io', '/gym/:gymId/socket.io'], (req, res, next) => {
  const restaurantId = req.params.restaurantId || req.params.gymId;
  const port = findRestaurantPort(restaurantId);

  if (!port) {
    return res.status(503).json({ error: `Restaurant ${restaurantId} not found` });
  }

  // Intercept if tenant is blocked (active is false)
  const registry = readRegistry();
  const entry = registry.restaurants.find((r) => r.id === restaurantId);
  if (entry && entry.active === false) {
    return res.status(403).json({ error: 'This restaurant portal has been suspended by the administrator.' });
  }

  const proxy = createProxyMiddleware({
    target: `http://localhost:${port}`,
    changeOrigin: true,
    ws: true,
    pathRewrite: (reqPath) => {
      // Strip /r/:restaurantId or /gym/:gymId prefix
      return reqPath.replace(/^\/(r|gym)\/[^/]+/, '');
    },
    on: {
      error: (err, req, res) => {
        console.error(`[Gateway] Socket.IO proxy error for ${restaurantId}:`, err.message);
        if (res.writeHead) {
          res.writeHead(503, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: `Restaurant ${restaurantId} is offline` }));
        }
      },
    },
  });

  proxy(req, res, next);
});

// Handle REST API requests for restaurants and gyms
app.use(['/r/:restaurantId', '/gym/:gymId'], (req, res, next) => {
  const restaurantId = req.params.restaurantId || req.params.gymId;
  const port = findRestaurantPort(restaurantId);

  if (!port) {
    return res.status(503).json({ error: `Tenant ${restaurantId} not found` });
// Handle REST API requests for tenants (Restaurants & TMS)
const tenantProxyMiddleware = (prefix) => (req, res, next) => {
  const tenantId = req.params.tenantId || req.params.restaurantId;
  const port = findRestaurantPort(tenantId);
// Handle REST API requests for restaurants
app.use('/r/:restaurantId', (req, res, next) => {
  const restaurantId = req.params.restaurantId;

  // Handle HMS routing
  if (restaurantId.startsWith('HMS-')) {
    const relativePath = req.path || '';
    const parts = relativePath.split('/').filter(Boolean);
    const serviceName = parts[0]; // e.g. /patient/list -> patient

    const port = findHospitalServicePort(restaurantId, serviceName);
    if (!port) {
      // If it's a page navigation (HTML request), let frontend handle it
      const accept = req.headers.accept || '';
      if (accept.includes('text/html')) {
        return next();
      }
      return res.status(503).json({ error: `Hospital service ${serviceName} not found for ${restaurantId}` });
    }

    const proxy = createProxyMiddleware({
      target: `http://localhost:${port}`,
      changeOrigin: true,
      pathRewrite: (reqPath) => {
        // Strip /r/:id/serviceName
        return reqPath.replace(`/r/${restaurantId}/${serviceName}`, '') || '/';
      },
    });
    return proxy(req, res, next);
  }

  const port = findRestaurantPort(restaurantId);

  if (!port) {
    return res.status(503).json({ error: `Tenant ${tenantId} not found` });
  }

  // Intercept if tenant is blocked (active is false)
  const registry = readRegistry();
  const entry = registry.restaurants.find((r) => r.id === tenantId);
  if (entry && entry.active === false) {
    const relativePath = req.path || '';
      const apiRoots = ['/auth', '/tables', '/menu', '/orders', '/reservations', '/analytics', '/health', '/uploads', '/manifest.json', '/staff', '/settings', '/customers', '/coupons', '/expenses', '/inventory', '/s', '/outlets', '/venues', '/events', '/tickets', '/attendees', '/vendors', '/catering-orders', '/crm', '/marketing', '/ai'];
    const apiRoots = ['/auth', '/tables', '/menu', '/orders', '/reservations', '/analytics', '/health', '/uploads', '/manifest.json', '/staff', '/settings', '/customers', '/coupons', '/expenses', '/inventory', '/s', '/outlets', '/venues', '/members', '/plans', '/subscriptions', '/leads', '/equipment', '/classes', '/loyalty', '/ai', '/attendance', '/workouts', '/diet-plans', '/exercises', '/sales'];
    const apiRoots = ['/auth', '/tables', '/menu', '/orders', '/reservations', '/analytics', '/health', '/uploads', '/manifest.json', '/staff', '/settings', '/customers', '/coupons', '/expenses', '/inventory', '/s', '/outlets', '/venues', '/travel-requests', '/employees', '/bookings', '/policies', '/vendors'];
    const isApiRequest = apiRoots.some((root) => relativePath.startsWith(root));
    const accept = req.headers.accept || '';

    if (isApiRequest && !accept.includes('text/html')) {
      return res.status(403).json({ 
        error: 'This portal has been suspended by the administrator.',
        blocked: true 
      });
    }
  }

  // Intercept if a specific feature is blocked by the agency administrator
  if (entry && entry.blockedFeatures && entry.blockedFeatures.length > 0) {
    const relativePath = req.path || '';
    const featurePathMapping = {
      '/tables': 'tables',
      '/reservations': 'reservations',
      '/menu': 'menu',
      '/staff': 'staff',
      '/customers': 'customers',
      '/coupons': 'coupons',
      '/analytics': 'analytics',
      '/expenses': 'expenses',
      '/inventory': 'inventory',
      '/outlets': 'outlets',
        '/venues': 'venues',
        '/events': 'events',
        '/tickets': 'ticketing',
        '/attendees': 'attendees',
        '/vendors': 'vendors',
        '/catering-orders': 'catering',
        '/crm': 'marketing',
        '/marketing': 'marketing'
      '/venues': 'venues',
      '/leads': 'crm',
      '/equipment': 'facility',
      '/classes': 'classes',
      '/loyalty': 'loyalty',
      '/ai': 'ai',
      '/attendance': 'attendance',
      '/workouts': 'workouts',
      '/diet-plans': 'diet',
      '/sales': 'pos'
    };

    for (const [pathPrefix, featureKey] of Object.entries(featurePathMapping)) {
      if (relativePath.startsWith(pathPrefix) && entry.blockedFeatures.includes(featureKey)) {
        return res.status(403).json({
          error: `The ${featureKey} feature has been disabled for this tenant by the administrator.`,
          featureBlocked: true
        });
      }
    }
  }

  // Bypass proxy for non-API routes or HTML document requests (page navigation) so the React SPA handles routing
  const relativePath = req.path || '';
  const apiRoots = ['/auth', '/tables', '/menu', '/orders', '/reservations', '/analytics', '/health', '/uploads', '/manifest.json', '/staff', '/settings', '/customers', '/coupons', '/expenses', '/inventory', '/s', '/outlets', '/venues', '/events', '/tickets', '/attendees', '/vendors', '/catering-orders', '/crm', '/marketing', '/ai'];
  const apiRoots = ['/auth', '/tables', '/menu', '/orders', '/reservations', '/analytics', '/health', '/uploads', '/manifest.json', '/staff', '/settings', '/customers', '/coupons', '/expenses', '/inventory', '/s', '/outlets', '/venues', '/members', '/plans', '/subscriptions', '/leads', '/equipment', '/classes', '/loyalty', '/ai', '/attendance', '/workouts', '/diet-plans', '/exercises', '/sales'];
  const apiRoots = ['/auth', '/tables', '/menu', '/orders', '/reservations', '/analytics', '/health', '/uploads', '/manifest.json', '/staff', '/settings', '/customers', '/coupons', '/expenses', '/inventory', '/s', '/outlets', '/venues', '/travel-requests', '/employees', '/bookings', '/policies', '/vendors'];
  const isApiRequest = apiRoots.some((root) => relativePath.startsWith(root));
  const accept = req.headers.accept || '';

  if (!isApiRequest || (accept.includes('text/html') && !relativePath.startsWith('/s') && !relativePath.startsWith('/uploads'))) {
    return next();
  }

  const proxy = createProxyMiddleware({
    target: `http://localhost:${port}`,
    changeOrigin: true,
    pathRewrite: (reqPath) => {
      // Strip /r/:restaurantId or /gym/:gymId prefix
      return reqPath.replace(/^\/(r|gym)\/[^/]+/, '') || '/';
      // Strip prefix
      return reqPath.replace(`/${prefix}/${tenantId}`, '') || '/';
    },
    on: {
      error: (err, req, res) => {
        console.error(`[Gateway] REST proxy error for ${tenantId}:`, err.message);
        if (res.writeHead) {
          res.writeHead(503, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: `Tenant ${tenantId} is offline` }));
        }
      },
    },
  });

  proxy(req, res, next);
};

app.use('/r/:tenantId', tenantProxyMiddleware('r'));
app.use('/t/:tenantId', tenantProxyMiddleware('t'));

// ─── 2.5. EMS Proxy: /e/:tenantId/* → :41XX ─────────────────

app.use('/e/:tenantId', (req, res, next) => {
  const tenantId = req.params.tenantId;
  const port = findEmsPort(tenantId);

  if (!port) {
    return res.status(503).json({ error: `EMS Tenant ${tenantId} not found` });
  }

  // Bypass proxy for non-API routes or HTML document requests
  const relativePath = req.path || '';
  const apiRoots = ['/auth', '/events', '/tickets', '/attendees', '/vendors', '/catering-orders', '/crm', '/marketing', '/ai', '/health', '/uploads'];
  const isApiRequest = apiRoots.some((root) => relativePath.startsWith(root));
  const accept = req.headers.accept || '';

  if (!isApiRequest || (accept.includes('text/html') && !relativePath.startsWith('/uploads'))) {
    return next();
  }

  const proxy = createProxyMiddleware({
    target: `http://localhost:${port}`,
    changeOrigin: true,
    pathRewrite: (reqPath) => {
      return reqPath.replace(`/e/${tenantId}`, '') || '/';
    },
    on: {
      error: (err, req, res) => {
        console.error(`[Gateway] EMS proxy error for ${tenantId}:`, err.message);
        if (res.writeHead) {
          res.writeHead(503, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: `EMS Tenant ${tenantId} is offline` }));
        }
      },
    },
  });

  proxy(req, res, next);
});

// ─── 3. Frontend: /* ────────────────────────────────────────

if (NODE_ENV === 'production') {
  // Serve built frontend assets
  const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');
  app.use(express.static(frontendDist));
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
} else {
  // Dev mode: proxy to Vite dev server
  app.use(
    '/',
    createProxyMiddleware({
      target: 'http://localhost:5173',
      changeOrigin: true,
      ws: true,
      on: {
        error: (err, req, res) => {
          // Vite might not be ready yet — return a friendly message
          if (res.writeHead) {
            res.writeHead(503, { 'Content-Type': 'text/html' });
            res.end(`
              <html>
                <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #1a1a2e; color: #e0e0e0;">
                  <div style="text-align: center;">
                    <h1>⏳ Frontend is starting...</h1>
                    <p>Vite dev server is not ready yet. Refresh in a few seconds.</p>
                  </div>
                </body>
              </html>
            `);
          }
        },
      },
    })
  );
}

// ─── Start Server ───────────────────────────────────────────

const server = app.listen(PORT, () => {
  console.log('');
  console.log('  ╔══════════════════════════════════════════╗');
  console.log('  ║   🌐 Gateway — Reverse Proxy             ║');
  console.log(`  ║   Running on http://localhost:${PORT}        ║`);
  console.log(`  ║   Mode: ${NODE_ENV.padEnd(33)}║`);
  console.log('  ╚══════════════════════════════════════════╝');
  console.log('');
  console.log(`  Routes:`);
  console.log(`    /api/*             → Agency Core (:${AGENCY_PORT})`);
  console.log(`    /r/:id/*           → Restaurant microservice`);
  console.log(`    /t/:id/*           → TMS microservice`);
  console.log(`    /*                 → ${NODE_ENV === 'production' ? 'frontend/dist/' : 'Vite dev (:5173)'}`);
  console.log('');
});

// Handle WebSocket upgrades for restaurant Socket.IO
server.on('upgrade', (req, socket, head) => {
  // Check if this is a restaurant or gym Socket.IO connection
  const match = req.url.match(/^\/(r|gym)\/([^/]+)\//);
  if (match) {
    const restaurantId = match[2];
    const port = findRestaurantPort(restaurantId);

    if (port) {
      const registry = readRegistry();
      const entry = registry.restaurants.find((r) => r.id === restaurantId);
      if (entry && entry.active === false) {
        socket.destroy();
        return;
      }

      const proxy = createProxyMiddleware({
        target: `http://localhost:${port}`,
        ws: true,
        changeOrigin: true,
        pathRewrite: (reqPath) => {
          return reqPath.replace(/^\/(r|gym)\/[^/]+/, '');
        },
      });

      proxy.upgrade(req, socket, head);
    } else {
      socket.destroy();
    }
  }
});

// Boot all registered restaurants on gateway startup
try {
  const { startAll } = require('../agency-core/startup');
  // Note: agency-core/index.js also calls startAll(), but if gateway starts alone
  // (e.g., in production via `pnpm start`), we need this fallback.
  // startup.js is idempotent in practice since detached processes won't duplicate.
} catch (err) {
  console.warn('[Gateway] Could not load startup module:', err.message);
}
