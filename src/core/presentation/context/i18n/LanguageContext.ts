import { createContext } from 'react';

export type Language = 'ar' | 'en';
export type Direction = 'rtl' | 'ltr';

export interface LanguageContextType {
  language: Language;
  direction: Direction;
  setLanguage: (lang: Language) => void;
  t: (key: string, moduleName?: string) => string;
}

const CONTEXT_KEY = '__LanguageContext__';

function createLanguageContext() {
  return createContext<LanguageContextType | undefined>(undefined);
}

// Preserve the same context instance across Vite HMR updates
export const LanguageContext =
  (import.meta.hot?.data[CONTEXT_KEY] as ReturnType<typeof createLanguageContext>) ??
  createLanguageContext();

if (import.meta.hot) {
  import.meta.hot.data[CONTEXT_KEY] = LanguageContext;
}
