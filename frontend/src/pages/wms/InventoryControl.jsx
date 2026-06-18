import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Search,
  Filter,
  ArrowRightLeft,
  History,
  AlertTriangle,
  MoreVertical,
  Plus,
  ChevronRight,
  Package,
  Box,
  MapPin,
  ClipboardList
} from 'lucide-react';
import axios from 'axios';

export default function InventoryControl() {
  const { restaurantId } = useParams();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const { data } = await axios.get(`/r/${restaurantId}/wms/inventory`);
        setInventory(data);
      } catch (err) {
        console.error('Failed to fetch inventory', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInventory();
  }, [restaurantId]);

  const filteredInventory = inventory.filter(item =>
    item.product_name.toLowerCase().includes(search.toLowerCase()) ||
    item.sku.toLowerCase().includes(search.toLowerCase()) ||
    item.bin_code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <Package size={20} />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Inventory Intelligence</h1>
          </div>
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Real-time Stock & Bin Management</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 flex items-center gap-2 hover:bg-slate-50 transition-colors">
            <History size={14} /> Audit Logs
          </button>
          <button className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-emerald-500 transition-all shadow-md shadow-emerald-500/10">
            <Plus size={14} /> Manual Adjustment
          </button>
        </div>
      </header>

      {/* Control Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by SKU, Product Name, or Bin Code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 transition-all"
          />
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-slate-50 rounded-xl text-slate-500 flex items-center gap-2 text-xs font-bold hover:bg-slate-100 transition-colors">
            <Filter size={14} /> Zones
          </button>
          <button className="px-4 py-2 bg-slate-50 rounded-xl text-slate-500 flex items-center gap-2 text-xs font-bold hover:bg-slate-100 transition-colors">
            <ClipboardList size={14} /> Category
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th className="px-6 py-4">Product / SKU</th>
                <th className="px-6 py-4">Current Location</th>
                <th className="px-6 py-4">Zone</th>
                <th className="px-6 py-4">Quantity</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {loading ? (
                <tr><td colSpan="6" className="p-20 text-center text-slate-400 font-bold animate-pulse">Initializing Data Stream...</td></tr>
              ) : filteredInventory.length === 0 ? (
                <tr><td colSpan="6" className="p-20 text-center text-slate-400">No inventory records found.</td></tr>
              ) : filteredInventory.map((item, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-bold text-slate-800">{item.product_name}</div>
                      <div className="text-[10px] font-mono text-slate-400 mt-0.5">{item.sku}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                        <Box size={14} />
                      </div>
                      <span className="font-mono font-bold text-slate-700">{item.bin_code}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {item.zone_name}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-black text-slate-800 text-base">{item.quantity} <span className="text-[10px] font-normal text-slate-400 ml-0.5">UNITS</span></div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-tighter ${
                      item.quantity < 50 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
                    }`}>
                      {item.quantity < 50 ? 'Low Stock' : 'Stable'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-slate-300 hover:text-slate-600 hover:bg-white rounded-lg transition-all">
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Low Stock Alerts */}
      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-rose-50 border border-rose-100 rounded-3xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-rose-500 rounded-lg text-white">
              <AlertTriangle size={18} />
            </div>
            <h3 className="font-bold text-rose-900">Critical Shortages</h3>
          </div>
          <div className="space-y-3">
            {inventory.filter(x => x.quantity < 20).length === 0 ? (
              <p className="text-xs text-rose-600 font-semibold italic">No critical shortages detected.</p>
            ) : inventory.filter(x => x.quantity < 20).map((item, i) => (
              <div key={i} className="flex justify-between items-center bg-white/60 p-3 rounded-xl">
                <span className="text-xs font-bold text-rose-800">{item.product_name}</span>
                <span className="text-xs font-black text-rose-600">{item.quantity} Left</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-indigo-500 rounded-lg text-white">
              <ArrowRightLeft size={18} />
            </div>
            <h3 className="font-bold text-indigo-900">Replenishment Needs</h3>
          </div>
          <p className="text-xs text-indigo-600 font-semibold mb-4 leading-relaxed">The following items are below their safety stock threshold and require replenishment tasks.</p>
          <button className="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/10">
            Generate Replenishment Tasks
          </button>
        </div>
      </div>
    </div>
  );
}
