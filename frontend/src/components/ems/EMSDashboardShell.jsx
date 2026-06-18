import React, { useState, useEffect } from 'react';
import { Outlet, useParams, useNavigate } from 'react-router-dom';
import { Bell, Search, User, Wifi, LogOut, Menu } from 'lucide-react';
import EMSSidebar from './EMSSidebar';
import { createApi } from '../../api/client';

const EMSDashboardShell = () => {
  const { tenantId } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tenantName, setTenantName] = useState('EMS Tenant');
  const api = createApi(tenantId);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const { data } = await api.get('/settings/config');
        if (data && data.name) setTenantName(data.name);
      } catch (err) {
        console.error('Failed to fetch EMS config', err);
      }
    };
    fetchConfig();
  }, [tenantId]);

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans">
      <div className={`${sidebarOpen ? 'block' : 'hidden'} md:block`}>
        <EMSSidebar />
      </div>

      <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* Modern Header */}
        <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-30 shadow-sm backdrop-blur-md bg-white/80">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 hover:bg-slate-100 rounded-xl"
            >
              <Menu className="w-5 h-5 text-slate-500" />
            </button>
            <div className="hidden sm:flex items-center gap-2 bg-slate-50 border border-slate-200 px-4 py-2 rounded-2xl w-64 md:w-96">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search events, tickets, attendees..."
                className="bg-transparent border-none text-xs focus:ring-0 w-full"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
              <Wifi className="w-3 h-3" />
              <span className="text-[10px] font-black uppercase tracking-widest">System Online</span>
            </div>

            <button className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-rose-500 border-2 border-white rounded-full"></span>
            </button>

            <div className="h-8 w-px bg-slate-200"></div>

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-slate-800">{tenantName}</p>
                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-tighter">Event Director</p>
              </div>
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-200">
                <User className="w-5 h-5" />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-0 relative">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default EMSDashboardShell;
