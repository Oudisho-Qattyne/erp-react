import { getModules } from "../../moduleRegistry"

export type LocaleDictionary = Record<string, string>

export const mergeLocales = (): Record<string, LocaleDictionary> => {
  const modules = getModules()
  const merged: Record<string, LocaleDictionary> = {}

  for (const module of modules) {
    for (const [locale, dict] of Object.entries(module.locales)) {
      if (!merged[locale]) merged[locale] = {}
      // Prefix keys with module name to avoid collisions
      for (const [key, value] of Object.entries(dict)) {
        merged[locale][`${module.name}.${key}`] = value
      }
    }
  }

  return merged
}