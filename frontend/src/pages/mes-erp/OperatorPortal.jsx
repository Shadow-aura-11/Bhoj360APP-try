import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Play,
  CheckCircle,
  AlertCircle,
  Clock,
  FileText,
  Settings,
  ChevronRight,
  LogOut
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function OperatorPortal() {
  const { restaurantId } = useParams();
  const [activeTask, setActiveTask] = useState({
    id: 'WO-1001-A',
    product: 'Industrial Motor X1',
    qty: 50,
    completed: 12,
    machine: 'Assembly Station A',
    startedAt: new Date().toISOString()
  });

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans">
      <header className="p-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold">JO</div>
           <div>
              <h1 className="text-sm font-bold">John Operator</h1>
              <p className="text-[10px] text-slate-400">Shift: Morning (06:00 - 14:00)</p>
           </div>
        </div>
        <button className="p-2 text-slate-400 hover:text-white"><LogOut className="w-5 h-5" /></button>
      </header>

      <main className="p-4 space-y-6">
        {/* Active Task Card */}
        <div className="bg-slate-800 rounded-3xl p-6 border border-slate-700 shadow-xl">
           <div className="flex justify-between items-start mb-6">
              <div>
                 <span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Active Work Order</span>
                 <h2 className="text-2xl font-black mt-2">{activeTask.id}</h2>
                 <p className="text-slate-400 font-medium">{activeTask.product}</p>
              </div>
              <div className="text-right">
                 <p className="text-[10px] text-slate-500 uppercase font-bold">Machine</p>
                 <p className="text-sm font-bold text-slate-200">{activeTask.machine}</p>
              </div>
           </div>

           <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-700/50">
                 <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Target</p>
                 <p className="text-3xl font-black">{activeTask.qty}</p>
              </div>
              <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-700/50">
                 <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Produced</p>
                 <p className="text-3xl font-black text-emerald-500">{activeTask.completed}</p>
              </div>
           </div>

           <div className="space-y-4">
              <button
                onClick={() => toast.success('Production Entry Recorded')}
                className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all shadow-lg active:scale-95"
              >
                <CheckCircle className="w-6 h-6" />
                <span>+1 UNIT COMPLETE</span>
              </button>

              <div className="flex gap-4">
                 <button className="flex-1 py-4 bg-slate-700 hover:bg-slate-600 rounded-2xl font-bold text-sm flex items-center justify-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-500" /> Report Scrap
                 </button>
                 <button className="flex-1 py-4 bg-slate-700 hover:bg-slate-600 rounded-2xl font-bold text-sm flex items-center justify-center gap-2">
                    <FileText className="w-4 h-4 text-blue-400" /> Instructions
                 </button>
              </div>
           </div>
        </div>

        {/* Quality Check Prompt */}
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-center gap-4">
           <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center text-slate-900"><Clock className="w-6 h-6" /></div>
           <div className="flex-1">
              <h4 className="text-sm font-bold text-amber-500">Hourly Quality Check Due</h4>
              <p className="text-[10px] text-amber-200/60">Last check performed at 09:15 AM</p>
           </div>
           <button className="bg-amber-500 text-slate-900 px-4 py-2 rounded-xl text-xs font-black">START CHECK</button>
        </div>

        {/* Machine Telemetry */}
        <div className="grid grid-cols-3 gap-3">
           <TelemetryCard label="Temp" value="42°C" color="text-emerald-400" />
           <TelemetryCard label="RPM" value="1200" color="text-blue-400" />
           <TelemetryCard label="Load" value="68%" color="text-blue-400" />
        </div>
      </main>
    </div>
  );
}

function TelemetryCard({ label, value, color }) {
  return (
    <div className="bg-slate-800 p-3 rounded-2xl border border-slate-700">
       <p className="text-[9px] text-slate-500 uppercase font-bold mb-1">{label}</p>
       <p className={`text-sm font-black ${color}`}>{value}</p>
    </div>
  );
}
