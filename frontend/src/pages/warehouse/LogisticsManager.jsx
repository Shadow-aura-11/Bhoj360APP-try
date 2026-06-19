import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Truck, MapPin, Navigation, Anchor, Monitor, AlertTriangle, Play, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LogisticsManager() {
  const { tenantId } = useParams();
  const [docks, setDocks] = useState([]);
  const [yard, setYard] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [tenantId]);

  const fetchData = async () => {
    try {
      const [docksRes, yardRes, equipRes] = await Promise.all([
        fetch(`/r/${tenantId}/docks`),
        fetch(`/r/${tenantId}/yard`),
        fetch(`/r/${tenantId}/equipment`)
      ]);

      setDocks(await docksRes.json());
      setYard(await yardRes.json());
      setEquipment(await equipRes.json());
      setLoading(false);
    } catch (err) {
      toast.error('Failed to load logistics data');
    }
  };

  if (loading) return <div className="p-10 text-center text-slate-500">Loading Logistics...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <header className="mb-8">
        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Yard & Dock Management</h1>
        <p className="text-slate-500 text-sm">Monitor dock doors, yard traffic, and equipment health.</p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Dock Management */}
        <div className="xl:col-span-2 space-y-6">
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Anchor className="text-blue-600 w-5 h-5" />
                Dock Door Status
              </h2>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{docks.length} Doors Total</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {docks.map((dock) => (
                <div key={dock.id} className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm hover:border-blue-200 transition-all flex items-center gap-4">
                  <div className={`w-12 h-16 rounded-xl flex flex-col items-center justify-center font-bold text-xl ${
                    dock.status === 'occupied' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400 border border-slate-200'
                  }`}>
                    <span className="text-[10px] uppercase mb-1">Dock</span>
                    {dock.code.replace('DOCK-', '')}
                  </div>

                  <div className="flex-1">
                    <h3 className="font-bold text-slate-800">{dock.type.toUpperCase()}</h3>
                    <p className="text-xs text-slate-500">
                      {dock.status === 'occupied' ? `Vehicle: ${dock.current_vehicle_id}` : 'Ready for arrival'}
                    </p>
                  </div>

                  <div className="shrink-0">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider ${
                      dock.status === 'occupied' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                    }`}>
                      {dock.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Truck className="text-indigo-600 w-5 h-5" />
                Yard Layout
              </h2>
              <button className="text-xs font-bold text-blue-600 hover:underline">Full Yard Map</button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              {yard.map((spot) => (
                <div key={spot.id} className={`p-4 rounded-2xl border flex flex-col items-center text-center transition-all ${
                  spot.status === 'occupied' ? 'bg-white border-blue-200 shadow-sm' : 'bg-slate-50 border-slate-100 border-dashed opacity-60'
                }`}>
                  <MapPin className={`w-4 h-4 mb-2 ${spot.status === 'occupied' ? 'text-blue-500' : 'text-slate-300'}`} />
                  <span className="text-[10px] font-bold text-slate-400 mb-1">{spot.code}</span>
                  <span className="text-[11px] font-bold text-slate-700 truncate w-full">
                    {spot.vehicle_id || 'EMPTY'}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Equipment & Monitoring Sidebar */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Monitor className="text-blue-400 w-5 h-5" />
              Equipment Monitor
            </h3>

            <div className="space-y-4">
              {equipment.map((item) => (
                <div key={item.id} className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between group hover:bg-white/10 transition-all">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${item.status === 'available' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                      <Navigation className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold">{item.name}</h4>
                      <p className="text-[10px] text-slate-400 font-mono">{item.code}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${
                      item.status === 'available' ? 'text-emerald-400' : 'text-amber-400'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400">System Uptime</span>
                <span className="text-xs font-bold text-emerald-400">99.9%</span>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-[99.9%]" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <AlertTriangle className="text-amber-500 w-5 h-5" />
              Logistics Alerts
            </h3>
            <div className="space-y-3">
              <div className="flex gap-3 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <p className="text-slate-600">Truck <span className="font-bold">TRK-882</span> has been at Dock 1 for over 4 hours.</p>
              </div>
              <div className="flex gap-3 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                <p className="text-slate-600">Forklift <span className="font-bold">FL-02</span> scheduled maintenance overdue.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
