import React, { createContext, useContext, useState, useEffect } from 'react';

const EnterpriseContext = createContext();

export const EnterpriseProvider = ({ children }) => {
  const [config, setConfig] = useState({
    currency: 'INR',
    language: 'en',
    theme: {
      primary: '#3b82f6', // Zen Blue
      secondary: '#10b981', // Emerald Wellness
      font: 'Inter, sans-serif'
    },
    organization: {
      name: 'Spa Harmony Group',
      logo: null
    }
  });

  // Translation Map (Simulation for Enterprise i18n)
  const translations = {
    en: {
      booking: 'Book Appointment',
      services: 'Our Treatments',
      therapist: 'Specialist',
      checkout: 'Complete Zen'
    },
    hi: {
      booking: 'अपॉइंटमेंट बुक करें',
      services: 'हमारे उपचार',
      therapist: 'विशेषज्ञ',
      checkout: 'भुगतान करें'
    }
  };

  const t = (key) => translations[config.language][key] || key;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: config.currency,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <EnterpriseContext.Provider value={{ config, setConfig, t, formatCurrency }}>
      <div style={{ '--primary-color': config.theme.primary, fontFamily: config.theme.font }}>
        {children}
      </div>
    </EnterpriseContext.Provider>
  );
};

export const useEnterprise = () => useContext(EnterpriseContext);
