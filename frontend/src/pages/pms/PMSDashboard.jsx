import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Building,
  Home,
  Users,
  FileText,
  DollarSign,
  Wrench,
  TrendingUp,
  PieChart,
  Clock,
  LayoutDashboard,
  ArrowRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart as RePieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import { createApi } from '../../api/client';
import toast from 'react-hot-toast';

export default function PMSDashboard() {
  const { tenantId } = useParams();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const api = createApi(tenantId);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/analytics/summary');
      setStats(data);
    } catch (err) {
      toast.error('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Properties', value: stats?.totalProperties || 0, icon: Building, color: 'blue', link: 'properties' },
    { label: 'Total Units', value: stats?.totalUnits || 0, icon: Home, color: 'indigo', link: 'properties' },
    { label: 'Occupancy', value: `${stats?.occupancyRate || 0}%`, icon: PieChart, color: 'emerald', link: 'leases' },
    { label: 'Total Tenants', value: stats?.totalTenants || 0, icon: Users, color: 'purple', link: 'leases' },
    { label: 'Total Revenue', value: `₹${stats?.totalRevenue?.toLocaleString() || 0}`, icon: DollarSign, color: 'amber', link: 'billing' },
    { label: 'Pending Invoices', value: stats?.pendingInvoices || 0, icon: FileText, color: 'rose', link: 'billing' },
    { label: 'Open Maintenance', value: stats?.openMaintenance || 0, icon: Wrench, color: 'orange', link: 'maintenance' },
  ];

  if (loading) return <div className="p-8 text-center text-slate-500 font-bold uppercase tracking-widest animate-pulse">Initializing PMS Dashboard...</div>;

  const revenueData = [
    { name: 'Mon', revenue: 4000 },
    { name: 'Tue', revenue: 3000 },
    { name: 'Wed', revenue: 2000 },
    { name: 'Thu', revenue: 2780 },
    { name: 'Fri', revenue: 1890 },
    { name: 'Sat', revenue: 2390 },
    { name: 'Sun', revenue: 3490 },
  ];

  const occupancyData = [
    { name: 'Occupied', value: stats?.occupiedUnits || 0 },
    { name: 'Vacant', value: (stats?.totalUnits || 0) - (stats?.occupiedUnits || 0) },
  ];

  const COLORS = ['#2563eb', '#f1f5f9'];

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <LayoutDashboard className="w-8 h-8 text-blue-600" />
          PMS Control Center
        </h1>
        <p className="text-slate-500 mt-1">Enterprise Property Management System Overview</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {statCards.map((stat, idx) => (
          <Link
            key={idx}
            to={`/r/${tenantId}/admin/pms/${stat.link}`}
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
            </div>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{stat.label}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Revenue Trend
            </h2>
            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueData}>
                        <defs>
                            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                                <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                        <YAxis hide />
                        <Tooltip
                            contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                            itemStyle={{fontSize: '12px', fontWeight: 'bold'}}
                        />
                        <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-blue-600" />
                Occupancy Breakdown
            </h2>
            <div className="h-64 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                        <Pie
                            data={occupancyData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {occupancyData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </RePieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-black text-slate-900">{stats?.occupancyRate}%</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Occupied</span>
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Recent Activity
          </h2>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">New Lease Signed</p>
                <p className="text-xs text-slate-500">Tenant John Doe moved into Unit 101, Tower A</p>
                <p className="text-[10px] text-slate-400 mt-1">2 hours ago</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                <DollarSign className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">Payment Received</p>
                <p className="text-xs text-slate-500">₹2,500 received for Invoice #INV-8299</p>
                <p className="text-[10px] text-slate-400 mt-1">5 hours ago</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
                <Wrench className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">New Maintenance Request</p>
                <p className="text-xs text-slate-500">Leaking tap reported in Unit 204</p>
                <p className="text-[10px] text-slate-400 mt-1">Yesterday</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <Link to={`/r/${tenantId}/admin/pms/properties`} className="p-4 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-colors text-center">
              <Building className="w-6 h-6 mx-auto mb-2 text-blue-500" />
              <span className="text-xs font-bold text-slate-700">Add Property</span>
            </Link>
            <Link to={`/r/${tenantId}/admin/pms/leases`} className="p-4 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-colors text-center">
              <Users className="w-6 h-6 mx-auto mb-2 text-purple-500" />
              <span className="text-xs font-bold text-slate-700">Onboard Tenant</span>
            </Link>
            <Link to={`/r/${tenantId}/admin/pms/billing`} className="p-4 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-colors text-center">
              <FileText className="w-6 h-6 mx-auto mb-2 text-rose-500" />
              <span className="text-xs font-bold text-slate-700">Raise Invoice</span>
            </Link>
            <Link to={`/r/${tenantId}/admin/pms/maintenance`} className="p-4 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-colors text-center">
              <Wrench className="w-6 h-6 mx-auto mb-2 text-orange-500" />
              <span className="text-xs font-bold text-slate-700">Work Order</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
