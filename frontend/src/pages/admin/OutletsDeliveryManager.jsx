import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, MapPin, Phone, Check, ShieldAlert, Edit2, Trash2, Globe, Sparkles, Navigation, DollarSign } from 'lucide-react';
import DashboardShell from '../../components/Layout/DashboardShell';
import { createApi } from '../../api/client';
import toast from 'react-hot-toast';

export default function OutletsDeliveryManager() {
  const { restaurantId } = useParams();
  const api = createApi(restaurantId);

  const [outlets, setOutlets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingOutlet, setEditingOutlet] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    delivery_radius: 5,
    delivery_charge: 40,
    delivery_enabled: true,
    zomato_enabled: true,
    swiggy_enabled: true
  });

  useEffect(() => {
    fetchOutlets();
  }, []);

  const fetchOutlets = async () => {
    try {
      setLoading(true);
      const res = await api.get('/outlets');
      setOutlets(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load outlets');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingOutlet(null);
    setFormData({
      name: '',
      address: '',
      phone: '',
      delivery_radius: 5,
      delivery_charge: 40,
      delivery_enabled: true,
      zomato_enabled: true,
      swiggy_enabled: true
    });
    setShowModal(true);
  };

  const openEditModal = (outlet) => {
    setEditingOutlet(outlet);
    setFormData({
      name: outlet.name,
      address: outlet.address,
      phone: outlet.phone || '',
      delivery_radius: outlet.delivery_radius || 5,
      delivery_charge: outlet.delivery_charge || 0,
      delivery_enabled: outlet.delivery_enabled === 1,
      zomato_enabled: outlet.zomato_enabled === 1,
      swiggy_enabled: outlet.swiggy_enabled === 1
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        id: editingOutlet?.id
      };
      await api.post('/outlets', payload);
      toast.success(editingOutlet ? 'Outlet updated successfully' : 'Outlet added successfully');
      setShowModal(false);
      fetchOutlets();
    } catch (err) {
      console.error(err);
      toast.error('Failed to save outlet');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this outlet?')) return;
    try {
      await api.delete(`/outlets/${id}`);
      toast.success('Outlet deleted successfully');
      fetchOutlets();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete outlet');
    }
  };

  return (
    <DashboardShell title="Outlets & Delivery" restaurantId={restaurantId} role="admin">
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -z-1"></div>
          <div>
            <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-xs font-mono uppercase tracking-widest font-semibold inline-flex items-center gap-1.5 mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Multi-location Suite
            </span>
            <h1 className="font-display font-black text-3xl md:text-4xl tracking-tight">
              Outlets & Delivery
            </h1>
            <p className="text-slate-400 text-sm mt-1.5 max-w-md">
              Manage physical restaurant locations and integrate delivery channels like Zomato & Swiggy.
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-650 hover:bg-indigo-600 active:scale-95 transition-all text-white font-semibold rounded-2xl shadow-lg shadow-indigo-650/30 hover:shadow-indigo-600/40 text-sm"
          >
            <Plus className="w-4 h-4" /> Add New Outlet
          </button>
        </div>

        {/* Loading / Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2].map((n) => (
              <div key={n} className="bg-white border border-slate-200/80 rounded-3xl p-6 h-64 animate-pulse space-y-4">
                <div className="h-6 w-1/3 bg-slate-200 rounded-lg"></div>
                <div className="h-4 w-2/3 bg-slate-150 rounded-lg"></div>
                <div className="h-4 w-1/2 bg-slate-150 rounded-lg"></div>
                <div className="h-10 bg-slate-100 rounded-2xl mt-6"></div>
              </div>
            ))}
          </div>
        ) : outlets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white border border-slate-150 rounded-3xl text-center p-8">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-4">
              <MapPin className="w-8 h-8 animate-bounce" />
            </div>
            <h3 className="font-display font-bold text-lg text-slate-800">No Outlets Registered</h3>
            <p className="text-slate-500 text-sm max-w-sm mt-1">
              Add your restaurant outlets to manage settings, map coordinates, and activate delivery channels.
            </p>
            <button
              onClick={openAddModal}
              className="mt-5 px-5 py-2.5 bg-indigo-650 hover:bg-indigo-600 text-white text-sm font-semibold rounded-xl transition-all"
            >
              Configure First Outlet
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {outlets.map((outlet) => (
              <div
                key={outlet.id}
                className="bg-white border border-slate-200/80 hover:border-indigo-150 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <h3 className="font-display font-bold text-lg text-slate-800">{outlet.name}</h3>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openEditModal(outlet)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(outlet.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-slate-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2.5 text-sm text-slate-600">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                      <span>{outlet.address}</span>
                    </div>
                    {outlet.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <span>{outlet.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Delivery Parameters */}
                  <div className="mt-6 border-t border-slate-100 pt-5 space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Navigation className="w-3.5 h-3.5" /> Radius
                      </span>
                      <span className="font-semibold text-slate-800 font-mono">
                        {outlet.delivery_radius || 5} km
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5" /> Delivery Fee
                      </span>
                      <span className="font-semibold text-slate-800 font-mono">
                        ₹{outlet.delivery_charge || 0}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Delivery Integrations */}
                <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap gap-2">
                  <span className={`px-2.5 py-1 text-[11px] font-bold rounded-lg ${
                    outlet.delivery_enabled === 1 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                      : 'bg-slate-50 text-slate-400 border border-slate-100'
                  }`}>
                    {outlet.delivery_enabled === 1 ? '● Delivery Active' : '○ Delivery Disabled'}
                  </span>
                  
                  <span className={`px-2.5 py-1 text-[11px] font-bold rounded-lg ${
                    outlet.zomato_enabled === 1
                      ? 'bg-rose-50 text-rose-700 border border-rose-100'
                      : 'bg-slate-50 text-slate-400'
                  }`}>
                    Zomato
                  </span>

                  <span className={`px-2.5 py-1 text-[11px] font-bold rounded-lg ${
                    outlet.swiggy_enabled === 1
                      ? 'bg-orange-50 text-orange-700 border border-orange-100'
                      : 'bg-slate-50 text-slate-400'
                  }`}>
                    Swiggy
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal Form */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
              
              <div className="px-6 py-5 bg-slate-50 border-b border-slate-150 flex items-center justify-between">
                <h3 className="font-display font-black text-lg text-slate-800">
                  {editingOutlet ? 'Edit Outlet Details' : 'Add New Outlet'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors text-sm font-semibold p-1"
                >
                  Close
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Outlet Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500 text-sm"
                    placeholder="e.g. Downtown Central"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Address
                  </label>
                  <textarea
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500 text-sm h-20 resize-none"
                    placeholder="Physical location address..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500 text-sm"
                      placeholder="+91..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Delivery Radius (km)
                    </label>
                    <input
                      type="number"
                      value={formData.delivery_radius}
                      onChange={(e) => setFormData({ ...formData, delivery_radius: parseFloat(e.target.value) })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Base Delivery Fee (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.delivery_charge}
                    onChange={(e) => setFormData({ ...formData, delivery_charge: parseFloat(e.target.value) })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500 text-sm"
                  />
                </div>

                {/* Integrations toggles */}
                <div className="bg-slate-50 rounded-2xl p-4 space-y-3.5 border border-slate-100">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Channel Integrations</h4>
                  
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-sm font-semibold text-slate-700">Self Delivery Service</span>
                    <input
                      type="checkbox"
                      checked={formData.delivery_enabled}
                      onChange={(e) => setFormData({ ...formData, delivery_enabled: e.target.checked })}
                      className="w-4.5 h-4.5 accent-indigo-650"
                    />
                  </label>
                  
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-sm font-semibold text-slate-700">Zomato Delivery Channel</span>
                    <input
                      type="checkbox"
                      checked={formData.zomato_enabled}
                      onChange={(e) => setFormData({ ...formData, zomato_enabled: e.target.checked })}
                      className="w-4.5 h-4.5 accent-rose-600"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-sm font-semibold text-slate-700">Swiggy Delivery Channel</span>
                    <input
                      type="checkbox"
                      checked={formData.swiggy_enabled}
                      onChange={(e) => setFormData({ ...formData, swiggy_enabled: e.target.checked })}
                      className="w-4.5 h-4.5 accent-orange-500"
                    />
                  </label>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-indigo-650 hover:bg-indigo-600 text-white font-semibold rounded-xl text-sm shadow-md"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </DashboardShell>
  );
}
