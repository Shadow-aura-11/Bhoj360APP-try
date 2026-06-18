import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Utensils,
  Plus,
  Search,
  Clock,
  Users,
  DollarSign,
  Truck,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  MoreVertical,
  Calendar
} from 'lucide-react';
import DashboardShell from '../../components/Layout/DashboardShell';
import { createApi } from '../../api/client';
import toast from 'react-hot-toast';

export default function CateringManager() {
  const { restaurantId, tenantId } = useParams();
  const currentId = tenantId || restaurantId;
  const api = createApi(currentId);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [events, setEvents] = useState([]);
  const [vendors, setVendors] = useState([]);

  const [formData, setFormData] = useState({
    event_id: '',
    vendor_id: '',
    menu_details: '',
    guest_count: 50,
    total_price: 0,
    status: 'Pending'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ordersRes, eventsRes, vendorsRes] = await Promise.all([
        api.get('/catering-orders'),
        api.get('/events'),
        api.get('/vendors')
      ]);
      setOrders(ordersRes.data);
      setEvents(eventsRes.data);
      setVendors(vendorsRes.data.filter(v => v.category === 'Catering'));
    } catch (err) {
      toast.error('Failed to load catering data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/catering-orders', formData);
      toast.success('Catering order saved');
      setShowModal(false);
      fetchData();
    } catch (err) {
      toast.error('Failed to save catering order');
    }
  };

  const content = (
    <div className="p-6 max-w-7xl mx-auto space-y-6">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
          <div>
            <h1 className="font-display font-black text-2xl text-slate-800 tracking-tight flex items-center gap-2">
              <Utensils className="w-6 h-6 text-indigo-600" />
              Catering Services
            </h1>
            <p className="text-slate-500 text-xs mt-1">
              Coordinate menus and guest counts with internal and external kitchens.
            </p>
          </div>
          <button
            onClick={() => {
              setFormData({ event_id: '', vendor_id: '', menu_details: '', guest_count: 50, total_price: 0, status: 'Pending' });
              setShowModal(true);
            }}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-sm shadow-md"
          >
            <Plus className="w-4 h-4" /> New Order
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all">
              <div className="flex flex-col lg:flex-row justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${
                      order.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {order.status}
                    </span>
                    <span className="text-xs text-slate-400 font-bold flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Order ID: #{order.id}
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-lg text-slate-800 mb-1">{order.event_title}</h3>
                  <p className="text-slate-500 text-xs flex items-center gap-1.5 mb-4">
                    <Truck className="w-3.5 h-3.5" />
                    Vendor: <span className="font-bold text-slate-700">{order.vendor_name || 'Internal Kitchen'}</span>
                  </p>

                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Menu Highlights</p>
                    <p className="text-xs text-slate-600 leading-relaxed italic">
                      "{order.menu_details}"
                    </p>
                  </div>
                </div>

                <div className="lg:w-64 flex flex-col justify-center border-t lg:border-t-0 lg:border-l border-slate-100 lg:pl-6 pt-6 lg:pt-0">
                  <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Guest Count</span>
                      <span className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-indigo-500" />
                        {order.guest_count}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Total Cost</span>
                      <span className="text-sm font-black text-emerald-600 flex items-center gap-1.5">
                        <DollarSign className="w-4 h-4" />
                        ₹{order.total_price.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="mt-6 flex gap-2">
                    <button className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors">
                      Details
                    </button>
                    <button className="p-2.5 border border-slate-200 hover:bg-slate-50 text-slate-400 rounded-xl transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {orders.length === 0 && (
            <div className="py-20 text-center bg-white border border-dashed border-slate-300 rounded-3xl">
              <Utensils className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-400 text-sm font-medium">No catering orders registered yet.</p>
            </div>
          )}
        </div>

        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-200">
              <form onSubmit={handleSubmit} className="p-8 space-y-4">
                <h2 className="font-display font-black text-xl text-slate-800 mb-6">
                  Log Catering Order
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Associated Event</label>
                    <select
                      required
                      value={formData.event_id}
                      onChange={(e) => setFormData({...formData, event_id: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm"
                    >
                      <option value="">Select Event</option>
                      {events.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Catering Vendor</label>
                    <select
                      required
                      value={formData.vendor_id}
                      onChange={(e) => setFormData({...formData, vendor_id: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm"
                    >
                      <option value="">Select Vendor</option>
                      <option value="0">Internal Kitchen</option>
                      {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Expected Guests</label>
                      <input
                        type="number"
                        required
                        value={formData.guest_count}
                        onChange={(e) => setFormData({...formData, guest_count: parseInt(e.target.value)})}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Quote Amount (₹)</label>
                      <input
                        type="number"
                        required
                        value={formData.total_price}
                        onChange={(e) => setFormData({...formData, total_price: parseFloat(e.target.value)})}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Menu / Packages Details</label>
                    <textarea
                      required
                      value={formData.menu_details}
                      onChange={(e) => setFormData({...formData, menu_details: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm h-24 resize-none"
                      placeholder="e.g. Standard Veg Buffet, 4 Starters, 2 Main Course..."
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
                    Save Order
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
    <DashboardShell title="Catering Management" restaurantId={restaurantId} role="admin">
      {content}
    </DashboardShell>
  );
}
