import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Truck,
  ArrowDownLeft,
  ArrowUpRight,
  Users,
  AlertCircle,
  BarChart3,
  Settings,
  Activity,
  Box,
  MapPin,
  TrendingUp,
  Brain
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function WMOSDashboard() {
  const { tenantId } = useParams();
  const [stats, setStats] = useState({
    inventoryCount: 0,
    pendingTasks: 0,
    activeDocks: 0,
    todayThroughput: 0
  });
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch base stats
        const response = await fetch(`/r/${tenantId}/analytics/summary`);
        const data = await response.json();
        setStats(data);

        // Fetch AI Forecast
        const forecastRes = await fetch(`/r/${tenantId}/ai/forecast-labor`, {
          headers: { 'x-role': 'admin', 'x-pin': '1111' } // simplified for demo
        });
        if (forecastRes.ok) {
          const forecastData = await forecastRes.json();
          setForecast(forecastData);
        }

        setLoading(false);
      } catch (err) {
        console.error('Failed to load dashboard data');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [tenantId]);

  if (loading) {
    return <div className="p-10 text-center">Loading Warehouse Dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <LayoutDashboard className="text-blue-600" />
            WMOS Control Center
          </h1>
          <p className="text-slate-500 text-sm">Warehouse Management & Operations System</p>
        </div>
        <div className="flex gap-3">
          <Link to={`/r/${tenantId}/admin/settings`} className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            <Settings className="w-5 h-5 text-slate-600" />
          </Link>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Items in Stock</p>
              <h3 className="text-2xl font-bold text-slate-800">{stats.revenue || 0}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Pending Tasks</p>
              <h3 className="text-2xl font-bold text-slate-800">{stats.ordersCount || 0}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Active Docks</p>
              <h3 className="text-2xl font-bold text-slate-800">{stats.activeDocks || 0}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Capacity Utilization</p>
              <h3 className="text-2xl font-bold text-slate-800">74%</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Navigation Sections */}
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link to={`/r/${tenantId}/warehouse/inventory`} className="group bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:border-blue-200 transition-all hover:shadow-md">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Box className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Inventory Manager</h3>
              <p className="text-slate-500 text-sm">Manage SKUs, locations, and cycle counting operations.</p>
            </Link>

            <Link to={`/r/${tenantId}/warehouse/operations`} className="group bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:border-emerald-200 transition-all hover:shadow-md">
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <Activity className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Operations Center</h3>
              <p className="text-slate-500 text-sm">Execute receiving, picking, packing, and shipping tasks.</p>
            </Link>

            <Link to={`/r/${tenantId}/warehouse/logistics`} className="group bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:border-indigo-200 transition-all hover:shadow-md">
              <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <Truck className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Yard & Dock</h3>
              <p className="text-slate-500 text-sm">Real-time tracking of trailers, yard spots, and dock assignments.</p>
            </Link>

            <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-3xl shadow-sm text-white">
              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-blue-400 mb-6">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Labor Management</h3>
              <p className="text-slate-400 text-sm">Track performance, assignments, and labor forecasting.</p>
            </div>
          </div>
        </div>

        {/* AI Insights Sidebar */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Brain className="text-blue-600 w-5 h-5" />
              AI Insights
            </h3>

            {forecast ? (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-2xl">
                  <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">Labor Forecast</p>
                  <p className="text-sm text-slate-700 font-medium">Recommended Staff for Today:</p>
                  <div className="flex items-end gap-2 mt-1">
                    <span className="text-3xl font-bold text-slate-900">{forecast.recommended_staff_count}</span>
                    <span className="text-sm text-slate-500 mb-1">Operators</span>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-xs text-blue-600 font-medium">
                    <TrendingUp className="w-3 h-3" />
                    Based on {forecast.pending_receipts + forecast.pending_shipments} pending operations
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Route Optimization</p>
                  <p className="text-sm text-slate-700">S-Shape picking routes enabled. Avg travel time reduced by 14%.</p>
                </div>
              </div>
            ) : (
              <p className="text-slate-400 text-sm text-center py-10 italic">Initializing AI models...</p>
            )}
          </div>

          <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100">
            <h3 className="text-amber-800 font-bold flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5" />
              Inventory Alerts
            </h3>
            <ul className="space-y-2">
              <li className="text-sm text-amber-700 flex justify-between">
                <span>Low Stock: SKU-9921</span>
                <span className="font-bold">2 units</span>
              </li>
              <li className="text-sm text-amber-700 flex justify-between">
                <span>Expiring: Batch-A12</span>
                <span className="font-bold">2 days left</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
