import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Building,
  Plus,
  MapPin,
  Home,
  Layers,
  ChevronRight,
  MoreVertical,
  Edit,
  Trash2,
  Filter
} from 'lucide-react';
import { createApi } from '../../api/client';
import toast from 'react-hot-toast';

export default function PropertyManager() {
  const { tenantId } = useParams();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [units, setUnits] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', type: 'Residential', address: '', city: '', country: '' });
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
  const [unitFormData, setUnitFormData] = useState({ floor_id: '', unit_number: '', type: 'Apartment', rent: 0 });
  const api = createApi(tenantId);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const { data } = await api.get('/properties');
      setProperties(data);
      if (data.length > 0 && !selectedProperty) {
          handleSelectProperty(data[0]);
      }
    } catch (err) {
      toast.error('Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProperty = async (e) => {
    e.preventDefault();
    try {
      await api.post('/properties', formData);
      toast.success('Property added successfully');
      setIsModalOpen(false);
      fetchProperties();
    } catch (err) {
      toast.error('Failed to add property');
    }
  };

  const handleAddUnit = async (e) => {
      e.preventDefault();
      // Implementation for adding unit...
      toast.success('Unit added successfully (Simulated)');
      setIsUnitModalOpen(false);
  };

  const handleSelectProperty = async (property) => {
      setSelectedProperty(property);
      try {
          const { data } = await api.get('/units');
          // For simplicity, filter units locally, though a dedicated endpoint is better
          const propertyUnits = data.filter(u => u.property_name === property.name);
          setUnits(propertyUnits);
      } catch (err) {
          toast.error('Failed to load units');
      }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Vacant': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Occupied': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'Maintenance': return 'bg-amber-50 text-amber-600 border-amber-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading Properties...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Building className="w-8 h-8 text-blue-600" />
            Properties & Units
          </h1>
          <p className="text-slate-500 mt-1">Manage your real estate portfolio</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-blue-200"
        >
          <Plus className="w-4 h-4" />
          Add Property
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Properties Sidebar */}
        <div className="lg:col-span-1 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2">Portfolio</h3>
            <div className="space-y-2">
                {properties.map(prop => (
                    <button
                        key={prop.id}
                        onClick={() => handleSelectProperty(prop)}
                        className={`w-full text-left p-4 rounded-2xl border transition-all ${
                            selectedProperty?.id === prop.id
                            ? 'bg-white border-blue-200 shadow-md ring-2 ring-blue-50'
                            : 'bg-white border-slate-200 hover:border-blue-100'
                        }`}
                    >
                        <div className="flex items-start justify-between">
                            <div className={`p-2 rounded-xl mb-3 ${selectedProperty?.id === prop.id ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-400'}`}>
                                <Building className="w-5 h-5" />
                            </div>
                            <ChevronRight className={`w-4 h-4 mt-2 transition-transform ${selectedProperty?.id === prop.id ? 'text-blue-500 translate-x-1' : 'text-slate-300'}`} />
                        </div>
                        <h4 className="font-bold text-slate-800 truncate">{prop.name}</h4>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1">
                            <MapPin className="w-3 h-3" />
                            <span>{prop.city}, {prop.country}</span>
                        </div>
                        <div className="mt-3 inline-block px-2 py-0.5 bg-slate-100 rounded text-[9px] font-bold text-slate-500 uppercase">
                            {prop.type}
                        </div>
                    </button>
                ))}
            </div>
        </div>

        {/* Units Grid */}
        <div className="lg:col-span-3">
            {selectedProperty ? (
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">{selectedProperty.name} — Units</h2>
                            <p className="text-sm text-slate-400 mt-0.5">{units.length} total units defined</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-xl border border-slate-200 transition-colors">
                                <Filter className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setIsUnitModalOpen(true)}
                                className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold text-xs hover:bg-slate-800 transition-colors"
                            >
                                New Unit
                            </button>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {units.map(unit => (
                                <div key={unit.id} className="border border-slate-100 rounded-2xl p-5 hover:border-blue-100 hover:shadow-sm transition-all relative group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter block mb-0.5">Unit</span>
                                            <h5 className="text-2xl font-black text-slate-900 font-mono">{unit.unit_number}</h5>
                                        </div>
                                        <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusColor(unit.status)}`}>
                                            {unit.status.toUpperCase()}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-y-3 mb-5">
                                        <div className="flex items-center gap-2 text-slate-500">
                                            <Layers className="w-4 h-4" />
                                            <span className="text-xs font-semibold">{unit.building_name}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-500">
                                            <Home className="w-4 h-4" />
                                            <span className="text-xs font-semibold">{unit.type}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-500">
                                            <span className="text-xs font-bold text-slate-900 font-mono">₹{unit.rent?.toLocaleString()}</span>
                                            <span className="text-[10px]">/mo</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 pt-4 border-t border-slate-50 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="flex-1 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 text-[10px] font-bold rounded-xl border border-slate-100 transition-colors flex items-center justify-center gap-1.5">
                                            <Edit className="w-3 h-3" /> Edit
                                        </button>
                                        <button className="flex-1 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 text-[10px] font-bold rounded-xl border border-rose-100 transition-colors flex items-center justify-center gap-1.5">
                                            <Trash2 className="w-3 h-3" /> Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {units.length === 0 && (
                                <div className="col-span-full py-20 text-center bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200">
                                    <Home className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                                    <p className="text-slate-500 font-medium">No units added to this property yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="h-full flex items-center justify-center bg-white rounded-3xl border border-dashed border-slate-200 p-20 text-center">
                    <div>
                        <Building className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-slate-400">Select a property to view its units</h3>
                    </div>
                </div>
            )}
        </div>
      </div>

      {/* Property Modal */}
      {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
              <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
                  <h2 className="text-2xl font-bold text-slate-900 mb-6">Add New Property</h2>
                  <form onSubmit={handleAddProperty} className="space-y-4">
                      <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Property Name</label>
                          <input
                            type="text"
                            required
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100"
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                          />
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Type</label>
                          <select
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100"
                            value={formData.type}
                            onChange={e => setFormData({...formData, type: e.target.value})}
                          >
                              <option>Residential</option>
                              <option>Commercial</option>
                              <option>Industrial</option>
                          </select>
                      </div>
                      <div className="flex gap-4 pt-6">
                          <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                          >
                              Cancel
                          </button>
                          <button
                            type="submit"
                            className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                          >
                              Save Property
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      {/* Unit Modal */}
      {isUnitModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
              <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
                  <h2 className="text-2xl font-bold text-slate-900 mb-6">Add New Unit</h2>
                  <form onSubmit={handleAddUnit} className="space-y-4">
                      <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Unit Number</label>
                          <input
                            type="text"
                            required
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100"
                            value={unitFormData.unit_number}
                            onChange={e => setUnitFormData({...unitFormData, unit_number: e.target.value})}
                          />
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Monthly Rent</label>
                          <input
                            type="number"
                            required
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 font-mono"
                            value={unitFormData.rent}
                            onChange={e => setUnitFormData({...unitFormData, rent: e.target.value})}
                          />
                      </div>
                      <div className="flex gap-4 pt-6">
                          <button
                            type="button"
                            onClick={() => setIsUnitModalOpen(false)}
                            className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                          >
                              Cancel
                          </button>
                          <button
                            type="submit"
                            className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                          >
                              Save Unit
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
}
