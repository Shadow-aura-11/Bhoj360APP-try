import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Grid, 
  CalendarCheck, 
  UtensilsCrossed, 
  BarChart3, 
  QrCode, 
  Settings,
  LogOut, 
  X,
  Users,
  Ticket,
  Wallet,
  Smartphone,
  Receipt,
  Boxes,
  MapPin,
  Building
} from 'lucide-react';

export default function Sidebar({ tenantId, role, isOpen, onClose, blockedFeatures = [] }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('session');
    navigate(`/r/${tenantId}/login?role=${role || 'admin'}`);
    if (onClose) onClose();
  };

  const navItems = [
    { id: 'overview', label: 'Overview', path: `/r/${tenantId}/admin`, icon: LayoutDashboard, end: true },
    { id: 'tables', label: 'Tables', path: `/r/${tenantId}/admin/tables`, icon: Grid },
    { id: 'reservations', label: 'Reservations', path: `/r/${tenantId}/admin/reservations`, icon: CalendarCheck },
    { id: 'events', label: 'Event Planner', path: `/r/${tenantId}/admin/events`, icon: CalendarCheck },
    { id: 'ticketing', label: 'Ticketing', path: `/r/${tenantId}/admin/ticketing`, icon: Ticket },
    { id: 'attendees', label: 'Attendees', path: `/r/${tenantId}/admin/attendees`, icon: Users },
    { id: 'venues', label: 'Venue Bookings', path: `/r/${tenantId}/admin/venues`, icon: Building },
    { id: 'vendors', label: 'Vendors', path: `/r/${tenantId}/admin/vendors`, icon: MapPin },
    { id: 'catering', label: 'Catering', path: `/r/${tenantId}/admin/catering`, icon: UtensilsCrossed },
    { id: 'marketing', label: 'Marketing & CRM', path: `/r/${tenantId}/admin/marketing`, icon: Users },
    { id: 'accounting', label: 'Accounting', path: `/r/${tenantId}/admin/accounting`, icon: Receipt },
    { id: 'outlets', label: 'Outlets & Delivery', path: `/r/${tenantId}/admin/outlets`, icon: MapPin },
    { id: 'menu', label: 'Menu Manager', path: `/r/${tenantId}/admin/menu`, icon: UtensilsCrossed },
    { id: 'staff', label: 'Staff Management', path: `/r/${tenantId}/admin/staff`, icon: Users },
    { id: 'customers', label: 'Customers Directory', path: `/r/${tenantId}/admin/customers`, icon: Users },
    { id: 'coupons', label: 'Coupons & Discounts', path: `/r/${tenantId}/admin/coupons`, icon: Ticket },
    { id: 'money', label: 'Money Management', path: `/r/${tenantId}/admin/money`, icon: Wallet },
    { id: 'expenses', label: 'Expenses Manager', path: `/r/${tenantId}/admin/expenses`, icon: Receipt },
    { id: 'inventory', label: 'Inventory Manager', path: `/r/${tenantId}/admin/inventory`, icon: Boxes },
    { id: 'analytics', label: 'Analytics', path: `/r/${tenantId}/admin/analytics`, icon: BarChart3 },
    { id: 'qr', label: 'Print QR Codes', path: `/r/${tenantId}/admin/print-qr`, icon: QrCode },
    { id: 'staff-apps', label: 'Staff Mobile Apps', path: `/r/${tenantId}/admin/staff-apps`, icon: Smartphone },
    { id: 'settings', label: 'Settings', path: `/r/${tenantId}/admin/settings`, icon: Settings },
  ];

  const visibleNavItems = navItems.filter((item) => {
    if (item.id && blockedFeatures.includes(item.id)) {
      return false;
    }
    return true;
  });

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 text-slate-800">
      {/* Brand Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-150">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-display font-bold text-lg text-white shadow-sm">
            R
          </div>
          <div>
            <h1 className="font-display font-bold text-base leading-tight text-slate-800">
              Multi-OS Suite
            </h1>
            <span className="text-[10px] text-indigo-600 font-mono tracking-widest uppercase font-bold">
              {role} portal
            </span>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-655 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav List */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {visibleNavItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            end={item.end}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-150 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`
            }
          >
            <item.icon className="w-4 h-4 flex-shrink-0" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout Footer */}
      <div className="p-4 border-t border-slate-150 bg-slate-50">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 text-sm font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 rounded-xl transition-colors"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          <span>Log out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Permanent) */}
      <aside className="hidden md:block w-64 h-screen sticky top-0 flex-shrink-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={onClose}
          />
          <div className="relative w-64 h-full animate-slide-right shadow-2xl z-10">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
