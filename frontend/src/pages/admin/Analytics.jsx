import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  BarChart3, TrendingUp, DollarSign, ShoppingBag, Eye, RefreshCw,
  Layers, Users, Clock, CreditCard, Star, Zap, ChefHat, TrendingDown,
  Activity, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { createApi } from '../../api/client';
import DashboardShell from '../../components/Layout/DashboardShell';
import toast from 'react-hot-toast';
import { parseOrderDate } from '../../utils/date';
import {
  AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, RadarChart,
  PolarGrid, PolarAngleAxis, Radar,
} from 'recharts';

const PIE_COLORS = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#64748b', '#ec4899', '#14b8a6'];
const STATUS_COLORS = { PAID: '#10b981', SERVED: '#3b82f6', PREPARING: '#f59e0b', PENDING: '#ef4444', CANCELLED: '#94a3b8' };

const KPICard = ({ label, value, sub, icon: Icon, color, trend, trendLabel }) => (
  <div className={`bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex flex-col gap-2 hover:shadow-md transition-shadow`}>
    <div className="flex items-center justify-between">
      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{label}</span>
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
    </div>
    <span className="text-2xl font-bold font-mono text-slate-800">{value}</span>
    {sub && <span className="text-[9px] font-medium text-slate-400 font-mono">{sub}</span>}
    {trend !== undefined && (
      <div className={`flex items-center gap-1 text-[10px] font-semibold ${trend >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
        {trend >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
        {Math.abs(trend)}% {trendLabel}
      </div>
    )}
  </div>
);

export default function Analytics() {
  const { restaurantId } = useParams();
  const api = createApi(restaurantId);

  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('week');
  const [revenueData, setRevenueData] = useState([]);
  const [popularItems, setPopularItems] = useState([]);
  const [orderStatusData, setOrderStatusData] = useState([]);
  const [tableUtilization, setTableUtilization] = useState([]);
  const [hourlyTraffic, setHourlyTraffic] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [staffPerformance, setStaffPerformance] = useState([]);
  const [kpis, setKpis] = useState({
    today: 0, cashRevenue: 0, onlineRevenue: 0, week: 0, month: 0,
    allTime: 0, totalOrders: 0, avgOrderValue: 0, paidOrders: 0,
    pendingOrders: 0, cancelledOrders: 0, avgPrepTime: 0,
  });

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const { data: summary } = await api.get('/analytics/summary');
      const { data: revData } = await api.get('/analytics/revenue', { params: { period } });
      setRevenueData(revData);

      const { data: popular } = await api.get('/analytics/popular');
      setPopularItems(popular.slice(0, 8));

      const { data: orders } = await api.get('/orders');

      // Status breakdown
      const statusCounts = {};
      orders.forEach(o => { statusCounts[o.status] = (statusCounts[o.status] || 0) + 1; });
      setOrderStatusData(Object.entries(statusCounts).map(([status, value]) => ({
        name: status.toUpperCase(), value, fill: STATUS_COLORS[status.toUpperCase()] || '#94a3b8'
      })));

      // Table utilization
      const tableCounts = {};
      orders.forEach(o => {
        const tbl = o.table_number || `T${o.table_id}`;
        tableCounts[tbl] = (tableCounts[tbl] || 0) + 1;
      });
      setTableUtilization(Object.entries(tableCounts)
        .map(([name, ordersCount]) => ({ name, ordersCount }))
        .sort((a, b) => b.ordersCount - a.ordersCount)
        .slice(0, 8));

      // Hourly traffic
      const hourlyCounts = Array.from({ length: 15 }, (_, i) => {
        const hour = i + 9;
        return { hour: `${hour}:00`, ordersCount: 0, revenue: 0 };
      });
      orders.forEach(o => {
        if (o.created_at) {
          const hour = parseOrderDate(o.created_at).getHours();
          const slot = hourlyCounts.find(hc => hc.hour.startsWith(`${hour}:`));
          if (slot) {
            slot.ordersCount++;
            slot.revenue += o.total || 0;
          }
        }
      });
      setHourlyTraffic(hourlyCounts);

      // Payment methods breakdown
      const payMethods = {};
      orders.filter(o => o.status === 'paid').forEach(o => {
        const method = (o.payment_method || 'unknown').toUpperCase();
        payMethods[method] = (payMethods[method] || 0) + 1;
      });
      setPaymentMethods(Object.entries(payMethods).map(([name, value]) => ({ name, value })));

      // Staff performance (by waiter name)
      const staffOrders = {};
      const staffRevenue = {};
      orders.forEach(o => {
        if (o.waiter_name) {
          staffOrders[o.waiter_name] = (staffOrders[o.waiter_name] || 0) + 1;
          staffRevenue[o.waiter_name] = (staffRevenue[o.waiter_name] || 0) + (o.total || 0);
        }
      });
      setStaffPerformance(Object.entries(staffOrders)
        .map(([name, orders]) => ({ name, orders, revenue: Math.round(staffRevenue[name] || 0) }))
        .sort((a, b) => b.orders - a.orders)
        .slice(0, 6));

      // Compute KPIs
      const paidOrders = orders.filter(o => o.status === 'paid');
      const totalRevenue = paidOrders.reduce((s, o) => s + (o.total || 0), 0);
      const avgOrderValue = paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0;

      // Avg prep time
      let totalMins = 0;
      const closedOrders = orders.filter(o => o.status === 'served' || o.status === 'paid');
      closedOrders.forEach(o => {
        const created = parseOrderDate(o.created_at);
        const updated = parseOrderDate(o.updated_at);
        const mins = Math.floor((updated - created) / 60000);
        totalMins += mins > 0 ? mins : 10;
      });

      setKpis({
        today: summary.revenue || 0,
        cashRevenue: summary.cashRevenue || 0,
        onlineRevenue: summary.onlineRevenue || 0,
        week: revData.reduce((sum, d) => sum + (d.revenue || 0), 0) || 0,
        month: summary.monthRevenue || 0,
        allTime: summary.allTimeRevenue || 0,
        totalOrders: orders.length,
        avgOrderValue: Math.round(avgOrderValue),
        paidOrders: paidOrders.length,
        pendingOrders: orders.filter(o => o.status === 'pending').length,
        cancelledOrders: orders.filter(o => o.status === 'cancelled').length,
        avgPrepTime: closedOrders.length > 0 ? Math.round(totalMins / closedOrders.length) : 0,
      });

    } catch (err) {
      console.error(err);
      toast.error('Failed to load analytics charts');
      // Mock fallbacks
      setRevenueData([
        { date: 'Mon', revenue: 1200 }, { date: 'Tue', revenue: 1900 },
        { date: 'Wed', revenue: 3400 }, { date: 'Thu', revenue: 2200 },
        { date: 'Fri', revenue: 4900 }, { date: 'Sat', revenue: 6800 }, { date: 'Sun', revenue: 5400 },
      ]);
      setPopularItems([
        { item_name: 'Grilled Chicken', order_count: 45 }, { item_name: 'Pasta Arrabiata', order_count: 38 },
        { item_name: 'Veg Biryani', order_count: 32 }, { item_name: 'Gulab Jamun', order_count: 28 },
        { item_name: 'Cold Coffee', order_count: 24 }, { item_name: 'Paneer Tikka', order_count: 19 },
      ]);
      setOrderStatusData([
        { name: 'PAID', value: 34, fill: '#10b981' }, { name: 'SERVED', value: 12, fill: '#3b82f6' },
        { name: 'PREPARING', value: 6, fill: '#f59e0b' }, { name: 'PENDING', value: 4, fill: '#ef4444' },
      ]);
      setTableUtilization([
        { name: 'T1', ordersCount: 18 }, { name: 'VIP-1', ordersCount: 15 },
        { name: 'T2', ordersCount: 12 }, { name: 'O1', ordersCount: 9 },
        { name: 'T3', ordersCount: 7 }, { name: 'T4', ordersCount: 5 },
      ]);
      setHourlyTraffic(Array.from({ length: 15 }, (_, i) => ({
        hour: `${i + 9}:00`, ordersCount: Math.floor(Math.random() * 10), revenue: Math.floor(Math.random() * 3000),
      })));
      setPaymentMethods([
        { name: 'CASH', value: 24 }, { name: 'UPI', value: 18 }, { name: 'CARD', value: 8 }, { name: 'SPLIT', value: 6 },
      ]);
      setStaffPerformance([
        { name: 'Rahul', orders: 34, revenue: 42000 }, { name: 'Priya', orders: 28, revenue: 36000 },
        { name: 'Arjun', orders: 22, revenue: 28000 },
      ]);
      setKpis({ today: 6800, cashRevenue: 3200, onlineRevenue: 3600, week: 25400, month: 96000, allTime: 450000, totalOrders: 56, avgOrderValue: 485, paidOrders: 46, pendingOrders: 4, cancelledOrders: 2, avgPrepTime: 18 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (restaurantId) loadAnalytics(); }, [restaurantId, period]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-lg text-xs">
          <p className="font-bold text-slate-700 mb-1">{label}</p>
          {payload.map((p, i) => (
            <p key={i} style={{ color: p.color }} className="font-mono">
              {p.name}: {p.name === 'revenue' || p.name === 'Revenue' ? `₹${p.value?.toLocaleString('en-IN')}` : p.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <DashboardShell title="Analytics" restaurantId={restaurantId} role="admin">
      <div className="space-y-6">

        {/* Control Row */}
        <div className="flex items-center justify-between bg-white border border-slate-200 p-4 rounded-3xl shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 pl-2">
            <BarChart3 className="w-4.5 h-4.5 text-indigo-600" />
            Performance Intelligence Dashboard
          </h2>
          <div className="flex items-center gap-2">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer font-semibold"
            >
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
            <button
              onClick={loadAnalytics}
              className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-slate-800 border border-slate-200 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* KPIs Grid - 4x2 */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <KPICard label="Today's Revenue" value={`₹${kpis.today.toLocaleString('en-IN')}`} sub={`Cash: ₹${kpis.cashRevenue} | UPI: ₹${kpis.onlineRevenue}`} icon={DollarSign} color="bg-emerald-100 text-emerald-600" />
          <KPICard label="This Week" value={`₹${kpis.week.toLocaleString('en-IN')}`} icon={TrendingUp} color="bg-blue-100 text-blue-600" />
          <KPICard label="This Month" value={`₹${kpis.month.toLocaleString('en-IN')}`} icon={Activity} color="bg-violet-100 text-violet-600" />
          <KPICard label="All Time" value={`₹${kpis.allTime.toLocaleString('en-IN')}`} icon={Star} color="bg-amber-100 text-amber-600" />
          <KPICard label="Total Orders" value={kpis.totalOrders} sub={`${kpis.paidOrders} paid · ${kpis.pendingOrders} pending · ${kpis.cancelledOrders} cancelled`} icon={ShoppingBag} color="bg-slate-100 text-slate-600" />
          <KPICard label="Avg Order Value" value={`₹${kpis.avgOrderValue}`} icon={CreditCard} color="bg-rose-100 text-rose-600" />
          <KPICard label="Avg Prep Time" value={`${kpis.avgPrepTime} min`} icon={Clock} color="bg-orange-100 text-orange-600" />
          <KPICard label="Settlement Rate" value={kpis.totalOrders > 0 ? `${Math.round((kpis.paidOrders / kpis.totalOrders) * 100)}%` : '—'} icon={Zap} color="bg-teal-100 text-teal-600" />
        </section>

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton h-72 rounded-3xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Chart 1: Revenue Trend */}
            <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
              <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                Revenue Trend ({period === 'week' ? 'Last 7 Days' : 'Last 30 Days'})
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} />
                    <YAxis stroke="#94a3b8" fontSize={10} tickFormatter={(v) => `₹${v >= 1000 ? (v/1000).toFixed(1)+'k' : v}`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#revGrad)" dot={{ r: 3, fill: '#6366f1' }} activeDot={{ r: 5 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Top Menu Items */}
            <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
              <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-1.5">
                <ChefHat className="w-4 h-4 text-amber-600" />
                Top Menu Items (By Order Volume)
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={popularItems} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                    <XAxis type="number" stroke="#94a3b8" fontSize={10} />
                    <YAxis dataKey="item_name" type="category" stroke="#94a3b8" fontSize={10} width={90} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="order_count" name="Orders" fill="#f59e0b" radius={[0, 6, 6, 0]} barSize={16} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 3: Order Status Breakdown */}
            <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
              <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-indigo-600" />
                Order Status Distribution
              </h3>
              <div className="h-64 flex items-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={orderStatusData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                      {orderStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill || PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: 11 }} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 4: Hourly Traffic */}
            <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
              <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-rose-600" />
                Hourly Traffic & Revenue (9am–11pm)
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={hourlyTraffic} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="hour" stroke="#94a3b8" fontSize={9} interval={2} />
                    <YAxis yAxisId="orders" stroke="#94a3b8" fontSize={10} />
                    <YAxis yAxisId="rev" orientation="right" stroke="#94a3b8" fontSize={10} tickFormatter={(v) => `₹${v >= 1000 ? (v/1000).toFixed(0)+'k' : v}`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line yAxisId="orders" type="monotone" dataKey="ordersCount" name="Orders" stroke="#ef4444" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                    <Line yAxisId="rev" type="monotone" dataKey="revenue" name="Revenue" stroke="#6366f1" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 5: Table Utilization */}
            <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
              <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-600" />
                Table Seating Utilization (Top 8)
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={tableUtilization} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="ordersCount" name="Orders" fill="#10b981" radius={[6, 6, 0, 0]} barSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 6: Payment Methods */}
            <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
              <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-blue-600" />
                Payment Method Breakdown
              </h3>
              {paymentMethods.length > 0 ? (
                <div className="h-64 flex items-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={paymentMethods} cx="50%" cy="50%" outerRadius={85} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} fontSize={10}>
                        {paymentMethods.map((_, index) => (
                          <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: 11 }} />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-slate-400 text-sm">No payment data available</div>
              )}
            </div>

            {/* Staff Performance Table */}
            {staffPerformance.length > 0 && (
              <div className="lg:col-span-2 bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
                <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-violet-600" />
                  Staff Performance Leaderboard
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="text-left py-2 px-3 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Rank</th>
                        <th className="text-left py-2 px-3 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Staff Member</th>
                        <th className="text-right py-2 px-3 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Orders Served</th>
                        <th className="text-right py-2 px-3 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Revenue Generated</th>
                        <th className="text-right py-2 px-3 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Contribution</th>
                      </tr>
                    </thead>
                    <tbody>
                      {staffPerformance.map((staff, index) => {
                        const totalOrders = staffPerformance.reduce((s, st) => s + st.orders, 0);
                        const pct = totalOrders > 0 ? Math.round((staff.orders / totalOrders) * 100) : 0;
                        return (
                          <tr key={index} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                            <td className="py-3 px-3">
                              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${index === 0 ? 'bg-amber-100 text-amber-700' : index === 1 ? 'bg-slate-100 text-slate-600' : 'bg-orange-50 text-orange-600'}`}>
                                {index + 1}
                              </span>
                            </td>
                            <td className="py-3 px-3 font-semibold text-slate-800">{staff.name}</td>
                            <td className="py-3 px-3 text-right font-mono text-slate-700">{staff.orders}</td>
                            <td className="py-3 px-3 text-right font-mono font-semibold text-emerald-600">₹{staff.revenue.toLocaleString('en-IN')}</td>
                            <td className="py-3 px-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <div className="w-20 bg-slate-100 rounded-full h-1.5">
                                  <div className="bg-violet-500 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                                </div>
                                <span className="text-[10px] font-semibold text-slate-500 w-8">{pct}%</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Insights Panel */}
            <div className="lg:col-span-2 bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 p-6 rounded-3xl">
              <h3 className="text-sm font-semibold text-indigo-800 mb-4 flex items-center gap-1.5">
                <Eye className="w-4 h-4" />
                AI-Ready Insights & Observations
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white/80 border border-indigo-100 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-bold text-slate-700">Best Selling Item</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-800">{popularItems[0]?.item_name || '—'}</p>
                  <p className="text-[10px] text-slate-500 mt-1">{popularItems[0]?.order_count || 0} orders logged</p>
                </div>
                <div className="bg-white/80 border border-indigo-100 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-rose-500" />
                    <span className="text-xs font-bold text-slate-700">Peak Hour</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-800">
                    {hourlyTraffic.length > 0 ? hourlyTraffic.reduce((a, b) => a.ordersCount > b.ordersCount ? a : b).hour : '—'}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1">Highest order volume in this slot</p>
                </div>
                <div className="bg-white/80 border border-indigo-100 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Layers className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs font-bold text-slate-700">Top Table</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-800">{tableUtilization[0]?.name || '—'}</p>
                  <p className="text-[10px] text-slate-500 mt-1">{tableUtilization[0]?.ordersCount || 0} orders served at this table</p>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </DashboardShell>
  );
}
