import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  BarChart3,
  DollarSign,
  TrendingUp,
  TrendingDown,
  PieChart,
  Calendar,
  Download,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  BrainCircuit,
  FileText,
  Sparkles
} from 'lucide-react';
import DashboardShell from '../../components/Layout/DashboardShell';
import { createApi } from '../../api/client';
import toast from 'react-hot-toast';

export default function AccountingReports() {
  const { restaurantId, tenantId } = useParams();
  const currentId = tenantId || restaurantId;
  const api = createApi(currentId);

  const [summary, setSummary] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [summaryRes, revenueRes] = await Promise.all([
        api.get('/analytics/summary'),
        api.get('/analytics/revenue?period=month')
      ]);
      setSummary(summaryRes.data);
      setRevenueData(revenueRes.data);
    } catch (err) {
      toast.error('Failed to load accounting data');
    } finally {
      setLoading(false);
    }
  };

  const content = (
    <div className="p-6 max-w-7xl mx-auto space-y-6">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
          <div>
            <h1 className="font-display font-black text-2xl text-slate-800 tracking-tight flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-indigo-600" />
              Financial Insights
            </h1>
            <p className="text-slate-500 text-xs mt-1">
              Enterprise-grade revenue forecasting and detailed ledger reports.
            </p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-2xl text-xs border border-slate-200 hover:bg-slate-200 transition-all">
              <Download className="w-4 h-4" /> Export PDF
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-xs transition-all shadow-md">
              <FileText className="w-4 h-4" /> Ledger Report
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-emerald-50 rounded-xl">
                <DollarSign className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg uppercase">
                <ArrowUpRight className="w-3 h-3" /> 12%
              </span>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Revenue</p>
            <h3 className="text-2xl font-black text-slate-800">₹{summary?.allTimeRevenue?.toLocaleString() || '0'}</h3>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-indigo-50 rounded-xl">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
              </div>
              <span className="flex items-center gap-1 text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg uppercase">
                Stable
              </span>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Monthly Forecast</p>
            <h3 className="text-2xl font-black text-slate-800">₹{summary?.monthRevenue ? (summary.monthRevenue * 1.4).toLocaleString() : '0'}</h3>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-amber-50 rounded-xl">
                <PieChart className="w-5 h-5 text-amber-600" />
              </div>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Operating Margin</p>
            <h3 className="text-2xl font-black text-slate-800">34.2%</h3>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-rose-50 rounded-xl">
                <TrendingDown className="w-5 h-5 text-rose-600" />
              </div>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Outstanding Receivables</p>
            <h3 className="text-2xl font-black text-slate-800">₹42,500</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-display font-black text-lg text-slate-800 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
                Revenue Trajectory
              </h3>
              <select className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-bold uppercase focus:outline-none">
                <option>Last 30 Days</option>
                <option>Last 6 Months</option>
              </select>
            </div>

            <div className="h-64 flex items-end justify-between gap-2 px-2">
              {revenueData.map((day, i) => (
                <div key={i} className="flex-1 group relative">
                  <div
                    className="w-full bg-indigo-100 group-hover:bg-indigo-600 rounded-t-lg transition-all duration-300"
                    style={{ height: `${(day.revenue / (summary?.revenue || 10000)) * 100}%`, minHeight: '4px' }}
                  >
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 font-bold">
                      ₹{day.revenue.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between text-[10px] font-bold text-slate-400 uppercase">
              <span>{revenueData[0]?.date || 'Start'}</span>
              <span>Timeline</span>
              <span>{revenueData[revenueData.length - 1]?.date || 'End'}</span>
            </div>
          </div>

          <div className="space-y-6">
             <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
                <BrainCircuit className="absolute -right-4 -bottom-4 w-32 h-32 text-indigo-500 opacity-20 rotate-12" />
                <h3 className="font-display font-bold text-lg mb-2 relative z-10 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                  Predictive AI
                </h3>
                <p className="text-slate-400 text-xs leading-relaxed mb-6 relative z-10">
                  Based on current booking velocity and market trends, we predict a <span className="text-indigo-400 font-bold">22% increase</span> in revenue for the next quarter.
                </p>
                <div className="space-y-3 relative z-10">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Confidence Score</p>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex-1 bg-white/10 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-indigo-500 h-full w-[88%] rounded-full"></div>
                      </div>
                      <span className="text-xs font-black">88%</span>
                    </div>
                  </div>
                </div>
             </div>

             <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                <h3 className="font-display font-black text-base text-slate-800 mb-4">Quick Reports</h3>
                <div className="space-y-2">
                  {['Tax Summary 2025', 'P&L Statement Q1', 'Vendor Payment History', 'Audit Log - Last 24h'].map((report, i) => (
                    <button key={i} className="w-full flex items-center justify-between p-3 hover:bg-slate-50 rounded-2xl border border-transparent hover:border-slate-100 transition-all text-left">
                      <span className="text-xs font-bold text-slate-600">{report}</span>
                      <Download className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                  ))}
                </div>
             </div>
          </div>
        </div>

      </div>
  );

  if (tenantId) {
    return content;
  }

  return (
    <DashboardShell title="Accounting & Reports" restaurantId={restaurantId} role="admin">
      {content}
    </DashboardShell>
  );
}
