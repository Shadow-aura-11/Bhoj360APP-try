import React, { useState } from 'react';
import Nav from './components/Nav';
import Footer from './components/Footer';
import FloatingWhatsApp from '../../components/shared/FloatingWhatsApp';
import { useLanguage } from '../../hooks/useLanguage';
import useDocumentMetadata from '../../hooks/useDocumentMetadata';
import { 
  Check, 
  ChevronDown, 
  ArrowRight, 
  Terminal, 
  Users, 
  QrCode, 
  Printer, 
  ChefHat, 
  MessageSquare, 
  Share2, 
  Ticket, 
  HelpCircle 
} from 'lucide-react';

export default function FeaturesPage() {
  useDocumentMetadata(
    'Multi-OS Platform Features - Cloud POS, Table & Inventory Management Tools',
    'Discover the powerful restaurant automation tools built into Multi-OS Platform. Features include split billing, dynamic UPI QR codes, interactive floorplans, and real-time inventory tracking.'
  );

  const { lang } = useLanguage();
  const isHindi = lang === 'hi';

  const [activeTab, setActiveTab] = useState('floorplan');
  const [viewMode, setViewMode] = useState('phone'); // 'phone' or 'desktop'
  const [openFaq, setOpenFaq] = useState(null);

  // 1. Tabbed visual showcase data (Interactive Layout, Expenses, Bookings, Coupons!)
  const tabsData = isHindi ? {
    floorplan: {
      title: "गतिशील बैठक और टेबल लेआउट संपादक",
      tag: "टेबल लेआउट संपादक",
      desc: "इंटरैक्टिव ग्रिड मैपिंग के साथ अपने डाइनिंग रूम को डिज़ाइन करें। टेबल आकार सेट करें, ग्राहक क्षमता निर्दिष्ट करें, फर्श योजनाओं को व्यवस्थित करें, और वास्तविक समय में टेबल स्थिति देखें।",
      image: "/floor_plan_editor.png",
      highlights: ["ड्रैग एंड ड्रॉप इंटरफ़ेस", "सीट संख्या कॉन्फ़िगरेशन", "वास्तविक समय बैठने की स्थिति", "मल्टी-रूम फ्लोरप्लान"]
    },
    ledger: {
      title: "विस्तृत व्यय और परिचालन बही",
      tag: "व्यय और लाभ ट्रैकर",
      desc: "अंतर्निहित बही-खातों के साथ अपनी वित्तीय सीमाओं को प्रबंधित करें। कुल राजस्व की तुलना लागतों से करते हुए आपूर्ति खरीद, कर्मचारी श्रम, किराया और उपयोगिता व्यय दर्ज करें।",
      image: "/expenses_ledger.png",
      highlights: ["परिचालन लागत बहीखाता", "वास्तविक समय शुद्ध लाभ", "इंटरैक्टिव लाभ विश्लेषण", "दैनिक वित्तीय ऑडिट"]
    },
    reservations: {
      title: "सटीक बुकिंग और अतिथि आरक्षण",
      tag: "आरक्षण प्रबंधक",
      desc: "आगामी टेबल बुकिंग, अतिथि विवरण, विशेष निर्देशों और वीआईपी श्रेणियों को ट्रैक करें। ग्राहकों के आगमन के समय लाइव टेबल असाइन करें।",
      image: "/reservations_manager.png",
      highlights: ["कैलेंडर बुकिंग ग्रिड", "अतिथि डेटाबेस प्रबंधन", "वीआईपी/विशेष अनुरोध टैग", "स्वचालित सीट आवंटन"]
    },
    coupons: {
      title: "पदोन्नति अभियान और प्रोमो कोड",
      tag: "कूपन अभियान प्रबंधक",
      desc: "प्रतिशत या निश्चित मूल्य कटौती के साथ सहेजने वाले कूपन कोड बनाएं। न्यूनतम बिल आवश्यकताएं निर्धारित करें और लाइव चेकआउट के दौरान कूपन वैधता सत्यापित करें।",
      image: "/coupons_manager.png",
      highlights: ["प्रतिशत / निश्चित मूल्य छूट", "न्यूनतम जांच सीमा मूल्य", "लाइव कार्ट कूपन सत्यापन", "कूपन रिडेम्पशन लॉग"]
    }
  } : {
    floorplan: {
      title: "Dynamic Seating & Layout Mapping",
      tag: "Table Layout Editor",
      desc: "Design your dining room with interactive grid mapping. Set table shapes, specify customer capacities, arrange floor plans dynamically, and visualize real-time table occupancy status.",
      image: "/floor_plan_editor.png",
      highlights: ["Drag & Drop Interface", "Seat Count Configuration", "Real-time Seating Status", "Multi-Room Floorplans"]
    },
    ledger: {
      title: "Granular Expense & Operational Book",
      tag: "Expense & Profit Tracker",
      desc: "Manage your bottom line with built-in ledgers. Record supply purchases, employee labor, rent, and utility expenses while comparing overall revenue with costs for real margins.",
      image: "/expenses_ledger.png",
      highlights: ["Operational Cost Ledgers", "Real-time Margins", "Interactive Profit Analysis", "Daily Financial Audits"]
    },
    reservations: {
      title: "Granular Bookings & Reservation Ledger",
      tag: "Reservations Manager",
      desc: "Track upcoming guest seatings, customer contact details, custom instructions, and guest loyalty categories. Live-assign seating upon patron arrival.",
      image: "/reservations_manager.png",
      highlights: ["Calendar-based Seating Grid", "Guest Contact Database", "Special VIP Request Tags", "Instant Table Assignment"]
    },
    coupons: {
      title: "Promotional Campaigns & Coupon Codes",
      tag: "Campaign Coupon Manager",
      desc: "Create and deploy promo coupons supporting fixed rate or percentage-based check discounts. Set minimum ticket subtotals and valid campaign periods.",
      image: "/coupons_manager.png",
      highlights: ["Fixed or Percentage Discounts", "Minimum Order Value Limits", "Live Checkout Validations", "Redemption Count Tracking"]
    }
  };



  // 2. Core features list
  const features = isHindi ? [
    { title: "एकीकृत पीओएस बिलिंग", icon: Terminal, desc: "जीएसटी-अनुपालन करों, सेवा शुल्क और स्प्लिट कैश/यूपीआई भुगतान निपटान के साथ पूर्ण बिलिंग कंसोल।" },
    { title: "इंटरैक्टिव फ्लोर प्लान", icon: Users, desc: "टेबल लेआउट खींचें और छोड़ें, वास्तविक समय की बैठने की स्थिति देखें, और वेटर ऑर्डर डिस्पैच पाइपलाइन प्रबंधित करें।" },
    { title: "डायनेमिक यूपीआई क्यूआर कोड", icon: QrCode, desc: "प्रत्येक टेबल चेक के लिए स्वचालित रूप से अद्वितीय यूपीआई क्यूआर कोड उत्पन्न करें। ग्राहक स्कैन करके तुरंत भुगतान कर सकते हैं।" },
    { title: "थर्मल केओटी प्रिंटिंग", icon: Printer, desc: "स्वचालित रूप से रसोई ऑर्डर टिकट प्रिंट करें। प्रिंट प्रीव्यू देखने के लिए लाइव थर्मल रसीद कार्ड प्रीव्यू।" },
    { title: "वेटर और किचन टर्मिनल", icon: ChefHat, desc: "कदम-दर-कदम भोजन निर्माण और वितरण प्रक्रिया के लिए वेटर टैबलेट लॉगिन और रसोई केडीएस लाइव डिस्प्ले पाइप।" },
    { title: "गूगल समीक्षा स्वचालन", icon: MessageSquare, desc: "भुगतान पूर्ण होने के बाद ग्राहकों को स्वतः गूगल समीक्षा लिंक पर रीडायरेक्ट करें। समीक्षा रेटिंग बढ़ाएं।" },
    { title: "व्हाट्सएप बिल शेयरिंग", icon: Share2, desc: "बिना किसी महंगे बिजनेस एपीआई शुल्क के सीधे ग्राहकों के व्हाट्सएप नंबर पर बिल विवरण और रसीद संदेश साझा करें।" },
    { title: "कूपन प्रबंधक", icon: Ticket, desc: "न्यूनतम ऑर्डर मूल्य नियंत्रण, प्रतिशत या निश्चित मूल्य छूट के साथ प्रोमो कूपन कोड बनाएं और सत्यापित करें।" }
  ] : [
    { title: "Unified POS Billing", icon: Terminal, desc: "Complete billing terminal with GST compliance, service charges, and split cash/online payment settlement." },
    { title: "Interactive Floorplans", icon: Users, desc: "Drag & drop table shapes, manage dynamic seating occupancy statuses, and synchronize live orders." },
    { title: "Dynamic UPI QR Codes", icon: QrCode, desc: "Instantly generate Base64 payment QR codes based on order totals and restaurant merchant UPI configurations." },
    { title: "Thermal KOT Print Engine", icon: Printer, desc: "Send print commands to local receipt printers automatically. Check custom headers, footers and live bill previews." },
    { title: "Waiter & Kitchen Terminals", icon: ChefHat, desc: "Mobile-first waiter dashboard interface and real-time Kitchen Display Systems (KDS) order tracking pipeline." },
    { title: "Google Review Automation", icon: MessageSquare, desc: "Redirect customers to leave a review immediately after their order is paid. Build online brand trust." },
    { title: "WhatsApp Receipt Shares", icon: Share2, desc: "Simulate and send bills to customer numbers, pre-composing links for fast WhatsApp Web client sharing." },
    { title: "Promo Coupon Manager", icon: Ticket, desc: "Create percentage or fixed discounts, configure minimum check totals, and validate active coupons in real-time." }
  ];

  // 3. FAQ data
  const faqs = isHindi ? [
    {
      q: "क्या Multi-OS Platform के लिए विशेष हार्डवेयर की आवश्यकता है?",
      a: "नहीं। Multi-OS Platform आधुनिक वेब तकनीक का उपयोग करके बनाया गया है और किसी भी स्मार्टफोन, टैबलेट, लैपटॉप या डेस्कटॉप पर आसानी से चलता है। प्रिंटिंग के लिए, यह सिस्टम प्रिंट लेआउट के माध्यम से मानक थर्मल प्रिंटर के साथ एकीकृत होता है।"
    },
    {
      q: "क्यूआर मेनू ऑर्डरिंग फ्लो कैसे काम करता है?",
      a: "प्रत्येक टेबल को एक अनूठा क्यूआर कोड दिया जाता है। जब कोई अतिथि इसे स्कैन करता है, तो यह बिना किसी ऐप को इंस्टॉल किए उनके ब्राउज़र पर मेनू खोलता है। वे आइटम जोड़ते हैं, एड-ऑन चुनते हैं और ऑर्डर देते हैं। ऑर्डर तुरंत वेटर डैशबोर्ड और KDS पर दिखाई देते हैं।"
    },
    {
      q: "क्या हम कुछ स्टाफ भूमिकाओं के लिए सुविधाओं को प्रतिबंधित कर सकते हैं?",
      a: "हाँ। एडमिन सेटिंग्स आपको स्टाफ क्रेडेंशियल प्रबंधित करने और पहुंच को सीमित करने की अनुमति देती हैं। इसके अतिरिक्त, एजेंसी प्रशासक रेस्तरां स्तर पर विशिष्ट सुविधाओं (जैसे व्यय या विश्लेषिकी) को सक्षम या अक्षम कर सकते हैं।"
    },
    {
      q: "क्या स्थानीय कैशियर के लिए ऑफलाइन सहायता है?",
      a: "Multi-OS Platform को तेज़ लोड समय के लिए अनुकूलित किया गया है और यह एक प्रोग्रेसिव वेब एप्लिकेशन (PWA) के रूप में काम करता है। यदि आपका इंटरनेट क्षण भर के लिए चला जाता है, तो सक्रिय टेबल और कार्ट डेटा को ऑर्डर हानि से बचाने के लिए इन-मेमोरी में रखा जाता है।"
    }
  ] : [
    {
      q: "Does Multi-OS Platform require special hardware?",
      a: "No. Multi-OS Platform is built using modern web technology and runs smoothly on any smartphone, tablet, laptop, or desktop. For printing, it integrates with standard thermal printers via system print layouts."
    },
    {
      q: "How does the QR menu ordering flow work?",
      a: "Each table is assigned a unique QR code. When scanned by a guest, it opens the menu on their browser without installing any app. They add items, choose add-ons, and place orders. The orders immediately ring on the Waiter Dashboard and KDS."
    },
    {
      q: "Can we restrict features for certain staff roles?",
      a: "Yes. Admin settings allow you to manage staff credentials and limit access. Additionally, agency administrators can enable or disable specific features (such as Expenses or Analytics) at a restaurant level."
    },
    {
      q: "Is there offline support for local cashiers?",
      a: "Multi-OS Platform is optimized for fast load times and operates as a Progressive Web Application (PWA). If your internet drops momentarily, active tables and cart data are retained in-memory to prevent order loss."
    }
  ];

  const activeInfo = tabsData[activeTab];

  const handleScrollToShowcase = () => {
    const el = document.getElementById('feature-showcase');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="tableos-landing min-h-screen flex flex-col justify-between bg-[#080808] text-[#F5F0EB] relative">
      <div className="noise-overlay"></div>
      
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 right-0 h-[600px] bg-gradient-to-b from-[rgba(212,146,10,0.06)] to-transparent pointer-events-none z-0"></div>
      <div className="absolute top-1/3 left-1/2 w-[400px] h-[400px] rounded-full bg-[rgba(212,146,10,0.03)] blur-[100px] pointer-events-none"></div>
      <div className="bg-grid-pattern opacity-25 absolute inset-0 z-0 pointer-events-none"></div>

      <Nav />
      <FloatingWhatsApp />

      {/* Main Container */}
      <main className="flex-grow pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto w-full z-10 relative space-y-28">
        
        {/* HERO SECTION */}
        <section className="max-w-4xl mx-auto text-left space-y-8 animate-reveal">
          <div className="space-y-4">
            <span className="text-[11px] font-mono tracking-[0.25em] text-[var(--color-amber)] uppercase block">
              {isHindi ? "प्रणाली की क्षमताएं" : "System Capabilities"}
            </span>
            <h1 className="text-4xl md:text-6xl font-serif text-[#F5F0EB] leading-[1.15] tracking-tight">
              {isHindi ? "आधुनिक भोजनालयों के लिए निर्मित उपकरण।" : "Engineered for speed, built for reliability."}
            </h1>
            <p className="text-[rgba(245,240,235,0.7)] text-lg md:text-xl font-light leading-relaxed max-w-3xl">
              {isHindi
                ? "Multi-OS Platform ऑर्डर मैनेजमेंट, टेबल मैनेजमेंट, किचन मैनेजमेंट और रियल-टाइम इन्वेंट्री को एकीकृत करने के लिए स्वचालित वर्कफ़्लो प्रदान करता है। हमारे ऑल-इन-वन रेस्तरां सॉफ़्टवेयर के साथ परिचालन को सुव्यवस्थित करें।"
                : "Multi-OS Platform provides automated workflows that integrate order management, table management, menu management, and real-time analytics. Streamline your operations with our premium QR dining solution."
              }
            </p>
          </div>

          <div className="flex flex-wrap gap-4 pt-2">
            <button
              onClick={handleScrollToShowcase}
              className="px-6 py-3 bg-[var(--color-amber)] text-black rounded-xl font-mono text-xs tracking-wider uppercase font-extrabold hover:bg-amber-400 transition-all duration-300 shimmer-btn flex items-center gap-2"
            >
              <span>{isHindi ? "क्षमताओं का अन्वेषण करें" : "Explore Capabilities"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <a
              href="/contact"
              className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-mono text-xs tracking-wider uppercase border border-white/10 transition-all duration-300"
            >
              {isHindi ? "डेमो का अनुरोध करें" : "Request a Demo"}
            </a>
          </div>
        </section>

        <hr className="border-white/5 max-w-5xl mx-auto" />

        {/* INTERACTIVE SHOWCASE TABS */}
        <section id="feature-showcase" className="max-w-5xl mx-auto space-y-10 scroll-mt-28">
          <div className="space-y-3 text-left">
            <span className="text-[10px] font-mono text-[var(--color-amber)] tracking-[0.2em] uppercase">
              {isHindi ? "इंटरैक्टिव डेमो" : "Interactive Showcase"}
            </span>
            <h2 className="text-3xl md:text-4xl font-serif text-white">
              {isHindi ? "सिस्टम को लाइव देखें" : "Explore advanced control systems"}
            </h2>
            <p className="text-sm text-slate-400 font-light max-w-2xl">
              {isHindi
                ? "हमारे चार मुख्य प्रबंधन मॉड्यूल के इंटरैक्टिव इंटरफेस का अन्वेषण करें। आपके रेस्तरां को सुव्यवस्थित करने के लिए बिल्कुल अनुकूल।"
                : "Browse through the visual interfaces of our layout planners, stock control centers, expense sheets, and SaaS settings."
              }
            </p>
          </div>

          {/* Tabs Selector Row */}
          <div className="flex flex-wrap gap-2 justify-start border-b border-white/5 pb-4">
            {Object.keys(tabsData).map((tabKey) => {
              const tab = tabsData[tabKey];
              const isActive = activeTab === tabKey;
              return (
                <button
                  key={tabKey}
                  onClick={() => setActiveTab(tabKey)}
                  className={`px-5 py-2.5 rounded-xl font-mono text-[10px] md:text-xs tracking-wider uppercase border transition-all duration-300 ${
                    isActive
                      ? 'bg-[var(--color-amber)] text-black border-[var(--color-amber)] font-bold shadow-lg shadow-amber-500/10'
                      : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {tab.tag}
                </button>
              );
            })}
          </div>

          {/* Interactive tab block */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-6 text-left">
              <div className="space-y-2">
                <span className="text-[10px] font-mono text-[var(--color-amber)] tracking-widest uppercase block">
                  {activeInfo.tag}
                </span>
                <h3 className="text-2xl md:text-3xl font-serif text-white">{activeInfo.title}</h3>
              </div>
              <p className="text-sm text-slate-400 font-light leading-relaxed">{activeInfo.desc}</p>
              
              <div className="grid grid-cols-2 gap-y-3 gap-x-4 pt-2">
                {activeInfo.highlights.map((highlight, hIdx) => (
                  <div key={hIdx} className="flex items-center gap-2 text-[11px] text-slate-300">
                    <Check className="w-3.5 h-3.5 text-[var(--color-amber)] flex-shrink-0" />
                    <span>{highlight}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-7 flex flex-col items-center">
              {/* Device Toggle */}
              <div className="inline-flex p-1 bg-black/60 border border-white/10 rounded-xl mb-6 self-center lg:self-end">
                <button
                  onClick={() => setViewMode('phone')}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-mono tracking-wider transition-all ${
                    viewMode === 'phone' ? 'bg-[var(--color-amber)] text-black font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  PHONE APP
                </button>
                <button
                  onClick={() => setViewMode('desktop')}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-mono tracking-wider transition-all ${
                    viewMode === 'desktop' ? 'bg-[var(--color-amber)] text-black font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  DESKTOP
                </button>
              </div>

              {viewMode === 'desktop' ? (
                <div className="browser-chrome border-glow-amber w-full transition-all duration-500">
                  <div className="browser-header">
                    <div className="flex gap-1.5">
                      <div className="dot-red"></div>
                      <div className="dot-yellow"></div>
                      <div className="dot-green"></div>
                    </div>
                    <div className="browser-address">
                      https://multi-os-platform.com/features/{activeTab}
                    </div>
                  </div>
                  <div className="bg-[#F8F9FD] relative overflow-hidden aspect-[16/10] flex items-center justify-center p-4">
                    <img
                      src={activeInfo.image}
                      alt={activeInfo.title}
                      className="max-w-full max-h-full object-contain select-none shadow-md rounded border border-slate-200/50"
                    />
                  </div>
                </div>
              ) : (
                /* Phone App Frame Wrapper */
                <div className="relative border-[12px] border-zinc-800 rounded-[2.5rem] overflow-hidden aspect-[9/16] max-w-[320px] w-full bg-black shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] border-glow-amber transition-all duration-500">
                  {/* Speaker Notch */}
                  <div className="absolute top-0 inset-x-0 h-4 bg-zinc-800 flex justify-center items-center z-20">
                    <div className="w-16 h-1 rounded-full bg-zinc-700"></div>
                  </div>

                  {/* Dynamic App Content Screen */}
                  <div className="relative w-full h-full pt-8 pb-4 overflow-hidden bg-[#F8F9FD] flex items-center justify-center">
                    <img
                      src={activeInfo.image.replace("expenses_ledger.png", "phone_ledger.png").replace("floor_plan_editor.png", "phone_floorplan.png").replace("reservations_manager.png", "phone_reservations.png").replace("coupons_manager.png", "phone_coupons.png")}
                      alt={`${activeInfo.title} phone view`}
                      className="max-w-full max-h-full object-contain select-none"
                    />
                  </div>

                  {/* Bottom Home Button Bar */}
                  <div className="absolute bottom-2 inset-x-0 h-1 flex justify-center items-center z-20">
                    <div className="w-24 h-1 rounded-full bg-zinc-600"></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        <hr className="border-white/5 max-w-5xl mx-auto" />

        {/* CORE CAPABILITIES GRID */}
        <section className="max-w-5xl mx-auto space-y-12">
          <div className="space-y-3 text-left">
            <span className="text-[10px] font-mono text-[var(--color-amber)] tracking-[0.2em] uppercase">
              {isHindi ? "सभी सुविधाएं" : "Full Feature Deck"}
            </span>
            <h2 className="text-3xl md:text-4xl font-serif text-white">
              {isHindi ? "व्यापक स्वचालन सूट" : "Built to handle your busiest shifts"}
            </h2>
            <p className="text-sm text-slate-400 font-light max-w-2xl">
              {isHindi
                ? "हमारे प्लेटफ़ॉर्म में वे सभी घटक शामिल हैं जिनकी आपको इन-स्टोर बिलिंग, ऑर्डर देने और ग्राहक प्रतिधारण के लिए आवश्यकता होती है।"
                : "Every tool you need to streamline order taking, accelerate checkout, and increase dining capacity."
              }
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, idx) => {
              const IconComp = feat.icon;
              return (
                <div key={idx} className="glass-card-dark rounded-2xl p-6 border border-white/5 bg-black/40 space-y-4 hover:border-amber-500/20 transition-all duration-300 flex flex-col justify-between text-left">
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-[var(--color-amber)]/10 text-[var(--color-amber)] flex items-center justify-center">
                      <IconComp className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-serif text-[#F5F0EB]">{feat.title}</h3>
                    <p className="text-xs text-[rgba(245,240,235,0.65)] font-light leading-relaxed">
                      {feat.desc}
                    </p>
                  </div>
                  <div className="text-[10px] font-mono text-[var(--color-amber)]/45">
                    FEATURE 0{idx + 1}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <hr className="border-white/5 max-w-5xl mx-auto" />

        {/* FAQ SECTION */}
        <section className="max-w-4xl mx-auto space-y-10">
          <div className="space-y-3 text-center">
            <span className="text-[10px] font-mono text-[var(--color-amber)] tracking-[0.2em] uppercase">
              {isHindi ? "अक्सर पूछे जाने वाले प्रश्न" : "Common Questions"}
            </span>
            <h2 className="text-3xl md:text-4xl font-serif text-white">
              {isHindi ? "पूछे जाने वाले प्रश्न" : "Frequently Asked Questions"}
            </h2>
          </div>

          <div className="space-y-4 max-w-3xl mx-auto text-left">
            {faqs.map((faq, fIdx) => {
              const isOpen = openFaq === fIdx;
              return (
                <div
                  key={fIdx}
                  className="glass-card-dark rounded-2xl border border-white/5 bg-black/40 overflow-hidden transition-all duration-350"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : fIdx)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left font-serif text-base md:text-lg text-white hover:text-[var(--color-amber)] transition-colors duration-300"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform duration-300 flex-shrink-0 ml-4 ${
                        isOpen ? 'transform rotate-180 text-[var(--color-amber)]' : ''
                      }`}
                    />
                  </button>
                  <div
                    className={`transition-all duration-350 ease-in-out ${
                      isOpen ? 'max-h-56 border-t border-white/5 opacity-100' : 'max-h-0 opacity-0'
                    } overflow-hidden`}
                  >
                    <p className="px-6 py-4 text-xs md:text-sm text-slate-400 font-light leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* CALL TO ACTION (CTA) SECTION */}
        <section className="max-w-5xl mx-auto pt-6">
          <div className="relative rounded-3xl p-8 md:p-14 overflow-hidden border border-white/10 bg-gradient-to-br from-zinc-900/60 to-black/80 text-center space-y-6">
            <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-[var(--color-amber)]/5 blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-amber-500/5 blur-3xl pointer-events-none"></div>
            
            <span className="text-[10px] font-mono text-[var(--color-amber)] tracking-[0.25em] uppercase">
              {isHindi ? "ऑपरेशन्स को बदलें" : "Elevate Your Dining Experience"}
            </span>
            <h2 className="text-3xl md:text-5xl font-serif text-white max-w-2xl mx-auto leading-tight">
              {isHindi ? "अपने रेस्तरां को अगले स्तर पर ले जाने के लिए तैयार हैं?" : "Ready to modernize your restaurant operations?"}
            </h2>
            <p className="text-sm text-slate-400 font-light max-w-xl mx-auto leading-relaxed">
              {isHindi
                ? "आज ही शामिल हों और ऑर्डर की गति बढ़ाएं, टेबल का टर्नओवर सुधारे और भुगतान को सहज बनाएं।"
                : "Join restaurant operators using Multi-OS Platform to speed up checkout, automate reviews, and provide contactless table ordering."
              }
            </p>
            <div className="pt-4">
              <a
                href="/contact"
                className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--color-amber)] text-black rounded-xl font-mono text-xs tracking-wider uppercase font-bold hover:bg-amber-400 transition-all duration-300 shadow-xl shadow-amber-500/10 hover:shadow-amber-500/20"
              >
                <span>{isHindi ? "14 दिनों का निःशुल्क परीक्षण शुरू करें" : "Start your 14-day free trial"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
