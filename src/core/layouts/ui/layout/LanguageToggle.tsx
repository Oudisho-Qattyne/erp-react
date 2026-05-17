'use client';

import React from 'react';
import { Languages } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';

export function LanguageToggle({ collapsed }: { collapsed?: boolean }) {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  return (
    <button
      onClick={toggleLanguage}
      className={`
        w-full flex items-center gap-3 px-3 py-2 rounded-lg
        text-white/70 hover:text-white hover:bg-white/10
        transition-all duration-300 group
        ${collapsed ? 'justify-center' : ''}
      `}
      title={language === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
    >
      <Languages
        size={20}
        className={`shrink-0 transition-transform duration-500 group-hover:rotate-12 ${language === 'en' ? 'text-gold' : ''}`}
      />
      {!collapsed && (
        <span className="text-xs font-bold tracking-wide flex-1 text-right">
          {language === 'ar' ? 'English' : 'العربية'}
        </span>
      )}
      {!collapsed && (
        <div className="flex items-center gap-1 opacity-40 text-[10px]">
          <span>{language.toUpperCase()}</span>
        </div>
      )}
    </button>
  );
}
