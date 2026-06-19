import React, { useState } from 'react';

export default function DashboardShowcase() {
  const [activeTab, setActiveTab] = useState('admin');
  const [viewMode, setViewMode] = useState('phone'); // 'phone' or 'desktop'
  const [adminPhoneSubView, setAdminPhoneSubView] = useState('live'); // 'live' or 'drawer'
  const [waiterPhoneSubView, setWaiterPhoneSubView] = useState('floor'); // 'floor' or 'detail'
  const [guestPhoneSubView, setGuestPhoneSubView] = useState('menu'); // 'menu' or 'order'

  const tabs = [
    { id: 'admin', label: 'Admin Controller', desc: 'Manage tables, configure menu pricing, deploy live staff permissions, and inspect outlet-wide analytics.' },
    { id: 'waiter', label: 'Waiter Dispatch', desc: 'Mobile terminal for waitstaff. View table call states, register orders directly, and receive kitchen alerts.' },
    { id: 'kitchen', label: 'Kitchen & Counter', desc: 'Display active table orders instantly, sort by preparation urgency, and ping waitstaff on completion.' },
    { id: 'guest', label: 'Guest Self-Order', desc: 'QR-enabled digital menu. Let patrons browse dishes, order items, and request checkout from their personal phones.' }
  ];

  return (
    <section id="showcase" className="py-32 relative z-10 border-b border-white/5 bg-[#070707]">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* Header Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-end mb-20">
          <div className="lg:col-span-8 space-y-4 text-left">
            <span className="text-[11px] font-mono tracking-[0.25em] text-[var(--color-amber)] uppercase">
              Operational Interfaces
            </span>
            <h2 className="text-4xl md:text-5xl font-serif text-[#F5F0EB]">
              Complete synchronization from lounge to kitchen.
            </h2>
          </div>
          <div className="lg:col-span-4 text-left lg:text-right flex flex-col items-start lg:items-end gap-3">
            <p className="text-[rgba(245,240,235,0.65)] font-light text-sm max-w-sm">
              Explore the dedicated interfaces customized for each role in your restaurant team.
            </p>
            {/* View Mode Toggle */}
            <div className="inline-flex p-1 bg-black/60 border border-white/10 rounded-xl">
              <button
                onClick={() => setViewMode('phone')}
                className={`px-4 py-2 rounded-lg text-xs font-mono tracking-wider transition-all ${viewMode === 'phone' ? 'bg-[var(--color-amber)] text-black font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                PHONE APP
              </button>
              <button
                onClick={() => setViewMode('desktop')}
                className={`px-4 py-2 rounded-lg text-xs font-mono tracking-wider transition-all ${viewMode === 'desktop' ? 'bg-[var(--color-amber)] text-black font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                DESKTOP
              </button>
            </div>
          </div>
        </div>

        {/* Responsive Tabs Selection */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Tabs Column */}
          <div className="lg:col-span-4 space-y-4 text-left">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left p-6 rounded-xl transition-all duration-300 border ${activeTab === tab.id ? 'border-[var(--color-amber)] bg-[rgba(212,146,10,0.04)] shadow-lg' : 'border-white/5 hover:border-white/10 hover:bg-white/5'}`}
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className={`text-lg font-serif font-medium transition-colors ${activeTab === tab.id ? 'text-[var(--color-amber)]' : 'text-[#F5F0EB]'}`}>
                    {tab.label}
                  </h3>
                  {activeTab === tab.id && (
                    <span className="w-2 h-2 rounded-full bg-[var(--color-amber)] animate-pulse"></span>
                  )}
                </div>
                <p className="text-xs text-[rgba(245,240,235,0.55)] font-light leading-relaxed">
                  {tab.desc}
                </p>
              </button>
            ))}
          </div>

          {/* Browser / Phone Simulator Column */}
          <div className="lg:col-span-8 flex justify-center w-full">
            {viewMode === 'desktop' ? (
              <div className="browser-chrome border-glow-amber w-full">
                {/* Fake Chrome Header */}
                <div className="browser-header">
                  <div className="flex gap-2">
                    <span className="dot-red"></span>
                    <span className="dot-yellow"></span>
                    <span className="dot-green"></span>
                  </div>
                  <div className="browser-address">
                    {activeTab === 'admin' && 'https://multi-os-platform.com/outlet/3101/admin'}
                    {activeTab === 'waiter' && 'https://multi-os-platform.com/outlet/3101/waiter'}
                    {activeTab === 'kitchen' && 'https://multi-os-platform.com/outlet/3101/kitchen'}
                    {activeTab === 'guest' && 'https://multi-os-platform.com/r/outlet_3101/menu'}
                  </div>
                  <div className="w-12"></div>
                </div>

                {/* Mock Screen Content */}
                <div className="bg-[#F8F9FD] aspect-[16/10] relative overflow-hidden transition-all duration-500 flex items-center justify-center p-4">
                  <img
                    src={
                      activeTab === 'admin' ? '/dashboard_admin.png' :
                      activeTab === 'waiter' ? '/dashboard_waiter.png' :
                      activeTab === 'kitchen' ? '/dashboard_kds.png' :
                      '/customer_dining.png'
                    }
                    alt={activeTab}
                    className="max-w-full max-h-full object-contain select-none shadow-md rounded border border-slate-200/50"
                  />
                </div>
              </div>
            ) : (
              /* Phone App Frame Wrapper */
              <div className="relative mx-auto border-[12px] border-zinc-800 rounded-[2.5rem] overflow-hidden aspect-[9/16] max-w-[340px] w-full bg-black shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] border-glow-amber">
                {/* Speaker Notch */}
                <div className="absolute top-0 inset-x-0 h-4 bg-zinc-800 flex justify-center items-center z-20">
                  <div className="w-16 h-1 rounded-full bg-zinc-700"></div>
                </div>

                {/* Dynamic App Content Screen */}
                <div className="relative w-full h-full pt-8 pb-4 overflow-hidden bg-[#F8F9FD] flex items-center justify-center">
                  <img
                    src={
                      activeTab === 'admin' ? (adminPhoneSubView === 'live' ? '/phone_admin.png' : '/phone_admin_drawer.png') :
                      activeTab === 'waiter' ? (waiterPhoneSubView === 'floor' ? '/phone_waiter.png' : '/phone_waiter_detail.png') :
                      activeTab === 'kitchen' ? '/phone_kds.png' :
                      (guestPhoneSubView === 'menu' ? '/phone_guest_menu.png' : '/phone_guest_order.png')
                    }
                    alt={`${activeTab} phone view`}
                    className="max-w-full max-h-full object-contain select-none"
                  />

                  {/* Floating sub-view switchers inside the phone mockup */}
                  {activeTab === 'admin' && (
                    <div className="absolute bottom-6 inset-x-0 flex justify-center gap-1.5 z-30">
                      <button
                        onClick={() => setAdminPhoneSubView('live')}
                        className={`px-3 py-1.5 rounded-full text-[9px] font-mono tracking-wider transition-all shadow-md ${adminPhoneSubView === 'live' ? 'bg-[var(--color-amber)] text-black font-extrabold' : 'bg-zinc-900/95 text-zinc-300 hover:text-white'}`}
                      >
                        STATUS
                      </button>
                      <button
                        onClick={() => setAdminPhoneSubView('drawer')}
                        className={`px-3 py-1.5 rounded-full text-[9px] font-mono tracking-wider transition-all shadow-md ${adminPhoneSubView === 'drawer' ? 'bg-[var(--color-amber)] text-black font-extrabold' : 'bg-zinc-900/95 text-zinc-300 hover:text-white'}`}
                      >
                        DRAWER
                      </button>
                    </div>
                  )}

                  {activeTab === 'waiter' && (
                    <div className="absolute bottom-6 inset-x-0 flex justify-center gap-1.5 z-30">
                      <button
                        onClick={() => setWaiterPhoneSubView('floor')}
                        className={`px-3 py-1.5 rounded-full text-[9px] font-mono tracking-wider transition-all shadow-md ${waiterPhoneSubView === 'floor' ? 'bg-[var(--color-amber)] text-black font-extrabold' : 'bg-zinc-900/95 text-zinc-300 hover:text-white'}`}
                      >
                        FLOOR
                      </button>
                      <button
                        onClick={() => setWaiterPhoneSubView('detail')}
                        className={`px-3 py-1.5 rounded-full text-[9px] font-mono tracking-wider transition-all shadow-md ${waiterPhoneSubView === 'detail' ? 'bg-[var(--color-amber)] text-black font-extrabold' : 'bg-zinc-900/95 text-zinc-300 hover:text-white'}`}
                      >
                        DETAIL
                      </button>
                    </div>
                  )}

                  {activeTab === 'guest' && (
                    <div className="absolute bottom-6 inset-x-0 flex justify-center gap-1.5 z-30">
                      <button
                        onClick={() => setGuestPhoneSubView('menu')}
                        className={`px-3 py-1.5 rounded-full text-[9px] font-mono tracking-wider transition-all shadow-md ${guestPhoneSubView === 'menu' ? 'bg-[var(--color-amber)] text-black font-extrabold' : 'bg-zinc-900/95 text-zinc-300 hover:text-white'}`}
                      >
                        MENU
                      </button>
                      <button
                        onClick={() => setGuestPhoneSubView('order')}
                        className={`px-3 py-1.5 rounded-full text-[9px] font-mono tracking-wider transition-all shadow-md ${guestPhoneSubView === 'order' ? 'bg-[var(--color-amber)] text-black font-extrabold' : 'bg-zinc-900/95 text-zinc-300 hover:text-white'}`}
                      >
                        ORDER
                      </button>
                    </div>
                  )}
                </div>

                {/* Bottom Home Button Bar */}
                <div className="absolute bottom-2 inset-x-0 h-1 flex justify-center items-center z-20">
                  <div className="w-24 h-1 rounded-full bg-zinc-600"></div>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </section>
  );
}
