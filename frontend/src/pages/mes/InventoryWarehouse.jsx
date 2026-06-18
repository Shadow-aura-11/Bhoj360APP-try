import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Package, Archive, Truck, AlertCircle } from 'lucide-react';
import { createApi } from '../../api/client';
import toast from 'react-hot-toast';

export default function InventoryWarehouse() {
  const { restaurantId } = useParams();
  const api = createApi(restaurantId);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInventory = async () => {
    try {
      const { data } = await api.get(`/r/${restaurantId}/inventory`);
      setInventory(data);
    } catch (err) {
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [restaurantId]);

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Box className="text-emerald-600" /> Inventory & Warehouse Management
        </h1>
        <p className="text-slate-500 text-sm">Track raw materials, components, and finished goods</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {inventory.map(item => (
          <div key={item.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.category}</span>
                <h3 className="text-lg font-bold text-slate-800">{item.name}</h3>
                <p className="text-xs text-slate-400 font-mono">{item.sku}</p>
              </div>
              <div className={`p-2 rounded-xl ${item.quantity < 10 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                <Package size={20} />
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">{item.quantity}</span>
              <span className="text-slate-500 font-medium">{item.unit}</span>
            </div>

            {item.quantity < 10 && (
              <div className="mt-4 flex items-center gap-2 text-red-600 text-xs font-bold bg-red-50 p-2 rounded-lg">
                <AlertCircle size={14} /> Low stock warning
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Archive size={20} className="text-slate-400" /> Recent Stock Movements
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <Truck size={18} />
              </div>
              <div>
                <p className="font-bold text-sm">Stock Received: RM-STEEL-001</p>
                <p className="text-xs text-slate-500">From Supplier: Global Metals Corp</p>
              </div>
            </div>
            <span className="font-mono font-bold text-emerald-600">+50 m</span>
          </div>
        </div>
      </div>
    </div>
  );
}
