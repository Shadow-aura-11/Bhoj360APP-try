import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Cpu, Zap, Activity, TrendingUp, AlertTriangle, Brain } from 'lucide-react';
import { createApi } from '../../api/client';
import toast from 'react-hot-toast';

export default function MachineMonitoring() {
  const { restaurantId } = useParams();
  const api = createApi(restaurantId);
  const [machines, setMachines] = useState([]);
  const [forecast, setForecast] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [mRes, fRes, pRes] = await Promise.all([
        api.get(`/r/${restaurantId}/machines`),
        api.get(`/r/${restaurantId}/ai/demand-forecasting`),
        api.get(`/r/${restaurantId}/ai/predictive-maintenance`)
      ]);
      setMachines(mRes.data);
      setForecast(fRes.data);
      setMaintenance(pRes.data);
    } catch (err) {
      toast.error('Failed to load machine and AI data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [restaurantId]);

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Cpu className="text-blue-600" /> Machine Monitoring & AI Insights
          </h1>
          <p className="text-slate-500 text-sm">Real-time telemetry and predictive production analytics</p>
        </div>
        <div className="flex gap-2">
            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full flex items-center gap-1">
                <Brain size={12} /> AI ENGINE ACTIVE
            </span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {machines.map(machine => (
          <div key={machine.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-800">{machine.name}</h3>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                machine.status === 'Running' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
              }`}>
                {machine.status}
              </span>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">OEE Score</p>
                <div className="flex items-end gap-2">
                    <span className="text-2xl font-black">{machine.oee}%</span>
                    <TrendingUp size={16} className="text-emerald-500 mb-1" />
                </div>
              </div>
              <div className="w-16 h-16 rounded-full border-4 border-slate-100 flex items-center justify-center relative">
                <div className="absolute inset-0 border-4 border-blue-500 rounded-full" style={{ clipPath: `inset(${100-machine.oee}% 0 0 0)` }} />
                <Zap size={20} className="text-blue-500" />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-50 flex justify-between items-center">
                <span className="text-xs text-slate-500 italic">Next Service: {machine.next_maintenance || 'Scheduled'}</span>
                <Activity size={14} className="text-slate-300" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Brain size={20} className="text-purple-600" /> AI Demand Forecasting
          </h2>
          <div className="h-48 flex items-end justify-between gap-2 px-2">
            {forecast.map((f, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-blue-500 rounded-t-lg transition-all hover:bg-blue-600 cursor-pointer relative group"
                  style={{ height: `${(f.predicted_demand / 800) * 100}%` }}
                >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                        {f.predicted_demand} units
                    </div>
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">{f.month}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <AlertTriangle size={20} className="text-amber-500" /> Predictive Maintenance
          </h2>
          <div className="space-y-4">
            {maintenance.map((p, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <p className="font-bold text-sm text-slate-800">{p.machine_name}</p>
                  <p className="text-xs text-slate-500">Predicted Failure Prob: <span className="font-mono text-red-500">{(p.failure_probability * 100).toFixed(2)}%</span></p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Rec. Service</p>
                  <p className="text-xs font-bold text-blue-600">{p.recommended_maintenance}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
