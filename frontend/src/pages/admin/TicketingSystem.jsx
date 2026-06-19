import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Ticket,
  Plus,
  Search,
  TrendingUp,
  Tag,
  Users,
  DollarSign,
  AlertCircle,
  BrainCircuit,
  QrCode
} from 'lucide-react';
import DashboardShell from '../../components/Layout/DashboardShell';
import { createApi } from '../../api/client';
import toast from 'react-hot-toast';

export default function TicketingSystem() {
  const { tenantId, tenantId } = useParams();
  const currentId = tenantId || tenantId;
  const api = createApi(currentId);

  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);
  const [optimizedPricing, setOptimizedPricing] = useState({});

  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    quantity: 100,
    description: ''
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await api.get('/events');
      setEvents(res.data);
      if (res.data.length > 0) {
        setSelectedEventId(res.data[0].id);
        fetchTickets(res.data[0].id);
      }
    } catch (err) {
      toast.error('Failed to load events');
    }
  };

  const fetchTickets = async (eventId) => {
    try {
      setLoading(true);
      const res = await api.get(`/events/${eventId}/tickets`);
      setTickets(res.data);
    } catch (err) {
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const fetchOptimizedPricing = async () => {
    if (!selectedEventId) return;
    try {
      const res = await api.get(`/ai/ticket-pricing/${selectedEventId}`);
      const mapping = {};
      res.data.forEach(item => {
        mapping[item.ticketId] = item;
      });
      setOptimizedPricing(mapping);
      toast.success('AI Pricing optimization complete');
    } catch (err) {
      toast.error('Pricing AI currently unavailable');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tickets', { ...formData, event_id: selectedEventId, id: editingTicket?.id });
      toast.success(editingTicket ? 'Ticket updated' : 'Ticket created');
      setShowModal(false);
      fetchTickets(selectedEventId);
    } catch (err) {
      toast.error('Failed to save ticket');
    }
  };

  const content = (
    <div className="p-6 max-w-7xl mx-auto space-y-6">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
          <div>
            <h1 className="font-display font-black text-2xl text-slate-800 tracking-tight flex items-center gap-2">
              <Ticket className="w-6 h-6 text-indigo-600" />
              Ticketing & Admission
            </h1>
            <div className="mt-2 flex items-center gap-3">
              <select
                value={selectedEventId}
                onChange={(e) => { setSelectedEventId(e.target.value); fetchTickets(e.target.value); }}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none"
              >
                {events.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchOptimizedPricing}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-50 text-indigo-600 font-bold rounded-2xl text-xs transition-all border border-indigo-100 hover:bg-indigo-100"
            >
              <BrainCircuit className="w-4 h-4" /> Optimize Prices
            </button>
            <button
              onClick={() => {
                setEditingTicket(null);
                setFormData({ name: '', price: 0, quantity: 100, description: '' });
                setShowModal(true);
              }}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-xs transition-all shadow-md"
            >
              <Plus className="w-4 h-4" /> Create Ticket
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-6">
                <div className="flex-1 w-full">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-display font-bold text-lg text-slate-800">{ticket.name}</h3>
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] font-bold uppercase tracking-wider">
                      Tier {ticket.id}
                    </span>
                  </div>
                  <p className="text-slate-500 text-xs mb-4">{ticket.description}</p>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-slate-50 p-3 rounded-2xl">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Price</span>
                      <span className="text-sm font-black text-slate-700">₹{ticket.price}</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-2xl">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Sold</span>
                      <span className="text-sm font-black text-slate-700">{ticket.sold} / {ticket.quantity}</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-2xl">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Revenue</span>
                      <span className="text-sm font-black text-emerald-600">₹{(ticket.sold * ticket.price).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-auto">
                  <button className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors">
                    Edit
                  </button>
                  <button className="flex-1 px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5">
                    <QrCode className="w-3.5 h-3.5" /> Scan
                  </button>
                </div>

                {optimizedPricing[ticket.id] && (
                  <div className="w-full mt-4 p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-5 h-5 text-amber-600" />
                      <div>
                        <p className="text-[10px] font-bold text-amber-800 uppercase">AI Recommendation</p>
                        <p className="text-xs text-amber-700">{optimizedPricing[ticket.id].reason}. Suggesting <span className="font-bold">₹{optimizedPricing[ticket.id].suggestedPrice}</span></p>
                      </div>
                    </div>
                    <button className="px-3 py-1.5 bg-amber-600 text-white text-[10px] font-bold rounded-lg hover:bg-amber-700 transition-colors">
                      Apply Price
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
              <h3 className="font-display font-black text-lg text-slate-800 mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
                Sales Summary
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1.5">
                    <span className="text-slate-500 uppercase">Capacity Filled</span>
                    <span className="text-slate-800">72%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-indigo-600 h-full rounded-full" style={{ width: '72%' }}></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Total Sales</p>
                    <p className="text-lg font-black text-slate-800">₹8.4L</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Active Users</p>
                    <p className="text-lg font-black text-slate-800">1.2K</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
              <BrainCircuit className="absolute -right-4 -bottom-4 w-32 h-32 text-indigo-500 opacity-20 rotate-12" />
              <h3 className="font-display font-bold text-lg mb-2 relative z-10">Smart Ticketing</h3>
              <p className="text-indigo-100 text-xs leading-relaxed mb-4 relative z-10">
                Our AI analyzes velocity, historical demand, and seasonality to recommend the perfect price point for maximum yield.
              </p>
              <button className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-xs font-bold transition-all relative z-10">
                View Reports
              </button>
            </div>
          </div>
        </div>

        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-200">
              <form onSubmit={handleSubmit} className="p-8 space-y-4">
                <h2 className="font-display font-black text-xl text-slate-800 mb-6">
                  {editingTicket ? 'Edit Ticket Type' : 'New Ticket Type'}
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Ticket Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      placeholder="e.g. Early Bird"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Price (₹)</label>
                      <input
                        type="number"
                        required
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Quantity</label>
                      <input
                        type="number"
                        required
                        value={formData.quantity}
                        onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value)})}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm h-24 resize-none"
                    />
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
                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-sm transition-all shadow-lg"
                  >
                    {editingTicket ? 'Save Changes' : 'Create Ticket'}
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
    <DashboardShell title="Ticketing System" tenantId={tenantId} role="admin">
      {content}
    </DashboardShell>
  );
}
