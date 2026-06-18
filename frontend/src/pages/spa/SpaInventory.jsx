import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Package, Plus, Search, AlertTriangle, RefreshCw, ShoppingBag, Truck } from 'lucide-react';
import { createApi } from '../../api/client';
import toast from 'react-hot-toast';

export default function SpaInventory() {
  const { restaurantId } = useParams();
  const api = createApi(restaurantId);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const res = await api.get('/spa/inventory');
      setItems(res.data);
    } catch (err) {
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter(i =>
    i.item_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 bg-slate-50 min-h-screen font-body">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Package className="w-6 h-6 text-blue-600" /> Spa Resource Inventory
          </h1>
          <p className="text-sm text-slate-500 mt-1">Track oils, cremes, and retail products</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-200 transition-all">
          <Plus className="w-5 h-5" /> Add Product
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search inventory..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
          <button onClick={fetchInventory} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 transition-colors">
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        <table className="w-full text-left">
          <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
            <tr>
              <th className="px-6 py-4">Item Name</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Quantity</th>
              <th className="px-6 py-4">Supplier</th>
              <th className="px-6 py-4">Unit Cost</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 text-sm">
            {filteredItems.map(item => (
              <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-slate-700">{item.item_name}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold uppercase">{item.category || 'General'}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className={`font-mono font-bold ${item.quantity <= item.min_quantity ? 'text-rose-500' : 'text-slate-700'}`}>
                      {item.quantity} {item.unit}
                    </span>
                    {item.quantity <= item.min_quantity && (
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-500">{item.supplier || 'N/A'}</td>
                <td className="px-6 py-4 font-mono text-slate-600 font-bold">₹{item.cost_per_unit}</td>
                <td className="px-6 py-4 text-right">
                  <button className="text-blue-600 font-bold text-xs hover:underline">Adjust Stock</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
