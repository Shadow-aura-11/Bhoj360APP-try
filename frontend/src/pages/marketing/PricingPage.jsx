import React from 'react';
import Nav from './components/Nav';
import Footer from './components/Footer';
import Pricing from './components/Pricing';
import FloatingWhatsApp from '../../components/shared/FloatingWhatsApp';
import useDocumentMetadata from '../../hooks/useDocumentMetadata';
import { useLanguage } from '../../hooks/useLanguage';

export default function PricingPage() {
  useDocumentMetadata(
    'Multi-OS Platform Pricing - Affordable Restaurant POS & Management Software Plans',
    'Choose the perfect Multi-OS Platform plan for your restaurant. Flexible pricing for cloud POS billing, table ordering, menu management, and inventory tracking.'
  );

  const { lang } = useLanguage();
  const isHindi = lang === 'hi';

  return (
    <div className="tableos-landing min-h-screen flex flex-col justify-between bg-[#080808] text-[#F5F0EB] relative">
      <div className="noise-overlay"></div>
      
      <Nav />
      <FloatingWhatsApp />

      <main className="flex-grow pt-32">
        {/* SEO Introduction Header */}
        <div className="max-w-4xl mx-auto px-6 text-center space-y-4">
          <span className="text-[11px] font-mono tracking-[0.25em] text-[var(--color-amber)] uppercase block">
            {isHindi ? "लागत और योजनाएं" : "Flexible Subscriptions"}
          </span>
          <h1 className="text-4xl md:text-5xl font-serif text-[#F5F0EB]">
            {isHindi ? "पारदर्शी मूल्य निर्धारण, कोई छिपा हुआ शुल्क नहीं" : "Affordable Cloud-based Restaurant POS Software"}
          </h1>
          <p className="text-[rgba(245,240,235,0.7)] text-sm md:text-base font-light max-w-2xl mx-auto leading-relaxed">
            {isHindi 
              ? "Multi-OS Platform भारत के बेहतरीन रेस्तरां बिलिंग सॉफ्टवेयर (Restaurant Billing Software India) में से एक है। हमारी योजनाओं में क्लाउड-आधारित रेस्तरां पीओएस (Cloud-based Restaurant POS) के साथ टेबल और इन्वेंट्री शामिल हैं।"
              : "Multi-OS Platform is engineered as the best restaurant POS software to simplify billing and table operations. Choose a subscription package built on our high-performance restaurant billing software India framework."
            }
          </p>
        </div>

        {/* Render the standard marketing pricing component inside the page shell */}
        <Pricing />
      </main>

      <Footer />
    </div>
  );
}
