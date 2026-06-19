import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CreditCard, Package, Plus, CheckCircle, Star, Calendar, ShieldCheck } from 'lucide-react';
import { createApi } from '../../api/client';
import toast from 'react-hot-toast';

export default function MembershipsPackages() {
  const { tenantId } = useParams();
  const api = createApi(tenantId);
  const [memberships, setMemberships] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [mRes, pRes] = await Promise.all([
        api.get('/memberships'),
        api.get('/packages')
      ]);
      setMemberships(mRes.data);
      setPackages(pRes.data);
    } catch (err) {
      toast.error('Failed to load plans');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen font-body">
      <header className="mb-10">
        <h1 className="text-2xl font-bold text-slate-800">Memberships & Wellness Packages</h1>
        <p className="text-sm text-slate-500 mt-1">Driving recurring revenue through tiered benefits</p>
      </header>

      {/* Memberships Section */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-700 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-600" /> Recurring Memberships
          </h2>
          <button className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
            <Plus className="w-3 h-3" /> Create New Tier
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {memberships.map(m => (
            <div key={m.id} className="bg-white rounded-[2rem] border border-slate-200 p-8 relative overflow-hidden group hover:shadow-xl transition-all duration-500">
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div className="text-right">
                    <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Starting at</span>
                    <span className="text-2xl font-black text-slate-800">₹{m.price}</span>
                    <span className="text-xs text-slate-400">/mo</span>
                  </div>
                </div>

                <h3 className="text-xl font-black text-slate-800 mb-2">{m.name}</h3>
                <p className="text-sm text-slate-500 mb-6">{m.description}</p>

                <div className="space-y-3 mb-8">
                  {JSON.parse(m.benefits_json || '[]').map((benefit, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs font-bold text-slate-600">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      {benefit}
                    </div>
                  ))}
                </div>

                <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">
                  Assign to Customer
                </button>
              </div>
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
          ))}
        </div>
      </section>

      {/* Packages Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-700 flex items-center gap-2">
            <Package className="w-5 h-5 text-indigo-600" /> Bundled Service Packages
          </h2>
          <button className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1">
            <Plus className="w-3 h-3" /> New Bundle
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map(p => (
            <div key={p.id} className="bg-white rounded-3xl border border-slate-200 p-6 flex items-center gap-4 hover:border-indigo-500 transition-all cursor-pointer">
              <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 flex-shrink-0">
                <Star className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-800 truncate">{p.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5">Valid for {p.validity_days} days</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-indigo-600">₹{p.price}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Limited Offer</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
