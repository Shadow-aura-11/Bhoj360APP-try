import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Scan,
  Package,
  ArrowRightLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Camera,
  Keyboard,
  LogOut,
  User,
  AlertCircle,
  Menu
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function MobileScanner() {
  const { restaurantId } = useParams();
  const [activeTask, setActiveTask] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState('menu'); // 'menu' | 'scan' | 'detail'

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const { data } = await axios.get(`/r/${restaurantId}/wms/tasks`);
        setTasks(data);
      } catch (err) {
        console.error('Failed to fetch tasks', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [restaurantId]);

  const handleCompleteTask = async (taskId) => {
    try {
      await axios.post(`/r/${restaurantId}/wms/tasks/${taskId}/complete`, { units_processed: activeTask.quantity });
      toast.success('Task Completed Successfully');
      setTasks(prev => prev.filter(t => t.id !== taskId));
      setActiveTask(null);
      setMode('menu');
    } catch (err) {
      toast.error('Failed to complete task');
    }
  };

  if (mode === 'menu') {
    return (
      <div className="min-h-screen bg-slate-900 text-white font-sans flex flex-col">
        <header className="p-4 flex justify-between items-center bg-slate-800 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Scan className="text-indigo-400" size={20} />
            <h1 className="font-bold text-sm tracking-tight">WMS MOBILE</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <User size={12} /> OP-104
            </span>
            <button className="text-slate-400 hover:text-white"><LogOut size={18} /></button>
          </div>
        </header>

        <main className="flex-1 p-4 space-y-4 overflow-y-auto">
          <div className="bg-indigo-600 rounded-2xl p-6 shadow-lg shadow-indigo-500/20">
            <h2 className="text-xl font-black mb-1">Queue Stream</h2>
            <p className="text-xs text-indigo-200 font-bold uppercase tracking-widest">{tasks.length} Assigned Tasks</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => setMode('scan')} className="bg-slate-800 p-6 rounded-2xl border border-white/5 flex flex-col items-center gap-3 active:scale-95 transition-all">
              <div className="p-3 bg-white/5 rounded-xl"><Scan size={24} className="text-indigo-400" /></div>
              <span className="text-[10px] font-black uppercase tracking-widest">Rapid Scan</span>
            </button>
            <button className="bg-slate-800 p-6 rounded-2xl border border-white/5 flex flex-col items-center gap-3 active:scale-95 transition-all">
              <div className="p-3 bg-white/5 rounded-xl"><Package size={24} className="text-emerald-400" /></div>
              <span className="text-[10px] font-black uppercase tracking-widest">Inquiry</span>
            </button>
          </div>

          <div className="space-y-2 pt-4">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Current Task List</h3>
            {tasks.map((task, i) => (
              <button
                key={i}
                onClick={() => { setActiveTask(task); setMode('detail'); }}
                className="w-full bg-slate-800/50 border border-white/5 rounded-2xl p-4 flex items-center justify-between text-left active:bg-slate-800"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${task.type === 'Picking' ? 'bg-indigo-500' : 'bg-emerald-500'}`} />
                    <h4 className="font-bold text-sm">{task.type}</h4>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 font-mono uppercase">{task.sku} • {task.product_name}</p>
                </div>
                <ChevronRight className="text-slate-600" size={20} />
              </button>
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (mode === 'detail' && activeTask) {
    return (
      <div className="min-h-screen bg-slate-900 text-white font-sans flex flex-col">
        <header className="p-4 flex items-center gap-4 bg-slate-800 border-b border-white/10">
          <button onClick={() => setMode('menu')} className="p-1"><ChevronLeft size={24} /></button>
          <div>
            <h1 className="font-bold text-sm uppercase tracking-widest">{activeTask.type}</h1>
            <p className="text-[10px] text-slate-400 font-mono">TID-{activeTask.id}</p>
          </div>
        </header>

        <main className="flex-1 p-6 space-y-8">
          <div className="text-center space-y-2">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Current Instruction</p>
            <h2 className="text-4xl font-black tracking-tighter">
              {activeTask.type === 'Picking' ? `PICK ${activeTask.quantity}` : `STORE ${activeTask.quantity}`}
            </h2>
            <p className="text-indigo-400 font-bold">{activeTask.product_name}</p>
          </div>

          <div className="bg-slate-800 rounded-3xl p-6 border border-white/5 flex flex-col items-center text-center">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Location Target</span>
            <div className="w-20 h-20 bg-indigo-600/20 rounded-full flex items-center justify-center mb-4 border border-indigo-500/20">
               <ArrowRightLeft className="text-indigo-400" size={32} />
            </div>
            <h3 className="text-3xl font-black font-mono tracking-widest">{activeTask.type === 'Picking' ? activeTask.from_bin : activeTask.to_bin}</h3>
            <p className="text-xs text-slate-400 mt-1">Aisle 4 • Section B • Shelf 2</p>
          </div>

          <div className="space-y-4">
             <button className="w-full py-5 bg-white text-slate-900 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-all">
               <Scan size={20} /> Scan Item Barcode
             </button>
             <button onClick={() => handleCompleteTask(activeTask.id)} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-all">
               <CheckCircle2 size={20} /> Confirm Action
             </button>
          </div>
        </main>

        <footer className="p-4 grid grid-cols-3 gap-2 bg-slate-800 border-t border-white/10">
           <button className="flex flex-col items-center gap-1 text-slate-400 py-2"><Camera size={20} /><span className="text-[8px] font-bold uppercase tracking-widest">Photo</span></button>
           <button className="flex flex-col items-center gap-1 text-slate-400 py-2"><Keyboard size={20} /><span className="text-[8px] font-bold uppercase tracking-widest">Key-in</span></button>
           <button className="flex flex-col items-center gap-1 text-rose-400 py-2"><AlertCircle size={20} /><span className="text-[8px] font-bold uppercase tracking-widest">Dispute</span></button>
        </footer>
      </div>
    );
  }

  if (mode === 'scan') {
    return (
      <div className="min-h-screen bg-black text-white font-sans flex flex-col relative overflow-hidden">
        <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 via-black to-black opacity-50" />

        <header className="relative z-10 p-4 flex items-center justify-between bg-black/40 backdrop-blur-md border-b border-white/10">
          <button onClick={() => setMode('menu')} className="p-1"><ChevronLeft size={24} /></button>
          <span className="font-bold text-sm tracking-widest uppercase italic">Active Scanner</span>
          <div className="w-6" />
        </header>

        <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-8">
           <div className="w-full aspect-square max-w-xs relative mb-12">
              {/* Scanner Simulation Graphics */}
              <div className="absolute inset-0 border-2 border-indigo-500/30 rounded-3xl" />
              <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-indigo-500 rounded-tl-3xl" />
              <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-indigo-500 rounded-tr-3xl" />
              <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-indigo-500 rounded-bl-3xl" />
              <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-indigo-500 rounded-br-3xl" />

              <div className="absolute inset-x-8 top-1/2 h-0.5 bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.8)] animate-scanner-line" />

              <div className="absolute inset-0 flex items-center justify-center">
                 <Scan size={64} className="text-white/10" />
              </div>
           </div>

           <div className="text-center space-y-4">
              <h2 className="text-lg font-bold tracking-widest animate-pulse uppercase">Align Barcode</h2>
              <p className="text-xs text-slate-400 max-w-[200px] mx-auto leading-relaxed">System will automatically capture and decode standard EAN-13 / QR formats.</p>
           </div>
        </main>

        <div className="relative z-10 p-10 bg-gradient-to-t from-black to-transparent flex justify-center">
           <button onClick={() => toast('Simulation: Barcode Captured')} className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center shadow-2xl shadow-indigo-500/50 active:scale-90 transition-all">
             <div className="w-16 h-16 border-2 border-white/20 rounded-full" />
           </button>
        </div>

        <style>{`
          @keyframes scan {
            0%, 100% { top: 10%; }
            50% { top: 90%; }
          }
          .animate-scanner-line {
            animation: scan 2s ease-in-out infinite;
            position: absolute;
          }
        `}</style>
      </div>
    );
  }

  return null;
}
