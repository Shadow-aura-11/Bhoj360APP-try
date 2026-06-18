import React, { useState, useEffect } from 'react';
import {
  Settings,
  Wrench,
  Calendar,
  Clock,
  AlertCircle,
  Plus,
  RefreshCcw
} from 'lucide-react';
import { useParams } from 'react-router-dom';
import { createApi } from '../../api/client';
import toast from 'react-hot-toast';

export default function GmsFacilityManager() {
  const { gymId } = useParams();
  const api = createApi(gymId);
  const [equipment, setEquipment] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [eqRes, classRes] = await Promise.all([
        api.get('/equipment'),
        api.get('/classes')
      ]);
      setEquipment(eqRes.data || []);
      setClasses(classRes.data || []);
    } catch (err) {
      toast.error("Failed to fetch facility data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [gymId]);

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Facility & Ops</h1>
          <p className="text-slate-500">Real-time status of your gym's assets and schedules.</p>
        </div>
        <button
          onClick={fetchData}
          className="p-2 text-slate-400 hover:text-blue-600 transition"
        >
          <RefreshCcw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Equipment Section */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Wrench className="w-5 h-5 text-indigo-500" /> Equipment Health
            </h3>
            <button className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100">
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            {equipment.length > 0 ? equipment.map(item => (
              <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <p className="font-bold text-slate-800">{item.name}</p>
                  <p className="text-[10px] text-slate-400 font-mono">SN: {item.serial_number || 'N/A'}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                  item.status === 'operational' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                }`}>
                  {item.status}
                </span>
              </div>
            )) : (
              <p className="py-8 text-center text-slate-400 italic">No equipment listed.</p>
            )}
          </div>
        </div>

        {/* Classes Section */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-500" /> Live Class Schedule
            </h3>
            <button className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100">
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            {classes.length > 0 ? classes.map(cls => (
              <div key={cls.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl border border-slate-200 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-slate-400" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{cls.name}</p>
                    <p className="text-xs text-slate-400">{new Date(cls.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} • Cap: {cls.capacity}</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-[10px] font-bold text-slate-600 uppercase">
                  {cls.status}
                </span>
              </div>
            )) : (
              <p className="py-8 text-center text-slate-400 italic">No classes scheduled for today.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
