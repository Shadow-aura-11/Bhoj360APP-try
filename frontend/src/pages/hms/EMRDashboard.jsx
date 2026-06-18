import React from 'react';
import { FileText, Search, Activity, Clock } from 'lucide-react';

export default function EMRDashboard() {
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-black flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-600" />
            Electronic Medical Records
          </h1>
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-3 text-slate-400" />
            <input
              placeholder="Search Patient by Name/ID..."
              className="pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl w-80 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-500" />
                Recent Clinical Visits
              </h2>
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                    <div>
                      <p className="font-bold text-slate-800">John Doe</p>
                      <p className="text-xs text-slate-500">Visit: Fever and Cough</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-mono">10 Oct 2023</p>
                      <button className="text-blue-600 text-xs font-bold mt-1">View Details</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-blue-600 rounded-3xl p-6 text-white shadow-lg">
              <h3 className="font-bold mb-2">Patient Summary</h3>
              <p className="text-xs opacity-80 mb-4">Quick overview of selected patient clinical history.</p>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Blood Group</span>
                  <span className="font-bold">O+</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Last Visit</span>
                  <span className="font-bold">2 days ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
