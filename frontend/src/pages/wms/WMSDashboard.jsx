import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Package,
  Truck,
  BarChart3,
  Users,
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRightLeft,
  Container,
  LayoutDashboard,
  Settings
} from 'lucide-react';
import axios from 'axios';

export default function WMSDashboard() {
  const { restaurantId } = useParams();
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchKPIs = async () => {
      try {
        const { data } = await axios.get(`/r/${restaurantId}/wms/analytics/kpis`);
        setKpis(data);
      } catch (err) {
        console.error('Failed to fetch KPIs', err);
      } finally {
        setLoading(false);
      }
    };
    fetchKPIs();
  }, [restaurantId]);

  const stats = [
    { label: 'Daily Throughput', value: kpis?.dailyThroughput || '0', icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Inventory', value: kpis?.totalInventory || '0', icon: Package, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Dock Utilization', value: kpis?.dockUtilization || '0%', icon: Truck, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Order Accuracy', value: kpis?.accuracy || '0%', icon: CheckCircle2, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans">
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg">
            <LayoutDashboard size={24} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Warehouse Director Command Center</h1>
        </div>
        <p className="text-slate-500 text-sm">Enterprise WMS/WOS Platform • Management Portal</p>
      </header>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 transition-all hover:shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Real-time</span>
            </div>
            <h3 className="text-3xl font-black text-slate-800 tracking-tight font-mono">{stat.value}</h3>
            <p className="text-sm font-semibold text-slate-400 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Operations */}
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="font-bold text-slate-800 flex items-center gap-2">
                <Clock className="text-indigo-500" size={18} />
                Live Fulfillment Stream
              </h2>
              <button className="text-xs font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-widest">View All</button>
            </div>
            <div className="divide-y divide-slate-50">
              {[
                { id: 'ORD-9901', type: 'Outbound Picking', status: 'In Progress', priority: 'High', time: '5m ago' },
                { id: 'ORD-9892', type: 'Inbound Receiving', status: 'Awaiting Dock', priority: 'Normal', time: '12m ago' },
                { id: 'ORD-9885', type: 'Replenishment', status: 'Assigned', priority: 'Urgent', time: '20m ago' },
                { id: 'ORD-9877', type: 'Outbound Packing', status: 'In Progress', priority: 'High', time: '1h ago' },
              ].map((op, i) => (
                <div key={i} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-mono text-xs">
                      {op.id.split('-')[1]}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{op.type}</h4>
                      <p className="text-xs text-slate-400">{op.id} • {op.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                      op.priority === 'Urgent' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {op.priority}
                    </span>
                    <span className="text-xs font-bold text-slate-700">{op.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* AI Slotting Recommendations */}
          <section className="bg-slate-900 rounded-3xl shadow-xl p-8 text-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-500 rounded-lg">
                <BarChart3 size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold tracking-tight">AI Slotting Intelligence</h2>
                <p className="text-xs text-slate-400">Inventory movement optimization recommendations</p>
              </div>
            </div>
            <div className="space-y-4">
              {[
                { sku: 'SKU-1001', from: 'Zone C (Bulk)', to: 'Zone A (Pick Face)', reason: 'Velocity increase detected' },
                { sku: 'SKU-2005', from: 'Zone A (Pick Face)', to: 'Zone C (Bulk)', reason: 'Seasonal slowdown' },
              ].map((rec, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-start gap-4">
                  <ArrowRightLeft className="text-indigo-400 shrink-0 mt-1" size={18} />
                  <div>
                    <h4 className="font-bold text-sm text-indigo-300">Move {rec.sku}</h4>
                    <p className="text-xs text-slate-300 mt-1">{rec.from} → {rec.to}</p>
                    <p className="text-[10px] text-slate-500 italic mt-2">Reason: {rec.reason}</p>
                  </div>
                  <button className="ml-auto px-4 py-2 bg-white text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 transition-all">
                    Execute
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar: Yard & Dock Status */}
        <div className="space-y-8">
          <section className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Container className="text-amber-500" size={18} />
              Yard & Dock Status
            </h3>
            <div className="space-y-6">
              {[
                { dock: 'DOCK-01', status: 'Occupied', carrier: 'FedEx Ground', load: '85%' },
                { dock: 'DOCK-02', status: 'Available', carrier: 'None', load: '-' },
                { dock: 'DOCK-03', status: 'Occupied', carrier: 'Amazon Logistics', load: '20%' },
                { dock: 'DOCK-04', status: 'Awaiting', carrier: 'UPS Freight', load: '100%' },
              ].map((dock, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-800">{dock.dock}</span>
                    <span className={dock.status === 'Occupied' ? 'text-emerald-600' : 'text-slate-400'}>{dock.status}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${dock.status === 'Occupied' ? 'bg-indigo-500' : 'bg-slate-200'}`}
                      style={{ width: dock.load === '-' ? '0%' : dock.load }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 uppercase tracking-widest">
                    <span>{dock.carrier}</span>
                    <span>{dock.load}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Users className="text-blue-500" size={18} />
              Labor Productivity
            </h3>
            <div className="space-y-4">
              {[
                { name: 'Marcus R.', task: 'Picking', units: '142/hr', rate: 110 },
                { name: 'Sarah L.', task: 'Packing', units: '65/hr', rate: 95 },
                { name: 'David K.', task: 'Receiving', units: '12 pal/hr', rate: 105 },
              ].map((staff, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{staff.name}</h4>
                    <p className="text-[10px] text-slate-400 uppercase">{staff.task}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-slate-800">{staff.units}</span>
                    <div className={`text-[9px] font-black ${staff.rate >= 100 ? 'text-emerald-500' : 'text-amber-500'}`}>
                      {staff.rate}% Efficiency
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
