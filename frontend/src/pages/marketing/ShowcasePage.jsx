import React, { useState, useEffect } from 'react';
import Nav from './components/Nav';
import Footer from './components/Footer';
import FloatingWhatsApp from '../../components/shared/FloatingWhatsApp';
import { useLanguage } from '../../hooks/useLanguage';
import useDocumentMetadata from '../../hooks/useDocumentMetadata';
import { 
  Check, 
  ArrowRight, 
  Smartphone, 
  Terminal, 
  ChefHat, 
  HeartHandshake, 
  Play, 
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Maximize,
  Wifi, 
  Zap, 
  Printer, 
  Cpu 
} from 'lucide-react';

export default function ShowcasePage() {
  useDocumentMetadata(
    'Multi-OS Platform Showcase - Live Smart POS & Restaurant Analytics Dashboard',
    'See Multi-OS Platform in active operations. Explore our cashier POS console, waiter terminals, kitchen display systems, and analytics dashboard.'
  );

  const { lang } = useLanguage();
  const isHindi = lang === 'hi';

  // Walkthrough Simulator states
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [progress, setProgress] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1); // 1, 1.5, 2
  const [isMuted, setIsMuted] = useState(false);
  const [viewMode, setViewMode] = useState('phone'); // 'phone' or 'desktop'

  const FRAME_DURATION = 5000; // 5 seconds per dashboard screenshot

  const videoFrames = [
    {
      titleEn: "01. Admin Controller & Seating",
      titleHi: "01. एडमिन कंट्रोलर और सीटिंग",
      subtitleEn: "Parent Admin Portal - managing live floor plan table updates, reservation waitlist check-ins, and outlet KPIs on the fly.",
      subtitleHi: "पैरेंट एडमिन पोर्टल - लाइव फ्लोर प्लान टेबल अपडेट, आरक्षण प्रतीक्षा सूची चेक-इन, और आउटलेट केपीआई को तुरंत प्रबंधित करना।",
      imgDesktop: "/dashboard_admin.png",
      imgPhone: "/phone_admin.png",
      tagEn: "Corporate Admin",
      tagHi: "कॉर्पोरेट एडमिन",
      timestamp: "00:05"
    },
    {
      titleEn: "02. Waiter Dispatch App",
      titleHi: "02. वेटर डिस्पैच ऐप",
      subtitleEn: "Staff mobile terminal - check table ready statuses, send digital kitchen orders, print bills, and run quick KOT receipts.",
      subtitleHi: "स्टाफ मोबाइल टर्मिनल - टेबल की स्थिति की जांच करें, डिजिटल केओटी भेजें, बिल प्रिंट करें, और रसोई के लिए रसीदें चलाएं।",
      imgDesktop: "/dashboard_waiter.png",
      imgPhone: "/phone_waiter.png",
      tagEn: "Table-Side Service",
      tagHi: "टेबल-साइड सेवा",
      timestamp: "00:10"
    },
    {
      titleEn: "03. Kitchen Display System (KDS)",
      titleHi: "03. रसोई प्रदर्शन प्रणाली (KDS)",
      subtitleEn: "Chef display console - tracking preparation timers, checking course counts, and updating active orders in real-time.",
      subtitleHi: "शेफ डिस्प्ले कंसोल - तैयारी टाइमर को ट्रैक करना, कोर्स काउंट की जांच करना, और वास्तविक समय में सक्रिय ऑर्डर अपडेट करना।",
      imgDesktop: "/dashboard_kds.png",
      imgPhone: "/phone_kds.png",
      tagEn: "Kitchen Production",
      tagHi: "रसोई उत्पादन",
      timestamp: "00:15"
    },
    {
      titleEn: "04. Cashier POS Billing Console",
      titleHi: "04. कैशियर पीओएस बिलिंग कंसोल",
      subtitleEn: "Settle orders with lightning speed. Processing split bills, generating dynamic UPI QR codes, and displaying live thermal print previews.",
      subtitleHi: "बिजली की गति से ऑर्डर व्यवस्थित करें। विभाजित बिलों को संसाधित करना, गतिशील यूपीआई क्यूआर कोड उत्पन्न करना, और लाइव थर्मल प्रिंट पूर्वावलोकन प्रदर्शित करना।",
      imgDesktop: "/dashboard_pos.png",
      imgPhone: "/phone_pos.png",
      tagEn: "Billing & Settlement",
      tagHi: "बिलिंग और निपटान",
      timestamp: "00:20"
    },
    {
      titleEn: "05. Guest Dining QR Portal",
      titleHi: "05. ग्राहक डाइनिंग क्यूआर पोर्टल",
      subtitleEn: "Contactless dining menu scans table-specific QR codes. Guests select custom themes (Onyx, Emerald, Ruby, Amber), order items, and check out.",
      subtitleHi: "संपर्क रहित भोजन मेनू टेबल-विशिष्ट क्यूआर कोड को स्कैन करता है। अतिथि कस्टम थीम (गोमेद, पन्ना, माणिक, एम्बर) चुनते हैं, ऑर्डर करते हैं और चेकआउट करते हैं।",
      imgDesktop: "/customer_dining.png",
      imgPhone: "/phone_guest_menu.png",
      tagEn: "Guest Experience",
      tagHi: "अतिथि अनुभव",
      timestamp: "00:25"
    },
    {
      titleEn: "06. Reservations Manager",
      titleHi: "06. आरक्षण प्रबंधक",
      subtitleEn: "Plan table bookings on a calendar grid. Seat arriving guests, register contact detail database profiles, and append special VIP tags.",
      subtitleHi: "कैलेंडर ग्रिड पर टेबल बुकिंग की योजना बनाएं। आने वाले मेहमानों को बैठाएं, संपर्क विवरण डेटाबेस प्रोफाइल पंजीकृत करें, और विशेष वीआईपी टैग जोड़ें।",
      imgDesktop: "/reservations_manager.png",
      imgPhone: "/phone_reservations.png",
      tagEn: "Bookings & Seating",
      tagHi: "आरक्षण और सीटिंग",
      timestamp: "00:30"
    },
    {
      titleEn: "07. Expense & Profit Ledger",
      titleHi: "07. व्यय और लाभ बही",
      subtitleEn: "Consolidated group bookkeeping. Logs supplier invoice costs, monthly utility charges, and calculates real-time net operating margins.",
      subtitleHi: "एकीकृत समूह बहीखाता। आपूर्तिकर्ता चालान लागत, मासिक उपयोगिता शुल्क लॉग करता है, और वास्तविक समय शुद्ध परिचालन मार्जिन की गणना करता है।",
      imgDesktop: "/expenses_ledger.png",
      imgPhone: "/phone_ledger.png",
      tagEn: "Financial Margins",
      tagHi: "वित्तीय मार्जिन",
      timestamp: "00:35"
    },
    {
      titleEn: "08. Table Layout Floorplan",
      titleHi: "08. टेबल लेआउट फ्लोरप्लान",
      subtitleEn: "Interactive drag-and-drop seating mapping. Admins shape tables, allocate seat capacities, and organize layouts for multiple dining rooms.",
      subtitleHi: "इंटरैक्टिव ड्रैग-एंड-ड्रॉप बैठने का मानचित्र। व्यवस्थापक टेबल को आकार देते हैं, सीट क्षमताएं आवंटित करते हैं, और कई डाइनिंग रूम के लिए लेआउट व्यवस्थित करते हैं।",
      imgDesktop: "/floor_plan_editor.png",
      imgPhone: "/phone_floorplan.png",
      tagEn: "Floor Arrangement",
      tagHi: "फ्लोर व्यवस्था",
      timestamp: "00:40"
    },
    {
      titleEn: "09. Coupons Campaign Manager",
      titleHi: "09. कूपन अभियान प्रबंधक",
      subtitleEn: "Configure promotional promo campaigns. Supports percentage or fixed currency discounts, minimum order limits, and uses live coupon logs.",
      subtitleHi: "प्रचार प्रोमो अभियानों को कॉन्फ़िगर करें। प्रतिशत या निश्चित मुद्रा छूट, न्यूनतम ऑर्डर सीमा का समर्थन करता है, और लाइव कूपन लॉग का उपयोग करता है।",
      imgDesktop: "/coupons_manager.png",
      imgPhone: "/phone_coupons.png",
      tagEn: "Promotions & Marketing",
      tagHi: "प्रचार और विपणन",
      timestamp: "00:45"
    }
  ];

  useEffect(() => {
    if (!isPlaying) return;

    const tickTime = 50;
    const interval = setInterval(() => {
      setProgress((prev) => {
        const nextProgress = prev + (tickTime / FRAME_DURATION) * 100 * playbackSpeed;
        if (nextProgress >= 100) {
          setCurrentFrame((prevFrame) => (prevFrame + 1) % videoFrames.length);
          return 0;
        }
        return nextProgress;
      });
    }, tickTime);

    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, videoFrames.length]);

  const handleNext = () => {
    setCurrentFrame((prev) => (prev + 1) % videoFrames.length);
    setProgress(0);
  };

  const handlePrev = () => {
    setCurrentFrame((prev) => (prev - 1 + videoFrames.length) % videoFrames.length);
    setProgress(0);
  };

  const handleFrameSelect = (idx) => {
    setCurrentFrame(idx);
    setProgress(0);
    setIsPlaying(true);
  };

  const showcaseItems = isHindi ? [
    {
      name: "कैशियर पीओएस बिलिंग कंसोल",
      tag: "बिलिंग और भुगतान",
      desc: "कैशियर और प्रबंधकों के लिए बिल निपटान केंद्र। एक क्लिक से विभाजित भुगतान (कैश, यूपीआई, या अन्य), रीयल-टाइम रसीद लाइव थर्मल पूर्वावलोकन, क्यूआर-कोड जनरेटर, और अनुकूलित प्रिंटर आकार (80mm/58mm) विन्यास का समर्थन करता है। निपटान के बाद ग्राहक को व्हाट्सएप या गूगल रिव्यू लिंक के लिए निर्देशित करने का विकल्प देता है।",
      img: "/dashboard_pos.png",
      icon: Terminal,
      highlights: ["जीएसटी-अनुपालन करों का समर्थन", "स्प्लिट भुगतान निपटान", "डायनेमिक यूपीआई क्यूआर कोड", "व्हाट्सएप पर तत्काल रसीद साझाकरण"]
    },
    {
      name: "वेटर डिस्पैच टर्मिनल",
      tag: "स्टाफ और फ्लोर ऑपरेशन्स",
      desc: "वेटर और कर्मचारियों के लिए डिज़ाइन किया गया एक मोबाइल-उत्तरदायी डार्क-थीम इंटरफ़ेस। यह उन्हें सीधे टेबल से ऑर्डर लेने, रसोई में भेजने, वेटर कॉल अलर्ट प्राप्त करने और वास्तविक समय में ऑर्डर स्थिति अपडेट देखने की अनुमति देता है। 10-अंकीय फोन सत्यापन के साथ त्वरित स्टाफ पिन लॉगिन सुविधा भी शामिल है।",
      img: "/dashboard_waiter.png",
      icon: Smartphone,
      highlights: ["त्वरित स्टाफ पिन लॉगिन", "सक्रिय टेबल और ऑर्डर ट्रैकिंग", "वेटर कॉल सूचनाएं", "केओटी रीयल-टाइम अपडेट"]
    },
    {
      name: "रसोई प्रदर्शन प्रणाली (KDS)",
      tag: "किचन प्रोडक्शन और कतार",
      desc: "रसोई के अंदर शेफ के लिए एक वास्तविक समय डिस्प्ले कार्ड ग्रिड। यह कागजी पर्चियों की आवश्यकता को समाप्त करता है। टिकटिंग प्रणाली को समय के आधार पर ग्रीन (ताज़ा), ऑरेंज (समय बीत रहा है) और रेड (विलंबित) रंगों में वर्गीकृत किया जाता है। शेफ एक टैप से ऑर्डर की तैयारी पूरी होने की घोषणा कर सकते हैं।",
      img: "/dashboard_kds.png",
      icon: ChefHat,
      highlights: ["रंग-कोडित समय ट्रैकर्स", "डिश तैयारी की स्थिति अद्यतन", "वेटर को ऑटो-सिग्नल पिंग", "कागज रहित रसोई कतार"]
    },
    {
      name: "ग्राहक डाइनिंग क्यूआर पोर्टल",
      tag: "डिजिटल गेस्ट अनुभव",
      desc: "डाइनिंग टेबल पर ग्राहकों के लिए क्यूआर-आधारित स्वयं-ऑर्डरिंग और मेनू ब्राउज़िंग ब्राउज़र। इसमें सुंदर रंग थीम (Onyx Dark, Emerald Clean, Ruby Royal, Amber Light) का समर्थन है। ग्राहक अपने फोन से सीधे वेटर को कॉल कर सकते हैं, ऑर्डर की स्थिति देख सकते हैं, और भुगतान निपटाने के बाद बिल देख सकते हैं।",
      img: "/customer_dining.png",
      icon: HeartHandshake,
      highlights: ["क्यूआर-आधारित स्वयं ऑर्डर करना", "आकर्षक बहुभाषी मेनू थीम", "बिल और रसीद पूर्वावलोकन", "स्वचालित गूगल समीक्षा प्रेषण"]
    }
  ] : [
    {
      name: "Cashier POS Billing Console",
      tag: "Billing & Settlements",
      desc: "The nerve center of billing operations for cashier managers. Features instant splitting for Cash & Online payments, dynamic base64 UPI QR code generation, custom receipt footer configuration, and live thermal preview matching the printed slip. Offers post-settlement options to send reviews to Google or share bills over WhatsApp.",
      img: "/dashboard_pos.png",
      icon: Terminal,
      highlights: ["GST Compliance and Taxes", "Split Cash/Online Payments", "Live Thermal Bill Preview", "Instant WhatsApp Shares"]
    },
    {
      name: "Waiter Dispatch Terminal",
      tag: "Staff & Floor Operations",
      desc: "A mobile-responsive, dark-themed interface crafted for waiters and floor staff. Supports instant table-side order intake, real-time sync with kitchen queues, visual waiter call banners, and status updates. Equipped with quick staff PIN login verified with a 10-digit phone profile.",
      img: "/dashboard_waiter.png",
      icon: Smartphone,
      highlights: ["Secure Staff PIN Logins", "Seating floorplan sync", "Real-time Waiter Calls", "Instant KOT dispatch"]
    },
    {
      name: "Kitchen Display System (KDS)",
      tag: "Kitchen Production & Queues",
      desc: "A live, reactive touch-screen display grid that replaces paper KOT slips for chefs in the kitchen. Orders are automatically color-coded by preparation duration (Green for fresh, Orange for pending, and Red for delayed) to ensure high-priority speed, course management, and meal dispatch.",
      img: "/dashboard_kds.png",
      icon: ChefHat,
      highlights: ["Color-coded delay alerts", "Prep time indicators", "Auto-ping waiter on ready", "Zero paper order clutter"]
    },
    {
      name: "Guest Dining QR Portal",
      tag: "Digital Guest Experience",
      desc: "A browser-based self-dining menu powered by table-specific QR codes. Supports stunning branded skins (Onyx Dark, Emerald Clean, Ruby Royal, Amber Light) tailored by the restaurant admin. Allows guests to place orders, trigger waiter assistance, view historical checks, and receive review prompts upon checkout.",
      img: "/customer_dining.png",
      icon: HeartHandshake,
      highlights: ["Contactless QR Ordering", "Multi-lingual Menu Skins", "Historical bill previews", "Automated Google reviews"]
    }
  ];

  return (
    <div className="tableos-landing min-h-screen flex flex-col justify-between bg-[#080808] text-[#F5F0EB] relative">
      <div className="noise-overlay"></div>
      
      {/* Background elements */}
      <div className="absolute top-0 left-0 right-0 h-[600px] bg-gradient-to-b from-[rgba(212,146,10,0.06)] to-transparent pointer-events-none z-0"></div>
      <div className="absolute top-1/3 right-1/4 w-[450px] h-[450px] rounded-full bg-[rgba(212,146,10,0.03)] blur-[120px] pointer-events-none"></div>
      <div className="bg-grid-pattern opacity-25 absolute inset-0 z-0 pointer-events-none"></div>
      
      <Nav />
      <FloatingWhatsApp />

      <main className="flex-grow pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto w-full z-10 relative space-y-28">
        
        {/* HEADER */}
        <section className="max-w-4xl mx-auto text-left space-y-6">
          <span className="text-[11px] font-mono tracking-[0.25em] text-[var(--color-amber)] uppercase block">
            {isHindi ? "सिस्टम इंटरफेस गैलरी" : "System Interface Gallery"}
          </span>
          <h1 className="text-4xl md:text-6xl font-serif text-[#F5F0EB] leading-[1.15] tracking-tight">
            {isHindi ? "लाइव काम के दौरान वास्तविक समय प्रणालियां।" : "Visualizing Multi-OS Platform in active operations."}
          </h1>
          <p className="text-[rgba(245,240,235,0.7)] text-lg md:text-xl font-light leading-relaxed max-w-3xl">
            {isHindi
              ? "Multi-OS Platform स्मार्ट पीओएस (Smart POS) और बिलिंग मशीन सॉफ्टवेयर के साथ रेस्तरां ऑर्डर मैनेजमेंट सिस्टम को लाइव देखें। हमारे व्यापक रेस्तरां एनालिटिक्स डैशबोर्ड के साथ संचालन और राजस्व पर नज़र रखें।"
              : "Explore the actual interfaces customized for each role in your restaurant team. Designed for high speed, reliability, and real-time synchronization."
            }
          </p>
        </section>

        <hr className="border-white/5 max-w-5xl mx-auto" />

        {/* 1. INTERACTIVE VIDEO WALKTHROUGH SIMULATOR */}
        <section className="max-w-5xl mx-auto space-y-12">
          {/* Section Header */}
          <div className="space-y-4 text-center">
            <span className="text-[10px] font-mono text-[var(--color-amber)] tracking-[0.25em] uppercase">
              {isHindi ? "इंटरैक्टिव वॉकथ्रू" : "Interactive Walkthrough"}
            </span>
            <h2 className="text-3xl md:text-5xl font-serif text-white">
              {isHindi ? "लाइव सिस्टम वॉकथ्रू प्लेयर" : "Live System Walkthrough Player"}
            </h2>
            <p className="text-sm text-slate-400 font-light max-w-2xl mx-auto">
              {isHindi
                ? "हमारे वास्तविक समय इंटरफेस को लाइव देखें। स्वचालित उत्पाद निर्देशित यात्रा शुरू करने के लिए प्ले पर क्लिक करें।"
                : "Experience our suite of restaurant dashboards in action. Select a chapter to skip to a feature or click Play for the full guided tour."}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Left Side: Video Player */}
            <div className="lg:col-span-8 flex flex-col justify-between glass-card-dark rounded-2xl border border-white/10 bg-black/40 overflow-hidden relative shadow-2xl">
              
              {/* Fake Browser Chrome Frame Header */}
              <div className="browser-header border-b border-white/5 bg-zinc-950 px-4 py-3 flex items-center justify-between">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
                </div>
                <div className="text-[11px] font-mono text-slate-400 bg-black/60 px-6 py-0.5 rounded-full max-w-md truncate">
                  https://multi-os-platform.com/walkthrough/tour?frame={currentFrame + 1}&view={viewMode}
                </div>
                {/* Mode Selector */}
                <div className="flex items-center gap-1.5 bg-black/40 border border-white/10 p-0.5 rounded-lg">
                  <button
                    onClick={() => setViewMode('phone')}
                    className={`px-2 py-0.5 rounded text-[9px] font-mono transition-all ${viewMode === 'phone' ? 'bg-[var(--color-amber)] text-black font-semibold' : 'text-slate-400 hover:text-white'}`}
                  >
                    PHONE
                  </button>
                  <button
                    onClick={() => setViewMode('desktop')}
                    className={`px-2 py-0.5 rounded text-[9px] font-mono transition-all ${viewMode === 'desktop' ? 'bg-[var(--color-amber)] text-black font-semibold' : 'text-slate-400 hover:text-white'}`}
                  >
                    DESKTOP
                  </button>
                </div>
              </div>

              {/* Player Screens Canvas */}
              <div className="relative bg-[#090909] aspect-[16/10] overflow-hidden group select-none flex items-center justify-center p-6">
                
                {viewMode === 'desktop' ? (
                  /* Desktop View with Simulated Camera Zoom/Pan Video Effect */
                  <div className="w-full h-full relative overflow-hidden rounded-xl border border-white/10 bg-[#F8F9FD] flex items-center justify-center p-4">
                    <img
                      src={videoFrames[currentFrame].imgDesktop}
                      alt={isHindi ? videoFrames[currentFrame].titleHi : videoFrames[currentFrame].titleEn}
                      className={`max-w-full max-h-full object-contain transition-transform duration-[4000ms] ease-in-out ${
                        isPlaying ? 'scale-[1.05] translate-y-1' : 'scale-100 translate-y-0'
                      }`}
                    />
                    {/* Simulated Cursor for active click simulation */}
                    {isPlaying && (
                      <div className="absolute w-4 h-4 rounded-full bg-white/20 border border-white/60 pointer-events-none shadow-2xl flex items-center justify-center animate-cursorMove" style={{ left: '60%', top: '45%', zIndex: 30 }}>
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-amber)] animate-ping"></div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Phone App View with Simulated Handheld Scroll Video Effect */
                  <div className="relative border-[8px] border-zinc-800 rounded-[2rem] overflow-hidden aspect-[9/16] max-h-[92%] w-auto bg-black shadow-2xl border-glow-amber">
                    <div className="absolute top-0 inset-x-0 h-3 bg-zinc-800 flex justify-center items-center z-20">
                      <div className="w-12 h-0.5 rounded-full bg-zinc-700"></div>
                    </div>
                    <div className="w-full h-full pt-8 pb-4 overflow-hidden bg-[#F8F9FD] relative flex items-center justify-center">
                      <img
                        src={videoFrames[currentFrame].imgPhone}
                        alt={`${videoFrames[currentFrame].titleEn} phone`}
                        className={`max-w-full max-h-full object-contain transition-all duration-[4000ms] ease-in-out ${
                          isPlaying ? 'scale-[1.03]' : 'scale-100'
                        }`}
                      />
                      {/* Mobile Finger-tap simulation */}
                      {isPlaying && (
                        <div className="absolute w-6 h-6 rounded-full bg-white/30 border border-white pointer-events-none shadow-2xl flex items-center justify-center animate-tapSimulation" style={{ left: '50%', top: '70%', zIndex: 30 }}>
                          <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-amber)] animate-ping"></div>
                        </div>
                      )}
                    </div>
                    <div className="absolute bottom-1.5 inset-x-0 h-0.5 flex justify-center items-center z-20">
                      <div className="w-16 h-0.5 rounded-full bg-zinc-600"></div>
                    </div>
                  </div>
                )}

                {/* Big Center Play Overlay (only when paused) */}
                {!isPlaying && (
                  <button 
                    onClick={() => setIsPlaying(true)}
                    className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-black/60 border border-white/20 text-white flex items-center justify-center backdrop-blur-md hover:bg-[var(--color-amber)] hover:text-black hover:scale-110 active:scale-95 transition-all duration-300 z-30 shadow-2xl"
                  >
                    <Play className="w-6 h-6 fill-current translate-x-0.5" />
                  </button>
                )}

                {/* Sound wave visualizer overlay when playing */}
                {isPlaying && (
                  <div className="absolute top-4 right-4 bg-black/70 border border-white/10 px-3 py-1.5 rounded-lg flex items-center gap-2 backdrop-blur-sm z-20">
                    <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest text-[8px]">Audio narration</span>
                    <div className="flex items-end gap-0.5 h-3">
                      <div className="w-[2px] bg-[var(--color-amber)] rounded-full wave-bar" style={{ animationDelay: '0.1s', height: '100%' }}></div>
                      <div className="w-[2px] bg-[var(--color-amber)] rounded-full wave-bar" style={{ animationDelay: '0.3s', height: '60%' }}></div>
                      <div className="w-[2px] bg-[var(--color-amber)] rounded-full wave-bar" style={{ animationDelay: '0.5s', height: '80%' }}></div>
                      <div className="w-[2px] bg-[var(--color-amber)] rounded-full wave-bar" style={{ animationDelay: '0.2s', height: '40%' }}></div>
                      <div className="w-[2px] bg-[var(--color-amber)] rounded-full wave-bar" style={{ animationDelay: '0.4s', height: '70%' }}></div>
                    </div>
                  </div>
                )}

              </div>

              {/* Cinematic Subtitles (Moved below the image) */}
              <div className="bg-zinc-950/80 border-t border-white/5 p-5 text-center relative z-25">
                <div className="text-[10px] font-mono text-[var(--color-amber)] tracking-widest uppercase mb-1">
                  {isHindi ? "आवाज स्पष्टीकरण" : "AI TOUR GUIDE"}
                </div>
                <p className="text-xs md:text-sm text-slate-300 font-light leading-relaxed max-w-2xl mx-auto">
                  {isHindi ? videoFrames[currentFrame].subtitleHi : videoFrames[currentFrame].subtitleEn}
                </p>
              </div>

              {/* Video Timeline & Controls Area */}
              <div className="bg-zinc-950 border-t border-white/5 p-4 space-y-4">
                
                {/* Timeline Progress Bar (divided into chapters) */}
                <div className="relative w-full h-1 bg-white/10 rounded-full cursor-pointer group/timeline">
                  {/* Progress Line */}
                  <div 
                    className="absolute top-0 left-0 h-full bg-[var(--color-amber)] rounded-full"
                    style={{ width: `${progress}%` }}
                  ></div>
                  
                  {/* Handle Dot */}
                  <div 
                    className="absolute -top-1 w-3 h-3 rounded-full bg-white border border-[var(--color-amber)] shadow scale-0 group-hover/timeline:scale-100 transition-transform duration-200"
                    style={{ left: `calc(${progress}% - 6px)` }}
                  ></div>
                </div>

                {/* Playback Controls Row */}
                <div className="flex items-center justify-between">
                  {/* Left: Playback buttons */}
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={handlePrev}
                      className="text-slate-400 hover:text-white transition-colors"
                      title={isHindi ? "पिछला" : "Previous"}
                    >
                      <SkipBack className="w-4 h-4 fill-current" />
                    </button>

                    <button 
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 text-white flex items-center justify-center border border-white/10 transition-colors"
                    >
                      {isPlaying ? (
                        <Pause className="w-4 h-4 fill-current" />
                      ) : (
                        <Play className="w-4 h-4 fill-current translate-x-0.5" />
                      )}
                    </button>

                    <button 
                      onClick={handleNext}
                      className="text-slate-400 hover:text-white transition-colors"
                      title={isHindi ? "अगला" : "Next"}
                    >
                      <SkipForward className="w-4 h-4 fill-current" />
                    </button>

                    {/* Mute button */}
                    <button 
                      onClick={() => setIsMuted(!isMuted)}
                      className="text-slate-400 hover:text-white transition-colors ml-2"
                    >
                      {isMuted ? (
                        <VolumeX className="w-4 h-4" />
                      ) : (
                        <Volume2 className="w-4 h-4" />
                      )}
                    </button>

                    {/* Elapsed Time */}
                    <span className="text-[10px] font-mono text-slate-400 select-none">
                      00:{(currentFrame * 5 + Math.floor(progress * 5 / 100)) < 10 ? '0' : ''}{currentFrame * 5 + Math.floor(progress * 5 / 100)} / 00:40
                    </span>
                  </div>

                  {/* Right: Speed & Fullscreen */}
                  <div className="flex items-center gap-3">
                    {/* Speed Selector */}
                    <button 
                      onClick={() => {
                        if (playbackSpeed === 1) setPlaybackSpeed(1.5);
                        else if (playbackSpeed === 1.5) setPlaybackSpeed(2);
                        else setPlaybackSpeed(1);
                      }}
                      className="text-[9px] font-mono bg-white/5 border border-white/10 text-slate-300 px-2 py-1 rounded hover:bg-white/10 active:scale-95 transition-all"
                    >
                      {playbackSpeed}x SPEED
                    </button>

                    {/* Fullscreen indicator */}
                    <button 
                      onClick={() => {
                        const playerElem = document.querySelector('.browser-chrome');
                        if (playerElem) {
                          if (document.fullscreenElement) {
                            document.exitFullscreen();
                          } else {
                            playerElem.requestFullscreen().catch(() => {});
                          }
                        }
                      }}
                      className="text-slate-400 hover:text-white transition-colors"
                    >
                      <Maximize className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            </div>

            {/* Right Side: Chapters Navigation */}
            <div className="lg:col-span-4 flex flex-col justify-between glass-card-dark rounded-2xl border border-white/10 bg-black/60 p-5 space-y-4">
              <div className="space-y-1">
                <h4 className="font-serif text-[#F5F0EB] text-base">{isHindi ? "सिस्टम अध्याय" : "Walkthrough Chapters"}</h4>
                <p className="text-[10px] font-mono text-[var(--color-amber)] uppercase tracking-wider">{isHindi ? "कुल 8 डैशबोर्ड्स" : "8 Active Dashboard Views"}</p>
              </div>

              {/* Chapters list */}
              <div className="space-y-2 overflow-y-auto max-h-[300px] lg:max-h-none pr-1">
                {videoFrames.map((frame, idx) => {
                  const isActive = idx === currentFrame;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleFrameSelect(idx)}
                      className={`w-full text-left p-3 rounded-lg border transition-all duration-300 flex items-center justify-between ${
                        isActive 
                          ? 'border-[var(--color-amber)] bg-[rgba(212,146,10,0.05)] shadow-lg shadow-amber-500/5' 
                          : 'border-white/5 bg-white/0 hover:border-white/10 hover:bg-white/5'
                      }`}
                    >
                      <div className="space-y-1 max-w-[80%]">
                        <span className="text-[9px] font-mono text-slate-500 block">
                          {isHindi ? frame.tagHi : frame.tagEn}
                        </span>
                        <h5 className={`text-xs font-serif font-medium truncate ${isActive ? 'text-[var(--color-amber)]' : 'text-slate-300'}`}>
                          {isHindi ? frame.titleHi.substring(4) : frame.titleEn.substring(4)}
                        </h5>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-slate-500">{frame.timestamp}</span>
                        {isActive && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-amber)] animate-pulse"></span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-white/5 text-center">
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">
                  {isHindi ? "ऑटोप्ले सक्रिय लूप" : "Autoplay active loop"}
                </span>
              </div>
            </div>
          </div>
          
          {/* Sound wave styles injector */}
          <style>{`
            @keyframes bounceWave {
              0%, 100% { transform: scaleY(0.3); }
              50% { transform: scaleY(1); }
            }
            .wave-bar {
              animation: bounceWave 0.8s ease-in-out infinite;
              transform-origin: bottom;
            }
          `}</style>
        </section>

        <hr className="border-white/5 max-w-5xl mx-auto" />

        {/* 2. ALTERNATING SHOWCASE SECTIONS (Dashboard images) */}
        <section className="max-w-5xl mx-auto space-y-24">
          {showcaseItems.map((item, idx) => {
            const IconComp = item.icon;
            const isEven = idx % 2 === 0;
            return (
              <div 
                key={idx} 
                className={`grid grid-cols-1 lg:grid-cols-12 gap-12 items-center ${
                  isEven ? '' : 'lg:flex-row-reverse'
                }`}
                style={{ direction: isEven ? 'ltr' : 'rtl' }}
              >
                {/* Description Column */}
                <div className="lg:col-span-5 space-y-6 text-left" style={{ direction: 'ltr' }}>
                  <div className="space-y-3">
                    <span className="text-[10px] font-mono text-[var(--color-amber)] tracking-wider border border-amber-500/20 px-2.5 py-0.5 rounded-full bg-amber-500/5 inline-block">
                      {item.tag}
                    </span>
                    <h3 className="text-2xl md:text-3xl font-serif text-[#F5F0EB] flex items-center gap-2">
                      <IconComp className="w-6 h-6 text-[var(--color-amber)] flex-shrink-0" />
                      <span>{item.name}</span>
                    </h3>
                    <p className="text-sm text-slate-400 font-light leading-relaxed">
                      {item.desc}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    {item.highlights.map((hl, hIdx) => (
                      <div key={hIdx} className="flex items-center gap-2 text-xs text-slate-300">
                        <Check className="w-4 h-4 text-[var(--color-amber)] flex-shrink-0" />
                        <span>{hl}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Graphic Column */}
                <div className="lg:col-span-7" style={{ direction: 'ltr' }}>
                  <div className="browser-chrome border-glow-amber transition-all duration-500">
                    <div className="browser-header">
                      <div className="flex gap-1.5">
                        <div className="dot-red"></div>
                        <div className="dot-yellow"></div>
                        <div className="dot-green"></div>
                      </div>
                      <div className="browser-address">
                        https://multi-os-platform.com/showcase/{idx + 1}
                      </div>
                    </div>
                    <div className="bg-[#F8F9FD] relative overflow-hidden aspect-[16/10] flex items-center justify-center p-4">
                      <img
                        src={item.img}
                        alt={item.name}
                        className="max-w-full max-h-full object-contain select-none shadow-md rounded border border-slate-200/50 transform hover:scale-[1.02] transition-transform duration-700"
                        loading="lazy"
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        <hr className="border-white/5 max-w-5xl mx-auto" />

        {/* 3. WEBSOCKETS REAL-TIME SYNC DIAGRAM WORKFLOW */}
        <section className="max-w-5xl mx-auto space-y-12">
          <div className="space-y-4 text-center">
            <span className="text-[10px] font-mono text-[var(--color-amber)] tracking-[0.2em] uppercase">
              {isHindi ? "तात्कालिक सिंक्रनाइज़ेशन" : "Instant Synchronization"}
            </span>
            <h2 className="text-3xl font-serif text-white">
              {isHindi ? "वेबसॉकेट्स द्वारा संचालित रीयल-टाइम ऑर्डर फ्लो" : "WebSocket powered real-time sync engine"}
            </h2>
            <p className="text-sm text-slate-400 font-light max-w-2xl mx-auto">
              {isHindi
                ? "हमारे वास्तविक समय संचार नेटवर्क के साथ त्रुटियों को समाप्त करें और रसोई की गति बढ़ाएं।"
                : "Watch how orders, seating statuses, and print requests synchronize across cashier POS, waiter tablets, and kitchen monitors instantly."
              }
            </p>
          </div>

          {/* Workflow Steps layout */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative pt-4">
            
            {/* Step 1 */}
            <div className="glass-card-dark p-6 rounded-2xl border border-white/5 bg-black/40 space-y-3 relative text-left">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-lg bg-[var(--color-amber)]/10 text-[var(--color-amber)] flex items-center justify-center">
                  <Smartphone className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono text-slate-500">STEP 01</span>
              </div>
              <h4 className="font-serif text-[#F5F0EB] text-base">{isHindi ? "अतिथि क्यूआर आर्डर" : "Guest QR Cart"}</h4>
              <p className="text-xs text-slate-400 font-light leading-relaxed">
                {isHindi ? "टेबल क्यूआर से ग्राहक आर्डर कार्ट भेजते है।" : "Guest scans table QR code and submits the meal cart directly."}
              </p>
            </div>

            {/* Step 2 */}
            <div className="glass-card-dark p-6 rounded-2xl border border-white/5 bg-black/40 space-y-3 relative text-left">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <Smartphone className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono text-slate-500">STEP 02</span>
              </div>
              <h4 className="font-serif text-[#F5F0EB] text-base">{isHindi ? "वेटर सूचना" : "Waiter Alert"}</h4>
              <p className="text-xs text-slate-400 font-light leading-relaxed">
                {isHindi ? "वेटर टर्मिनल पर लाइव आर्डर अलर्ट और बीप बजती है।" : "Waiter tablet receives the new order and triggers an audio alert."}
              </p>
            </div>

            {/* Step 3 */}
            <div className="glass-card-dark p-6 rounded-2xl border border-white/5 bg-black/40 space-y-3 relative text-left">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center">
                  <ChefHat className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono text-slate-500">STEP 03</span>
              </div>
              <h4 className="font-serif text-[#F5F0EB] text-base">{isHindi ? "केडीएस डिस्प्ले" : "KDS Screen"}</h4>
              <p className="text-xs text-slate-400 font-light leading-relaxed">
                {isHindi ? "रसोई में कार्ड रंग बदलता है और शेफ तैयारी शुरू करते हैं।" : "Kitchen screen shows KOT ticket with preparation time timers."}
              </p>
            </div>

            {/* Step 4 */}
            <div className="glass-card-dark p-6 rounded-2xl border border-white/5 bg-black/40 space-y-3 relative text-left">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                  <Terminal className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono text-slate-500">STEP 04</span>
              </div>
              <h4 className="font-serif text-[#F5F0EB] text-base">{isHindi ? "पीओएस निपटान" : "POS Settlement"}</h4>
              <p className="text-xs text-slate-400 font-light leading-relaxed">
                {isHindi ? "कैशियर कंसोल पर बिल सिंक होता है और रसीद प्रिंट होती है।" : "Cashier POS reflects settled totals. Receipt is dispatched."}
              </p>
            </div>
            
          </div>
        </section>

        {/* CTA Card */}
        <section className="max-w-5xl mx-auto pt-6">
          <div className="relative rounded-3xl p-8 md:p-14 overflow-hidden border border-white/10 bg-gradient-to-br from-zinc-900/60 to-black/80 text-center space-y-6">
            <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-[var(--color-amber)]/5 blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-amber-500/5 blur-3xl pointer-events-none"></div>
            
            <span className="text-[10px] font-mono text-[var(--color-amber)] tracking-[0.25em] uppercase">
              {isHindi ? "स्मार्ट स्वचालन" : "Powering Modern Restaurants"}
            </span>
            <h2 className="text-3xl md:text-5xl font-serif text-white max-w-2xl mx-auto leading-tight">
              {isHindi ? "अपने डाइनिंग ऑपरेशन्स को आधुनिक बनाएं" : "Experience Multi-OS Platform in your own outlet"}
            </h2>
            <p className="text-sm text-slate-400 font-light max-w-xl mx-auto leading-relaxed">
              {isHindi
                ? "हमारे वास्तविक समय क्लाउड आर्किटेक्चर के साथ अपने भोजनालय की दक्षता और सेवा की गति को अनुकूलित करें।"
                : "Schedule a live demo to see how we sync operations in real-time, helping you serve customers faster and reduce errors."
              }
            </p>
            <div className="pt-4">
              <a
                href="/contact"
                className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--color-amber)] text-black rounded-xl font-mono text-xs tracking-wider uppercase font-bold hover:bg-amber-400 transition-all duration-300 shadow-xl shadow-amber-500/10 hover:shadow-amber-500/20"
              >
                <span>{isHindi ? "डेमो निर्धारित करें" : "Book a Live Demo"}</span>
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
