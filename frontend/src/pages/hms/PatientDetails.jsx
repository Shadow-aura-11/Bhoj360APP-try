import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { User, Activity, FileText, Plus, ArrowLeft, Thermometer, Weight, Heart, Droplets } from 'lucide-react';
import { createApi } from '../../api/client';
import toast from 'react-hot-toast';

export default function PatientDetails() {
  const { restaurantId, patientId } = useParams();
  const api = createApi(restaurantId);
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('history'); // 'history' | 'vitals' | 'visits'

  const fetchPatientData = async () => {
    try {
      const { data } = await api.get(`/api/hms/patients/${patientId}`);
      setPatient(data);
    } catch (err) {
      toast.error('Failed to load patient details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatientData();
  }, [patientId]);

  if (loading) return <div className="p-10 text-center animate-pulse">Loading patient medical records...</div>;
  if (!patient) return <div className="p-10 text-center text-red-500 font-bold">Patient Not Found</div>;

  return (
    <div className="p-6 md:p-10 bg-slate-50 min-h-screen font-body">
      <div className="flex items-center gap-4 mb-8">
        <Link to={`/r/${restaurantId}/hms/patients`} className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 font-display">{patient.name}</h1>
          <p className="text-slate-500 text-sm font-mono">{patient.patient_id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Patient Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-24 h-24 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <User className="w-12 h-12" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">{patient.name}</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{patient.gender} • {patient.dob ? (new Date().getFullYear() - new Date(patient.dob).getFullYear()) : 'N/A'} Years</p>
            </div>

            <div className="space-y-4 border-t border-slate-100 pt-6">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Blood Group</span>
                <span className="font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">{patient.blood_group}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Contact</span>
                <span className="font-semibold">{patient.contact}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Emergency</span>
                <span className="font-semibold">{patient.emergency_contact || 'None'}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-500" /> Latest Vitals
            </h3>
            {patient.vitals?.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3 rounded-2xl">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">BP</p>
                  <p className="text-sm font-bold text-slate-700">{patient.vitals[0].blood_pressure}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Temp</p>
                  <p className="text-sm font-bold text-slate-700">{patient.vitals[0].temperature}°C</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Pulse</p>
                  <p className="text-sm font-bold text-slate-700">{patient.vitals[0].pulse} bpm</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Weight</p>
                  <p className="text-sm font-bold text-slate-700">{patient.vitals[0].weight} kg</p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No vitals recorded yet.</p>
            )}
          </div>
        </div>

        {/* Medical History Tabs */}
        <div className="lg:col-span-2">
          <div className="flex gap-2 mb-6 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm w-fit">
            <button onClick={() => setActiveTab('history')} className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'history' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:text-slate-600'}`}>History</button>
            <button onClick={() => setActiveTab('vitals')} className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'vitals' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:text-slate-600'}`}>Vital Trends</button>
            <button onClick={() => setActiveTab('visits')} className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'visits' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:text-slate-600'}`}>Visits</button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
            {activeTab === 'history' && (
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold text-slate-800">Visit Timeline</h3>
                  <button className="flex items-center gap-2 text-blue-600 font-bold text-sm bg-blue-50 px-4 py-2 rounded-xl hover:bg-blue-100 transition-colors">
                    <Plus className="w-4 h-4" /> New Visit Record
                  </button>
                </div>

                {patient.visits?.length === 0 ? (
                  <div className="text-center py-20 text-slate-400 italic">No visit history found for this patient.</div>
                ) : (
                  <div className="relative border-l-2 border-slate-100 ml-3 space-y-8 pb-4">
                    {patient.visits.map(v => (
                      <div key={v.id} className="relative pl-8">
                        <div className="absolute -left-2.5 top-0 w-5 h-5 rounded-full bg-blue-500 border-4 border-white shadow-sm"></div>
                        <div className="bg-slate-50 p-5 rounded-2xl">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-slate-800">Diagnosis: {v.diagnosis}</h4>
                            <span className="text-[10px] font-mono text-slate-400">{new Date(v.created_at).toLocaleDateString()}</span>
                          </div>
                          <p className="text-sm text-slate-500 italic mb-4">"{v.notes}"</p>
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <User className="w-3.5 h-3.5" />
                            <span>Consulted by <strong className="text-slate-600">{v.doctor_name}</strong></span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'vitals' && (
              <div className="p-8">
                <h3 className="text-xl font-bold text-slate-800 mb-6">Recorded Vitals History</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4 text-center">BP</th>
                        <th className="px-6 py-4 text-center">Temp (°C)</th>
                        <th className="px-6 py-4 text-center">Pulse</th>
                        <th className="px-6 py-4 text-center">Weight (kg)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                      {patient.vitals?.map(v => (
                        <tr key={v.id} className="hover:bg-slate-50/50">
                          <td className="px-6 py-4 font-semibold">{new Date(v.recorded_at).toLocaleDateString()}</td>
                          <td className="px-6 py-4 text-center">{v.blood_pressure}</td>
                          <td className="px-6 py-4 text-center">{v.temperature}</td>
                          <td className="px-6 py-4 text-center">{v.pulse}</td>
                          <td className="px-6 py-4 text-center">{v.weight}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
