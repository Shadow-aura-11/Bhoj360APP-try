import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../../hooks/useLanguage';

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { lang, setLang, t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollTo = (id) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const menuItems = [
    { label: lang === 'en' ? 'Features' : 'विशेषताएं', path: '/features' },
    { label: lang === 'en' ? 'Showcase' : 'प्रदर्शन', path: '/showcase' },
    { label: lang === 'en' ? 'Pricing' : 'मूल्य निर्धारण', path: '/pricing' },
    { label: lang === 'en' ? 'About' : 'हमारे बारे में', path: '/about' },
    { label: lang === 'en' ? 'Contact' : 'संपर्क', path: '/contact' },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'py-4 glass-header shadow-lg' : 'py-6 bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center group cursor-pointer">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl font-serif">M</span>
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-amber-200 font-serif">
              Multi-OS
            </span>
          </div>
        </Link>

        {/* Desktop Navigation links */}
        <nav className="hidden lg:flex items-center gap-8">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="text-sm font-medium text-[rgba(245,240,235,0.7)] hover:text-[var(--color-amber)] transition-colors relative group py-2"
            >
              {item.label}
              <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[var(--color-amber)] transition-all duration-300 group-hover:w-full"></span>
            </Link>
          ))}
        </nav>

        {/* Action Button & Language Switcher */}
        <div className="hidden lg:flex items-center gap-5">
          <button
            onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
            className="text-xs font-bold text-[var(--color-amber)] border border-[var(--color-amber)] px-3 py-1.5 rounded-md hover:bg-[var(--color-amber)] hover:text-black transition-all bg-transparent"
          >
            {lang === 'en' ? 'हिन्दी (INR)' : 'English (INR)'}
          </button>
          
          <Link
            to="/contact"
            className="shimmer-btn px-5 py-2 rounded bg-[var(--color-amber)] text-black font-semibold text-sm transition-all hover:bg-[var(--color-amber-light)] active:scale-95 flex items-center gap-2"
          >
            {lang === 'en' ? 'Get Started' : 'शुरू करें'}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Mobile Menu Toggle Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5 focus:outline-none relative z-50 text-[#F5F0EB]"
          aria-label="Toggle menu"
        >
          <span className={`w-6 h-[1.5px] bg-[#F5F0EB] transition-transform duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-[7.5px]' : ''}`}></span>
          <span className={`w-6 h-[1.5px] bg-[#F5F0EB] transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
          <span className={`w-6 h-[1.5px] bg-[#F5F0EB] transition-transform duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-[7.5px]' : ''}`}></span>
        </button>
      </div>

      {/* Mobile Drawer Menu Overlay */}
      <div className={`fixed inset-0 bg-[#080808]/98 backdrop-blur-2xl z-40 flex flex-col justify-center items-center transition-all duration-500 lg:hidden ${mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="flex flex-col items-center gap-6 text-center">
          <button
            onClick={() => { setLang(lang === 'en' ? 'hi' : 'en'); setMobileMenuOpen(false); }}
            className="text-xs font-bold text-[var(--color-amber)] border border-[var(--color-amber)] px-4 py-2 rounded-full hover:bg-[var(--color-amber)] hover:text-black transition-all bg-transparent mb-4"
          >
            {lang === 'en' ? 'हिन्दी (INR)' : 'English (INR)'}
          </button>

          {menuItems.map((item, idx) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              className="text-xl font-serif text-[#F5F0EB] hover:text-[var(--color-amber)] transition-colors"
              style={{ transitionDelay: `${idx * 50}ms` }}
            >
              {item.label}
            </Link>
          ))}
          <Link
            to="/contact"
            onClick={() => setMobileMenuOpen(false)}
            className="mt-6 px-10 py-3 rounded bg-[var(--color-amber)] text-black font-semibold text-lg hover:bg-[var(--color-amber-light)] active:scale-95 transition-all shadow-md"
          >
            {lang === 'en' ? 'Get Started' : 'शुरू करें'}
          </Link>
        </div>
      </div>
    </header>
  );
}
