import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Users,
  FileSignature,
  Plus,
  Search,
  Mail,
  Phone,
  Calendar,
  CreditCard,
  ExternalLink,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { createApi } from '../../api/client';
import toast from 'react-hot-toast';
import { format, parseISO } from 'date-fns';

export default function LeaseManager() {
  const { restaurantId } = useParams();
  const [activeTab, setActiveTab] = useState('leases'); // 'leases' | 'tenants' | 'applications'
  const [leases, setLeases] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const api = createApi(restaurantId);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'leases') {
        const { data } = await api.get('/leases');
        setLeases(data);
      } else if (activeTab === 'tenants') {
        const { data } = await api.get('/tenants');
        setTenants(data);
      } else {
        const { data } = await api.get('/lease-applications');
        setApplications(data);
      }
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Expired': return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'Pending': return 'bg-blue-50 text-blue-600 border-blue-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-600" />
            Lease & Tenant Management
          </h1>
          <p className="text-slate-500 mt-1">Lifecycle management for your occupants</p>
        </div>
        <button className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-blue-200">
          <Plus className="w-4 h-4" />
          Onboard Tenant
        </button>
      </header>

      {/* Tabs */}
      <div className="flex gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 mb-8 w-fit shadow-sm">
          {[
              { id: 'leases', label: 'Active Leases', icon: FileSignature },
              { id: 'tenants', label: 'Tenant Directory', icon: Users },
              { id: 'applications', label: 'Applications', icon: Mail }
          ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                    activeTab === tab.id
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
              <div className="p-20 text-center text-slate-400">Loading data...</div>
          ) : (
              <div className="overflow-x-auto">
                  {activeTab === 'leases' && (
                      <table className="w-full text-left border-collapse">
                          <thead>
                              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                  <th className="px-6 py-4">Tenant & Unit</th>
                                  <th className="px-6 py-4">Property</th>
                                  <th className="px-6 py-4">Term</th>
                                  <th className="px-6 py-4">Rent/Deposit</th>
                                  <th className="px-6 py-4">Status</th>
                                  <th className="px-6 py-4 text-right">Actions</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                              {leases.map(lease => (
                                  <tr key={lease.id} className="hover:bg-slate-50/50 transition-colors">
                                      <td className="px-6 py-4">
                                          <div className="font-bold text-slate-800">{lease.tenant_name}</div>
                                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">Unit {lease.unit_number}</div>
                                      </td>
                                      <td className="px-6 py-4">
                                          <div className="text-xs font-semibold text-slate-600">{lease.property_name}</div>
                                      </td>
                                      <td className="px-6 py-4">
                                          <div className="text-xs text-slate-700">{format(parseISO(lease.start_date), 'MMM dd, yyyy')}</div>
                                          <div className="text-[10px] text-slate-400">to {format(parseISO(lease.end_date), 'MMM dd, yyyy')}</div>
                                      </td>
                                      <td className="px-6 py-4">
                                          <div className="text-xs font-bold text-slate-800">₹{lease.rent_amount?.toLocaleString()}</div>
                                          <div className="text-[10px] text-slate-400">Dep: ₹{lease.deposit_amount?.toLocaleString()}</div>
                                      </td>
                                      <td className="px-6 py-4">
                                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border uppercase ${getStatusColor(lease.status)}`}>
                                              {lease.status}
                                          </span>
                                      </td>
                                      <td className="px-6 py-4 text-right">
                                          <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                              <ExternalLink className="w-4 h-4" />
                                          </button>
                                      </td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  )}

                  {activeTab === 'tenants' && (
                      <table className="w-full text-left border-collapse">
                          <thead>
                              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                  <th className="px-6 py-4">Tenant Name</th>
                                  <th className="px-6 py-4">Contact Info</th>
                                  <th className="px-6 py-4">Nationality/ID</th>
                                  <th className="px-6 py-4">Occupation</th>
                                  <th className="px-6 py-4 text-right">Actions</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                              {tenants.map(tenant => (
                                  <tr key={tenant.id} className="hover:bg-slate-50/50 transition-colors text-sm">
                                      <td className="px-6 py-4 font-bold text-slate-800">{tenant.name}</td>
                                      <td className="px-6 py-4">
                                          <div className="flex items-center gap-1.5 text-slate-500">
                                              <Mail className="w-3.5 h-3.5" /> {tenant.email}
                                          </div>
                                          <div className="flex items-center gap-1.5 text-slate-500 mt-1">
                                              <Phone className="w-3.5 h-3.5" /> {tenant.phone}
                                          </div>
                                      </td>
                                      <td className="px-6 py-4">
                                          <div className="text-slate-600">{tenant.nationality}</div>
                                          <div className="text-[10px] text-slate-400">{tenant.id_number}</div>
                                      </td>
                                      <td className="px-6 py-4 text-slate-600">{tenant.occupation}</td>
                                      <td className="px-6 py-4 text-right">
                                          <button className="px-3 py-1.5 text-[10px] font-bold text-blue-600 bg-blue-50 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors">
                                              View Profile
                                          </button>
                                      </td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  )}

                  {!loading && (activeTab === 'leases' ? leases : tenants).length === 0 && (
                      <div className="p-20 text-center">
                          <AlertCircle className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                          <h3 className="text-slate-400 font-bold">No records found.</h3>
                      </div>
                  )}
              </div>
          )}
      </div>
    </div>
  );
}
