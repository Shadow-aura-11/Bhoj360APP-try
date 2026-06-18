import React, { useState } from 'react';
import { Send, MapPin, Calendar, Info } from 'lucide-react';

export default function TravelRequestForm() {
  const [formData, setFormData] = useState({
    purpose: '',
    origin: '',
    destination: '',
    startDate: '',
    endDate: '',
    managerId: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitting travel request:', formData);
    // Add submission logic here
  };

  return (
    <div className="max-w-3xl mx-auto p-8">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="bg-blue-600 p-8 text-white">
          <h1 className="text-2xl font-bold">New Travel Request</h1>
          <p className="text-blue-100 opacity-80">Plan your next business journey.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Purpose of Travel</label>
            <input
              type="text"
              placeholder="e.g. Client Quarterly Review"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              value={formData.purpose}
              onChange={(e) => setFormData({...formData, purpose: e.target.value})}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Origin</label>
              <div className="relative">
                <MapPin size={18} className="absolute left-3 top-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="City, Country"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={formData.origin}
                  onChange={(e) => setFormData({...formData, origin: e.target.value})}
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Destination</label>
              <div className="relative">
                <MapPin size={18} className="absolute left-3 top-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="City, Country"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={formData.destination}
                  onChange={(e) => setFormData({...formData, destination: e.target.value})}
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Start Date</label>
              <div className="relative">
                <Calendar size={18} className="absolute left-3 top-3.5 text-slate-400" />
                <input
                  type="date"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">End Date</label>
              <div className="relative">
                <Calendar size={18} className="absolute left-3 top-3.5 text-slate-400" />
                <input
                  type="date"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={formData.endDate}
                  onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  required
                />
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-3">
            <Info className="text-amber-600 shrink-0" size={20} />
            <p className="text-sm text-amber-800">
              <strong>AI Tip:</strong> Requests submitted at least 21 days in advance typically see 30% higher approval rates due to lower booking costs.
            </p>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
            >
              <Send size={18} />
              Submit for Approval
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
