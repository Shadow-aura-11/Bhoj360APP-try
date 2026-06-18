import React from 'react';
import { NavLink, useParams, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Ticket,
  Users,
  Truck,
  Utensils,
  Clock,
  BarChart3,
  Megaphone,
  Contact2,
  Settings,
  LogOut,
  Sparkles
} from 'lucide-react';

const EMSSidebar = () => {
  const { tenantId } = useParams();
  const navigate = useNavigate();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: `/e/${tenantId}/dashboard` },
    { icon: Calendar, label: 'Event Planner', path: `/e/${tenantId}/planner` },
    { icon: Ticket, label: 'Ticketing', path: `/e/${tenantId}/ticketing` },
    { icon: Users, label: 'Attendees', path: `/e/${tenantId}/attendees` },
    { icon: Truck, label: 'Vendors', path: `/e/${tenantId}/vendors` },
    { icon: Utensils, label: 'Catering', path: `/e/${tenantId}/catering` },
    { icon: BarChart3, label: 'Accounting & Reports', path: `/e/${tenantId}/reports` },
    { icon: Contact2, label: 'CRM Contacts', path: `/e/${tenantId}/crm` },
    { icon: Megaphone, label: 'Marketing', path: `/e/${tenantId}/marketing` },
  ];

  const handleLogout = () => {
    localStorage.removeItem(`ems_token_${tenantId}`);
    navigate(`/e/${tenantId}/login`);
  };

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen sticky top-0 border-r border-slate-800">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
          <Sparkles className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-display font-bold text-white text-lg leading-tight">VEMS OS</h1>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Enterprise Grade</p>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1 mt-4 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
              ${isActive
                ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-sm'
                : 'hover:bg-slate-800 hover:text-white border border-transparent'}
            `}
          >
            <item.icon className="w-5 h-5 opacity-80" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800 space-y-2">
        <NavLink
          to={`/e/${tenantId}/settings`}
          className={({ isActive }) => `
            flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
            ${isActive ? 'bg-slate-800 text-white' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}
          `}
        >
          <Settings className="w-5 h-5 opacity-80" />
          <span>Settings</span>
        </NavLink>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-all"
        >
          <LogOut className="w-5 h-5 opacity-80" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default EMSSidebar;
