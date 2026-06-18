import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  MessageSquare,
  Phone,
  UserPlus,
  RefreshCcw,
  BadgeCheck
} from 'lucide-react';
import { useParams } from 'react-router-dom';
import { createApi } from '../../api/client';
import toast from 'react-hot-toast';

const GmsCrmManager = () => {
  const { gymId } = useParams();
  const api = createApi(gymId);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLeads = async () => {
    try {
      const { data } = await api.get('/leads');
      setLeads(data || []);
    } catch (err) {
      toast.error("Failed to load CRM leads");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [gymId]);

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Lead CRM & Pipelines</h1>
          <p className="text-slate-500">Track inquiries, trials, and membership conversions.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchLeads}
            className="p-2 text-slate-400 hover:text-blue-600 transition"
          >
            <RefreshCcw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition">
            <UserPlus className="w-4 h-4 mr-2" />
            New Inquiry
          </button>
        </div>
      </div>

      {/* Pipeline Board (Mocked visualization of real data) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {['new', 'contacted', 'trial', 'converted'].map((stage) => (
          <div key={stage} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 min-h-[120px]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">{stage}</h3>
              <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold">
                {leads.filter(l => l.status === stage).length}
              </span>
            </div>
            <div className="space-y-3">
              {leads.filter(l => l.status === stage).map(lead => (
                <div key={lead.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs shadow-sm">
                  <p className="font-bold text-slate-700 mb-1">{lead.name}</p>
                  <p className="text-slate-400 font-mono">{lead.phone}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <h2 className="font-bold text-slate-700">All Recent Inquiries</h2>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-xs uppercase font-bold tracking-wider">
              <th className="px-6 py-3">Lead Name</th>
              <th className="px-6 py-3">Source</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Received At</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {leads.map(lead => (
              <tr key={lead.id} className="hover:bg-slate-50/50">
                <td className="px-6 py-4">
                  <div className="font-bold text-slate-800">{lead.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">{lead.phone}</div>
                </td>
                <td className="px-6 py-4 text-xs text-slate-600 capitalize">{lead.source || 'Direct'}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    lead.status === 'converted' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {lead.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs text-slate-400">{new Date(lead.created_at).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-right">
                  <button className="p-2 text-slate-300 hover:text-blue-600 transition">
                    <MessageSquare className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {leads.length === 0 && !loading && (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-slate-400 italic">No inquiries recorded yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GmsCrmManager;
