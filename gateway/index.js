/**
 * Gateway — Reverse proxy that unifies all services behind a single port.
 *
 * Routing:
 *   /api/*                → Agency Core (port 3000)
 *   /r/:restaurantId/*    → Restaurant/Vertical microservice (dynamic port lookup)
 *   /gym/:gymId/*         → Gym microservice
 *   /t/:tenantId/*        → TMS microservice
 *   /e/:tenantId/*        → EMS standalone microservice
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

function findRestaurantPort(tenantId) {
  const registry = readRegistry();
  const entry = registry.restaurants.find((r) => r.id === tenantId);
  return entry ? entry.port : null;
}

function findEmsPort(tenantId) {
  const registry = readEmsRegistry();
  const entry = registry.tenants.find((t) => t.id === tenantId);
  return entry ? entry.port : null;
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

// ─── 2. Universal Tenant Proxy Handler ───────────────────────

const universalProxy = (prefix) => (req, res, next) => {
  const tenantId = req.params.tenantId || req.params.restaurantId || req.params.gymId;
  const port = findRestaurantPort(tenantId);

  if (!port) {
    return res.status(503).json({ error: `Tenant ${tenantId} not found` });
  }

  const registry = readRegistry();
  const entry = registry.restaurants.find((r) => r.id === tenantId);
  if (entry && entry.active === false) {
    return res.status(403).json({ error: 'This portal has been suspended by the administrator.' });
  }

  const relativePath = req.path || '';
  const accept = req.headers.accept || '';

  // API Roots across all verticals
  const apiRoots = [
    '/auth', '/tables', '/menu', '/orders', '/reservations', '/analytics', '/health',
    '/uploads', '/manifest.json', '/staff', '/settings', '/customers', '/coupons',
    '/expenses', '/inventory', '/s', '/outlets', '/venues', '/rms', '/hms', '/pms',
    '/members', '/plans', '/subscriptions', '/leads', '/equipment', '/classes',
    '/loyalty', '/ai', '/attendance', '/workouts', '/diet-plans', '/exercises', '/sales',
    '/travel-requests', '/employees', '/bookings', '/policies', '/vendors',
    '/production', '/machines', '/quality', '/finance'
  ];

  const isApiRequest = apiRoots.some((root) => relativePath.startsWith(root));

  // If it's a page navigation (HTML request) and not a specialized asset/service, let frontend handle it
  if (!isApiRequest || (accept.includes('text/html') && !relativePath.startsWith('/s') && !relativePath.startsWith('/uploads'))) {
    return next();
  }

  const proxy = createProxyMiddleware({
    target: `http://localhost:${port}`,
    changeOrigin: true,
    ws: true,
    pathRewrite: (reqPath) => {
      const regex = new RegExp(`^\\/${prefix}\\/[^/]+`);
      return reqPath.replace(regex, '') || '/';
    },
    on: {
      error: (err, req, res) => {
        console.error(`[Gateway] REST/WS proxy error for ${tenantId}:`, err.message);
        if (res.writeHead) {
          res.writeHead(503, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: `Tenant ${tenantId} is offline` }));
        }
      },
    },
  });

  proxy(req, res, next);
};

app.use('/r/:restaurantId', universalProxy('r'));
app.use('/gym/:gymId', universalProxy('gym'));
app.use('/t/:tenantId', universalProxy('t'));

// ─── 3. EMS Standalone Proxy ────────────────────────────────

app.use('/e/:tenantId', (req, res, next) => {
  const tenantId = req.params.tenantId;
  const port = findEmsPort(tenantId);
  if (!port) return res.status(503).json({ error: `EMS Tenant ${tenantId} not found` });

  const relativePath = req.path || '';
  const apiRoots = ['/auth', '/events', '/tickets', '/attendees', '/vendors', '/catering-orders', '/crm', '/marketing', '/ai', '/health', '/uploads'];
  const isApiRequest = apiRoots.some((root) => relativePath.startsWith(root));
  const accept = req.headers.accept || '';

  if (!isApiRequest || (accept.includes('text/html') && !relativePath.startsWith('/uploads'))) {
    return next();
  }

  createProxyMiddleware({
    target: `http://localhost:${port}`,
    changeOrigin: true,
    pathRewrite: (reqPath) => reqPath.replace(`/e/${tenantId}`, '') || '/',
  })(req, res, next);
});

// ─── 4. Frontend: /* ────────────────────────────────────────

if (NODE_ENV === 'production') {
  const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');
  app.use(express.static(frontendDist));
  app.get('*', (req, res) => res.sendFile(path.join(frontendDist, 'index.html')));
} else {
  app.use('/', createProxyMiddleware({
    target: 'http://localhost:5173',
    changeOrigin: true,
    ws: true,
    on: {
      error: (err, req, res) => {
        if (res.writeHead) {
          res.writeHead(503, { 'Content-Type': 'text/html' });
          res.end('<h1>⏳ Frontend is starting...</h1>');
        }
      }
    }
  }));
}

app.listen(PORT, () => {
  console.log(`\n  🌐 Gateway running on http://localhost:${PORT}\n`);
});
