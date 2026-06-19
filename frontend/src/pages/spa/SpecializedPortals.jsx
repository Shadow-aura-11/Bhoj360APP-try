import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { User, Clipboard, Clock, Heart, ShieldAlert, Plus, Camera, FileText, CheckCircle, PenTool } from 'lucide-react';
import { createApi } from '../../api/client';
import toast from 'react-hot-toast';

export default function SpecializedPortals() {
  const { tenantId } = useParams();
  const api = createApi(tenantId);
  const [role, setRole] = useState('therapist'); // 'therapist' or 'doctor'
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await api.get('/appointments');
      setAppointments(res.data);
    } catch (err) {
      toast.error('Failed to load schedule');
    }
  };

  const TherapistView = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">My Treatment Schedule</h2>
        <div className="flex gap-2">
          <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold border border-blue-100">Status: On Duty</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {appointments.map(appt => (
          <div key={appt.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-blue-500 transition-all">
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 font-bold">
                {appt.appointment_time}
              </div>
              <div>
                <p className="font-bold text-slate-800">{appt.customer_name}</p>
                <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">{appt.service_name}</p>
              </div>
            </div>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-2">
                <PenTool className="w-3.5 h-3.5" /> Log Treatment Notes
              </button>
              <button className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-bold border border-emerald-100">
                Complete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const MedSpaView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Consultation Queue */}
      <div className="lg:col-span-1 space-y-6">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-rose-500" /> Clinical Queue
        </h2>
        <div className="space-y-3">
          <div className="p-4 bg-white rounded-2xl border-l-4 border-l-rose-500 shadow-sm border border-slate-200">
            <p className="font-bold text-sm">Patient: Jane Cooper</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Laser Skin Resurfacing</p>
            <button className="w-full mt-3 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold">Start Consultation</button>
          </div>
        </div>
      </div>

      {/* Medical Charting */}
      <div className="lg:col-span-2 space-y-6 bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center border-b border-slate-100 pb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Clinical Charting: Patient J.C.</h3>
            <p className="text-xs text-slate-400">DOB: 12/05/1985 • Blood Group: A+</p>
          </div>
          <div className="flex gap-2">
            <button className="p-2 bg-slate-50 text-slate-400 rounded-xl border border-slate-100"><Camera className="w-5 h-5" /></button>
            <button className="p-2 bg-slate-50 text-slate-400 rounded-xl border border-slate-100"><FileText className="w-5 h-5" /></button>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Medical Diagnosis</label>
            <textarea className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none" rows="3" placeholder="Enter clinical assessment..."></textarea>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Prescription</label>
            <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-blue-600">Active Prescriptions</span>
                <button className="text-[10px] font-black text-blue-600 hover:underline">+ ADD MEDICATION</button>
              </div>
              <p className="text-xs text-slate-400 italic">No medications prescribed yet.</p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <button className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-100">
              <CheckCircle className="w-5 h-5" /> Sign & Sync Treatment Plan
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-8 bg-slate-50 min-h-screen font-body">
      <div className="flex gap-2 mb-10 bg-white p-1 rounded-2xl border border-slate-200 w-fit shadow-sm">
        <button
          onClick={() => setRole('therapist')}
          className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${role === 'therapist' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          Therapist Portal
        </button>
        <button
          onClick={() => setRole('doctor')}
          className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${role === 'doctor' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          MedSpa Portal (Doctor)
        </button>
      </div>

      {role === 'therapist' ? <TherapistView /> : <MedSpaView />}
    </div>
  );
}
