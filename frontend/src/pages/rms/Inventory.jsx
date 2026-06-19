import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Package, AlertTriangle, ArrowUpRight, ArrowDownRight, RefreshCw, BarChart, Filter } from 'lucide-react';
import { createApi } from '../../api/client';
import toast from 'react-hot-toast';

export default function Inventory() {
  const { id: tenantId } = useParams();
  const api = createApi(tenantId);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const { data } = await api.get('/rms/inventory');
      setInventory(data);
    } catch (err) {
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen font-sans">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Inventory Control</h1>
          <p className="text-slate-500 mt-1">Multi-store stock tracking and replenishment.</p>
        </div>
        <div className="flex gap-3">
           <button onClick={fetchInventory} className="p-3 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-blue-600 transition-colors">
             <RefreshCw className="w-5 h-5" />
           </button>
           <button className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/10">
             New Purchase Order
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
               <Package className="w-6 h-6" />
             </div>
             <div>
               <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total SKUs</p>
               <p className="text-2xl font-black text-slate-900">{inventory.length}</p>
             </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
               <AlertTriangle className="w-6 h-6" />
             </div>
             <div>
               <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Low Stock Alerts</p>
               <p className="text-2xl font-black text-slate-900">
                 {inventory.filter(i => i.quantity <= i.min_stock_level).length}
               </p>
             </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
               <ArrowUpRight className="w-6 h-6" />
             </div>
             <div>
               <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Stock Value</p>
               <p className="text-2xl font-black text-slate-900">₹4.2M</p>
             </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h2 className="font-black text-slate-900">Real-time Stock Levels</h2>
          <div className="flex gap-2">
            <button className="p-2 text-slate-400 hover:text-slate-600"><Filter className="w-5 h-5" /></button>
            <button className="p-2 text-slate-400 hover:text-slate-600"><Barchart className="w-5 h-5" /></button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[11px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-4">Product / SKU</th>
                <th className="px-8 py-4">Current Stock</th>
                <th className="px-8 py-4">Reorder Point</th>
                <th className="px-8 py-4">Status</th>
                <th className="px-8 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                [1,2,3].map(i => <tr key={i} className="animate-pulse"><td colSpan="5" className="h-16 bg-white" /></tr>)
              ) : inventory.map((item) => {
                const isLow = item.quantity <= item.min_stock_level;
                return (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="font-bold text-slate-800">{item.product_name}</div>
                      <div className="text-[10px] font-mono text-slate-400 mt-1 uppercase tracking-tighter">{item.sku}</div>
                    </td>
                    <td className="px-8 py-5 font-mono font-bold text-slate-700">
                      {item.quantity} units
                    </td>
                    <td className="px-8 py-5 text-slate-500 text-sm">
                      {item.min_stock_level} units
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        isLow ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'
                      }`}>
                        {isLow ? 'Low Stock' : 'In Stock'}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button className="text-blue-600 font-bold text-xs hover:underline">Adjust Stock</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
