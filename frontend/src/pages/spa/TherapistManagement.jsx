import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { User, Briefcase, Phone, Mail, Plus, Settings, CheckCircle, XCircle } from 'lucide-react';
import { createApi } from '../../api/client';
import toast from 'react-hot-toast';

export default function TherapistManagement() {
  const { restaurantId } = useParams();
  const api = createApi(restaurantId);
  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [newTherapist, setNewTherapist] = useState({
    name: '',
    specialization: '',
    phone: '',
    email: '',
    status: 'active'
  });

  useEffect(() => {
    fetchTherapists();
  }, []);

  const fetchTherapists = async () => {
    try {
      const res = await api.get('/therapists');
      setTherapists(res.data);
    } catch (err) {
      toast.error('Failed to load therapists');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTherapist = async (e) => {
    e.preventDefault();
    try {
      await api.post('/therapists', newTherapist);
      toast.success('Therapist profile created!');
      setModalOpen(false);
      fetchTherapists();
    } catch (err) {
      toast.error('Failed to add therapist');
    }
  };

  const toggleStatus = async (therapist) => {
    try {
      const nextStatus = therapist.status === 'active' ? 'inactive' : 'active';
      await api.post('/therapists', { ...therapist, status: nextStatus });
      toast.success(`Status updated for ${therapist.name}`);
      fetchTherapists();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen font-body">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <User className="w-6 h-6 text-blue-600" /> Specialist Team
          </h1>
          <p className="text-sm text-slate-500 mt-1">Manage therapist profiles and specializations</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-200 transition-all"
        >
          <Plus className="w-5 h-5" /> Add Specialist
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {therapists.map(therapist => (
          <div key={therapist.id} className="bg-white rounded-3xl border border-slate-200 p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex items-start justify-between mb-6">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 font-black text-xl border border-blue-100">
                {therapist.name[0]}
              </div>
              <button
                onClick={() => toggleStatus(therapist)}
                className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-colors ${
                  therapist.status === 'active'
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                    : 'bg-rose-50 text-rose-600 border-rose-100'
                }`}
              >
                {therapist.status.toUpperCase()}
              </button>
            </div>

            <h3 className="text-lg font-bold text-slate-800">{therapist.name}</h3>
            <div className="flex items-center gap-1.5 text-blue-600 text-xs font-bold mt-1 uppercase tracking-wider">
              <Briefcase className="w-3 h-3" />
              {therapist.specialization}
            </div>

            <div className="mt-6 space-y-3 pt-6 border-t border-slate-50">
              <div className="flex items-center gap-3 text-sm text-slate-500">
                <Phone className="w-4 h-4" />
                <span>{therapist.phone || 'No phone'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-500">
                <Mail className="w-4 h-4" />
                <span className="truncate">{therapist.email || 'No email'}</span>
              </div>
            </div>

            <button className="w-full mt-6 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold text-xs rounded-xl border border-slate-100 transition-all flex items-center justify-center gap-2">
              <Settings className="w-4 h-4" /> Edit Profile
            </button>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl animate-slide-up">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Register Specialist</h2>
            <form onSubmit={handleAddTherapist} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Full Name</label>
                <input
                  type="text"
                  required
                  value={newTherapist.name}
                  onChange={(e) => setNewTherapist({...newTherapist, name: e.target.value})}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                  placeholder="e.g. Sarah Johnson"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Specialization</label>
                <input
                  type="text"
                  required
                  value={newTherapist.specialization}
                  onChange={(e) => setNewTherapist({...newTherapist, specialization: e.target.value})}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                  placeholder="e.g. Massage Specialist"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Phone</label>
                  <input
                    type="tel"
                    value={newTherapist.phone}
                    onChange={(e) => setNewTherapist({...newTherapist, phone: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Email</label>
                  <input
                    type="email"
                    value={newTherapist.email}
                    onChange={(e) => setNewTherapist({...newTherapist, email: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="pt-6">
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-100"
                >
                  Create Specialist Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
