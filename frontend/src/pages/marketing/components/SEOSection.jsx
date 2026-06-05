import React, { useState } from 'react';

export default function SEOSection() {
  const [activeTab, setActiveTab] = useState('all');

  const topics = [
    {
      id: 'pos',
      title: 'Cloud POS & Billing Machine Software',
      keywords: ['Bhoj360', 'Restaurant POS', 'Restaurant Management Software', 'Cloud POS', 'Android POS', 'Restaurant Billing Software', 'Billing Machine Software', 'Smart POS', 'Point of Sale Software', 'POS System', 'Best Restaurant POS Software', 'Cloud-based Restaurant POS', 'Restaurant Billing Software India'],
      content: 'Bhoj360 is recognized as the best restaurant POS software designed to drive restaurant digital transformation. As a comprehensive cloud-based restaurant POS and billing machine software, it replaces slow legacy systems with a smart POS point of sale software. Designed specifically as a high-performance restaurant billing software India, it offers seamless compatibility for Android POS devices and desktop terminals. Bring absolute speed and security to your counter with a modern cloud POS system that works offline and synchronizes in real time.'
    },
    {
      id: 'ops',
      title: 'Restaurant Operations & Table Management',
      keywords: ['Restaurant Billing', 'Order Management', 'Table Management', 'Kitchen Management', 'Menu Management', 'Inventory Management', 'Stock Management', 'Restaurant Operations', 'Shift Management', 'Employee Management', 'Settlements', 'Transaction History', 'Credit Management', 'Petty Cash Management', 'Restaurant Table Management System', 'Restaurant Order Management System'],
      content: 'Manage the complete lifecycle of restaurant operations with automated tools. Our advanced restaurant table management system and restaurant order management system coordinate guest bookings, floor layouts, and live order management. From kitchen management pipelines (KDS) and menu management controls to shift management, employee management, and front-of-house table management, Bhoj360 keeps everything in sync. Handle daily financial settlements, track complete transaction history, manage credit management databases, and oversee petty cash management directly from the dashboard.'
    },
    {
      id: 'digital',
      title: 'Digital Restaurant & Contactless Ordering',
      keywords: ['QR Menu', 'QR Code Ordering', 'Digital Menu', 'Contactless Ordering', 'Mobile Storefront', 'Online Ordering', 'Restaurant Website', 'Food Ordering System', 'Delivery Management', 'Takeaway Management', 'Dine-in Management', 'QR Menu Solution for Restaurants'],
      content: 'Launch contactless ordering and online ordering in minutes. Bhoj360 offers a premium QR menu solution for restaurants that enables instant QR code ordering and digital menu browsing. Allow guests to place orders directly from their tables with contactless ordering, or build a custom mobile storefront and restaurant website to accept direct takeaway management and delivery management orders. Our unified food ordering system aggregates dine-in management, takeaway, and delivery pipelines into a single digital screen.'
    },
    {
      id: 'analytics',
      title: 'Analytics, Customer Retention & Growth',
      keywords: ['Restaurant Analytics', 'Business Insights', 'Sales Reports', 'Revenue Tracking', 'Customer Database', 'Loyalty Programs', 'Customer Engagement', 'Marketing Campaigns', 'Customer Retention', 'Restaurant Growth', 'Restaurant Analytics Dashboard', 'Restaurant Loyalty Program Software'],
      content: 'Make data-driven decisions using our advanced restaurant analytics dashboard. Bhoj360 tracks live revenue tracking, aggregates sales reports, and translates raw metrics into actionable business insights. Build a structured customer database to launch automated loyalty programs, execute marketing campaigns, and drive customer engagement. With custom restaurant loyalty program software, you can boost customer retention and accelerate restaurant growth.'
    },
    {
      id: 'inventory',
      title: 'Real-time Inventory & Back-office Control',
      keywords: ['Real-time Inventory', 'Inventory Tracking', 'Purchase Management', 'Food Cost Control', 'Variance Analysis', 'Waste Reduction', 'Automated Workflows', 'Stock Alerts', 'Restaurant Inventory Management Software'],
      content: 'Eliminate ingredient leaks and optimize margins using our restaurant inventory management software. Bhoj360 provides real-time inventory tracking, purchase management workflows, and food cost control analysis. Monitor variance analysis, ensure waste reduction, and configure automated workflows with smart stock alerts. Safeguard your stock management operations with a system that alerts you when stock levels run low.'
    },
    {
      id: 'industry',
      title: 'Hospitality Technology & Automation',
      keywords: ['Restaurant Software', 'Cafe Management Software', 'Bar Management Software', 'Food & Beverage Management', 'Restaurant Technology', 'Hospitality Technology', 'Restaurant Automation', 'Cloud Restaurant Management'],
      content: 'Bhoj360 is the ultimate hospitality technology platform. Whether you operate a quick-service cafe requiring cafe management software, a high-volume bar needing bar management software, or a fine-dining group managing complex food & beverage management operations, our restaurant automation tools adapt to your business. Lead the cloud restaurant management shift with a system built for absolute reliability.'
    }
  ];

  const filteredTopics = activeTab === 'all' 
    ? topics 
    : topics.filter(t => t.id === activeTab);

  return (
    <section id="seo-resource-hub" className="py-24 relative z-10 border-b border-white/5 bg-black/30">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* Header */}
        <div className="max-w-3xl text-left mb-16 space-y-4">
          <span className="text-[11px] font-mono tracking-[0.25em] text-[var(--color-amber)] uppercase">
            Resource Center
          </span>
          <h2 className="text-3xl md:text-5xl font-serif text-[#F5F0EB]">
            The Complete Guide to Cloud Restaurant Management
          </h2>
          <p className="text-[rgba(245,240,235,0.6)] font-light text-base leading-relaxed">
            Discover how Bhoj360 integrates smart POS technology, real-time inventory tracking, and contactless QR ordering systems to automate restaurant operations and drive growth.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap gap-2 mb-10 border-b border-white/5 pb-6">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-lg text-xs font-mono tracking-wider uppercase transition-all ${
              activeTab === 'all' 
                ? 'bg-[var(--color-amber)] text-black font-semibold' 
                : 'text-slate-400 hover:text-[#F5F0EB] bg-white/5 border border-white/10'
            }`}
          >
            All Guides
          </button>
          {topics.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2 rounded-lg text-xs font-mono tracking-wider uppercase transition-all ${
                activeTab === t.id 
                  ? 'bg-[var(--color-amber)] text-black font-semibold' 
                  : 'text-slate-400 hover:text-[#F5F0EB] bg-white/5 border border-white/10'
              }`}
            >
              {t.title.split(' & ')[0]}
            </button>
          ))}
        </div>

        {/* Grid Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTopics.map((topic) => (
            <div 
              key={topic.id}
              className="glass-card-dark rounded-xl p-8 border-white/5 flex flex-col justify-between min-h-[300px] hover:border-[rgba(212,146,10,0.25)] transition-all duration-300"
            >
              <div className="space-y-4">
                <h3 className="text-xl font-serif font-semibold text-[#F5F0EB]">
                  {topic.title}
                </h3>
                <p className="text-[rgba(245,240,235,0.7)] text-xs leading-relaxed font-light font-body">
                  {topic.content}
                </p>
              </div>

              {/* Keyword Cloud (Subtle tag display for SEO semantic weights) */}
              <div className="mt-6 pt-4 border-t border-white/5">
                <span className="text-[10px] font-mono text-[var(--color-text-muted)] uppercase tracking-wider block mb-2">Target Keywords:</span>
                <div className="flex flex-wrap gap-1.5">
                  {topic.keywords.map((kw, i) => (
                    <span 
                      key={i} 
                      className="text-[9px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-400"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
