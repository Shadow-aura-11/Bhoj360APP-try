import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Search, Plus, Calendar, Clock, User, ArrowLeft, MoreVertical, CheckCircle, XCircle } from 'lucide-react';
import { createApi } from '../../api/client';
import toast from 'react-hot-toast';

export default function Appointments() {
  const { tenantId } = useParams();
  const api = createApi(tenantId);
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    patient_id: '', doctor_id: '', appointment_date: new Date().toISOString().split('T')[0], appointment_time: '10:00', type: 'OPD', notes: ''
  });

  const fetchData = async () => {
    try {
      const [apptsRes, ptsRes, docsRes] = await Promise.all([
        api.get('/api/hms/appointments'),
        api.get('/api/hms/patients'),
        api.get('/api/hms/doctors')
      ]);
      setAppointments(apptsRes.data);
      setPatients(ptsRes.data);
      setDoctors(docsRes.data);
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [tenantId]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/hms/appointments', formData);
      toast.success('Appointment scheduled');
      setModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error('Scheduling failed');
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.patch(`/api/hms/appointments/${id}/status`, { status });
      toast.success(`Marked as ${status}`);
      fetchData();
    } catch (err) {
      toast.error('Update failed');
    }
  };

  return (
    <div className="p-6 md:p-10 bg-slate-50 min-h-screen font-body">
      <div className="flex items-center gap-4 mb-8">
        <Link to={`/r/${tenantId}/hms`} className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 font-display">Appointments & Scheduling</h1>
          <p className="text-slate-500 text-sm">Manage doctor visits and patient queue.</p>
        </div>
      </div>

      <div className="flex justify-end mb-8">
        <button
          onClick={() => setModalOpen(true)}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Book Appointment</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center animate-pulse text-slate-400">Loading appointments...</div>
        ) : appointments.length === 0 ? (
          <div className="col-span-full py-20 text-center text-slate-400 bg-white rounded-3xl border border-dashed border-slate-200">No appointments scheduled for today.</div>
        ) : appointments.map(appt => (
          <div key={appt.id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                appt.status === 'scheduled' ? 'bg-blue-50 text-blue-600' :
                appt.status === 'checked-in' ? 'bg-amber-50 text-amber-600' :
                appt.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'
              }`}>
                {appt.status}
              </span>
              <div className="flex items-center gap-1.5 text-slate-400 text-xs font-mono">
                <Clock className="w-3.5 h-3.5" />
                {appt.appointment_time}
              </div>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 leading-tight">{appt.patient_name}</h3>
                <p className="text-[10px] text-slate-400 uppercase font-bold mt-0.5">Patient</p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-3 mb-5">
              <p className="text-[10px] text-slate-400 uppercase font-bold mb-1.5">Consulting Doctor</p>
              <p className="text-sm font-semibold text-slate-700">{appt.doctor_name}</p>
              <p className="text-[10px] text-slate-400 mt-1">{appt.type} Visit</p>
            </div>

            <div className="flex gap-2">
              {appt.status === 'scheduled' && (
                <button onClick={() => handleStatusUpdate(appt.id, 'checked-in')} className="flex-1 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-100 transition-colors">Check In</button>
              )}
              {appt.status === 'checked-in' && (
                <button onClick={() => handleStatusUpdate(appt.id, 'completed')} className="flex-1 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-colors">Complete</button>
              )}
              <button onClick={() => handleStatusUpdate(appt.id, 'cancelled')} className="p-2 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-xl transition-colors"><XCircle className="w-5 h-5" /></button>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-3xl p-8 shadow-2xl animate-slide-up">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Book New Appointment</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Select Patient *</label>
                <select required value={formData.patient_id} onChange={e => setFormData({...formData, patient_id: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500">
                  <option value="">-- Choose Patient --</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.name} ({p.patient_id})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Consulting Doctor *</label>
                <select required value={formData.doctor_id} onChange={e => setFormData({...formData, doctor_id: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500">
                  <option value="">-- Choose Doctor --</option>
                  {doctors.map(d => <option key={d.id} value={d.id}>{d.name} - {d.specialization}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Date *</label>
                  <input required type="date" value={formData.appointment_date} onChange={e => setFormData({...formData, appointment_date: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Preferred Time *</label>
                  <input required type="time" value={formData.appointment_time} onChange={e => setFormData({...formData, appointment_time: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Appointment Type</label>
                <div className="flex gap-2">
                  {['OPD', 'Telemedicine', 'Emergency'].map(t => (
                    <button key={t} type="button" onClick={() => setFormData({...formData, type: t})} className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${formData.type === t ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-500 border-slate-200'}`}>{t}</button>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                <button type="button" onClick={() => setModalOpen(false)} className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl">Cancel</button>
                <button type="submit" className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20">Schedule Visit</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
