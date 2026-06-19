import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Layout, Play, Clock, CheckCircle, AlertTriangle, Settings } from 'lucide-react';
import { createApi } from '../../api/client';
import toast from 'react-hot-toast';

export default function ProductionPlanning() {
  const { tenantId } = useParams();
  const api = createApi(tenantId);
  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWorkOrders = async () => {
    try {
      const { data } = await api.get(`/r/${tenantId}/work-orders`);
      setWorkOrders(data);
    } catch (err) {
      toast.error('Failed to load work orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkOrders();
  }, [tenantId]);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/r/${tenantId}/work-orders/${id}/status`, { status });
      toast.success(`Status updated to ${status}`);
      fetchWorkOrders();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Settings className="text-indigo-600" /> Production Planning & Scheduling
        </h1>
        <p className="text-slate-500 text-sm">Monitor and control shop floor work orders</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-5 rounded-2xl shadow-sm border-l-4 border-blue-500">
          <p className="text-slate-500 text-xs font-bold uppercase">Active Work Orders</p>
          <p className="text-2xl font-bold mt-1">{workOrders.filter(w => w.status === 'In Progress').length}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border-l-4 border-amber-500">
          <p className="text-slate-500 text-xs font-bold uppercase">Pending</p>
          <p className="text-2xl font-bold mt-1">{workOrders.filter(w => w.status === 'Pending').length}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border-l-4 border-green-500">
          <p className="text-slate-500 text-xs font-bold uppercase">Completed Today</p>
          <p className="text-2xl font-bold mt-1">{workOrders.filter(w => w.status === 'Completed').length}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border-l-4 border-red-500">
          <p className="text-slate-500 text-xs font-bold uppercase">Blocked / Issues</p>
          <p className="text-2xl font-bold mt-1">0</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-slate-50/50 flex justify-between items-center">
          <h2 className="font-bold text-slate-800 uppercase text-xs tracking-wider">Live Production Queue</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
              <tr>
                <th className="p-4">WO Number</th>
                <th className="p-4">Item</th>
                <th className="p-4">Quantity</th>
                <th className="p-4">Priority</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {workOrders.map(wo => (
                <tr key={wo.id} className="hover:bg-slate-50 transition">
                  <td className="p-4 font-mono font-bold">{wo.wo_number}</td>
                  <td className="p-4">
                    <p className="font-bold text-slate-900">{wo.item_name}</p>
                    <p className="text-xs text-slate-400 font-mono">{wo.sku}</p>
                  </td>
                  <td className="p-4 font-mono">{wo.quantity}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold ${wo.priority > 1 ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
                      P{wo.priority}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
                      wo.status === 'In Progress' ? 'bg-blue-50 text-blue-700' :
                      wo.status === 'Completed' ? 'bg-green-50 text-green-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {wo.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      {wo.status === 'Pending' && (
                        <button
                          onClick={() => updateStatus(wo.id, 'In Progress')}
                          className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
                        >
                          <Play size={16} />
                        </button>
                      )}
                      {wo.status === 'In Progress' && (
                        <button
                          onClick={() => updateStatus(wo.id, 'Completed')}
                          className="p-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition"
                        >
                          <CheckCircle size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
