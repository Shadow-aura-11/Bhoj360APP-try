/**
 * PWAInstallBanner - Shows a dismissible install notification on dashboards.
 *
 * Renders:
 *  - A sticky top banner when `beforeinstallprompt` is available (one-click native install)
 *  - A floating card after login if not already installed, that can be dismissed
 *  - Nothing if already running in standalone (installed) mode
 *
 * Props:
 *  - role: 'admin' | 'waiter' | 'counter' | 'cashier'
 *  - restaurantName: string
 *  - accentColor: hex string (optional)
 *  - installPrompt: the deferred prompt event from usePWA
 *  - handleInstall: function from usePWA
 */
import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';
import toast from 'react-hot-toast';

const ROLE_CONFIG = {
  admin:   { label: 'Admin Portal',        color: '#d97706', light: '#fffbeb', border: '#fde68a', text: '#92400e' },
  waiter:  { label: 'Waiter App',          color: '#4f46e5', light: '#eef2ff', border: '#c7d2fe', text: '#3730a3' },
  counter: { label: 'Kitchen Display App', color: '#be123c', light: '#fff1f2', border: '#fecdd3', text: '#9f1239' },
  cashier: { label: 'Cashier Terminal',    color: '#7c3aed', light: '#f5f3ff', border: '#ddd6fe', text: '#5b21b6' },
};

const DISMISS_KEY = (role) => `pwa_banner_dismissed_${role}`;
const INSTALLED_KEY = 'pwa_installed';

export default function PWAInstallBanner({ role, restaurantName, installPrompt, handleInstall }) {
  const cfg = ROLE_CONFIG[role] || ROLE_CONFIG.waiter;
  const [dismissed, setDismissed] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already in standalone mode
    const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    if (standalone || localStorage.getItem(INSTALLED_KEY)) {
      setIsInstalled(true);
      return;
    }

    // Check if this role banner was dismissed this session
    const wasDismissed = sessionStorage.getItem(DISMISS_KEY(role));
    if (wasDismissed) setDismissed(true);
  }, [role]);

  const handleDismiss = () => {
    sessionStorage.setItem(DISMISS_KEY(role), '1');
    setDismissed(true);
  };

  const handleClickInstall = async () => {
    const prompt = installPrompt || window.deferredPrompt;
    if (prompt) {
      const success = await handleInstall();
      if (success) {
        localStorage.setItem(INSTALLED_KEY, '1');
        setIsInstalled(true);
      }
    } else {
      toast.loading("Preparing installation...", { id: 'pwa-install-status', duration: 1800 });
      let elapsed = 0;
      const interval = setInterval(async () => {
        const currentPrompt = window.deferredPrompt || installPrompt;
        if (currentPrompt) {
          clearInterval(interval);
          toast.dismiss('pwa-install-status');
          currentPrompt.prompt();
          const { outcome } = await currentPrompt.userChoice;
          if (outcome === 'accepted') {
            localStorage.setItem(INSTALLED_KEY, '1');
            setIsInstalled(true);
          }
        }
        elapsed += 150;
        if (elapsed >= 1800) {
          clearInterval(interval);
          toast.dismiss('pwa-install-status');
          const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
          if (isStandalone) {
            localStorage.setItem(INSTALLED_KEY, '1');
            setIsInstalled(true);
          }
        }
      }, 150);
    }
  };

  // Show the banner if not installed and not dismissed on the dashboards
  if (isInstalled || dismissed) return null;

  return (
    <div
      className="mx-4 mt-4 mb-1 rounded-2xl border text-sm shadow-sm no-print overflow-hidden"
      style={{ backgroundColor: cfg.light, borderColor: cfg.border }}
    >
      {/* Main row */}
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
            style={{ backgroundColor: cfg.color }}
          >
            <Smartphone className="w-4.5 h-4.5 text-white" />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-xs leading-none mb-0.5" style={{ color: cfg.text }}>
              Install {restaurantName} {cfg.label}
            </p>
            <p className="text-[10px] text-slate-500 leading-snug">
              Add to home screen for instant access & persistent login
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleClickInstall}
            className="flex items-center gap-1.5 px-3 py-1.5 text-white text-xs font-bold rounded-lg transition-all hover:opacity-90 shadow-sm"
            style={{ backgroundColor: cfg.color }}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install</span>
          </button>
          <button
            onClick={handleDismiss}
            className="p-1.5 rounded-lg hover:bg-black/5 text-slate-400 hover:text-slate-600 transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
