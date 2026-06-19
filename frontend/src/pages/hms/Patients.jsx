import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Search, Plus, User, Phone, Calendar, ArrowLeft } from 'lucide-react';
import { createApi } from '../../api/client';
import toast from 'react-hot-toast';

export default function Patients() {
  const { tenantId } = useParams();
  const api = createApi(tenantId);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchName] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '', dob: '', gender: 'Male', blood_group: 'O+', contact: '', email: '', address: '', emergency_contact: ''
  });

  const fetchPatients = async () => {
    try {
      const { data } = await api.get('/api/hms/patients');
      setPatients(data);
    } catch (err) {
      toast.error('Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [tenantId]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/hms/patients', formData);
      toast.success('Patient registered successfully');
      setModalOpen(false);
      setFormData({ name: '', dob: '', gender: 'Male', blood_group: 'O+', contact: '', email: '', address: '', emergency_contact: '' });
      fetchPatients();
    } catch (err) {
      toast.error('Registration failed');
    }
  };

  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.patient_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 md:p-10 bg-slate-50 min-h-screen font-body">
      <div className="flex items-center gap-4 mb-8">
        <Link to={`/r/${tenantId}/hms`} className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 font-display">Patient Directory</h1>
          <p className="text-slate-500 text-sm">Manage and register patient records.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchName(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-blue-500 shadow-sm"
          />
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>New Registration</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <th className="px-6 py-4">Patient ID</th>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Gender / Age</th>
              <th className="px-6 py-4">Contact</th>
              <th className="px-6 py-4">Blood Group</th>
              <th className="px-6 py-4 text-right">Registered</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
            {loading ? (
              <tr><td colSpan="6" className="px-6 py-10 text-center animate-pulse">Loading patient records...</td></tr>
            ) : filteredPatients.length === 0 ? (
              <tr><td colSpan="6" className="px-6 py-20 text-center text-slate-400">No patients found.</td></tr>
            ) : filteredPatients.map(p => (
              <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 font-mono font-bold text-blue-600 text-xs">{p.patient_id}</td>
                <td className="px-6 py-4 font-bold text-slate-800">{p.name}</td>
                <td className="px-6 py-4 capitalize">{p.gender} / {p.dob ? (new Date().getFullYear() - new Date(p.dob).getFullYear()) : 'N/A'}</td>
                <td className="px-6 py-4">{p.contact}</td>
                <td className="px-6 py-4"><span className="px-2 py-0.5 bg-red-50 text-red-600 rounded text-[10px] font-black">{p.blood_group}</span></td>
                <td className="px-6 py-4 text-right text-xs text-slate-400">{new Date(p.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-3xl p-8 shadow-2xl animate-slide-up">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Register New Patient</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Full Name *</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Date of Birth</label>
                  <input type="date" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Gender</label>
                  <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500">
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Contact Number *</label>
                  <input required type="tel" value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Blood Group</label>
                  <select value={formData.blood_group} onChange={e => setFormData({...formData, blood_group: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500">
                    <option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>O+</option><option>O-</option><option>AB+</option><option>AB-</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Address</label>
                  <textarea rows="2" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                <button type="button" onClick={() => setModalOpen(false)} className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl">Cancel</button>
                <button type="submit" className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20">Complete Registration</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
