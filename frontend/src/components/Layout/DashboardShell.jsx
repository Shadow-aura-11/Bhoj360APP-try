import React, { useState, useEffect } from 'react';
import { Menu, LogOut, Wifi, WifiOff, ShieldAlert } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createApi } from '../../api/client';
import Sidebar from './Sidebar';
import { usePWA } from '../../hooks/usePWA';
import PWAInstallBanner from '../PWAInstallBanner';
import toast from 'react-hot-toast';

export default function DashboardShell({
  children,
  title,
  restaurantId,
  role = 'admin',
  accent = '#6366f1',
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [restaurantName, setRestaurantName] = useState('Restaurant');
  const [logoUrl, setLogoUrl] = useState('');
  const [isOnline, setIsOnline] = useState(true);
  const [blockedFeatures, setBlockedFeatures] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const api = createApi(restaurantId);

  const roleLabel = role === 'admin' ? 'Admin Portal' : role === 'waiter' ? 'Waiter App' : role === 'counter' ? 'Kitchen Display' : role === 'cashier' ? 'Cashier Terminal' : 'Staff App';
  const { installPrompt, handleInstall } = usePWA(restaurantName, roleLabel, logoUrl);

  const getActiveFeature = () => {
    const path = location.pathname;
    if (path.endsWith('/admin/tables')) return 'tables';
    if (path.endsWith('/admin/reservations')) return 'reservations';
    if (path.endsWith('/admin/menu')) return 'menu';
    if (path.endsWith('/admin/staff')) return 'staff';
    if (path.endsWith('/admin/customers')) return 'customers';
    if (path.endsWith('/admin/coupons')) return 'coupons';
    if (path.endsWith('/admin/money')) return 'money';
    if (path.endsWith('/admin/expenses')) return 'expenses';
    if (path.endsWith('/admin/analytics')) return 'analytics';
    if (path.endsWith('/admin/print-qr')) return 'qr';
    if (path.endsWith('/admin/staff-apps')) return 'staff-apps';
    if (path.endsWith('/admin/outlets')) return 'outlets';
    if (path.endsWith('/admin/venues')) return 'venues';
    return null;
  };

  const activeFeature = getActiveFeature();
  const isFeatureBlocked = activeFeature && blockedFeatures.includes(activeFeature);

  useEffect(() => {
    if (installPrompt) {
      toast((t) => (
        <div className="flex items-center justify-between gap-3 text-slate-800 w-full">
          <div className="flex flex-col gap-0.5 text-left">
            <span className="font-bold text-xs text-indigo-600">Install {roleLabel}</span>
            <span className="text-[10px] text-slate-500">Install for persistent login & instant {restaurantName} access</span>
          </div>
          <button
            onClick={() => {
              handleInstall();
              toast.dismiss(t.id);
            }}
            className="px-3 py-1.5 bg-indigo-650 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shrink-0 transition-all shadow-sm"
            style={{ backgroundColor: '#4f46e5' }}
          >
            Install
          </button>
        </div>
      ), {
        id: 'pwa-admin-install-toast',
        duration: 15000,
        style: {
          border: '2px solid #6366f1',
          borderRadius: '1.25rem',
          padding: '14px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
        }
      });
    }
  }, [installPrompt]);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const { data: config } = await api.get('/settings/config').catch(() => ({ data: null }));
        if (config) {
          if (config.name) setRestaurantName(config.name);
          if (config.logo_url) setLogoUrl(config.logo_url);
          if (config.blockedFeatures) setBlockedFeatures(config.blockedFeatures);
        } else {
          const session = JSON.parse(localStorage.getItem('session') || '{}');
          if (session.name) {
            setRestaurantName(session.name);
          }
        }
        setIsOnline(true);
      } catch (err) {
        console.error('Failed to contact microservice', err);
        setIsOnline(false);
      }
    };
    if (restaurantId) {
      fetchConfig();
    }
  }, [restaurantId]);

  // Sync online state based on browser online status
  useEffect(() => {
    const pingInterval = setInterval(async () => {
      try {
        await api.get('/tables/status');
        setIsOnline(true);
      } catch {
        setIsOnline(false);
      }
    }, 10000);

    return () => clearInterval(pingInterval);
  }, [restaurantId]);

  const handleLogout = () => {
    localStorage.removeItem('session');
    navigate(`/r/${restaurantId}/login?role=${role || 'admin'}`);
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800 font-body">
      <Sidebar
        restaurantId={restaurantId}
        role={role}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        blockedFeatures={blockedFeatures}
      />

      {/* Main Panel */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-slate-200 bg-white/85 backdrop-blur-md sticky top-0 z-20 shadow-xs">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold font-display tracking-wide truncate max-w-[160px] sm:max-w-xs text-slate-800">
                {restaurantName}
              </h2>
              <span className="h-4 w-px bg-slate-200 hidden sm:inline" />
              <h3 className="text-sm font-semibold text-slate-500 hidden sm:inline">
                {title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Connection status */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs">
              {isOnline ? (
                <>
                  <Wifi className="w-3.5 h-3.5 text-green-500" />
                  <span className="text-green-700 hidden sm:inline font-mono font-bold">ONLINE</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-rose-500 animate-bounce" />
                  <span className="text-rose-600 hidden sm:inline font-mono font-bold">OFFLINE</span>
                </>
              )}
            </div>

            {/* Profile info & Logout */}
            <div className="flex items-center gap-3">
              <span className="text-xs px-2.5 py-0.5 rounded-md font-mono bg-indigo-50 text-indigo-700 uppercase border border-indigo-200 font-bold">
                {role}
              </span>
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>
        </header>

        {/* PWA Install Banner - shown after login */}
        <PWAInstallBanner
          role={role}
          restaurantName={restaurantName}
          installPrompt={installPrompt}
          handleInstall={handleInstall}
        />

        {/* Content Body */}
        <main className="flex-1 p-6 md:p-8 animate-fade-in relative z-10">
          {isFeatureBlocked ? (
            <div className="flex flex-col items-center justify-center p-8 py-20 text-center bg-white border border-slate-200 rounded-3xl shadow-xs min-h-[50vh]">
              <div className="w-16 h-16 rounded-3xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mb-4 shadow-sm animate-pulse">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <h2 className="text-lg font-bold font-display text-slate-800">Feature Restricted</h2>
              <p className="text-xs text-slate-500 max-w-sm mt-2 leading-relaxed">
                Access to the <strong>{activeFeature}</strong> manager has been disabled for your restaurant by the system administrator. Please contact your support representative.
              </p>
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}
