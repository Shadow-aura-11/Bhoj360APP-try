import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Calendar,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit2,
  Trash2,
  Clock,
  MapPin,
  Users,
  DollarSign,
  TrendingUp,
  BrainCircuit,
  Ticket
} from 'lucide-react';
import DashboardShell from '../../components/Layout/DashboardShell';
import { createApi } from '../../api/client';
import toast from 'react-hot-toast';

export default function EventPlanner() {
  const { tenantId, tenantId } = useParams();
  const currentId = tenantId || tenantId;
  const api = createApi(currentId);

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingBooking] = useState(null);
  const [aiInsights, setAiInsights] = useState({});

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_type: 'Conference',
    start_date: '',
    end_date: '',
    status: 'Planning',
    budget: 0,
    venue_id: ''
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/events');
      setEvents(res.data);
    } catch (err) {
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const fetchAiInsights = async (eventId) => {
    try {
      const [attendance, revenue] = await Promise.all([
        api.get(`/ai/attendance-prediction/${eventId}`),
        api.get(`/ai/revenue-forecast/${eventId}`)
      ]);
      setAiInsights(prev => ({
        ...prev,
        [eventId]: { attendance: attendance.data, revenue: revenue.data }
      }));
    } catch (err) {
      console.error('AI Insights failed', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/events', { ...formData, id: editingEvent?.id });
      toast.success(editingEvent ? 'Event updated' : 'Event created');
      setShowModal(false);
      fetchEvents();
    } catch (err) {
      toast.error('Failed to save event');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this event?')) return;
    try {
      await api.delete(`/events/${id}`);
      toast.success('Event deleted');
      fetchEvents();
    } catch (err) {
      toast.error('Failed to delete event');
    }
  };

  const content = (
    <div className="p-6 max-w-7xl mx-auto space-y-6">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
          <div>
            <h1 className="font-display font-black text-2xl text-slate-800 tracking-tight flex items-center gap-2">
              <Calendar className="w-6 h-6 text-indigo-600" />
              Event Planner
            </h1>
            <p className="text-slate-500 text-xs mt-1">
              Organize and manage your enterprise-grade events.
            </p>
          </div>
          <button
            onClick={() => {
              setEditingBooking(null);
              setFormData({
                title: '',
                description: '',
                event_type: 'Conference',
                start_date: '',
                end_date: '',
                status: 'Planning',
                budget: 0,
                venue_id: ''
              });
              setShowModal(true);
            }}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-sm transition-all shadow-lg shadow-indigo-200"
          >
            <Plus className="w-4 h-4" /> Create Event
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div key={event.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all group">
              <div className="flex justify-between items-start mb-4">
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  event.status === 'Live' ? 'bg-emerald-100 text-emerald-700' :
                  event.status === 'Planning' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                }`}>
                  {event.status}
                </span>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setEditingBooking(event); setFormData(event); setShowModal(true); }} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-indigo-600">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(event.id)} className="p-2 hover:bg-rose-50 rounded-xl text-slate-400 hover:text-rose-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="font-display font-bold text-lg text-slate-800 mb-2">{event.title}</h3>
              <p className="text-slate-500 text-xs mb-4 line-clamp-2">{event.description}</p>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>{new Date(event.start_date).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <DollarSign className="w-4 h-4 text-slate-400" />
                  <span>Budget: ₹{event.budget.toLocaleString()}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => fetchAiInsights(event.id)}
                  className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-600 hover:text-indigo-700"
                >
                  <BrainCircuit className="w-3.5 h-3.5" />
                  AI Insights
                </button>
                <div className="flex -space-x-2">
                  <div className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[8px] font-bold text-slate-500">
                    +12
                  </div>
                </div>
              </div>

              {aiInsights[event.id] && (
                <div className="mt-4 p-4 bg-indigo-50 rounded-2xl space-y-3 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-indigo-700 uppercase">Predicted Attendance</span>
                    <span className="text-sm font-black text-indigo-900">{aiInsights[event.id].attendance.predictedAttendance}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-indigo-700 uppercase">Revenue Forecast</span>
                    <span className="text-sm font-black text-indigo-900">₹{aiInsights[event.id].revenue.forecastedTotalRevenue.toLocaleString()}</span>
                  </div>
                  <p className="text-[9px] text-indigo-600 italic leading-relaxed">
                    💡 {aiInsights[event.id].revenue.recommendation}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-xl w-full max-w-xl overflow-hidden animate-in zoom-in duration-200">
              <form onSubmit={handleSubmit} className="p-8 space-y-4">
                <h2 className="font-display font-black text-xl text-slate-800 mb-6">
                  {editingEvent ? 'Edit Event' : 'Create New Event'}
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Event Title</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      placeholder="e.g. Annual Tech Summit"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm h-24 resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Start Date</label>
                      <input
                        type="datetime-local"
                        required
                        value={formData.start_date}
                        onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">End Date</label>
                      <input
                        type="datetime-local"
                        required
                        value={formData.end_date}
                        onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Status</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm"
                      >
                        <option>Planning</option>
                        <option>Live</option>
                        <option>Completed</option>
                        <option>Cancelled</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Budget (₹)</label>
                      <input
                        type="number"
                        value={formData.budget}
                        onChange={(e) => setFormData({...formData, budget: parseFloat(e.target.value)})}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-6">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-sm transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-sm transition-all shadow-lg shadow-indigo-200"
                  >
                    {editingEvent ? 'Save Changes' : 'Create Event'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
  );

  if (tenantId) {
    return content;
  }

  return (
    <DashboardShell title="Event Planner" tenantId={tenantId} role="admin">
      {content}
    </DashboardShell>
  );
}
