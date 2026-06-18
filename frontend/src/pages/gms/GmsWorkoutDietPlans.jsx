import React, { useState, useEffect } from 'react';
import {
  Activity,
  Utensils,
  Dumbbell,
  Plus,
  ChevronRight,
  Clock,
  Zap,
  Target,
  RefreshCcw
} from 'lucide-react';
import { useParams } from 'react-router-dom';
import { createApi } from '../../api/client';
import toast from 'react-hot-toast';

const GmsWorkoutDietPlans = () => {
  const { gymId } = useParams();
  const api = createApi(gymId);
  const [activeTab, setActiveTab] = useState('workouts');
  const [workouts, setWorkouts] = useState([]);
  const [diets, setDiets] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [wRes, dRes] = await Promise.all([
        api.get('/workouts'),
        api.get('/diet-plans')
      ]);
      setWorkouts(wRes.data || []);
      setDiets(dRes.data || []);
    } catch (err) {
      toast.error("Failed to fetch plans library");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [gymId]);

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Training & Nutrition Library</h1>
          <p className="text-slate-500">Centralized repository for workout protocols and diet guides.</p>
        </div>
        <div className="flex gap-4">
          <button onClick={fetchData} className="p-2 text-slate-400 hover:text-blue-600 transition">
             <RefreshCcw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <div className="flex bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
            <button
              onClick={() => setActiveTab('workouts')}
              className={`px-4 py-2 rounded-md text-sm font-bold transition ${activeTab === 'workouts' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              Workouts
            </button>
            <button
              onClick={() => setActiveTab('diets')}
              className={`px-4 py-2 rounded-md text-sm font-bold transition ${activeTab === 'diets' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              Diets
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-6 rounded-2xl text-white shadow-lg shadow-blue-200">
            <Zap className="w-8 h-8 mb-4 opacity-80" />
            <h3 className="text-lg font-bold mb-1">AI Recommendation</h3>
            <p className="text-blue-100 text-sm mb-4">Leverage our neural engine to generate personalized protocols for members.</p>
            <button className="w-full py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg text-sm font-bold transition">
              Launch AI Coach
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800">
              {activeTab === 'workouts' ? 'Standard Workout Protocols' : 'Nutritional Templates'}
            </h3>
            <button className="flex items-center text-sm font-bold text-blue-600 hover:text-blue-700">
              <Plus className="w-4 h-4 mr-1" />
              {activeTab === 'workouts' ? 'New Workout' : 'New Diet Plan'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeTab === 'workouts' ? (
              workouts.length > 0 ? workouts.map(plan => (
                <div key={plan.id} className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition cursor-pointer group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-blue-50 p-2.5 rounded-lg text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition">
                      <Dumbbell className="w-5 h-5" />
                    </div>
                  </div>
                  <h4 className="font-bold text-slate-800 mb-1">{plan.name}</h4>
                  <div className="flex items-center text-xs text-slate-500 space-x-3 mb-4">
                    <span className="flex items-center"><Target className="w-3 h-3 mr-1" /> Member: {plan.member_id}</span>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                    <span className="text-xs font-medium text-blue-600">View Structure</span>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                  </div>
                </div>
              )) : (
                <div className="md:col-span-2 py-12 text-center text-slate-400 italic">No workout plans found in the repository.</div>
              )
            ) : (
              diets.length > 0 ? diets.map(plan => (
                <div key={plan.id} className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition cursor-pointer group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-emerald-50 p-2.5 rounded-lg text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition">
                      <Utensils className="w-5 h-5" />
                    </div>
                  </div>
                  <h4 className="font-bold text-slate-800 mb-1">{plan.name}</h4>
                  <div className="flex items-center text-xs text-slate-500 space-x-3 mb-4">
                    <span className="flex items-center"><Target className="w-3 h-3 mr-1" /> Member: {plan.member_id}</span>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                    <span className="text-xs font-medium text-emerald-600">View Diet Guide</span>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                  </div>
                </div>
              )) : (
                 <div className="md:col-span-2 py-12 text-center text-slate-400 italic">No diet plans found in the repository.</div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GmsWorkoutDietPlans;
