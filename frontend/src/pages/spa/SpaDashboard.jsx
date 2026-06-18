import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar, Users, Briefcase, CreditCard, Activity, TrendingUp, AlertTriangle, Star, CheckCircle } from 'lucide-react';
import { createApi } from '../../api/client';
import toast from 'react-hot-toast';

export default function SpaDashboard() {
  const { restaurantId } = useParams();
  const api = createApi(restaurantId);
  const [stats, setStats] = useState(null);
  const [aiInsights, setAiInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, aiRes] = await Promise.all([
        api.get('/analytics/summary'),
        api.get('/analytics/ai-insights')
      ]);
      setStats(statsRes.data);
      setAiInsights(aiRes.data);
    } catch (err) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading Zen Dashboard...</div>;

  return (
    <div className="p-6 bg-slate-50 min-h-screen font-body">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 font-display">Spa & Wellness Control Room</h1>
        <p className="text-slate-500">Enterprise-grade wellness management & AI insights</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-4">
            <Activity className="w-6 h-6" />
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Today's Revenue</p>
          <p className="text-2xl font-black text-slate-800 mt-1">₹{stats?.revenue || 0}</p>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-4">
            <Calendar className="w-6 h-6" />
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Appointments</p>
          <p className="text-2xl font-black text-slate-800 mt-1">{stats?.orderCount || 0}</p>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-4">
            <Users className="w-6 h-6" />
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Therapists</p>
          <p className="text-2xl font-black text-slate-800 mt-1">3</p>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 mb-4">
            <Star className="w-6 h-6" />
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg Rating</p>
          <p className="text-2xl font-black text-slate-800 mt-1">4.8</p>
        </div>
      </div>

      {/* AI Insights Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Forecast */}
        <div className="bg-slate-900 text-white p-8 rounded-[2rem] shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <h3 className="text-lg font-bold font-display uppercase tracking-widest text-slate-400">AI Revenue Forecast</h3>
            </div>
            <p className="text-xs text-slate-400 mb-1">Predicted Next Day Revenue</p>
            <p className="text-4xl font-black text-white mb-4">₹{aiInsights?.revenueForecast?.nextDay}</p>
            <div className="flex items-center gap-2 text-xs">
              <span className="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full font-bold">Confidence: {aiInsights?.revenueForecast?.confidence}</span>
              <span className="text-slate-500 italic">Trend: {aiInsights?.revenueForecast?.trend}</span>
            </div>
          </div>
          <div className="absolute -right-10 -bottom-10 opacity-10">
            <Activity className="w-40 h-40" />
          </div>
        </div>

        {/* Retention Prediction */}
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-500" />
              <h3 className="text-lg font-bold text-slate-800">Customer Retention Risk</h3>
            </div>
            <span className="text-xs text-slate-400 italic">AI predicted churn probability</span>
          </div>
          <div className="space-y-4">
            {aiInsights?.retentionRisk?.map((customer, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <p className="font-bold text-slate-800">{customer.name}</p>
                  <p className="text-xs text-slate-400">{customer.visit_count} past visits • Last seen: {customer.last_visit}</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-rose-600">{customer.churnProbability} Risk</span>
                  <p className="text-[10px] font-bold text-blue-600 mt-1 uppercase tracking-tighter cursor-pointer hover:underline">{customer.recommendation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Wellness Recommendations */}
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 lg:col-span-3">
          <div className="flex items-center gap-2 mb-6">
            <CheckCircle className="w-5 h-5 text-indigo-500" />
            <h3 className="text-lg font-bold text-slate-800">AI personalized Wellness Recommendations</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {aiInsights?.recommendations?.map((rec, idx) => (
              <div key={idx} className="p-6 bg-indigo-50 rounded-3xl border border-indigo-100">
                <p className="text-xs font-bold text-indigo-400 uppercase mb-2">Offer to: {rec.targetSegment}</p>
                <p className="text-xl font-bold text-indigo-900 mb-3">{rec.service}</p>
                <div className="flex items-center gap-2 text-xs text-indigo-600 italic">
                  <Star className="w-3 h-3 fill-indigo-400 border-none" />
                  {rec.reason}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
