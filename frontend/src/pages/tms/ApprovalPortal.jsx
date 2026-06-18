import React, { useState } from 'react';
import { Check, X, User, MapPin, Calendar, DollarSign, ShieldCheck } from 'lucide-react';

export default function ApprovalPortal() {
  const [requests, setRequests] = useState([
    {
      id: 1,
      employee: 'Sarah Jenkins',
      destination: 'Singapore',
      dates: 'Oct 20 - Oct 25',
      purpose: 'Customer Support Training',
      cost: '$2,450',
      compliance: 'Compliant'
    },
    {
      id: 2,
      employee: 'Michael Chen',
      destination: 'New York, USA',
      dates: 'Nov 12 - Nov 18',
      purpose: 'Strategic Partnership Meeting',
      cost: '$4,100',
      compliance: 'Flagged: Hotel Choice'
    }
  ]);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Approval Portal</h1>
        <p className="text-slate-500">Review and action pending travel requests.</p>
      </header>

      <div className="grid grid-cols-1 gap-6">
        {requests.map((req) => (
          <div key={req.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    req.compliance === 'Compliant' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                  }`}>
                    {req.compliance}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-800 mb-2">{req.purpose}</h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div className="flex items-center gap-2 text-slate-500">
                    <User size={16} />
                    <span className="text-sm">{req.employee}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500">
                    <MapPin size={16} />
                    <span className="text-sm">{req.destination}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500">
                    <Calendar size={16} />
                    <span className="text-sm">{req.dates}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-800 font-bold">
                    <DollarSign size={16} />
                    <span className="text-sm">{req.cost}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all">
                  <X size={18} />
                  Reject
                </button>
                <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
                  <Check size={18} />
                  Approve
                </button>
              </div>
            </div>

            {req.compliance !== 'Compliant' && (
              <div className="bg-rose-50 px-8 py-3 border-t border-rose-100 flex items-center gap-2">
                <ShieldCheck size={16} className="text-rose-600" />
                <p className="text-xs text-rose-800 font-medium italic">
                  AI Compliance Check: Selected hotel "The Plaza" exceeds the corporate limit of $300/night for New York.
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
