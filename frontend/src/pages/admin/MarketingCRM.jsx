import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Users,
  Plus,
  Search,
  Mail,
  Phone,
  MessageSquare,
  Filter,
  MoreVertical,
  Target,
  TrendingUp,
  BrainCircuit,
  Zap
} from 'lucide-react';
import DashboardShell from '../../components/Layout/DashboardShell';
import { createApi } from '../../api/client';
import toast from 'react-hot-toast';

export default function MarketingCRM() {
  const { restaurantId, tenantId } = useParams();
  const currentId = tenantId || restaurantId;
  const api = createApi(currentId);

  const [contacts, setContacts] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('contacts'); // 'contacts' | 'campaigns'

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [contactsRes, campaignsRes] = await Promise.all([
        api.get('/crm/contacts'),
        api.get('/marketing/campaigns')
      ]);
      setContacts(contactsRes.data);
      setCampaigns(campaignsRes.data);
    } catch (err) {
      toast.error('Failed to load marketing data');
    } finally {
      setLoading(false);
    }
  };

  const content = (
    <div className="p-6 max-w-7xl mx-auto space-y-6">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
          <div className="flex items-center gap-4">
             <div className={`p-3 rounded-2xl ${view === 'contacts' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                {view === 'contacts' ? <Users className="w-6 h-6" /> : <Target className="w-6 h-6" />}
             </div>
             <div>
                <h1 className="font-display font-black text-2xl text-slate-800 tracking-tight">
                  {view === 'contacts' ? 'Customer Relations' : 'Campaign Manager'}
                </h1>
                <div className="flex bg-slate-100 p-1 rounded-xl mt-1 w-fit">
                  <button
                    onClick={() => setView('contacts')}
                    className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${view === 'contacts' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
                  >
                    Contacts
                  </button>
                  <button
                    onClick={() => setView('campaigns')}
                    className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${view === 'campaigns' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
                  >
                    Campaigns
                  </button>
                </div>
             </div>
          </div>
          <button className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-sm transition-all shadow-lg">
            <Plus className="w-4 h-4" /> {view === 'contacts' ? 'Add Contact' : 'New Campaign'}
          </button>
        </div>

        {view === 'contacts' ? (
          <div className="grid grid-cols-1 gap-4">
             <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                <div className="p-4 border-b border-slate-100 flex items-center gap-4">
                   <div className="relative flex-1">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="text" placeholder="Search leads and customers..." className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none" />
                   </div>
                   <button className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-500"><Filter className="w-4 h-4" /></button>
                </div>
                <div className="overflow-x-auto">
                   <table className="w-full">
                      <thead>
                        <tr className="bg-slate-50/50 text-left border-b border-slate-100">
                          <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Contact</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Company/Source</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Last Sync</th>
                          <th className="px-6 py-4"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {contacts.map((contact) => (
                          <tr key={contact.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-xs">
                                  {contact.name.charAt(0)}
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-slate-800">{contact.name}</p>
                                  <p className="text-[10px] text-slate-400">{contact.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                               <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                                 contact.status === 'VIP' ? 'bg-purple-100 text-purple-700' :
                                 contact.status === 'Customer' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                               }`}>
                                 {contact.status}
                               </span>
                            </td>
                            <td className="px-6 py-4">
                               <p className="text-xs font-bold text-slate-700">{contact.company || 'Private'}</p>
                               <p className="text-[10px] text-slate-400">{contact.source || 'Organic'}</p>
                            </td>
                            <td className="px-6 py-4 text-xs text-slate-500">
                               {contact.last_interaction ? new Date(contact.last_interaction).toLocaleDateString() : 'Never'}
                            </td>
                            <td className="px-6 py-4 text-right">
                               <button className="p-2 hover:bg-slate-100 rounded-xl text-slate-400"><MoreVertical className="w-4 h-4" /></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                   </table>
                </div>
             </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {campaigns.map((campaign) => (
               <div key={campaign.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                       <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${
                         campaign.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                       }`}>
                         {campaign.status}
                       </span>
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{campaign.type}</span>
                    </div>
                    <h3 className="font-display font-bold text-lg text-slate-800 mb-2">{campaign.name}</h3>
                    <div className="grid grid-cols-2 gap-4 mt-6">
                       <div className="bg-slate-50 p-3 rounded-2xl">
                          <span className="text-[10px] font-bold text-slate-400 block uppercase">Reach</span>
                          <span className="text-sm font-black text-slate-700">{campaign.reach.toLocaleString()}</span>
                       </div>
                       <div className="bg-slate-50 p-3 rounded-2xl">
                          <span className="text-[10px] font-bold text-slate-400 block uppercase">Conv.</span>
                          <span className="text-sm font-black text-indigo-600">{campaign.conversions}%</span>
                       </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                        <span className="text-xs font-bold text-slate-600">Growth: +4.2%</span>
                     </div>
                     <button className="text-[10px] font-black text-indigo-600 uppercase hover:underline">Analytics</button>
                  </div>
               </div>
             ))}

             <div className="bg-indigo-600 rounded-3xl p-8 text-white relative overflow-hidden flex flex-col justify-center">
                <BrainCircuit className="absolute -right-4 -bottom-4 w-32 h-32 text-indigo-400 opacity-20" />
                <div className="bg-white/20 w-10 h-10 rounded-xl flex items-center justify-center mb-4">
                   <Zap className="w-5 h-5 fill-white" />
                </div>
                <h3 className="font-display font-bold text-xl mb-2">AI Campaign Builder</h3>
                <p className="text-indigo-100 text-xs leading-relaxed mb-6">
                   Let our AI analyze your customer base to generate personalized email sequences and social triggers that convert 3x better.
                </p>
                <button className="w-fit px-4 py-2 bg-white text-indigo-600 rounded-xl text-xs font-black uppercase transition-transform hover:scale-105">
                   Start AI Pilot
                </button>
             </div>
          </div>
        )}

      </div>
  );

  if (tenantId) {
    return content;
  }

  return (
    <DashboardShell title="Marketing & CRM" restaurantId={restaurantId} role="admin">
      {content}
    </DashboardShell>
  );
}
