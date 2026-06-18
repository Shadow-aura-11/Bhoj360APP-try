import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Truck,
  Plus,
  Search,
  Star,
  Phone,
  Mail,
  MapPin,
  Tag,
  ExternalLink,
  Edit2,
  Trash2,
  Filter,
  BrainCircuit
} from 'lucide-react';
import DashboardShell from '../../components/Layout/DashboardShell';
import { createApi } from '../../api/client';
import toast from 'react-hot-toast';

export default function VendorManager() {
  const { restaurantId, tenantId } = useParams();
  const currentId = tenantId || restaurantId;
  const api = createApi(currentId);

  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    category: 'Catering',
    contact_person: '',
    phone: '',
    email: '',
    address: '',
    rating: 5
  });

  const categories = ['Catering', 'Decor', 'AudioVisual', 'Security', 'Entertainment', 'Logistics', 'Photography'];

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const res = await api.get('/vendors');
      setVendors(res.data);
    } catch (err) {
      toast.error('Failed to load vendors');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/vendors', { ...formData, id: editingVendor?.id });
      toast.success(editingVendor ? 'Vendor updated' : 'Vendor registered');
      setShowModal(false);
      fetchVendors();
    } catch (err) {
      toast.error('Failed to save vendor');
    }
  };

  const filteredVendors = vendors.filter(v =>
    v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const content = (
    <div className="p-6 max-w-7xl mx-auto space-y-6">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
          <div>
            <h1 className="font-display font-black text-2xl text-slate-800 tracking-tight flex items-center gap-2">
              <Truck className="w-6 h-6 text-indigo-600" />
              Vendor Ecosystem
            </h1>
            <p className="text-slate-500 text-xs mt-1">
              Manage external service providers and partner ratings.
            </p>
          </div>
          <div className="flex gap-2">
             <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-50 text-indigo-600 font-bold rounded-2xl text-xs border border-indigo-100">
              <BrainCircuit className="w-4 h-4" /> AI Matching
            </button>
            <button
              onClick={() => {
                setEditingVendor(null);
                setFormData({ name: '', category: 'Catering', contact_person: '', phone: '', email: '', address: '', rating: 5 });
                setShowModal(true);
              }}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-xs shadow-md"
            >
              <Plus className="w-4 h-4" /> Add Vendor
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search vendors by name or category..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 w-full">
            {['All', ...categories].map(cat => (
              <button
                key={cat}
                className="whitespace-nowrap px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-500 hover:border-indigo-500 hover:text-indigo-600 transition-all"
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVendors.map((vendor) => (
            <div key={vendor.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-sm">
                    {vendor.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-slate-800 text-sm leading-tight">{vendor.name}</h3>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{vendor.category}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg">
                  <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                  <span className="text-[10px] font-black text-amber-700">{vendor.rating}</span>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2.5 text-xs text-slate-600">
                  <Tag className="w-4 h-4 text-slate-400" />
                  <span className="font-medium">Contact: {vendor.contact_person}</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-600">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span>{vendor.phone}</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-600">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span className="truncate">{vendor.email}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                <button
                  onClick={() => { setEditingVendor(vendor); setFormData(vendor); setShowModal(true); }}
                  className="text-[10px] font-bold text-indigo-600 hover:underline"
                >
                  Manage Contract
                </button>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 hover:bg-slate-100 rounded-xl text-slate-400">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button className="p-2 hover:bg-rose-50 rounded-xl text-slate-400 hover:text-rose-600">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-200">
              <form onSubmit={handleSubmit} className="p-8 space-y-4">
                <h2 className="font-display font-black text-xl text-slate-800 mb-6">
                  {editingVendor ? 'Update Vendor' : 'Register New Vendor'}
                </h2>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Business Name</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Category</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm"
                      >
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Rating (1-5)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="1"
                        max="5"
                        value={formData.rating}
                        onChange={(e) => setFormData({...formData, rating: parseFloat(e.target.value)})}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Contact Person</label>
                      <input
                        type="text"
                        value={formData.contact_person}
                        onChange={(e) => setFormData({...formData, contact_person: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Phone Number</label>
                      <input
                        type="text"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Email Address</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Office Address</label>
                    <textarea
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm h-20 resize-none"
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
                    {editingVendor ? 'Update Details' : 'Register Vendor'}
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
    <DashboardShell title="Vendor Management" restaurantId={restaurantId} role="admin">
      {content}
    </DashboardShell>
  );
}
