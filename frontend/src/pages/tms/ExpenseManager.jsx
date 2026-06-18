import React, { useState } from 'react';
import { Plus, Receipt, Search, Filter, ArrowUpRight, ShieldAlert } from 'lucide-react';

export default function ExpenseManager() {
  const [expenses, setExpenses] = useState([
    {
      id: 1,
      category: 'Meals',
      date: '2023-10-15',
      amount: '$45.00',
      status: 'Approved',
      fraudScore: 0.1
    },
    {
      id: 2,
      category: 'Transport',
      date: '2023-10-16',
      amount: '$120.00',
      status: 'Pending',
      fraudScore: 0.2
    },
    {
      id: 3,
      category: 'Miscellaneous',
      date: '2023-10-18',
      amount: '$500.00',
      status: 'Flagged',
      fraudScore: 0.85
    }
  ]);

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Expense Manager</h1>
          <p className="text-slate-500">Track and submit your travel expenses.</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
          <Plus size={20} />
          <span>Add Expense</span>
        </button>
      </header>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between bg-slate-50/50">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search expenses..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
            />
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-600 hover:bg-slate-50">
              <Filter size={16} />
              <span>Filters</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                <th className="px-6 py-4">Expense Details</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Fraud Risk (AI)</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {expenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                        <Receipt size={20} />
                      </div>
                      <span className="font-bold text-slate-800">{exp.category}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 font-medium">{exp.date}</td>
                  <td className="px-6 py-4 font-bold text-slate-900">{exp.amount}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                      exp.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                      exp.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                      'bg-rose-100 text-rose-700'
                    }`}>
                      {exp.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${exp.fraudScore > 0.5 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                          style={{ width: `${exp.fraudScore * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-mono text-slate-400">{(exp.fraudScore * 100).toFixed(0)}%</span>
                      {exp.fraudScore > 0.7 && <ShieldAlert size={14} className="text-rose-500" />}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-blue-600 transition-colors opacity-0 group-hover:opacity-100">
                      <ArrowUpRight size={18} />
                    </button>
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
