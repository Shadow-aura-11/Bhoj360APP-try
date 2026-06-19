import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Megaphone, Gift, Star, Users, Plus, Send, CreditCard, ChevronRight, Sparkles, MessageSquare } from 'lucide-react';
import { createApi } from '../../api/client';
import toast from 'react-hot-toast';

export default function MarketingLoyalty() {
  const { tenantId } = useParams();
  const api = createApi(tenantId);
  const [activeTab, setActiveTab] = useState('marketing');

  const MarketingView = () => (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Marketing Automation</h2>
          <p className="text-slate-500">Reach customers via WhatsApp, SMS, and Email</p>
        </div>
        <button className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-100">
          <Plus className="w-4 h-4" /> Create Campaign
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase">WhatsApp Open Rate</p>
            <p className="text-xl font-black text-slate-800">92%</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
            <Megaphone className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase">Campaigns Sent</p>
            <p className="text-xl font-black text-slate-800">14</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase">Referrals Converted</p>
            <p className="text-xl font-black text-slate-800">42</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-8 py-6 border-b border-slate-100 font-bold text-slate-800">Recent Campaigns</div>
        <div className="divide-y divide-slate-100">
          {[
            { name: 'Summer Glow Promo', type: 'Email', status: 'Sent', reach: '1.2k' },
            { name: 'Membership Renewal', type: 'WhatsApp', status: 'Scheduled', reach: '450' },
            { name: 'B-Day Special Offer', type: 'SMS', status: 'Draft', reach: '-' },
          ].map((c, i) => (
            <div key={i} className="px-8 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4">
                <span className={`px-2 py-1 rounded text-[10px] font-bold ${c.status === 'Sent' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                  {c.status}
                </span>
                <p className="font-bold text-slate-800">{c.name}</p>
              </div>
              <div className="flex items-center gap-8 text-xs font-bold text-slate-400">
                <span>{c.type}</span>
                <span>Reach: {c.reach}</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const LoyaltyView = () => (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Loyalty & Gift Cards</h2>
          <p className="text-slate-500">Reward programs and digital gift card management</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold flex items-center gap-2">
            <Gift className="w-4 h-4" /> Issue Gift Card
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Tier Config */}
        <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500" /> Reward Tier Levels
          </h3>
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 border border-slate-200 shadow-sm"><Sparkles className="w-5 h-5" /></div>
                <div>
                  <p className="font-bold text-sm">Silver Tier</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">1 Point per ₹100</p>
                </div>
              </div>
              <span className="text-xs font-black text-slate-400">850 Customers</span>
            </div>
            <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-amber-500 border border-amber-200 shadow-sm"><Sparkles className="w-5 h-5" /></div>
                <div>
                  <p className="font-bold text-sm">Gold Tier</p>
                  <p className="text-[10px] text-amber-600 font-bold uppercase">2 Points per ₹100</p>
                </div>
              </div>
              <span className="text-xs font-black text-amber-600">124 Customers</span>
            </div>
          </div>
        </div>

        {/* Gift Card Tracking */}
        <div className="bg-slate-900 text-white p-8 rounded-[2rem] shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-400" /> Gift Card Balance
            </h3>
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Total Liability</p>
                  <p className="text-3xl font-black">₹85,420</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Active Cards</p>
                  <p className="text-xl font-black">156</p>
                </div>
              </div>
              <button className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-blue-500/20">View Card Registry</button>
            </div>
          </div>
          <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-8 bg-slate-50 min-h-screen font-body">
      <div className="flex gap-2 mb-10 bg-white p-1 rounded-2xl border border-slate-200 w-fit shadow-sm">
        <button
          onClick={() => setActiveTab('marketing')}
          className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'marketing' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          Marketing Automation
        </button>
        <button
          onClick={() => setActiveTab('loyalty')}
          className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'loyalty' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          Loyalty & Gift Cards
        </button>
      </div>

      {activeTab === 'marketing' ? <MarketingView /> : <LoyaltyView />}
    </div>
  );
}
