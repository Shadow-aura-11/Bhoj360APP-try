import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Users, Calendar, Activity, Clipboard, FlaskConical, Pill, CreditCard, Search, Plus } from 'lucide-react';
import { createApi } from '../../api/client';
import toast from 'react-hot-toast';

export default function HMSDashboard() {
  const { restaurantId } = useParams();
  const api = createApi(restaurantId);
  const [stats, setStats] = useState({ totalPatients: 0, appointmentsToday: 0, revenueToday: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/api/hms/analytics/summary');
        setStats(data);
      } catch (err) {
        console.error('Failed to fetch HMS stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [restaurantId]);

  const modules = [
    { title: 'Patients', icon: Users, count: stats.totalPatients, color: 'bg-blue-500', path: 'patients' },
    { title: 'Appointments', icon: Calendar, count: stats.appointmentsToday, color: 'bg-emerald-500', path: 'appointments' },
    { title: 'Clinical EMR', icon: Activity, count: null, color: 'bg-indigo-500', path: 'emr' },
    { title: 'Lab / Diagnostics', icon: FlaskConical, count: null, color: 'bg-purple-500', path: 'lab' },
    { title: 'Pharmacy', icon: Pill, count: null, color: 'bg-rose-500', path: 'pharmacy' },
    { title: 'Billing', icon: CreditCard, count: stats.revenueToday, color: 'bg-amber-500', path: 'billing', prefix: '₹' },
  ];

  return (
    <div className="p-6 md:p-10 bg-slate-50 min-h-screen font-body">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 font-display">Hospital Management System</h1>
        <p className="text-slate-500 text-sm">Welcome to the central clinical & operational dashboard.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((m) => (
          <div key={m.title} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all group cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-2xl ${m.color} text-white shadow-lg shadow-${m.color.split('-')[1]}-200`}>
                <m.icon className="w-6 h-6" />
              </div>
              <button className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors">
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <h3 className="text-lg font-bold text-slate-800">{m.title}</h3>
            <p className="text-slate-400 text-xs uppercase font-bold tracking-wider mt-1">
              {m.count !== null ? `${m.prefix || ''}${m.count} ${m.title === 'Billing' ? 'Today' : 'Registered'}` : 'Manage Module'}
            </p>
          </div>
        ))}
      </div>

      <section className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-800 font-display">Recent Activity</h2>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input type="text" placeholder="Search records..." className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 w-64" />
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="px-6 py-4">Event</th>
                <th className="px-6 py-4">Patient / Subject</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
              <tr>
                <td className="px-6 py-4 font-semibold text-slate-800">New Registration</td>
                <td className="px-6 py-4">John Doe</td>
                <td className="px-6 py-4">General OPD</td>
                <td className="px-6 py-4"><span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold">COMPLETED</span></td>
                <td className="px-6 py-4 text-right text-xs text-slate-400">10:45 AM</td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-semibold text-slate-800">Vitals Recorded</td>
                <td className="px-6 py-4">Jane Roe</td>
                <td className="px-6 py-4">Cardiology</td>
                <td className="px-6 py-4"><span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold">STABLE</span></td>
                <td className="px-6 py-4 text-right text-xs text-slate-400">10:30 AM</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
