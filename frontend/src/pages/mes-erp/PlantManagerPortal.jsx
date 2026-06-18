import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Play,
  Pause,
  CheckCircle,
  Clock,
  Settings,
  Users,
  Cpu,
  Database,
  Search,
  Plus
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function PlantManagerPortal() {
  const { restaurantId } = useParams();
  const [machines, setMachines] = useState([
    { id: 1, name: 'SMT Line 1', status: 'Running', efficiency: '94%', load: 82 },
    { id: 2, name: 'Assembly Station A', status: 'Idle', efficiency: '88%', load: 0 },
    { id: 3, name: 'CNC Mill #05', status: 'Maintenance', efficiency: '76%', load: 0 },
    { id: 4, name: 'Packaging B', status: 'Running', efficiency: '91%', load: 65 }
  ]);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Plant Manager Portal</h1>
          <p className="text-slate-500 text-sm">Shop floor control and machine monitoring</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
            Shift Schedule
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-500 transition-all shadow-sm">
            Release Work Orders
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
             <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-slate-800">Live Machine Status</h3>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input type="text" placeholder="Search machines..." className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-blue-500" />
                </div>
             </div>
             <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-3">Machine Name</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Efficiency</th>
                      <th className="px-6 py-3">Current Load</th>
                      <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {machines.map(machine => (
                      <tr key={machine.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-100 rounded-lg text-slate-500"><Cpu className="w-4 h-4" /></div>
                            <span className="text-sm font-semibold text-slate-700">{machine.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                           <StatusBadge status={machine.status} />
                        </td>
                        <td className="px-6 py-4 font-mono text-sm text-slate-600">{machine.efficiency}</td>
                        <td className="px-6 py-4">
                           <div className="w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-blue-500 h-full" style={{ width: `${machine.load}%` }} />
                           </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                           <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400"><Settings className="w-4 h-4" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
             <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-500" /> Active Work Orders
             </h3>
             <div className="space-y-4">
                <WorkOrderItem id="WO-1001" product="Industrial Motor" qty={500} progress={65} />
                <WorkOrderItem id="WO-1005" product="Power Supply Unit" qty={1200} progress={20} />
                <WorkOrderItem id="WO-1008" product="PCB Assembly X2" qty={300} progress={90} />
             </div>
             <button className="w-full mt-6 py-2.5 text-blue-600 bg-blue-50 rounded-xl text-xs font-bold hover:bg-blue-100 transition-colors">
                View All Work Orders
             </button>
          </div>

          <div className="bg-indigo-600 p-6 rounded-2xl shadow-md text-white">
             <div className="flex justify-between items-start mb-4">
                <Users className="w-6 h-6" />
                <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-bold">LIVE</span>
             </div>
             <h4 className="text-sm font-medium opacity-80">Shift Personnel</h4>
             <p className="text-2xl font-bold mt-1">42 Operators</p>
             <div className="mt-4 flex -space-x-2">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-indigo-600 bg-indigo-200 flex items-center justify-center text-[10px] font-bold text-indigo-800">
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
                <div className="w-8 h-8 rounded-full border-2 border-indigo-600 bg-indigo-500 flex items-center justify-center text-[10px] font-bold">
                  +37
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    'Running': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Idle': 'bg-slate-50 text-slate-600 border-slate-200',
    'Maintenance': 'bg-amber-50 text-amber-700 border-amber-200',
    'Error': 'bg-rose-50 text-rose-700 border-rose-200'
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${styles[status] || styles['Idle']}`}>
      {status.toUpperCase()}
    </span>
  );
}

function WorkOrderItem({ id, product, qty, progress }) {
  return (
    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
      <div className="flex justify-between items-center mb-2">
        <span className="text-[10px] font-bold text-blue-600 font-mono">{id}</span>
        <span className="text-[10px] font-bold text-slate-400">{qty} units</span>
      </div>
      <h5 className="text-xs font-bold text-slate-700 truncate">{product}</h5>
      <div className="mt-2 w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
        <div className="bg-indigo-500 h-full" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
