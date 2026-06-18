import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  ArrowDownLeft,
  ArrowUpRight,
  ClipboardList,
  CheckCircle2,
  Clock,
  Truck,
  User,
  PackageCheck,
  ChevronRight,
  Navigation
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function OperationsManager() {
  const { restaurantId } = useParams();
  const [tasks, setTasks] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tasks'); // 'tasks', 'inbound', 'outbound'

  useEffect(() => {
    fetchData();
  }, [restaurantId]);

  const fetchData = async () => {
    try {
      const [tasksRes, receiptsRes, shipmentsRes] = await Promise.all([
        fetch(`/r/${restaurantId}/tasks`),
        fetch(`/r/${restaurantId}/receipts`),
        fetch(`/r/${restaurantId}/shipments`)
      ]);

      setTasks(await tasksRes.json());
      setReceipts(await receiptsRes.json());
      setShipments(await shipmentsRes.json());
      setLoading(false);
    } catch (err) {
      toast.error('Failed to load operations data');
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'completed': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'in_progress': return 'bg-blue-50 text-blue-700 border-blue-100';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  if (loading) return <div className="p-10 text-center text-slate-500">Loading Operations...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Operations Center</h1>
          <p className="text-slate-500 text-sm">Real-time task execution and shipment tracking.</p>
        </div>
        <div className="flex gap-2">
           <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold shadow-sm hover:bg-emerald-700 transition-all">
            <ArrowDownLeft className="w-4 h-4" />
            New Receipt
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-sm hover:bg-blue-700 transition-all">
            <ArrowUpRight className="w-4 h-4" />
            New Shipment
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b border-slate-200">
        {[
          { id: 'tasks', label: 'Active Tasks', icon: ClipboardList },
          { id: 'inbound', label: 'Inbound / Receiving', icon: ArrowDownLeft },
          { id: 'outbound', label: 'Outbound / Shipping', icon: ArrowUpRight },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-bold transition-all border-b-2 -mb-[2px] ${
              activeTab === tab.id
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'tasks' && (
        <div className="space-y-4">
          {tasks.map((task) => (
            <div key={task.id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center gap-6 group hover:border-blue-200 transition-all">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border ${getStatusStyle(task.status)}`}>
                {task.type === 'picking' ? <PackageCheck className="w-7 h-7" /> : <Navigation className="w-7 h-7" />}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md">Task #{task.id}</span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${getStatusStyle(task.status)}`}>
                    {task.status.replace('_', ' ')}
                  </span>
                </div>
                <h3 className="font-bold text-slate-800">{task.type.toUpperCase()}: {task.item_name}</h3>
                <div className="flex flex-wrap items-center gap-y-2 gap-x-4 mt-2 text-xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {new Date(task.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5" /> {task.staff_name || 'Unassigned'}
                  </div>
                  <div className="font-bold text-blue-600">
                    Qty: {task.quantity}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <div className="text-center px-3">
                  <p className="text-[9px] font-bold text-slate-400 uppercase">From</p>
                  <p className="text-sm font-bold text-slate-700 font-mono">{task.from_code || '---'}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300" />
                <div className="text-center px-3">
                  <p className="text-[9px] font-bold text-slate-400 uppercase">To</p>
                  <p className="text-sm font-bold text-slate-700 font-mono">{task.to_code || '---'}</p>
                </div>
              </div>

              <div className="shrink-0">
                {task.status === 'pending' && (
                  <button className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200">
                    Start Task
                  </button>
                )}
                {task.status === 'in_progress' && (
                  <button className="w-full md:w-auto px-6 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-200">
                    Complete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {(activeTab === 'inbound' || activeTab === 'outbound') && (
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Reference #</th>
                <th className="px-6 py-4">{activeTab === 'inbound' ? 'Supplier' : 'Customer'}</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(activeTab === 'inbound' ? receipts : shipments).map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 font-bold text-slate-800 font-mono">
                    {activeTab === 'inbound' ? row.receipt_number : row.shipment_number}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {activeTab === 'inbound' ? row.supplier_name : row.customer_name}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border ${getStatusStyle(row.status)}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-400">
                    {new Date(row.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-blue-600 font-bold text-xs hover:underline">View Details</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
