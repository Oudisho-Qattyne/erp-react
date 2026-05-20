
import { useContext, useState, useEffect, type ReactNode } from 'react';
import { mergeLocales, type ModuleTranslations } from './mergeLocales';
import {
  LanguageContext,
  type Language,
  type Direction,
} from './LanguageContext';

let cachedTranslations: ModuleTranslations | null = null;

const getTranslations = (): ModuleTranslations => {
  if (!cachedTranslations) {
    cachedTranslations = mergeLocales();
  }
  return cachedTranslations;
};

if (import.meta.hot) {
  import.meta.hot.accept(() => {
    cachedTranslations = null;
  });
}

function getInitialLanguage(): Language {
  if (typeof window === 'undefined') return 'ar';
  const saved = localStorage.getItem('locale');
  if (saved === 'ar' || saved === 'en') return saved;
  return 'ar';
}

function getDirection(lang: Language): Direction {
  return lang === 'ar' ? 'rtl' : 'ltr';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);
  const [direction, setDirection] = useState<Direction>(() =>
    getDirection(getInitialLanguage())
  );

  useEffect(() => {
    document.documentElement.dir = direction;
    document.documentElement.lang = language;
  }, [language, direction]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    const dir = getDirection(lang);
    setDirection(dir);
    localStorage.setItem('locale', lang);
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
  };

  const t = (key: string, moduleName: string = 'shared'): string => {
    const translations = getTranslations();
    const moduleDict = translations[moduleName]?.[language];
    if (!moduleDict) return key;
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

  return (
    <LanguageContext.Provider value={{ language, direction, setLanguage, t }}>
      <div dir={direction} className="font-sans">
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
