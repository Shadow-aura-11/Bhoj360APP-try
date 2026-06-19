import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Landmark, Users, Wallet, FileText, ChevronRight, PieChart } from 'lucide-react';
import { createApi } from '../../api/client';
import toast from 'react-hot-toast';

export default function FinanceHR() {
  const { tenantId } = useParams();
  const api = createApi(tenantId);
  const [activeSubTab, setActiveSubTab] = useState('finance'); // 'finance' | 'hr'

  const mockEmployees = [
    { id: 1, name: 'Alice Johnson', role: 'Production Manager', department: 'Operations', salary: 75000, joined: '2021-03-12' },
    { id: 2, name: 'Bob Smith', role: 'CNC Operator', department: 'Machining', salary: 45000, joined: '2022-06-01' },
    { id: 3, name: 'Charlie Davis', role: 'Quality Inspector', department: 'QC', salary: 52000, joined: '2022-11-15' },
  ];

  const mockTransactions = [
    { id: 1, type: 'Income', category: 'Sales', amount: 150000, date: '2023-10-24', desc: 'Order SO-K2X9Z' },
    { id: 2, type: 'Expense', category: 'Materials', amount: 45000, date: '2023-10-23', desc: 'Steel Purchase' },
    { id: 3, type: 'Expense', category: 'Payroll', amount: 120000, date: '2023-10-01', desc: 'Oct Salary' },
  ];

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Landmark className="text-blue-600" /> Business Administration
        </h1>
        <p className="text-slate-500 text-sm">Finance, Payroll, and Human Capital Management</p>
      </header>

      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setActiveSubTab('finance')}
          className={`px-6 py-2 rounded-xl text-sm font-bold transition ${
            activeSubTab === 'finance' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-600 border'
          }`}
        >
          Financial Ledger
        </button>
        <button
          onClick={() => setActiveSubTab('hr')}
          className={`px-6 py-2 rounded-xl text-sm font-bold transition ${
            activeSubTab === 'hr' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-600 border'
          }`}
        >
          Human Resources
        </button>
      </div>

      {activeSubTab === 'finance' ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><Wallet size={20} /></div>
                <h3 className="font-bold text-slate-800">Total Revenue</h3>
              </div>
              <p className="text-3xl font-black">₹4,25,000</p>
              <p className="text-xs text-emerald-600 font-bold mt-1">+12% vs last month</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-50 text-red-600 rounded-lg"><PieChart size={20} /></div>
                <h3 className="font-bold text-slate-800">Total Expenses</h3>
              </div>
              <p className="text-3xl font-black">₹1,82,400</p>
              <p className="text-xs text-red-600 font-bold mt-1">+5% vs last month</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Landmark size={20} /></div>
                  <h3 className="font-bold text-slate-800">Net Profit</h3>
                </div>
                <p className="text-3xl font-black">₹2,42,600</p>
                <p className="text-xs text-blue-600 font-bold mt-1">Healthy Margin</p>
              </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-4 bg-slate-50 border-b flex justify-between items-center">
              <h2 className="font-bold text-slate-800 text-sm uppercase">Transaction History</h2>
              <button className="text-blue-600 text-xs font-bold flex items-center gap-1">View All <ChevronRight size={14} /></button>
            </div>
            <div className="divide-y divide-slate-100">
              {mockTransactions.map(tx => (
                <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${tx.type === 'Income' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {tx.type[0]}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{tx.desc}</p>
                      <p className="text-xs text-slate-500">{tx.category} • {tx.date}</p>
                    </div>
                  </div>
                  <span className={`font-mono font-bold ${tx.type === 'Income' ? 'text-emerald-600' : 'text-red-600'}`}>
                    {tx.type === 'Income' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-4 bg-slate-50 border-b flex justify-between items-center">
              <h2 className="font-bold text-slate-800 text-sm uppercase">Employee Directory</h2>
              <button className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold">+ Add Employee</button>
            </div>
            <table className="w-full text-left">
                <thead className="bg-slate-50/50 text-slate-500 text-[10px] uppercase font-bold border-b">
                    <tr>
                        <th className="p-4">Name</th>
                        <th className="p-4">Role / Department</th>
                        <th className="p-4">Joined</th>
                        <th className="p-4 text-right">Monthly Salary</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {mockEmployees.map(emp => (
                        <tr key={emp.id} className="hover:bg-slate-50 transition">
                            <td className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs">
                                        {emp.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <span className="font-bold text-slate-800">{emp.name}</span>
                                </div>
                            </td>
                            <td className="p-4">
                                <p className="text-sm font-medium">{emp.role}</p>
                                <p className="text-xs text-slate-500">{emp.department}</p>
                            </td>
                            <td className="p-4 text-xs text-slate-500">{emp.joined}</td>
                            <td className="p-4 text-right font-mono font-bold">₹{emp.salary.toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
          </div>

          <div className="bg-blue-600 p-6 rounded-3xl text-white flex justify-between items-center shadow-lg shadow-blue-200">
              <div>
                  <h3 className="font-bold text-lg mb-1 flex items-center gap-2"><Users size={20} /> Payroll Processing</h3>
                  <p className="text-blue-100 text-sm">Next payroll run scheduled for Nov 1st, 2023</p>
              </div>
              <button className="bg-white text-blue-600 px-6 py-2 rounded-xl font-bold hover:bg-blue-50 transition">Run Payroll</button>
          </div>
        </div>
      )}
    </div>
  );
}
