import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Pill, Search, Plus, ArrowLeft, AlertCircle, ShoppingCart } from 'lucide-react';
import { createApi } from '../../api/client';
import toast from 'react-hot-toast';

export default function Pharmacy() {
  const { tenantId } = useParams();
  const api = createApi(tenantId);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchInventory = async () => {
    try {
      const { data } = await api.get('/api/hms/inventory');
      setInventory(data);
    } catch (err) {
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [tenantId]);

  const filteredItems = inventory.filter(item =>
    item.item_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 md:p-10 bg-slate-50 min-h-screen font-body">
      <div className="flex items-center gap-4 mb-8">
        <Link to={`/r/${tenantId}/hms`} className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 font-display">Pharmacy & Medical Supplies</h1>
          <p className="text-slate-500 text-sm">Manage medication stock and inventory levels.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Items</span>
            <Pill className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-black text-slate-800 font-display">{inventory.length}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Low Stock Alert</span>
            <AlertCircle className="w-4 h-4 text-red-500" />
          </div>
          <p className="text-2xl font-black text-red-600 font-display">
            {inventory.filter(i => i.quantity <= i.min_quantity).length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Inventory Value</span>
            <ShoppingCart className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600 font-display">
            ₹{inventory.reduce((acc, i) => acc + (i.price * i.quantity), 0).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search medicine name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-blue-500 shadow-sm"
          />
        </div>
        <button className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-2xl text-sm font-bold flex items-center gap-2 shadow-lg transition-all">
          <Plus className="w-5 h-5" />
          <span>Add New Stock</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <th className="px-6 py-4">Item Name</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4 text-center">Stock Level</th>
              <th className="px-6 py-4">Unit</th>
              <th className="px-6 py-4 text-right">Price per Unit</th>
              <th className="px-6 py-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
            {loading ? (
              <tr><td colSpan="6" className="px-6 py-10 text-center animate-pulse">Syncing pharmacy inventory...</td></tr>
            ) : filteredItems.length === 0 ? (
              <tr><td colSpan="6" className="px-6 py-20 text-center text-slate-400">No medical supplies found.</td></tr>
            ) : filteredItems.map(item => (
              <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 font-bold text-slate-800">{item.item_name}</td>
                <td className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase">{item.category}</td>
                <td className="px-6 py-4 text-center">
                  <span className={`font-mono font-bold ${item.quantity <= item.min_quantity ? 'text-red-500' : 'text-slate-700'}`}>
                    {item.quantity}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-400">{item.unit}</td>
                <td className="px-6 py-4 text-right font-bold">₹{item.price}</td>
                <td className="px-6 py-4 text-right">
                  {item.quantity <= item.min_quantity ? (
                    <span className="px-2 py-0.5 bg-red-50 text-red-600 rounded text-[10px] font-black uppercase">Low Stock</span>
                  ) : (
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[10px] font-black uppercase">Available</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
