import { useState, useEffect } from 'react';

const translations = {
  en: {
    // Nav
    features: "Features",
    showcase: "Showcase",
    process: "Workflow",
    pricing: "Pricing",
    faq: "FAQ",
    contact: "Contact",
    launch_console: "Launch Console",
    // Hero
    hero_tag: "Decentralized Multi-OS Engine",
    hero_title_1: "Next-Gen Enterprise OS,",
    hero_title_2: "Multi-Vertical SaaS Platform.",
    hero_desc: "Provision isolated, high-performance node instances for your entire business portfolio. From Restaurants and Retail to Gyms, Spas, and Property Management - one unified ecosystem.",
    get_started: "Get Started",
    // pricing
    pricing_matrix: "Pricing Matrix",
    pricing_title: "Transparent structures built for business growth.",
    monthly_billing: "Monthly Billing",
    yearly_billing: "Yearly Billing",
    save_20: "SAVE 20%",
    billed_annually: "Billed annually",
    billed_monthly: "Billed month-to-month",
    recommended: "RECOMMENDED",
    // How it works (Workflow)
    execution_lifecycle: "Enterprise Operations Workflow",
    workflow_subtitle: "From zero to live service orchestration in hours.",
    workflow_desc: "A comprehensive, automated setup flow built for sophisticated enterprise groups.",
    // CTA
    cta_tag: "GET STARTED IN 60 SECONDS",
    cta_title: "Ready to upgrade your business operations?",
    cta_desc: "Deploy your first enterprise node container in 60 seconds. Experience the speed, precision, and luxury of our Multi-OS Platform today.",
    cta_btn: "Get Started Now →",
    // Footer
    footer_desc: "Modern multi-vertical management platform. Empowering business units with high performance node instances, AI insights, and unified orchestration.",
    footer_quick_links: "Quick Links",
    footer_legal: "Legal Links",
    footer_contact: "Contact Details",
    footer_address: "12, Ring Road, Sector 4, HSR Layout, Bengaluru, Karnataka 560102",
    footer_phone: "+91 8299443154",
    footer_email: "support@multi-os-platform.com",
    footer_copyright: "Built by Multi-OS Platform Team. © {year}. All Rights Reserved."
  },
  hi: {
    // Nav
    features: "विशेषताएं",
    showcase: "प्रदर्शन",
    process: "कार्यप्रवाह",
    pricing: "मूल्य निर्धारण",
    faq: "अक्सर पूछे जाने वाले प्रश्न",
    contact: "संपर्क करें",
    launch_console: "कंसोल लॉन्च करें",
    // Hero
    hero_tag: "विकेंद्रीकृत मल्टी-ओएस इंजन",
    hero_title_1: "अगली पीढ़ी का एंटरप्राइज ओएस,",
    hero_title_2: "मल्टी-वर्टिकल SaaS प्लेटफॉर्म।",
    hero_desc: "अपने संपूर्ण व्यवसाय पोर्टफोलियो के लिए अलग, उच्च प्रदर्शन वाले नोड उदाहरण प्रदान करें। रेस्तरां और रिटेल से लेकर जिम, स्पा और प्रॉपर्टी मैनेजमेंट तक - एक एकीकृत पारिस्थितिकी तंत्र।",
    get_started: "शुरू करें",
    // pricing
    pricing_matrix: "मूल्य निर्धारण मैट्रिक्स",
    pricing_title: "व्यावसायिक विकास के लिए बनी पारदर्शी संरचनाएं।",
    monthly_billing: "मासिक बिलिंग",
    yearly_billing: "वार्षिक बिलिंग",
    save_20: "20% बचाएं",
    billed_annually: "वार्षिक बिल किया गया",
    billed_monthly: "मासिक बिल किया गया",
    recommended: "अनुशंसित",
    // How it works (Workflow)
    execution_lifecycle: "एंटरप्राइज संचालन कार्यप्रवाह",
    workflow_subtitle: "शून्य से लाइव सेवा संचालन तक कुछ ही घंटों में।",
    workflow_desc: "परिष्कृत कॉर्पोरेट समूहों के लिए निर्मित एक व्यापक, स्वचालित सेटअप प्रवाह।",
    // CTA
    cta_tag: "60 सेकंड में शुरू करें",
    cta_title: "क्या आप अपने व्यावसायिक संचालन को अपग्रेड करने के लिए तैयार हैं?",
    cta_desc: "60 सेकंड में अपना पहला एंटरप्राइज नोड कंटेनर तैनात करें। आज ही हमारे मल्टी-ओएस प्लेटफॉर्म की गति, सटीकता और सुविधा का अनुभव करें।",
    cta_btn: "अभी शुरू करें →",
    // Footer
    footer_desc: "आधुनिक मल्टी-वर्टिकल प्रबंधन मंच। व्यावसायिक इकाइयों को उच्च प्रदर्शन वाले नोड उदाहरणों, एआई अंतर्दृष्टि और एकीकृत संचालन के साथ सशक्त बनाना।",
    footer_quick_links: "त्वरित लिंक्स",
    footer_legal: "कानूनी लिंक्स",
    footer_contact: "संपर्क विवरण",
    footer_address: "12, रिंग रोड, सेक्टर 4, एचएसआर लेआउट, बेंगलुरु, कर्नाटक 560102",
    footer_phone: "+91 8299443154",
    footer_email: "support@multi-os-platform.com",
    footer_copyright: "मल्टी-ओएस प्लेटफॉर्म टीम द्वारा निर्मित। © {year}। सभी अधिकार सुरक्षित।"
  }
};

const priceConversions = {
  monthly: {
    "Bronze Plan": 3999,
    "Silver Plan": 7999,
    "Gold Plan": 19999
  },
  yearly: {
    "Bronze Plan": 3199,
    "Silver Plan": 6399,
    "Gold Plan": 15999
  }
};

export function useLanguage() {
  const [lang, setLangState] = useState(localStorage.getItem('lang') || 'en');

  useEffect(() => {
    const handleLangChange = () => {
      setLangState(localStorage.getItem('lang') || 'en');
    };
    window.addEventListener('langChanged', handleLangChange);
    return () => window.removeEventListener('langChanged', handleLangChange);
  }, []);

  const setLang = (newLang) => {
    localStorage.setItem('lang', newLang);
    window.dispatchEvent(new Event('langChanged'));
  };

  const t = (key, replacements = {}) => {
    let text = translations[lang]?.[key] || translations['en']?.[key] || key;
    Object.keys(replacements).forEach(k => {
      text = text.replace(`{${k}}`, replacements[k]);
    });
    return text;
  };

  const isHindi = lang === 'hi';

  const formatPrice = (planName, billingCycle, usdPrice) => {
    const price = priceConversions[billingCycle]?.[planName] || (usdPrice * 80);
    return `₹${price.toLocaleString('en-IN')}`;
  };

  return {
    lang,
    setLang,
    t,
    isHindi,
    formatPrice,
    currencySymbol: '₹'
  };
}
