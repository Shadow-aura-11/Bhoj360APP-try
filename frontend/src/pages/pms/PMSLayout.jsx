import React from 'react';
import { NavLink, useParams, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Building,
  Users,
  DollarSign,
  Wrench,
  ArrowLeft,
  ChevronRight
} from 'lucide-react';

export default function PMSLayout() {
  const { restaurantId } = useParams();
  const navigate = useNavigate();

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: `/r/${restaurantId}/admin/pms` },
    { label: 'Properties', icon: Building, path: `/r/${restaurantId}/admin/pms/properties` },
    { label: 'Leases', icon: Users, path: `/r/${restaurantId}/admin/pms/leases` },
    { label: 'Billing', icon: DollarSign, path: `/r/${restaurantId}/admin/pms/billing` },
    { label: 'Maintenance', icon: Wrench, path: `/r/${restaurantId}/admin/pms/maintenance` },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-400 p-6 flex flex-col border-r border-slate-800">
        <div className="mb-8 px-2 flex items-center justify-between">
            <h2 className="text-white font-black tracking-tight text-xl">PMS<span className="text-blue-500">Core</span></h2>
            <button
                onClick={() => navigate('/app')}
                className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors"
                title="Back to Agency"
            >
                <ArrowLeft className="w-4 h-4" />
            </button>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === `/r/${restaurantId}/admin/pms`}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                    : 'hover:bg-slate-800 hover:text-slate-200'
                }`
              }
            >
              <item.icon className="w-4.5 h-4.5" />
              <span>{item.label}</span>
              <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-30" />
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto p-4 bg-slate-800/50 rounded-2xl border border-slate-800">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Current Node</p>
            <p className="text-xs font-bold text-slate-200 truncate">{restaurantId}</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
