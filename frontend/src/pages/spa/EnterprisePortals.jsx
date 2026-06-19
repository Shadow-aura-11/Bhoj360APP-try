import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Building, MapPin, DollarSign, Activity, Users, Plus, ChevronRight, Globe, Shield } from 'lucide-react';
import { createApi } from '../../api/client';
import toast from 'react-hot-toast';

export default function EnterprisePortals() {
  const { tenantId } = useParams();
  const api = createApi(tenantId);
  const [branches, setBranches] = useState([]);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('owner'); // 'owner' or 'branch'

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [branchesRes, statsRes] = await Promise.all([
        api.get('/spa/branches'),
        api.get('/analytics/summary')
      ]);
      setBranches(branchesRes.data);
      setStats(statsRes.data);
    } catch (err) {
      toast.error('Failed to load enterprise data');
    }
  };

  const OwnerDashboard = () => (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Organization Overview</h2>
          <p className="text-slate-500">Cross-branch performance & global metrics</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-2">
            <Globe className="w-4 h-4" /> Global Reports
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
              <DollarSign className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">+12.5%</span>
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase">Total Org Revenue</p>
          <p className="text-3xl font-black text-slate-800">₹{stats?.allTimeRevenue || 0}</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-4">
            <Building className="w-6 h-6" />
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase">Active Branches</p>
          <p className="text-3xl font-black text-slate-800">{branches.length}</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 mb-4">
            <Users className="w-6 h-6" />
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase">Total Employees</p>
          <p className="text-3xl font-black text-slate-800">42</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-800">Branch Performance</h3>
          <button className="text-blue-600 font-bold text-xs hover:underline flex items-center gap-1">
            <Plus className="w-3 h-3" /> Add New Branch
          </button>
        </div>
        <div className="divide-y divide-slate-100">
          {branches.map(branch => (
            <div key={branch.id} className="px-8 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 font-black">
                  {branch.name[0]}
                </div>
                <div>
                  <p className="font-bold text-slate-800">{branch.name}</p>
                  <p className="text-xs text-slate-400">{branch.address}</p>
                </div>
              </div>
              <div className="flex items-center gap-8">
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-400 uppercase">Monthly Revenue</p>
                  <p className="font-black text-slate-800">₹{Math.round((stats?.monthRevenue || 0) * 0.4)}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const BranchDashboard = () => (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Branch Operations</h2>
          <p className="text-slate-500">Local management & staff scheduling</p>
        </div>
        <div className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-xs font-bold border border-blue-100">
          Branch: City Center (Main)
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" /> Real-time Utilization
          </h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-xs font-bold text-slate-500">Therapist Utilization</span>
                <span className="text-xs font-black text-blue-600">82%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500" style={{ width: '82%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-xs font-bold text-slate-500">Room Occupancy</span>
                <span className="text-xs font-black text-emerald-600">65%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: '65%' }} />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 text-white p-8 rounded-[2rem] shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-400" /> Staff Performance
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Top Performer</span>
                <span className="font-bold">Sarah Johnson</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Total Commissions Due</span>
                <span className="font-bold text-blue-400">₹4,250</span>
              </div>
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-blue-500/10 rounded-full" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-8 bg-slate-50 min-h-screen font-body">
      <div className="flex gap-2 mb-10 bg-white p-1 rounded-2xl border border-slate-200 w-fit shadow-sm">
        <button
          onClick={() => setActiveTab('owner')}
          className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'owner' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          Owner Portal
        </button>
        <button
          onClick={() => setActiveTab('branch')}
          className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'branch' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          Branch Manager
        </button>
      </div>

      {activeTab === 'owner' ? <OwnerDashboard /> : <BranchDashboard />}
    </div>
  );
}
