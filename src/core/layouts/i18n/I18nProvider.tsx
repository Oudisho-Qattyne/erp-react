import React, { createContext, useContext, useState, useEffect } from 'react'
import { mergeLocales, type LocaleDictionary } from './mergeLocales'

type I18nContextType = {
  locale: string
  setLocale: (locale: string) => void
  t: (key: string) => string
  dictionary: LocaleDictionary
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

export const I18nProvider = ({ children }: { children: React.ReactNode }) => {
  const [locale, setLocale] = useState(() => {
    return localStorage.getItem('locale') || 'en'
  })
  const [dictionary, setDictionary] = useState<LocaleDictionary>(() => {
    const all = mergeLocales()
    return all[locale] || all['en'] || {}
  })

  useEffect(() => {
    const all = mergeLocales()
    const newDict = all[locale] || all['en'] || {}
    setDictionary(newDict)
    localStorage.setItem('locale', locale)
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = locale
  }, [locale])

  const t = (key: string): string => {
    return dictionary[key] || key
  }

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, dictionary }}>
      {children}
    </I18nContext.Provider>
  )
}

export const useTranslation = (ns?: string) => {
  const context = useContext(I18nContext)
  if (!context) throw new Error('useTranslation must be used within I18nProvider')
  
  const { t: originalT, locale, setLocale } = context
  
  const t = (key: string, options?: { ns?: string }) => {
    const namespace = options?.ns || ns
    const fullKey = namespace ? `${namespace}.${key}` : key
    return originalT(fullKey)
  }
  
  return { t, locale, setLocale }
}