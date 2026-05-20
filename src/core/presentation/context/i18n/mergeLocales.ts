import { getModules } from "../../../moduleRegistry"
import enShared from "../../locals/en.json"
import arShared from "../../locals/ar.json"
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

  // Add shared locale translations
  result['shared'] = {
    en: enShared,
    ar: arShared,
  }

  return result
}