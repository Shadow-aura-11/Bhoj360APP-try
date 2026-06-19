import axios from 'axios';
import { io } from 'socket.io-client';

const GATEWAY = ''; // Relative path, proxies automatically via Vite proxy in dev, serves static in prod

export const agencyApi = axios.create({ baseURL: `${GATEWAY}/api` });

// Attach agency session token to all agency API requests
agencyApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('agency_token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses - redirect to login
agencyApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && window.location.pathname.startsWith('/app')) {
      localStorage.removeItem('agency_token');
      window.location.href = '/app/login';
    }
    return Promise.reject(error);
  }
);

export function createApi(tenantId) {
  const path = window.location.pathname;
  let prefix = 'r';

  if (path.startsWith('/gym/')) prefix = 'gym';
  else if (path.startsWith('/t/')) prefix = 't';
  else if (path.startsWith('/e/')) prefix = 'e';

  const instance = axios.create({ baseURL: `${GATEWAY}/${prefix}/${tenantId}` });

  instance.interceptors.request.use((config) => {
    const sessionKey = prefix === 'e' ? 'ems_session' : 'session';
    const session = JSON.parse(localStorage.getItem(sessionKey) || '{}');

    // Check if session belongs to this tenant
    const sid = session.tenantId || session.tenantId || session.gymId;
    if (session.role && sid === tenantId) {
      config.headers['x-role'] = session.role;
      config.headers['x-pin'] = session.pin;
      if (session.employeeId) config.headers['x-employee-id'] = session.employeeId;
      if (session.username) config.headers['x-username'] = session.username;
    }
    return config;
  });
  return instance;
}

export function createSocket(tenantId) {
  const path = window.location.pathname;
  let prefix = 'r';

  if (path.startsWith('/gym/')) prefix = 'gym';
  else if (path.startsWith('/t/')) prefix = 't';
  else if (path.startsWith('/e/')) prefix = 'e';

  const socket = io(window.location.origin, {
    path: `/${prefix}/${tenantId}/socket.io`,
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 10,
  });
  return socket;
}
