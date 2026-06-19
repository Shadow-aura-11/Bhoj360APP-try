import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Download, Loader2 } from 'lucide-react';
import { createApi } from '../api/client';
import { usePWA } from '../hooks/usePWA';

export default function PWAInstallLanding({ roleName, targetPath }) {
  const { tenantId } = useParams();
  const navigate = useNavigate();
  const api = createApi(tenantId);

  const [tenantName, setRestaurantName] = useState('Tenant');
  const [logoUrl, setLogoUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [isPreparing, setIsPreparing] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const { data: config } = await api.get('/settings/config').catch(() => ({ data: null }));
        if (config) {
          if (config.name) setRestaurantName(config.name);
          if (config.logo_url) setLogoUrl(config.logo_url);
        }
      } catch (err) {
        console.error('Failed to load restaurant config for PWA landing', err);
      } finally {
        setLoading(false);
      }
    };
    if (tenantId) {
      fetchConfig();
    }
  }, [tenantId]);

  useEffect(() => {
    // Force open in Chrome on Android if in-app browser (like WhatsApp, Instagram) is detected
    const ua = navigator.userAgent;
    const isAndroid = /android/i.test(ua);
    const isInApp = /FBAN|FBAV|Instagram|WhatsApp|Line|Snapchat/i.test(ua);

    if (isAndroid && isInApp) {
      const intentUrl = `intent://${window.location.host}${window.location.pathname}${window.location.search}#Intent;scheme=https;package=com.android.chrome;end`;
      window.location.href = intentUrl;
    }
  }, []);

  const { installPrompt, handleInstall } = usePWA(tenantName, `${roleName} App`, logoUrl);

  const handleLoginRedirect = () => {
    navigate(`/r/${tenantId}/login?redirect=${encodeURIComponent(targetPath)}`);
  };

  const handleInstallClick = async () => {
    // If prompt is ready, trigger it immediately
    const prompt = installPrompt || window.deferredPrompt;
    if (prompt) {
      const success = await handleInstall();
      if (success) return;
    }

    // Otherwise, wait up to 2 seconds for prompt to load
    setIsPreparing(true);
    const hasPrompt = await new Promise((resolve) => {
      let elapsed = 0;
      const interval = setInterval(() => {
        const currentPrompt = window.deferredPrompt || installPrompt;
        if (currentPrompt) {
          clearInterval(interval);
          resolve(true);
        }
        elapsed += 150;
        if (elapsed >= 1800) {
          clearInterval(interval);
          resolve(false);
        }
      }, 150);
    });

    setIsPreparing(false);

    if (hasPrompt) {
      // Trigger prompt
      await handleInstall();
    } else {
      // Direct redirection to the login page without displaying any compatibility text
      handleLoginRedirect();
    }
  };

  // Skip blocking render to prevent fullscreen spinner delays.
  const displayLogo = logoUrl;
  const displayRestName = loading ? 'Loading...' : tenantName;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white flex flex-col items-center justify-center p-6 font-body">
      <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 md:p-8 text-center shadow-2xl relative z-10">
        {/* Logo */}
        <div className="mx-auto w-20 h-20 rounded-3xl bg-slate-800 border border-slate-700/60 flex items-center justify-center overflow-hidden mb-6 shadow-md">
          {displayLogo ? (
            <img src={displayLogo} alt="Logo" className="w-full h-full object-contain" />
          ) : (
            <span className="text-3xl font-extrabold font-display bg-gradient-to-br from-indigo-400 to-indigo-600 bg-clip-text text-transparent">
              {displayRestName[0] || 'R'}
            </span>
          )}
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold font-display tracking-tight text-white mb-2">
          {displayRestName}
        </h2>
        <div className="inline-block bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-6">
          {roleName} Portal
        </div>

        {/* Dynamic Installer UI */}
        <p className="text-slate-400 text-xs leading-relaxed mb-8 max-w-xs mx-auto">
          Install the terminal app directly onto your home screen for instant loading, full screen view, and persistent staff login.
        </p>

        <div className="space-y-4">
          <button
            onClick={handleInstallClick}
            disabled={isPreparing}
            className="w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-bold rounded-2xl flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-indigo-600/25 disabled:opacity-80 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#4f46e5' }}
          >
            {isPreparing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Preparing Installation...</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5 animate-bounce" />
                <span>Install {roleName} App</span>
              </>
            )}
          </button>
        </div>

        {/* Subtle Skip Web Fallback Link */}
        <div className="mt-8">
          <button
            onClick={handleLoginRedirect}
            className="text-[11px] text-slate-500 hover:text-indigo-400 font-semibold transition-all hover:underline"
          >
            Continue to Web Version (No Install)
          </button>
        </div>
      </div>

      <div className="mt-8 text-slate-600 text-[10px] font-mono tracking-widest uppercase">
        Powered by Multi-OS App Suite
      </div>
    </div>
  );
}
