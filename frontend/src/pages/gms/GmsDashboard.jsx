import React, { useState, useEffect } from 'react';
import {
  Users,
  CreditCard,
  Calendar,
  TrendingUp,
  CheckCircle,
  DollarSign,
  Activity,
  AlertCircle
} from 'lucide-react';
import { useParams } from 'react-router-dom';
import { createApi } from '../../api/client';
import toast from 'react-hot-toast';

const GmsDashboard = () => {
  const { gymId } = useParams();
  const api = createApi(gymId);
  const [stats, setStats] = useState({
    activeMembers: 0,
    checkinsToday: 0,
    revenueMonth: 0
  });
  const [recentAttendance, setRecentAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, attendanceRes] = await Promise.all([
          api.get('/analytics/overview'),
          api.get('/attendance/today')
        ]);
        setStats({
          activeMembers: statsRes.data.activeMembers || 0,
          checkinsToday: statsRes.data.checkinsToday || 0,
          revenueMonth: statsRes.data.revenueMonth || 0
        });
        setRecentAttendance(attendanceRes.data || []);
      } catch (err) {
        toast.error("Failed to load dashboard metrics");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();

    // Refresh every 30s
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, [gymId]);

  if (loading) return <div className="p-8 animate-pulse text-slate-400 font-bold">Loading GMS Dashboard...</div>;

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Gym Management Dashboard</h1>
          <p className="text-slate-500">Live operational overview for Gym #{gymId}.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { label: 'Active Members', value: stats.activeMembers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
          { label: 'Check-ins Today', value: stats.checkinsToday, icon: Activity, color: 'text-orange-600', bg: 'bg-orange-100' },
          { label: 'Revenue (MTD)', value: `$${stats.revenueMonth.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-100' }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-start mb-4">
              <div className={`${stat.bg} p-3 rounded-lg`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">{stat.label}</p>
              <h3 className="text-2xl font-bold text-slate-800">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Attendance Area */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Today's Attendance</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 text-sm">
                  <th className="pb-3 font-medium">Member</th>
                  <th className="pb-3 font-medium">Check-in Time</th>
                  <th className="pb-3 font-medium">Method</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentAttendance.length > 0 ? recentAttendance.map((log, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition">
                    <td className="py-4 font-medium text-slate-700">{log.full_name}</td>
                    <td className="py-4 text-slate-500">{new Date(log.check_in).toLocaleTimeString()}</td>
                    <td className="py-4 uppercase text-[10px] font-bold text-slate-400">{log.method}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="3" className="py-8 text-center text-slate-400 italic">No check-ins today yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Alerts Sidebar */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Operational Alerts</h3>
          <div className="space-y-4">
            <div className="p-4 bg-amber-50 border-l-4 border-amber-500 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <p className="text-sm font-bold text-amber-800">Payment Collection</p>
              </div>
              <p className="text-xs text-amber-700">5 Memberships are expiring in the next 3 days.</p>
            </div>
            <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Activity className="w-4 h-4 text-blue-600" />
                <p className="text-sm font-bold text-blue-800">Peak Hours</p>
              </div>
              <p className="text-xs text-blue-700">Gym is currently at 85% capacity. Monitor floor space.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GmsDashboard;
