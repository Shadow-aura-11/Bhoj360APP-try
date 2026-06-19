import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Boxes, 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  RefreshCw, 
  AlertTriangle, 
  TrendingUp, 
  DollarSign, 
  Layers, 
  History,
  X,
  User,
  ShoppingBag
} from 'lucide-react';
import { createApi } from '../../api/client';
import DashboardShell from '../../components/Layout/DashboardShell';
import toast from 'react-hot-toast';

const UNITS = ['kg', 'ltr', 'pcs', 'grams', 'boxes', 'bottles', 'cans', 'packets', 'bags'];

export default function InventoryManager() {
  const { tenantId } = useParams();
  const api = createApi(tenantId);

  // UI Tabs: 'stock' | 'logs'
  const [activeTab, setActiveTab] = useState('stock');

  // Loading States
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Data States
  const [inventory, setInventory] = useState([]);
  const [logs, setLogs] = useState([]);

  // UI Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [stockFilter, setStockFilter] = useState('all'); // 'all' | 'low' | 'out'

  // Modals
  const [showItemModal, setShowItemModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  
  const [currentItem, setCurrentItem] = useState(null); // for edit or adjust
  
  // Forms
  const [itemFormData, setItemFormData] = useState({
    item_name: '',
    quantity: '',
    unit: 'kg',
    min_quantity: '',
    supplier: '',
    cost_per_unit: ''
  });

  const [adjustFormData, setAdjustFormData] = useState({
    change_amount: '',
    type: 'restock', // 'restock' | 'wastage' | 'used' | 'adjustment'
    notes: ''
  });

  // Load Inventory data
  const loadData = async () => {
    try {
      setLoading(true);
      const [invRes, logsRes] = await Promise.all([
        api.get('/inventory'),
        api.get('/inventory/logs')
      ]);

      setInventory(invRes.data || []);
      setLogs(logsRes.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [tenantId]);

  // Open add item modal
  const handleOpenAdd = () => {
    setCurrentItem(null);
    setItemFormData({
      item_name: '',
      quantity: '0',
      unit: 'kg',
      min_quantity: '0',
      supplier: '',
      cost_per_unit: '0'
    });
    setShowItemModal(true);
  };

  // Open edit item modal
  const handleOpenEdit = (item) => {
    setCurrentItem(item);
    setItemFormData({
      item_name: item.item_name || '',
      quantity: item.quantity || 0,
      unit: item.unit || 'kg',
      min_quantity: item.min_quantity || 0,
      supplier: item.supplier || '',
      cost_per_unit: item.cost_per_unit || 0
    });
    setShowItemModal(true);
  };

  // Open quick adjust modal
  const handleOpenAdjust = (item) => {
    setCurrentItem(item);
    setAdjustFormData({
      change_amount: '',
      type: 'restock',
      notes: ''
    });
    setShowAdjustModal(true);
  };

  // Submit item create/edit
  const handleItemSubmit = async (e) => {
    e.preventDefault();
    if (!itemFormData.item_name || !itemFormData.unit) {
      toast.error('Please enter Item Name and choose a Unit');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        item_name: itemFormData.item_name.trim(),
        quantity: parseFloat(itemFormData.quantity || 0),
        unit: itemFormData.unit,
        min_quantity: parseFloat(itemFormData.min_quantity || 0),
        supplier: itemFormData.supplier.trim() || null,
        cost_per_unit: parseFloat(itemFormData.cost_per_unit || 0)
      };

      if (currentItem) {
        payload.id = currentItem.id;
      }

      await api.post('/inventory', payload);
      toast.success(currentItem ? 'Inventory item updated successfully' : 'New inventory item added');
      setShowItemModal(false);
      loadData();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to save inventory item');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit stock adjustment
  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    const amt = parseFloat(adjustFormData.change_amount);
    if (isNaN(amt) || amt <= 0) {
      toast.error('Please enter a valid positive quantity change');
      return;
    }

    try {
      setSubmitting(true);
      
      // Determine sign of change
      let sign = 1;
      if (['wastage', 'used'].includes(adjustFormData.type)) {
        sign = -1;
      }
      
      const payload = {
        inventory_id: currentItem.id,
        change_amount: amt * sign,
        type: adjustFormData.type,
        notes: adjustFormData.notes.trim() || null
      };

      await api.post('/inventory/adjust', payload);
      toast.success('Stock level adjusted successfully');
      setShowAdjustModal(false);
      loadData();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to adjust stock');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete an item
  const handleDeleteItem = async (id, name) => {
    if (!confirm(`Are you sure you want to delete "${name}" from inventory?`)) return;

    try {
      await api.delete(`/inventory/${id}`);
      toast.success('Inventory item deleted');
      loadData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete inventory item');
    }
  };

  // Calculations
  const totalUniqueItems = inventory.length;
  const lowStockCount = inventory.filter(item => item.quantity <= item.min_quantity && item.quantity > 0).length;
  const outOfStockCount = inventory.filter(item => item.quantity === 0).length;
  const totalStockValue = inventory.reduce((sum, item) => sum + (item.quantity * item.cost_per_unit), 0);

  // Filtering Stock list
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = 
      item.item_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.supplier && item.supplier.toLowerCase().includes(searchQuery.toLowerCase()));
      
    if (!matchesSearch) return false;
    
    if (stockFilter === 'low') {
      return item.quantity <= item.min_quantity && item.quantity > 0;
    }
    if (stockFilter === 'out') {
      return item.quantity === 0;
    }
    return true;
  });

  return (
    <DashboardShell title="Inventory Management" tenantId={tenantId} role="admin">
      <div className="space-y-6">
        
        {/* Top Control Card */}
        <div className="bg-white border border-slate-205 rounded-3xl p-5 md:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-display font-bold text-base text-slate-800 flex items-center gap-2">
              <Boxes className="w-5 h-5 text-indigo-650" /> Ingredient & Stock Console
            </h3>
            <p className="text-[10px] text-slate-450 mt-0.5">Track raw ingredients, monitor stock shortages, log wastage, and calculate asset valuation</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              className="p-2 border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors text-slate-600"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 px-4.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Stock Item</span>
            </button>
          </div>
        </div>

        {/* KPIs Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-4.5 shadow-sm">
            <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wide">Stock Valuation</span>
            <div className="flex items-baseline gap-1 mt-1.5">
              <span className="text-xl font-bold font-mono text-emerald-600">₹{totalStockValue.toFixed(2)}</span>
            </div>
            <span className="text-[8px] text-slate-400 mt-1 block">Total asset value of all items</span>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-4.5 shadow-sm">
            <span className="text-[10px] font-bold text-slate-455 uppercase tracking-wide">Unique Items</span>
            <div className="flex items-baseline gap-1 mt-1.5">
              <span className="text-xl font-bold text-slate-800">{totalUniqueItems}</span>
            </div>
            <span className="text-[8px] text-slate-400 mt-1 block">Active entries in catalog</span>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-4.5 shadow-sm">
            <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wide">Low Stock Alert</span>
            <div className="flex items-baseline gap-1 mt-1.5">
              <span className="text-xl font-bold text-amber-600">{lowStockCount}</span>
            </div>
            <span className="text-[8px] text-slate-400 mt-1 block">Items below safety limits</span>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-4.5 shadow-sm">
            <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wide">Out of Stock</span>
            <div className="flex items-baseline gap-1 mt-1.5">
              <span className="text-xl font-bold text-rose-600">{outOfStockCount}</span>
            </div>
            <span className="text-[8px] text-slate-400 mt-1 block">Depleted items (KDS blockers)</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-slate-200 flex gap-4 no-print">
          <button
            onClick={() => setActiveTab('stock')}
            className={`pb-2.5 text-xs font-bold transition-all border-b-2 px-1 flex items-center gap-1.5 ${
              activeTab === 'stock'
                ? 'border-indigo-600 text-indigo-650'
                : 'border-transparent text-slate-450 hover:text-slate-700'
            }`}
          >
            <Boxes className="w-4 h-4" />
            <span>Current Stock Inventory</span>
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`pb-2.5 text-xs font-bold transition-all border-b-2 px-1 flex items-center gap-1.5 ${
              activeTab === 'logs'
                ? 'border-indigo-600 text-indigo-650'
                : 'border-transparent text-slate-450 hover:text-slate-700'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Stock Ledger / Audit Logs</span>
          </button>
        </div>

        {/* Tab contents */}
        {activeTab === 'stock' ? (
          /* CURRENT STOCK INVENTORY TAB */
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <h3 className="font-display font-bold text-sm text-slate-800">Ingredients Catalog ({filteredInventory.length})</h3>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Search */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search stock item or supplier..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-3 py-1.5 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-400 font-semibold w-48 md:w-56"
                  />
                </div>

                {/* Filter Selector */}
                <select
                  value={stockFilter}
                  onChange={(e) => setStockFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs text-slate-655 focus:outline-none focus:border-indigo-500 transition-colors font-semibold cursor-pointer"
                >
                  <option value="all">All Items</option>
                  <option value="low">Low Stock Alerts</option>
                  <option value="out">Out of Stock</option>
                </select>
              </div>
            </div>

            {/* Catalog Table */}
            {loading ? (
              <div className="flex flex-col gap-3 py-6">
                <div className="h-6 w-full skeleton rounded-lg" />
                <div className="h-6 w-full skeleton rounded-lg animate-pulse" />
                <div className="h-6 w-full skeleton rounded-lg animate-pulse" />
              </div>
            ) : filteredInventory.length === 0 ? (
              <div className="text-center py-16 text-slate-455 text-xs flex flex-col items-center justify-center gap-2.5">
                <Boxes className="w-8 h-8 text-slate-300" />
                <span>No matching inventory records.</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                {/* Desktop Table View */}
                <table className="hidden md:table w-full text-left border-collapse text-xs text-slate-700">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                      <th className="pb-3">Ingredient Item</th>
                      <th className="pb-3 text-right">Available Qty</th>
                      <th className="pb-3">Unit</th>
                      <th className="pb-3 text-right">Safety Limit</th>
                      <th className="pb-3 text-right">Cost Per Unit</th>
                      <th className="pb-3 text-right">Inventory Value</th>
                      <th className="pb-3">Supplier</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredInventory.map((item) => {
                      const isLow = item.quantity <= item.min_quantity && item.quantity > 0;
                      const isOut = item.quantity === 0;

                      return (
                        <tr 
                          key={item.id} 
                          className={`hover:bg-slate-50/20 transition-colors ${
                            isOut ? 'bg-rose-50/30' : isLow ? 'bg-amber-50/20' : ''
                          }`}
                        >
                          <td className="py-3.5">
                            <div className="flex flex-col">
                              <span className="font-semibold text-slate-850 text-xs flex items-center gap-1.5">
                                {item.item_name}
                                {isOut ? (
                                  <span className="text-[8px] font-black px-1.5 py-0.2 rounded bg-rose-50 border border-rose-200 text-rose-600 uppercase">DEPLETED</span>
                                ) : isLow ? (
                                  <span className="text-[8px] font-black px-1.5 py-0.2 rounded bg-amber-50 border border-amber-250 text-amber-700 uppercase">LOW STOCK</span>
                                ) : null}
                              </span>
                            </div>
                          </td>
                          <td className={`py-3.5 text-right font-bold font-mono text-sm ${
                            isOut ? 'text-rose-600' : isLow ? 'text-amber-600' : 'text-slate-800'
                          }`}>
                            {item.quantity}
                          </td>
                          <td className="py-3.5 font-semibold text-slate-500 uppercase text-[10px]">
                            {item.unit}
                          </td>
                          <td className="py-3.5 text-right font-semibold font-mono text-slate-500">
                            {item.min_quantity}
                          </td>
                          <td className="py-3.5 text-right font-semibold font-mono text-slate-600">
                            ₹{item.cost_per_unit.toFixed(2)}
                          </td>
                          <td className="py-3.5 text-right font-black font-mono text-emerald-600">
                            ₹{(item.quantity * item.cost_per_unit).toFixed(2)}
                          </td>
                          <td className="py-3.5 text-slate-500 font-medium max-w-xs truncate">
                            {item.supplier || <span className="italic text-slate-300">Unspecified</span>}
                          </td>
                          <td className="py-3.5 text-right">
                            <div className="flex justify-end gap-1.5">
                              {/* Stock Adjust button */}
                              <button
                                onClick={() => handleOpenAdjust(item)}
                                className="p-1.5 text-slate-600 hover:text-indigo-700 hover:bg-slate-100 border border-slate-205 rounded-lg transition-colors flex items-center gap-1"
                                title="Adjust Stock"
                              >
                                <Layers className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-bold">Qty</span>
                              </button>

                              {/* Edit button */}
                              <button
                                onClick={() => handleOpenEdit(item)}
                                className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete button */}
                              <button
                                onClick={() => handleDeleteItem(item.id, item.item_name)}
                                className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 border border-slate-200 hover:border-rose-100 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Mobile Card List View */}
                <div className="block md:hidden space-y-3">
                  {filteredInventory.map((item) => {
                    const isLow = item.quantity <= item.min_quantity && item.quantity > 0;
                    const isOut = item.quantity === 0;

                    return (
                      <div 
                        key={item.id} 
                        className={`bg-white border border-slate-150 rounded-2xl p-4 shadow-sm space-y-3 transition-colors ${
                          isOut ? 'border-rose-200 bg-rose-50/5' : isLow ? 'border-amber-200 bg-amber-50/5' : ''
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div className="min-w-0">
                            <h4 className="font-bold text-slate-850 text-xs truncate">{item.item_name}</h4>
                            <span className="text-[10px] text-slate-400 font-semibold">
                              Vendor: {item.supplier || <span className="italic">Unspecified</span>}
                            </span>
                          </div>
                          <div className="flex flex-col gap-1 items-end flex-shrink-0">
                            {isOut ? (
                              <span className="text-[8px] font-black px-1.5 py-0.2 rounded bg-rose-50 border border-rose-200 text-rose-600 uppercase">DEPLETED</span>
                            ) : isLow ? (
                              <span className="text-[8px] font-black px-1.5 py-0.2 rounded bg-amber-50 border border-amber-250 text-amber-700 uppercase">LOW STOCK</span>
                            ) : null}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 bg-slate-50/50 rounded-xl p-3 border border-slate-100 text-[11px]">
                          <div>
                            <span className="text-slate-400 block text-[9px] uppercase font-bold">Available Stock</span>
                            <span className={`font-black font-mono text-xs ${isOut ? 'text-rose-600' : isLow ? 'text-amber-600' : 'text-slate-800'}`}>
                              {item.quantity} <span className="text-[10px] font-bold uppercase text-slate-400">{item.unit}</span>
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[9px] uppercase font-bold">Safety Limit</span>
                            <span className="font-bold font-mono text-slate-700">{item.min_quantity} {item.unit}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[9px] uppercase font-bold">Cost Per Unit</span>
                            <span className="font-bold font-mono text-slate-750">₹{item.cost_per_unit.toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[9px] uppercase font-bold">Inventory Value</span>
                            <span className="font-black font-mono text-emerald-600">₹{(item.quantity * item.cost_per_unit).toFixed(2)}</span>
                          </div>
                        </div>

                        <div className="flex justify-end gap-1.5 pt-1">
                          <button
                            onClick={() => handleOpenAdjust(item)}
                            className="flex-1 py-1.5 text-slate-655 hover:text-indigo-750 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors flex items-center justify-center gap-1 text-[11px] font-bold"
                            title="Adjust Stock"
                          >
                            <Layers className="w-3.5 h-3.5" />
                            <span>Adjust Qty</span>
                          </button>
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors"
                            title="Edit"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id, item.item_name)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 border border-slate-205 hover:border-rose-100 rounded-xl transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* STOCK LEDGER / AUDIT LOGS TAB */
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="pb-3 border-b border-slate-100">
              <h3 className="font-display font-bold text-sm text-slate-800">Stock Transactions History (Recent 100)</h3>
              <p className="text-[10px] text-slate-450 mt-0.5">Automated logging of ingredient purchases, usage, wastage, and manual stock updates</p>
            </div>

            {loading ? (
              <div className="flex flex-col gap-3 py-6">
                <div className="h-6 w-full skeleton rounded-lg" />
                <div className="h-6 w-full skeleton rounded-lg animate-pulse" />
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-16 text-slate-455 text-xs flex flex-col items-center justify-center gap-2.5">
                <History className="w-8 h-8 text-slate-300" />
                <span>No stock transaction history recorded yet.</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                {/* Desktop Table View */}
                <table className="hidden md:table w-full text-left border-collapse text-xs text-slate-700">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                      <th className="pb-3">Timestamp</th>
                      <th className="pb-3">Ingredient</th>
                      <th className="pb-3">Type</th>
                      <th className="pb-3 text-right">Adjustment Quantity</th>
                      <th className="pb-3">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {logs.map((log) => {
                      const typeColors = {
                        restock: 'bg-emerald-50 text-emerald-700 border-emerald-100',
                        wastage: 'bg-rose-50 text-rose-700 border-rose-100',
                        used: 'bg-blue-50 text-blue-700 border-blue-100',
                        adjustment: 'bg-amber-50 text-amber-700 border-amber-100'
                      };

                      return (
                        <tr key={log.id} className="hover:bg-slate-50/20">
                          <td className="py-3 font-mono text-[10px] text-slate-400">
                            {new Date(log.created_at).toLocaleDateString('en-IN', {
                              day: '2-digit', month: 'short', year: 'numeric',
                              hour: '2-digit', minute: '2-digit'
                            })}
                          </td>
                          <td className="py-3 font-semibold text-slate-800">{log.item_name}</td>
                          <td className="py-3">
                            <span className={`inline-flex px-2 py-0.5 border rounded-full text-[9px] font-bold uppercase ${
                              typeColors[log.type] || 'bg-slate-50 text-slate-500'
                            }`}>
                              {log.type}
                            </span>
                          </td>
                          <td className={`py-3 text-right font-bold font-mono text-sm ${
                            log.change_amount > 0 ? 'text-emerald-600' : 'text-rose-600'
                          }`}>
                            {log.change_amount > 0 ? `+${log.change_amount}` : log.change_amount}
                          </td>
                          <td className="py-3 text-slate-500 max-w-sm truncate" title={log.notes}>
                            {log.notes || <span className="italic text-slate-350 text-[10px]">No details provided</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Mobile Card List View */}
                <div className="block md:hidden space-y-3">
                  {logs.map((log) => {
                    const typeColors = {
                      restock: 'bg-emerald-50 text-emerald-700 border-emerald-100',
                      wastage: 'bg-rose-50 text-rose-700 border-rose-100',
                      used: 'bg-blue-50 text-blue-700 border-blue-100',
                      adjustment: 'bg-amber-50 text-amber-700 border-amber-100'
                    };

                    return (
                      <div key={log.id} className="bg-white border border-slate-150 rounded-2xl p-4 shadow-sm space-y-2.5">
                        <div className="flex justify-between items-start gap-2">
                          <div className="min-w-0">
                            <h4 className="font-bold text-slate-850 text-xs truncate">{log.item_name}</h4>
                            <span className="text-[10px] font-mono text-slate-400">
                              {new Date(log.created_at).toLocaleDateString('en-IN', {
                                day: '2-digit', month: 'short', year: 'numeric',
                                hour: '2-digit', minute: '2-digit'
                              })}
                            </span>
                          </div>
                          <span className={`inline-flex px-2 py-0.5 border rounded-full text-[9px] font-bold uppercase flex-shrink-0 ${
                            typeColors[log.type] || 'bg-slate-50 text-slate-500'
                          }`}>
                            {log.type}
                          </span>
                        </div>
                        {log.notes && (
                          <p className="text-[11px] text-slate-550 leading-relaxed">{log.notes}</p>
                        )}
                        <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                          <span className="text-slate-400 text-[10px] font-bold">Adjustment Qty</span>
                          <span className={`font-black font-mono text-xs ${log.change_amount > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {log.change_amount > 0 ? `+${log.change_amount}` : log.change_amount}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Item Modal (Create/Edit) */}
      {showItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs animate-fade-in" 
            onClick={() => setShowItemModal(false)} 
          />
          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden animate-slide-up">
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between rounded-t-3xl">
              <div>
                <h3 className="font-display font-black text-base text-slate-900">
                  {currentItem ? 'Edit Stock Item' : 'New Catalog Item'}
                </h3>
                <p className="text-[10px] text-slate-450 mt-0.5">Submit new raw ingredient specifications to stock tracking database</p>
              </div>
              <button 
                onClick={() => setShowItemModal(false)} 
                className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleItemSubmit} className="p-6 space-y-4 text-slate-800 font-semibold text-xs">
              {/* Item Name */}
              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Ingredient Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Basmati Rice, Milk, Chicken Breast"
                  value={itemFormData.item_name}
                  onChange={(e) => setItemFormData({ ...itemFormData, item_name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              {/* Quantity & Unit */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Initial Qty</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    disabled={!!currentItem} // Restrict manual edit of qty in Edit mode; force Qty Adjust modal usage
                    value={itemFormData.quantity}
                    onChange={(e) => setItemFormData({ ...itemFormData, quantity: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500 font-mono transition-colors disabled:bg-slate-50 disabled:text-slate-400"
                  />
                  {currentItem && <span className="text-[9px] text-slate-400 block mt-1 font-medium">Use Qty Adjust for edits</span>}
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Unit *</label>
                  <select
                    value={itemFormData.unit}
                    onChange={(e) => setItemFormData({ ...itemFormData, unit: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
                  >
                    {UNITS.map(u => (
                      <option key={u} value={u}>{u.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Min Qty (Safety limits) & Cost */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Reorder Threshold *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="Safety limit"
                    value={itemFormData.min_quantity}
                    onChange={(e) => setItemFormData({ ...itemFormData, min_quantity: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500 font-mono transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Cost Per Unit (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Purchase cost"
                    value={itemFormData.cost_per_unit}
                    onChange={(e) => setItemFormData({ ...itemFormData, cost_per_unit: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500 font-mono transition-colors"
                  />
                </div>
              </div>

              {/* Supplier */}
              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Vendor / Supplier</label>
                <input
                  type="text"
                  placeholder="e.g. Royal Vegetables Ltd, Apex Foods"
                  value={itemFormData.supplier}
                  onChange={(e) => setItemFormData({ ...itemFormData, supplier: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowItemModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-1.5 px-4.5 py-2 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md disabled:opacity-60 transition-colors"
                >
                  {submitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{submitting ? 'Saving...' : (currentItem ? 'Update Item' : 'Add Item')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Adjust Modal (Quantity changes) */}
      {showAdjustModal && currentItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs animate-fade-in" 
            onClick={() => setShowAdjustModal(false)} 
          />
          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden animate-slide-up">
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between rounded-t-3xl">
              <div>
                <h3 className="font-display font-black text-base text-slate-900">Adjust Stock Quantity</h3>
                <p className="text-[10px] text-slate-450 mt-0.5">{currentItem.item_name} (Current: {currentItem.quantity} {currentItem.unit})</p>
              </div>
              <button 
                onClick={() => setShowAdjustModal(false)} 
                className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdjustSubmit} className="p-6 space-y-4 text-slate-800 font-semibold text-xs">
              {/* Type of Adjustment */}
              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Adjustment Type *</label>
                <select
                  value={adjustFormData.type}
                  onChange={(e) => setAdjustFormData({ ...adjustFormData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
                >
                  <option value="restock">Restock / Purchase (+)</option>
                  <option value="used">Used / Prepared (-)</option>
                  <option value="wastage">Wastage / Spoilage (-)</option>
                  <option value="adjustment">Manual Adjustment (+ / -)</option>
                </select>
              </div>

              {/* Quantity change */}
              <div>
                <label className="block text-[10px] font-bold text-slate-455 uppercase mb-1">
                  Quantity Change Amount ({currentItem.unit}) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.001"
                  required
                  placeholder="Enter change amount"
                  value={adjustFormData.change_amount}
                  onChange={(e) => setAdjustFormData({ ...adjustFormData, change_amount: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500 font-mono transition-colors"
                />
                <span className="text-[9px] text-slate-400 block mt-1 font-medium">
                  {['restock'].includes(adjustFormData.type) && 'This will add to the stock.'}
                  {['used', 'wastage'].includes(adjustFormData.type) && 'This will subtract from the stock.'}
                  {['adjustment'].includes(adjustFormData.type) && 'Quantity changes are always positive; signs are handled by category type.'}
                </span>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[10px] font-bold text-slate-455 uppercase mb-1">Reason / Notes</label>
                <textarea
                  placeholder="e.g. Weekly vendor stock up, expired tomato packages thrown out..."
                  value={adjustFormData.notes}
                  onChange={(e) => setAdjustFormData({ ...adjustFormData, notes: e.target.value })}
                  rows="3"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                />
              </div>

              {/* Action buttons */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="px-4 py-2 border border-slate-205 text-slate-650 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-1.5 px-4.5 py-2 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md disabled:opacity-60 transition-colors"
                >
                  {submitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{submitting ? 'Applying...' : 'Apply Stock Change'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
