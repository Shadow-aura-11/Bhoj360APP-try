import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { User, Phone, Mail, History, FileText, Plus, Search, Filter, MoreHorizontal, Heart, ShieldAlert } from 'lucide-react';
import { createApi } from '../../api/client';
import toast from 'react-hot-toast';
import { format, parseISO } from 'date-fns';

export default function CustomerCRM() {
  const { restaurantId } = useParams();
  const api = createApi(restaurantId);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await api.get('/spa/customers');
      setCustomers(res.data);
      if (res.data.length > 0 && !selectedCustomer) {
        setSelectedCustomer(res.data[0]);
      }
    } catch (err) {
      toast.error('Failed to load CRM data');
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  return (
    <div className="flex h-screen bg-slate-50 font-body overflow-hidden">
      {/* Sidebar: Customer List */}
      <div className="w-80 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 border-b border-slate-100">
          <h1 className="text-xl font-bold text-slate-800 mb-4">Wellness CRM</h1>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name/phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
          {filteredCustomers.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedCustomer(c)}
              className={`w-full text-left p-4 hover:bg-slate-50 transition-colors flex items-center gap-3 ${selectedCustomer?.id === c.id ? 'bg-blue-50/50 border-r-4 border-blue-500' : ''}`}
            >
              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 font-bold">
                {c.name[0]}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-800 truncate">{c.name}</p>
                <p className="text-[10px] text-slate-400 font-mono">{c.phone}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-slate-100">
          <button className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all">
            <Plus className="w-4 h-4" /> Add Profile
          </button>
        </div>
      </div>

      {/* Main Content: Profile Details */}
      <div className="flex-1 overflow-y-auto">
        {selectedCustomer ? (
          <div className="p-8 max-w-5xl mx-auto">
            {/* Header / Basic Info */}
            <div className="flex items-start justify-between mb-10">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 bg-blue-50 rounded-[2rem] flex items-center justify-center text-blue-600 font-black text-3xl border-2 border-white shadow-xl">
                  {selectedCustomer.name[0]}
                </div>
                <div>
                  <h2 className="text-3xl font-black text-slate-800 tracking-tight">{selectedCustomer.name}</h2>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                      <Phone className="w-3.5 h-3.5" /> {selectedCustomer.phone}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                      <Mail className="w-3.5 h-3.5" /> {selectedCustomer.email || 'No email'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-white rounded-xl border border-slate-200 transition-all"><MoreHorizontal className="w-5 h-5 text-slate-400" /></button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Col: Wellness Profile */}
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-rose-500" /> Wellness Profile & Notes
                  </h3>
                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest block mb-2">Medical Notes & Allergies</label>
                      <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100 flex items-start gap-3">
                        <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                        <p className="text-sm text-rose-700 font-medium leading-relaxed">
                          {selectedCustomer.allergies || 'No allergies recorded.'}
                        </p>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest block mb-2">General Consultation Notes</label>
                      <p className="text-sm text-slate-600 leading-relaxed italic">
                        {selectedCustomer.wellness_notes || 'No consultation notes available.'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <History className="w-5 h-5 text-blue-600" /> Treatment History
                  </h3>
                  <div className="space-y-4">
                    {/* Mock history */}
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div>
                        <p className="text-sm font-bold text-slate-800">Deep Tissue Massage</p>
                        <p className="text-[10px] text-slate-400">Mar 15, 2024 • 90 mins • Therapist: Sarah</p>
                      </div>
                      <span className="text-xs font-black text-blue-600">₹2,200</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Col: Stats & Quick Actions */}
              <div className="space-y-6">
                <div className="bg-slate-900 text-white p-8 rounded-[2rem] shadow-xl">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Lifetime Spend</p>
                  <p className="text-3xl font-black text-white">₹{selectedCustomer.total_spend || 0}</p>
                  <div className="mt-6 pt-6 border-t border-slate-800 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Visits</p>
                      <p className="text-lg font-black">{selectedCustomer.visit_count || 0}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Last Visit</p>
                      <p className="text-xs font-bold text-slate-300">
                        {selectedCustomer.last_visit ? format(parseISO(selectedCustomer.last_visit), 'MMM dd') : 'Never'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Quick Actions</h4>
                  <button className="w-full py-3 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-100 transition-all flex items-center justify-center gap-2">
                    <FileText className="w-4 h-4" /> Create Treatment Plan
                  </button>
                  <button className="w-full py-3 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-all flex items-center justify-center gap-2">
                    <Heart className="w-4 h-4" /> Log Consultation
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-300 italic">
            Select a customer to view their wellness journey
          </div>
        )}
      </div>
    </div>
  );
}
