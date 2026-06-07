import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Receipt, 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  AlertCircle, 
  Calendar,
  X
} from 'lucide-react';
import { createApi } from '../../api/client';
import DashboardShell from '../../components/Layout/DashboardShell';
import toast from 'react-hot-toast';

const CATEGORIES = [
  'Inventory/Food',
  'Salaries/Wages',
  'Rent/Maintenance',
  'Utilities',
  'Marketing',
  'Other'
];

const CATEGORY_COLORS = {
  'Inventory/Food': 'bg-amber-50 text-amber-700 border-amber-100',
  'Salaries/Wages': 'bg-blue-50 text-blue-700 border-blue-100',
  'Rent/Maintenance': 'bg-purple-50 text-purple-700 border-purple-100',
  'Utilities': 'bg-yellow-50 text-yellow-850 border-yellow-100',
  'Marketing': 'bg-cyan-50 text-cyan-700 border-cyan-100',
  'Other': 'bg-slate-50 text-slate-700 border-slate-100'
};

export default function ExpensesManager() {
  const { restaurantId } = useParams();
  const api = createApi(restaurantId);

  // Loading States
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Data States
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState({
    today: { revenue: 0, expenses: 0, profit: 0 },
    thisMonth: { revenue: 0, expenses: 0, profit: 0 },
    allTime: { revenue: 0, expenses: 0, profit: 0 }
  });

  // UI Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [currentExpense, setCurrentExpense] = useState(null); // null when adding, expense object when editing

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: 'Inventory/Food',
    expense_date: new Date().toISOString().split('T')[0],
    description: ''
  });

  // Fetch all data
  const loadData = async () => {
    try {
      setLoading(true);
      const [expensesRes, summaryRes] = await Promise.all([
        api.get('/expenses'),
        api.get('/expenses/summary')
      ]);

      setExpenses(expensesRes.data || []);
      setSummary(summaryRes.data || {
        today: { revenue: 0, expenses: 0, profit: 0 },
        thisMonth: { revenue: 0, expenses: 0, profit: 0 },
        allTime: { revenue: 0, expenses: 0, profit: 0 }
      });
    } catch (err) {
      console.error(err);
      toast.error('Failed to load expenses data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [restaurantId]);

  // Open modal for adding
  const handleOpenAdd = () => {
    setCurrentExpense(null);
    setFormData({
      title: '',
      amount: '',
      category: 'Inventory/Food',
      expense_date: new Date().toISOString().split('T')[0],
      description: ''
    });
    setShowModal(true);
  };

  // Open modal for editing
  const handleOpenEdit = (expense) => {
    setCurrentExpense(expense);
    setFormData({
      title: expense.title || '',
      amount: expense.amount || '',
      category: expense.category || 'Inventory/Food',
      expense_date: expense.expense_date || new Date().toISOString().split('T')[0],
      description: expense.description || ''
    });
    setShowModal(true);
  };

  // Delete an expense
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this expense record?')) return;

    try {
      await api.delete(`/expenses/${id}`);
      toast.success('Expense deleted successfully');
      loadData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete expense');
    }
  };

  // Submit add/edit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.amount || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        title: formData.title,
        amount: parseFloat(formData.amount),
        category: formData.category,
        expense_date: formData.expense_date,
        description: formData.description
      };

      if (currentExpense) {
        payload.id = currentExpense.id;
      }

      await api.post('/expenses', payload);
      toast.success(currentExpense ? 'Expense updated successfully' : 'Expense recorded successfully');
      setShowModal(false);
      loadData();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to save expense');
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered expenses list
  const filteredExpenses = expenses.filter(exp => {
    const matchesSearch = 
      exp.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (exp.description && exp.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = !selectedCategory || exp.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <DashboardShell title="Expenses & Cash Ledger" restaurantId={restaurantId} role="admin">
      <div className="space-y-6">

        {/* Top Control Panel */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-display font-bold text-base text-slate-800 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-indigo-650" /> Expenses & Margin Tracker
            </h3>
            <p className="text-[10px] text-slate-450 mt-0.5">Manage operational costs, track net profits, and record payouts</p>
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
              <span>Record Expense</span>
            </button>
          </div>
        </div>

        {/* 3 Columns Summary Cards (Today, Month, All Time) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Today's Ledger */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="font-display font-bold text-sm text-slate-800">Today's Ledger</h4>
              <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full uppercase">Realtime</span>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-450 font-semibold flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> Revenue (Sales)</span>
                <span className="font-bold font-mono text-slate-850">₹{summary.today.revenue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-450 font-semibold flex items-center gap-1"><TrendingDown className="w-3.5 h-3.5 text-rose-500" /> Expenses</span>
                <span className="font-bold font-mono text-slate-850">₹{summary.today.expenses.toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-1"><DollarSign className="w-3.5 h-3.5 text-indigo-650" /> Profit / Balance</span>
                <span className={`font-mono font-black ${summary.today.profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  ₹{summary.today.profit.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* This Month's Ledger */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="font-display font-bold text-sm text-slate-800">This Month's Ledger</h4>
              <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full uppercase">MTD</span>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-450 font-semibold flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> Revenue (Sales)</span>
                <span className="font-bold font-mono text-slate-850">₹{summary.thisMonth.revenue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-450 font-semibold flex items-center gap-1"><TrendingDown className="w-3.5 h-3.5 text-rose-500" /> Expenses</span>
                <span className="font-bold font-mono text-slate-850">₹{summary.thisMonth.expenses.toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-1"><DollarSign className="w-3.5 h-3.5 text-indigo-650" /> Profit / Balance</span>
                <span className={`font-mono font-black ${summary.thisMonth.profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  ₹{summary.thisMonth.profit.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* All-Time Ledger */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="font-display font-bold text-sm text-slate-800">All-Time Ledger</h4>
              <span className="text-[9px] font-bold text-slate-450 bg-slate-100 px-2 py-0.5 rounded-full uppercase">Cumulative</span>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-450 font-semibold flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> Revenue (Sales)</span>
                <span className="font-bold font-mono text-slate-850">₹{summary.allTime.revenue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-450 font-semibold flex items-center gap-1"><TrendingDown className="w-3.5 h-3.5 text-rose-500" /> Expenses</span>
                <span className="font-bold font-mono text-slate-850">₹{summary.allTime.expenses.toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-1"><DollarSign className="w-3.5 h-3.5 text-indigo-650" /> Profit / Balance</span>
                <span className={`font-mono font-black ${summary.allTime.profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  ₹{summary.allTime.profit.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Expenses List & Filter Layout */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <h3 className="font-display font-bold text-sm text-slate-800">Operational Cost Book ({filteredExpenses.length})</h3>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search expense title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-1.5 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-400 font-semibold w-48 md:w-56"
                />
              </div>

              {/* Category selector */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs text-slate-655 focus:outline-none focus:border-indigo-500 transition-colors font-semibold cursor-pointer"
              >
                <option value="">All Categories</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Table list */}
          {loading ? (
            <div className="flex flex-col gap-3 py-6">
              <div className="h-6 w-full skeleton rounded-lg" />
              <div className="h-6 w-full skeleton rounded-lg animate-pulse" />
              <div className="h-6 w-full skeleton rounded-lg animate-pulse" />
            </div>
          ) : filteredExpenses.length === 0 ? (
            <div className="text-center py-16 text-slate-455 text-xs flex flex-col items-center justify-center gap-2.5">
              <Receipt className="w-8 h-8 text-slate-300" />
              <span>No expense records found. Click "Record Expense" to add your first cost entry.</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs text-slate-700">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="pb-3">Date</th>
                    <th className="pb-3">Title</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3">Description</th>
                    <th className="pb-3 text-right">Amount</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredExpenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-slate-50/20">
                      <td className="py-3.5 font-mono text-[10px] text-slate-400">
                        {new Date(exp.expense_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="py-3.5 font-semibold text-slate-850">
                        {exp.title}
                      </td>
                      <td className="py-3.5">
                        <span className={`inline-flex px-2 py-0.5 border rounded-full text-[9px] font-bold uppercase ${CATEGORY_COLORS[exp.category] || CATEGORY_COLORS['Other']}`}>
                          {exp.category}
                        </span>
                      </td>
                      <td className="py-3.5 text-slate-455 max-w-xs truncate" title={exp.description}>
                        {exp.description || <span className="italic text-slate-300">No notes</span>}
                      </td>
                      <td className="py-3.5 text-right font-bold font-mono text-slate-900">
                        ₹{exp.amount.toFixed(2)}
                      </td>
                      <td className="py-3.5 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(exp)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(exp.id)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 border border-slate-200 hover:border-rose-100 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Modal Drawer */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs animate-fade-in" 
            onClick={() => setShowModal(false)} 
          />
          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden animate-slide-up">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between rounded-t-3xl">
              <div>
                <h3 className="font-display font-black text-base text-slate-900">
                  {currentExpense ? 'Edit Expense Entry' : 'Record Operational Expense'}
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Submit operational invoice or cost parameter to ledger</p>
              </div>
              <button 
                onClick={() => setShowModal(false)} 
                className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">
                  Expense Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dairy Supply Invoice"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              {/* Amount & Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">
                    Amount (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500 font-mono transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-455 uppercase mb-1">
                    Expense Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.expense_date}
                    onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-[10px] font-bold text-slate-455 uppercase mb-1">
                  Expense Category *
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Notes Description */}
              <div>
                <label className="block text-[10px] font-bold text-slate-455 uppercase mb-1">
                  Notes / Description
                </label>
                <textarea
                  placeholder="Include invoice numbers, vendor payee, or miscellaneous notes..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                />
              </div>

              {/* Action buttons */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-1.5 px-4.5 py-2 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md disabled:opacity-60 transition-colors"
                >
                  {submitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>{submitting ? 'Saving...' : (currentExpense ? 'Update Entry' : 'Record Entry')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
