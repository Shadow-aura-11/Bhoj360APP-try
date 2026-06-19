import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Wrench,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  User,
  Settings,
  Truck,
  MessageSquare
} from 'lucide-react';
import { createApi } from '../../api/client';
import toast from 'react-hot-toast';
import { format, parseISO } from 'date-fns';

export default function MaintenanceManager() {
  const { tenantId } = useParams();
  const [requests, setRequests] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveTab] = useState('requests'); // 'requests' | 'vendors'
  const api = createApi(tenantId);

  useEffect(() => {
    fetchData();
  }, [activeView]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeView === 'requests') {
        const { data } = await api.get('/maintenance-requests');
        setRequests(data);
      } else {
        const { data } = await api.get('/vendors');
        setVendors(data);
      }
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Urgent': return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'High': return 'bg-orange-50 text-orange-600 border-orange-100';
      default: return 'bg-blue-50 text-blue-600 border-blue-100';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Wrench className="w-8 h-8 text-blue-600" />
            Maintenance & Repairs
          </h1>
          <p className="text-slate-500 mt-1">Manage work orders and service vendors</p>
        </div>
        <button className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-blue-100">
          <Plus className="w-4 h-4" />
          {activeView === 'requests' ? 'New Request' : 'Add Vendor'}
        </button>
      </header>

      <div className="flex gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 mb-8 w-fit shadow-sm">
          {[
              { id: 'requests', label: 'Service Requests', icon: Settings },
              { id: 'vendors', label: 'Preferred Vendors', icon: Truck }
          ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                    activeView === tab.id
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                  <tab.icon className="w-3.5 h-3.5" />
                  {tab.label}
              </button>
          ))}
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
              <div className="p-20 text-center text-slate-400">Loading maintenance data...</div>
          ) : activeView === 'requests' ? (
              <div className="grid grid-cols-1 divide-y divide-slate-100">
                  {requests.map(req => (
                      <div key={req.id} className="p-6 hover:bg-slate-50/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-6">
                          <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                  <span className={`px-2 py-0.5 rounded text-[9px] font-black border uppercase ${getPriorityColor(req.priority)}`}>
                                      {req.priority}
                                  </span>
                                  <span className="text-[10px] font-mono text-slate-400 font-bold">REQ-{req.id.toString().padStart(4, '0')}</span>
                              </div>
                              <h4 className="text-lg font-bold text-slate-800">{req.description}</h4>
                              <div className="flex items-center gap-4 mt-3">
                                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                                      <User className="w-3.5 h-3.5" /> {req.tenant_name}
                                  </div>
                                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold font-mono">
                                      Unit {req.unit_number}
                                  </div>
                                  <div className="text-[10px] text-slate-400">
                                      {format(parseISO(req.created_at), 'PP')}
                                  </div>
                              </div>
                          </div>
                          <div className="flex items-center gap-3">
                              <div className="text-right hidden md:block">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Status</span>
                                  <span className="text-xs font-bold text-blue-600">{req.status}</span>
                              </div>
                              <button className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors">
                                  Assign Vendor
                              </button>
                          </div>
                      </div>
                  ))}
                  {requests.length === 0 && (
                      <div className="p-20 text-center text-slate-400 font-medium">No open maintenance requests.</div>
                  )}
              </div>
          ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-6">
                  {vendors.map(v => (
                      <div key={v.id} className="border border-slate-100 rounded-2xl p-5 hover:border-blue-100 hover:shadow-sm transition-all">
                          <div className="flex items-center gap-4 mb-4">
                              <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                                  <Truck className="w-6 h-6" />
                              </div>
                              <div>
                                  <h4 className="font-bold text-slate-800">{v.company}</h4>
                                  <p className="text-[10px] text-slate-400 font-bold uppercase">{v.services}</p>
                              </div>
                          </div>
                          <div className="space-y-2 mb-4 border-t border-b border-slate-50 py-3">
                              <div className="flex justify-between text-xs">
                                  <span className="text-slate-400">License</span>
                                  <span className="text-slate-700 font-semibold">{v.license || 'N/A'}</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                  <span className="text-slate-400">Rating</span>
                                  <span className="text-amber-500 font-black">★ {v.rating}</span>
                              </div>
                          </div>
                          <button className="w-full py-2.5 bg-blue-50 text-blue-600 text-xs font-bold rounded-xl hover:bg-blue-100 transition-colors flex items-center justify-center gap-2">
                              <MessageSquare className="w-3.5 h-3.5" /> Contact Vendor
                          </button>
                      </div>
                  ))}
                  {vendors.length === 0 && (
                      <div className="col-span-full p-20 text-center text-slate-400">No vendors registered in directory.</div>
                  )}
              </div>
          )}
      </div>
    </div>
  );
}
