import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ShieldCheck, CheckCircle2, XCircle, Clock, Search } from 'lucide-react';
import { createApi } from '../../api/client';
import toast from 'react-hot-toast';

export default function QualityControl() {
  const { restaurantId } = useParams();
  const api = createApi(restaurantId);
  const [checks, setChecks] = useState([]);
  const [loading, setLoading] = useState(true);

  const mockChecks = [
    { id: 1, wo_number: 'WO-KB7X2Z', item_name: 'Industrial Enclosure', inspector: 'John Doe', status: 'Passed', date: '2023-10-25' },
    { id: 2, wo_number: 'WO-M9Y4R1', item_name: 'Aluminum Rod', inspector: 'Jane Smith', status: 'Pending', date: '2023-10-26' },
    { id: 3, wo_number: 'WO-A1B2C3', item_name: 'Steel Sheet 2mm', inspector: 'Mike Ross', status: 'Failed', date: '2023-10-24', defects: 'Surface scratches' },
  ];

  useEffect(() => {
    // In a real app, fetch from /quality-checks
    setChecks(mockChecks);
    setLoading(false);
  }, []);

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="text-emerald-600" /> Quality Control & Compliance
        </h1>
        <p className="text-slate-500 text-sm">Monitor inspection results and production quality</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100">
            <div className="p-4 bg-slate-50 border-b flex justify-between items-center">
              <h2 className="font-bold text-slate-800 text-sm">Recent Inspections</h2>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                <input type="text" placeholder="Search WO#" className="pl-8 pr-4 py-1.5 bg-white border rounded-lg text-xs" />
              </div>
            </div>
            <div className="divide-y divide-slate-100">
              {checks.map(check => (
                <div key={check.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      check.status === 'Passed' ? 'bg-emerald-50 text-emerald-600' :
                      check.status === 'Failed' ? 'bg-red-50 text-red-600' :
                      'bg-amber-50 text-amber-600'
                    }`}>
                      {check.status === 'Passed' ? <CheckCircle2 size={20} /> :
                       check.status === 'Failed' ? <XCircle size={20} /> :
                       <Clock size={20} />}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{check.item_name}</p>
                      <p className="text-xs text-slate-500">WO: <span className="font-mono">{check.wo_number}</span> • Inspector: {check.inspector}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                      check.status === 'Passed' ? 'bg-emerald-100 text-emerald-700' :
                      check.status === 'Failed' ? 'bg-red-100 text-red-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {check.status}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-1">{check.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-900 mb-4">Yield Analytics</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-500">First Pass Yield</span>
                  <span className="font-bold text-emerald-600">98.2%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full" style={{ width: '98.2%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-500">Scrap Rate</span>
                  <span className="font-bold text-red-600">1.8%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="bg-red-500 h-full" style={{ width: '1.8%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
