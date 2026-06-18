import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Truck,
  Container,
  Navigation,
  Map as MapIcon,
  Clock,
  AlertCircle,
  CheckCircle2,
  Anchor,
  Move,
  Users,
  Activity,
  Plus
} from 'lucide-react';
import axios from 'axios';

export default function OperationsControl() {
  const { restaurantId } = useParams();
  const [yardData, setYardData] = useState({ trailers: [], docks: [] });
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [yardRes, tasksRes] = await Promise.all([
          axios.get(`/r/${restaurantId}/wms/yard`),
          axios.get(`/r/${restaurantId}/wms/tasks`)
        ]);
        setYardData(yardRes.data);
        setTasks(tasksRes.data);
      } catch (err) {
        console.error('Failed to fetch operations data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [restaurantId]);

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans">
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg bg-amber-600 flex items-center justify-center text-white shadow-lg">
            <Activity size={20} />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Warehouse Operations (WOS)</h1>
        </div>
        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Yard, Dock & Task Management</p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Yard Management */}
        <div className="xl:col-span-2 space-y-8">
          <section className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
              <h2 className="font-bold text-slate-800 flex items-center gap-2">
                <Truck className="text-amber-500" size={18} />
                Yard Trailer Tracking
              </h2>
              <button className="px-3 py-1.5 bg-amber-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-amber-500 transition-all flex items-center gap-2">
                <Plus size={12} /> Gate Check-In
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {yardData.trailers.map((trailer, i) => (
                  <div key={i} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:border-amber-300 transition-all group">
                    <div className="flex justify-between items-start mb-3">
                      <div className="p-2 bg-slate-100 rounded-xl text-slate-600 group-hover:bg-amber-50 group-hover:text-amber-600 transition-colors">
                        <Container size={20} />
                      </div>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-tighter ${
                        trailer.status === 'At Dock' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                      }`}>
                        {trailer.status}
                      </span>
                    </div>
                    <h3 className="font-mono font-bold text-lg text-slate-800">{trailer.trailer_number}</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{trailer.carrier}</p>
                    <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                        <Navigation size={12} className="text-slate-300" />
                        {trailer.dock_number || trailer.location}
                      </div>
                      <button className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-300 hover:text-amber-600 transition-all">
                        <Move size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Active Tasks Table */}
          <section className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="font-bold text-slate-800 flex items-center gap-2">
                <Clock className="text-blue-500" size={18} />
                Pending Operations Tasks
              </h2>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md uppercase">{tasks.length} Active</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <th className="px-6 py-4">Task Type</th>
                    <th className="px-6 py-4">Product / SKU</th>
                    <th className="px-6 py-4">Route (From/To)</th>
                    <th className="px-6 py-4">Qty</th>
                    <th className="px-6 py-4">Assigned To</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-sm">
                  {tasks.map((task, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-tighter ${
                          task.type === 'Picking' ? 'bg-indigo-50 text-indigo-600' :
                          task.type === 'Putaway' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-600'
                        }`}>
                          {task.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-700">{task.product_name}</div>
                        <div className="text-[10px] font-mono text-slate-400">{task.sku}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-500">
                          <span className="text-slate-400">{task.from_bin || '---'}</span>
                          <Navigation size={10} className="rotate-90 text-slate-300" />
                          <span className="text-blue-600">{task.to_bin || '---'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-black text-slate-800">{task.quantity}</td>
                      <td className="px-6 py-4 text-xs font-semibold text-slate-500 italic">{task.assigned_to || 'Unassigned'}</td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-xs font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest">Detail</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Dock Visualization */}
        <div className="space-y-8">
          <section className="bg-slate-900 rounded-3xl shadow-xl p-6 text-white">
            <h3 className="font-bold mb-6 flex items-center gap-2">
              <Anchor className="text-indigo-400" size={18} />
              Dock Management
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {yardData.docks.map((dock, i) => (
                <div key={i} className={`p-4 rounded-2xl border ${
                  dock.status === 'Occupied' ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-white/5 border-white/10'
                }`}>
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-mono font-bold text-xs">{dock.number}</span>
                    <div className={`w-2 h-2 rounded-full ${dock.status === 'Available' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  </div>
                  <p className={`text-[10px] font-black uppercase tracking-widest ${
                    dock.status === 'Occupied' ? 'text-indigo-300' : 'text-slate-500'
                  }`}>{dock.status}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 bg-white/5 rounded-2xl p-4 border border-white/10">
              <h4 className="text-xs font-bold text-indigo-300 mb-2 uppercase tracking-widest">Efficiency Metrics</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-slate-400">Avg Unload Time</span>
                  <span className="text-xs font-mono font-bold">42 min</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-slate-400">Turnover Rate</span>
                  <span className="text-xs font-mono font-bold">4.2/day</span>
                </div>
              </div>
            </div>
          </section>

          {/* Labor Activity */}
          <section className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Users className="text-indigo-500" size={18} />
              Operational Labor
            </h3>
            <div className="space-y-6">
              {[
                { name: 'John Smith', activity: 'Unloading DOCK-1', start: '14:20' },
                { name: 'Maria Garcia', activity: 'Picking Wave 4', start: '15:05' },
                { name: 'Lee Chen', activity: 'Replenishing Zone A', start: '15:12' },
              ].map((labor, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-1 bg-indigo-100 rounded-full" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{labor.name}</h4>
                    <p className="text-[10px] text-slate-500 font-semibold mt-0.5">{labor.activity}</p>
                    <p className="text-[9px] text-slate-400 mt-1 font-mono">Started at {labor.start}</p>
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
