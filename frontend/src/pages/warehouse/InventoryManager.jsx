import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Search, Plus, MapPin, Box, ArrowRightLeft, History, Tag, Scan } from 'lucide-react';
import toast from 'react-hot-toast';

export default function InventoryManager() {
  const { restaurantId } = useParams();
  const [items, setItems] = useState([]);
  const [locations, setLocations] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('stock'); // 'items', 'locations', 'stock'

  useEffect(() => {
    fetchData();
  }, [restaurantId]);

  const fetchData = async () => {
    try {
      const [itemsRes, locsRes, invRes] = await Promise.all([
        fetch(`/r/${restaurantId}/items`),
        fetch(`/r/${restaurantId}/locations`),
        fetch(`/r/${restaurantId}/inventory`)
      ]);

      setItems(await itemsRes.json());
      setLocations(await locsRes.json());
      setInventory(await invRes.json());
      setLoading(false);
    } catch (err) {
      toast.error('Failed to load inventory data');
    }
  };

  if (loading) return <div className="p-10 text-center text-slate-500">Loading Inventory...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Inventory Manager</h1>
          <p className="text-slate-500 text-sm">Control your stock levels and warehouse locations.</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-sm hover:bg-blue-700 transition-all">
            <Plus className="w-4 h-4" />
            Add New SKU
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all">
            <Scan className="w-4 h-4" />
            Cycle Count
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 bg-slate-200/50 p-1 rounded-2xl w-fit">
        {['stock', 'items', 'locations'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === tab ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        {activeTab === 'stock' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Item / SKU</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Quantity</th>
                  <th className="px-6 py-4">Batch</th>
                  <th className="px-6 py-4">Last Updated</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inventory.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800">{inv.item_name}</div>
                      <div className="text-xs text-slate-400 font-mono">{inv.sku}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold border border-slate-200">
                        {inv.location_code}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-slate-900">{inv.quantity}</td>
                    <td className="px-6 py-4 text-xs text-slate-500">{inv.batch_number || 'N/A'}</td>
                    <td className="px-6 py-4 text-xs text-slate-400">{new Date(inv.updated_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                        <ArrowRightLeft className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'items' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {items.map((item) => (
              <div key={item.id} className="p-5 border border-slate-100 rounded-2xl bg-white hover:shadow-md transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                    <Box className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.category}</span>
                </div>
                <h3 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{item.name}</h3>
                <p className="text-xs text-slate-400 mb-4 font-mono mt-1">{item.sku}</p>
                <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500 uppercase">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3 h-3" /> {item.unit}
                  </span>
                  {item.barcode && (
                    <span className="flex items-center gap-1">
                      <Scan className="w-3 h-3" /> {item.barcode}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'locations' && (
          <div className="overflow-x-auto">
             <table className="w-full text-left">
              <thead className="bg-slate-50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Code</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Zone / Aisle</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Capacity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {locations.map((loc) => (
                  <tr key={loc.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-bold text-slate-800 font-mono">{loc.code}</td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                        {loc.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {loc.zone} {loc.aisle && `| Aisle ${loc.aisle}`}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs uppercase">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Active
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-slate-400 font-mono text-xs">80% Full</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
