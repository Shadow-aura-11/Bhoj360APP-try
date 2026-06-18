import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FlaskConical, Search, Plus, ArrowLeft, Beaker, FileText, CheckCircle2, Clock } from 'lucide-react';
import { createApi } from '../../api/client';
import toast from 'react-hot-toast';

export default function Lab() {
  const { restaurantId } = useParams();
  const api = createApi(restaurantId);
  const [labOrders, setLabOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Since we don't have a specific lab orders endpoint in routes.js yet beyond the schema
  // We'll mock some for the UI demonstration if the real ones aren't there
  const fetchLabOrders = async () => {
    try {
      // For now, using a try-catch to handle potential 404 if the endpoint is not fully realized
      // Real implementation should be added to routes.js
      setLabOrders([
        { id: 1, patient_name: 'John Doe', test_name: 'Complete Blood Count (CBC)', status: 'pending', ordered_at: new Date().toISOString() },
        { id: 2, patient_name: 'Jane Roe', test_name: 'Lipid Profile', status: 'completed', ordered_at: new Date().toISOString() },
        { id: 3, patient_name: 'Alice Wonderland', test_name: 'Thyroid Function Test', status: 'processing', ordered_at: new Date().toISOString() },
      ]);
      setLoading(false);
    } catch (err) {
      toast.error('Failed to load lab orders');
    }
  };

  useEffect(() => {
    fetchLabOrders();
  }, [restaurantId]);

  return (
    <div className="p-6 md:p-10 bg-slate-50 min-h-screen font-body">
      <div className="flex items-center gap-4 mb-8">
        <Link to={`/r/${restaurantId}/hms`} className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 font-display">Laboratory & Diagnostics</h1>
          <p className="text-slate-500 text-sm">Manage diagnostic tests and sample processing.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        {[
          { label: 'Pending Samples', count: 12, icon: Beaker, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'In Processing', count: 5, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Ready Reports', count: 28, icon: FileText, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Urgent/STAT', count: 2, icon: CheckCircle2, color: 'text-red-600', bg: 'bg-red-50' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
              <p className="text-xl font-black text-slate-800 font-display">{stat.count}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-800">Active Test Orders</h3>
          <button className="text-xs font-bold text-blue-600 hover:underline">View All History</button>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <th className="px-6 py-4">Order ID</th>
              <th className="px-6 py-4">Patient</th>
              <th className="px-6 py-4">Test Description</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
            {labOrders.map(order => (
              <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 font-mono text-xs font-bold text-blue-600">LAB-{order.id.toString().padStart(4, '0')}</td>
                <td className="px-6 py-4 font-bold text-slate-800">{order.patient_name}</td>
                <td className="px-6 py-4">{order.test_name}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    order.status === 'completed' ? 'bg-emerald-50 text-emerald-600' :
                    order.status === 'processing' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold transition-colors">Update Status</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
