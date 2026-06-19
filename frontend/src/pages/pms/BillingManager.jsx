import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  FileText,
  Plus,
  DollarSign,
  Search,
  Calendar,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  Clock,
  Printer
} from 'lucide-react';
import { createApi } from '../../api/client';
import toast from 'react-hot-toast';
import { format, parseISO } from 'date-fns';

export default function BillingManager() {
  const { tenantId } = useParams();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const api = createApi(tenantId);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const { data } = await api.get('/invoices');
      setInvoices(data);
    } catch (err) {
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Unpaid': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'Overdue': return 'bg-rose-50 text-rose-600 border-rose-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-blue-600" />
            Billing & Finance
          </h1>
          <p className="text-slate-500 mt-1">Rent collection and financial records</p>
        </div>
        <div className="flex gap-3">
          <button className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold text-sm flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
            <Printer className="w-4 h-4" />
            Print Report
          </button>
          <button className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-blue-100">
            <Plus className="w-4 h-4" />
            Create Invoice
          </button>
        </div>
      </header>

      {/* Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-4 mb-2">
                  <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                      <ArrowDownLeft className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Collected</span>
              </div>
              <h3 className="text-2xl font-black text-slate-900">₹{invoices.filter(i => i.status === 'Paid').reduce((sum, i) => sum + i.total, 0).toLocaleString()}</h3>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-4 mb-2">
                  <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
                      <Clock className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pending Rent</span>
              </div>
              <h3 className="text-2xl font-black text-slate-900">₹{invoices.filter(i => i.status === 'Unpaid').reduce((sum, i) => sum + i.total, 0).toLocaleString()}</h3>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-4 mb-2">
                  <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                      <FileText className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Invoices Sent</span>
              </div>
              <h3 className="text-2xl font-black text-slate-900">{invoices.length}</h3>
          </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800">Recent Invoices</h3>
              <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by invoice or tenant..."
                    className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-100 w-64"
                  />
              </div>
          </div>
          <div className="overflow-x-auto">
              {loading ? (
                  <div className="p-20 text-center text-slate-400 font-medium italic">Loading financial data...</div>
              ) : (
                  <table className="w-full text-left border-collapse">
                      <thead>
                          <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                              <th className="px-6 py-4">Invoice No</th>
                              <th className="px-6 py-4">Tenant</th>
                              <th className="px-6 py-4">Unit</th>
                              <th className="px-6 py-4">Amount</th>
                              <th className="px-6 py-4">Due Date</th>
                              <th className="px-6 py-4">Status</th>
                              <th className="px-6 py-4 text-right">Actions</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                          {invoices.map(inv => (
                              <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                                  <td className="px-6 py-4 font-mono text-xs font-bold text-blue-600">{inv.invoice_no}</td>
                                  <td className="px-6 py-4">
                                      <div className="text-sm font-bold text-slate-800">{inv.tenant_name}</div>
                                  </td>
                                  <td className="px-6 py-4">
                                      <div className="text-xs font-semibold text-slate-500">Unit {inv.unit_number}</div>
                                  </td>
                                  <td className="px-6 py-4">
                                      <div className="text-sm font-black text-slate-900">₹{inv.total?.toLocaleString()}</div>
                                  </td>
                                  <td className="px-6 py-4">
                                      <div className="text-xs text-slate-600 flex items-center gap-1.5">
                                          <Calendar className="w-3 h-3" />
                                          {format(parseISO(inv.due_date), 'MMM dd, yyyy')}
                                      </div>
                                  </td>
                                  <td className="px-6 py-4">
                                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-black border uppercase ${getStatusColor(inv.status)}`}>
                                          {inv.status}
                                      </span>
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                      <div className="flex justify-end gap-2">
                                          <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                                              <Printer className="w-4 h-4" />
                                          </button>
                                          {inv.status === 'Unpaid' && (
                                              <button className="px-3 py-1.5 bg-emerald-600 text-white text-[10px] font-bold rounded-lg hover:bg-emerald-700 transition-all shadow-md shadow-emerald-100">
                                                  Pay Now
                                              </button>
                                          )}
                                      </div>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              )}
          </div>
      </div>
    </div>
  );
}
