
import React, { createContext, useContext, useState, useEffect } from 'react';
import { mergeLocales, type ModuleTranslations } from './mergeLocales';

type Language = 'ar' | 'en';
type Direction = 'rtl' | 'ltr';

interface LanguageContextType {
  language: Language;
  direction: Direction;
  setLanguage: (lang: Language) => void;
  t: (key: string, moduleName?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Store the merged translations (static, computed once)
let cachedTranslations: ModuleTranslations | null = null;

const getTranslations = (): ModuleTranslations => {
  if (!cachedTranslations) {
    cachedTranslations = mergeLocales();
  }
  return cachedTranslations;
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('ar');
  const [direction, setDirection] = useState<Direction>('rtl');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedLang = localStorage.getItem('locale') as Language | null;
    if (savedLang && (savedLang === 'ar' || savedLang === 'en')) {
      setLanguage(savedLang);
    } else {
      // Default to Arabic
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ar';
    }
    setMounted(true);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    const dir = lang === 'ar' ? 'rtl' : 'ltr';
    setDirection(dir);
    localStorage.setItem('locale', lang);
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
  };

  const t = (key: string, moduleName: string = 'shared'): string => {
    const translations = getTranslations();
    const moduleDict = translations[moduleName]?.[language];
    if (!moduleDict) return key;
    // Support dot‑notation keys like "user.form.submit"
    const keys = key.split('.');
    let value: unknown = moduleDict;
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        return key;
      }
    }
    return typeof value === 'string' ? value : key;
  };

  if (!mounted) return null;

  return (
    <LanguageContext.Provider value={{ language, direction, setLanguage, t }}>
      <div dir={direction} className={direction === 'rtl' ? 'font-sans' : 'font-sans'}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}