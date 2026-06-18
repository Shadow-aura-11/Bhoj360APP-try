import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Factory,
  Package,
  ShoppingCart,
  Settings,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Box,
  Truck,
  Users,
  DollarSign
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ExecutiveDashboard() {
  const { restaurantId } = useParams();
  const [stats, setStats] = useState({
    totalSales: 0,
    activeOrders: 0,
    oee: 85,
    inventoryValue: 0
  });

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Executive Overview</h1>
        <p className="text-slate-500 text-sm">Real-time enterprise performance metrics</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={<DollarSign className="text-blue-600" />}
          label="Total Sales"
          value={`₹${stats.totalSales.toLocaleString()}`}
          trend="+12.5%"
        />
        <StatCard
          icon={<Activity className="text-emerald-600" />}
          label="Overall Equipment Effectiveness (OEE)"
          value={`${stats.oee}%`}
          trend="+2.1%"
        />
        <StatCard
          icon={<Package className="text-amber-600" />}
          label="Active Production Orders"
          value={stats.activeOrders}
          trend="Steady"
        />
        <StatCard
          icon={<TrendingUp className="text-indigo-600" />}
          label="Inventory Value"
          value={`₹${stats.inventoryValue.toLocaleString()}`}
          trend="-3.4%"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Factory className="w-5 h-5" /> Plant Utilization
          </h3>
          <div className="space-y-4">
             <PlantProgress label="North Plant - Assembly Line" progress={78} />
             <PlantProgress label="South Plant - Packaging" progress={92} />
             <PlantProgress label="East Plant - Machining" progress={45} status="Maintenance" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" /> Critical Alerts
          </h3>
          <div className="space-y-3">
             <AlertItem type="Inventory" message="Microcontroller stock below safety level (85 units)" time="2h ago" />
             <AlertItem type="Quality" message="Increased defect rate in Batch #452 (4.2%)" time="5h ago" />
             <AlertItem type="Machine" message="Downtime reported on SMT-01 (Sensor failure)" time="15m ago" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, trend }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-slate-50 rounded-xl">{icon}</div>
        <span className={`text-xs font-bold ${trend.startsWith('+') ? 'text-emerald-600' : trend.startsWith('-') ? 'text-rose-600' : 'text-slate-400'}`}>
          {trend}
        </span>
      </div>
      <h4 className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{label}</h4>
      <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
    </div>
  );
}

function PlantProgress({ label, progress, status }) {
  return (
    <div>
      <div className="flex justify-between text-xs font-bold mb-1.5">
        <span className="text-slate-700">{label}</span>
        <span className={status === 'Maintenance' ? 'text-amber-600' : 'text-blue-600'}>
          {status || `${progress}%`}
        </span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${status === 'Maintenance' ? 'bg-amber-400' : 'bg-blue-500'}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

function AlertItem({ type, message, time }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
      <div className="w-1.5 h-8 bg-amber-400 rounded-full" />
      <div className="flex-1">
        <div className="flex justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{type}</span>
          <span className="text-[10px] text-slate-400">{time}</span>
        </div>
        <p className="text-xs font-medium text-slate-700 mt-0.5">{message}</p>
      </div>
    </div>
  );
}
