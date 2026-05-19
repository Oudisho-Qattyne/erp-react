import { getModules } from "../../../moduleRegistry"

export type LocaleValue = string | LocaleDictionary
export interface LocaleDictionary {
  [key: string]: LocaleValue
}
export type ModuleTranslations = Record<string, Record<string, LocaleDictionary>>

export const mergeLocales = (): ModuleTranslations => {
  const modules = getModules()
  const result: ModuleTranslations = {}

  for (const module of modules) {
    const moduleName = module.name
    result[moduleName] = {}
    for (const [locale, dict] of Object.entries(module.locales)) {
      result[moduleName][locale] = dict
    }
  }

  // Ensure a 'shared' module exists for common translations (optional)
  if (!result['shared']) {
    result['shared'] = { en: {}, ar: {} }
  }

  return result
}