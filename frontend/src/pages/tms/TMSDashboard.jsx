import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plane, Hotel, FileText, CheckCircle, Clock, AlertTriangle, Plus, LayoutDashboard } from 'lucide-react';

export default function TMSDashboard() {
  const navigate = useNavigate();
  const { tenantId } = useParams();
  const [stats, setStats] = useState({
    pendingApprovals: 3,
    upcomingTrips: 2,
    pendingExpenses: 5,
    budgetUtilization: 65
  });

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Travel Command Center</h1>
          <p className="text-slate-500">Welcome back, Captain. Here is your travel overview.</p>
        </div>
        <button
          onClick={() => navigate(`/t/${tenantId}/request`)}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
        >
          <Plus size={20} />
          <span>New Travel Request</span>
        </button>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={<Clock className="text-amber-600" />}
          label="Pending Approvals"
          value={stats.pendingApprovals}
          color="bg-amber-50"
        />
        <StatCard
          icon={<Plane className="text-blue-600" />}
          label="Upcoming Trips"
          value={stats.upcomingTrips}
          color="bg-blue-50"
        />
        <StatCard
          icon={<FileText className="text-emerald-600" />}
          label="Unfiled Expenses"
          value={stats.pendingExpenses}
          color="bg-emerald-50"
        />
        <StatCard
          icon={<LayoutDashboard className="text-indigo-600" />}
          label="Budget Used"
          value={`${stats.budgetUtilization}%`}
          color="bg-indigo-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Requests */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-800">Recent Travel Requests</h2>
            <button className="text-blue-600 text-sm font-semibold hover:underline">View All</button>
          </div>
          <div className="space-y-4">
            <RequestItem
              destination="San Francisco, USA"
              dates="Oct 12 - Oct 18"
              status="Approved"
              purpose="Product Launch Conference"
            />
            <RequestItem
              destination="London, UK"
              dates="Nov 05 - Nov 10"
              status="Pending"
              purpose="Client Quarterly Review"
            />
            <RequestItem
              destination="Tokyo, Japan"
              dates="Dec 01 - Dec 07"
              status="Draft"
              purpose="Regional Team Sync"
            />
          </div>
        </div>

        {/* AI Assistant Side Panel */}
        <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <LayoutDashboard size={20} />
              </div>
              <h3 className="font-bold text-lg">Travel AI Assistant</h3>
            </div>
            <div className="bg-slate-800/50 rounded-2xl p-4 mb-4 border border-slate-700">
              <p className="text-sm text-slate-300 italic">
                "I've analyzed your upcoming trip to London. Booking the Hilton Paddington now will save the company $120 compared to last week's rates."
              </p>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2 text-sm text-slate-300">
                <CheckCircle size={16} className="text-emerald-500" />
                Policy compliance check: 100%
              </li>
              <li className="flex items-center gap-2 text-sm text-slate-300">
                <AlertTriangle size={16} className="text-amber-500" />
                Visa requirement: UK Standard Visitor
              </li>
            </ul>
            <button className="w-full bg-blue-600 py-3 rounded-xl font-bold hover:bg-blue-500 transition-colors">
              Talk to Assistant
            </button>
          </div>
          {/* Background decorative elements */}
          <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl"></div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className={`p-6 rounded-2xl ${color} border border-white/50 shadow-sm`}>
      <div className="flex items-center justify-between mb-4">
        {icon}
      </div>
      <p className="text-slate-500 text-sm font-medium">{label}</p>
      <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
    </div>
  );
}

function RequestItem({ destination, dates, status, purpose }) {
  const statusColors = {
    Approved: 'bg-emerald-100 text-emerald-700',
    Pending: 'bg-amber-100 text-amber-700',
    Draft: 'bg-slate-100 text-slate-600',
    Rejected: 'bg-rose-100 text-rose-700'
  };

  return (
    <div className="flex items-center justify-between p-4 rounded-xl border border-slate-50 hover:bg-slate-50 transition-colors">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border border-slate-100 shadow-sm">
          <Plane size={24} className="text-slate-400" />
        </div>
        <div>
          <h4 className="font-bold text-slate-800">{destination}</h4>
          <p className="text-xs text-slate-500">{dates} • {purpose}</p>
        </div>
      </div>
      <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors[status]}`}>
        {status}
      </span>
    </div>
  );
}
