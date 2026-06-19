import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { MessageSquare, Star, User, Calendar, Trash2, CheckCircle } from 'lucide-react';
import { createApi } from '../../api/client';
import toast from 'react-hot-toast';
import { format, parseISO } from 'date-fns';

export default function CustomerFeedback() {
  const { tenantId } = useParams();
  const api = createApi(tenantId);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      const res = await api.get('/spa/feedback');
      setFeedback(res.data);
    } catch (err) {
      toast.error('Failed to load feedback');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            className={`w-3 h-3 ${star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen font-body">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-blue-600" /> Customer Voice
        </h1>
        <p className="text-sm text-slate-500 mt-1">Holistic feedback and service ratings</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {feedback.map(item => (
          <div key={item.id} className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 font-bold">
                  {item.customer_name[0]}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">{item.customer_name}</h3>
                  <p className="text-[10px] text-slate-400 font-mono uppercase">{item.appointment_date}</p>
                </div>
              </div>
              {renderStars(item.rating)}
            </div>

            <p className="text-sm text-slate-600 leading-relaxed italic flex-1">
              "{item.comments}"
            </p>

            <div className="mt-6 pt-4 border-t border-slate-50 space-y-3">
              <div className="flex justify-between items-center text-[10px] font-bold">
                <span className="text-slate-400 uppercase tracking-tighter">Therapist Performance</span>
                <div className="flex items-center gap-2">
                  <span className="text-slate-800">{item.staff_performance_rating}/5</span>
                  <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: `${(item.staff_performance_rating/5)*100}%` }} />
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center text-[10px] font-bold">
                <span className="text-slate-400 uppercase tracking-tighter">Facility Comfort</span>
                <div className="flex items-center gap-2">
                  <span className="text-slate-800">{item.facility_rating}/5</span>
                  <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: `${(item.facility_rating/5)*100}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {feedback.length === 0 && !loading && (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-100">
            <MessageSquare className="w-12 h-12 mx-auto text-slate-200 mb-2" />
            <p className="text-slate-400 font-medium italic">No feedback received yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
