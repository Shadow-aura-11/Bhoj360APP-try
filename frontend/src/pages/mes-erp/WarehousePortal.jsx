import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Package,
  Truck,
  ArrowDownLeft,
  ArrowUpRight,
  Box,
  Search,
  Filter,
  MoreVertical,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function WarehousePortal() {
  const { restaurantId } = useParams();
  const [inventory, setInventory] = useState([
    { id: 1, name: 'Microcontroller ATmega', sku: 'E-MIC-001', qty: 450, unit: 'pcs', warehouse: 'A-01', status: 'In Stock' },
    { id: 2, name: 'PCB Board 4-Layer', sku: 'E-PCB-04', qty: 120, unit: 'pcs', warehouse: 'A-05', status: 'Low Stock' },
    { id: 3, name: 'Industrial Casing', sku: 'M-CAS-99', qty: 850, unit: 'pcs', warehouse: 'B-12', status: 'In Stock' },
    { id: 4, name: 'Solder Paste 500g', sku: 'C-SOL-05', qty: 15, unit: 'tubes', warehouse: 'C-02', status: 'Critical' }
  ]);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Warehouse Portal</h1>
          <p className="text-slate-500 text-sm">Inventory management and logistics</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-500 transition-all flex items-center gap-2 shadow-sm">
            <ArrowDownLeft className="w-4 h-4" /> Goods Receipt
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-500 transition-all flex items-center gap-2 shadow-sm">
            <ArrowUpRight className="w-4 h-4" /> Ship Orders
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
           <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><Box className="w-6 h-6" /></div>
           <div>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Total SKUs</p>
              <h4 className="text-xl font-bold text-slate-800">1,248</h4>
           </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
           <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center"><AlertCircle className="w-6 h-6" /></div>
           <div>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Low Stock Alerts</p>
              <h4 className="text-xl font-bold text-slate-800">14 Items</h4>
           </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
           <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center"><Truck className="w-6 h-6" /></div>
           <div>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Pending Shipments</p>
              <h4 className="text-xl font-bold text-slate-800">8 Orders</h4>
           </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
         <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="font-bold text-slate-800">Stock Inventory</h3>
            <div className="flex gap-3 w-full sm:w-auto">
               <div className="relative flex-1 sm:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input type="text" placeholder="Search by SKU or name..." className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-blue-500" />
               </div>
               <button className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-500"><Filter className="w-4 h-4" /></button>
            </div>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3">Item Details</th>
                    <th className="px-6 py-3">SKU</th>
                    <th className="px-6 py-3">Quantity</th>
                    <th className="px-6 py-3">Warehouse Bin</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {inventory.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                         <span className="text-sm font-bold text-slate-700">{item.name}</span>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-500">{item.sku}</td>
                      <td className="px-6 py-4">
                         <span className="text-sm font-bold text-slate-800">{item.qty}</span>
                         <span className="text-[10px] text-slate-400 ml-1">{item.unit}</span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600">{item.warehouse}</td>
                      <td className="px-6 py-4">
                         <StockBadge status={item.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                         <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400"><MoreVertical className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}

function StockBadge({ status }) {
  const styles = {
    'In Stock': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Low Stock': 'bg-amber-50 text-amber-700 border-amber-200',
    'Critical': 'bg-rose-50 text-rose-700 border-rose-200'
  };
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${styles[status] || styles['In Stock']}`}>
      {status.toUpperCase()}
    </span>
  );
}
