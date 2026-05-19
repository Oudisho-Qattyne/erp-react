import type { ReactNode } from "react"
import type { LocaleDictionary } from "./presentation/context/i18n/mergeLocales"

// ========== Navigation Types ==========
export interface NavItem {
  id: string
  label: string
  icon: ReactNode
  group: string
  href: string
  permission?: string
}

export interface NavGroup {
  id: string
  label: string
  order?: number;
  icon?: ReactNode

}

// ========== Route & Module Types ==========
export type ModuleRoute = {
  path: string
  element: ReactNode
  layout?: "default" | "dashboard" | "auth" | "none"
  label: string
  nav?: boolean
  order?: number
  moduleName: string
  icon?: ReactNode
  group?: string
  permission?: string
}

export type Module = {
  name: string
  routes: ModuleRoute[]
  locales: Record<string, LocaleDictionary>
  navGroups?: NavGroup[]
}

// ========== Registry Store ==========
let modules: Module[] = []

export const registerModule = (module: Module): void => {
  const existing = modules.find(m => m.name === module.name)
  if (!existing) {
    modules.push(module)
  }
}

export const getModules = (): Module[] => {
  return [...modules]
}

export const getAllRoutes = (): ModuleRoute[] => {
  console.log(modules);
  
  return modules.flatMap(module => module.routes)
}

// ========== Navigation Getters ==========
export const getNavGroups = (): NavGroup[] => {
  const groupsMap = new Map<string, NavGroup>()
  // First collect groups defined in modules
  for (const module of modules) {
    if (module.navGroups) {
      for (const group of module.navGroups) {
        if (!groupsMap.has(group.id)) {
          groupsMap.set(group.id, { ...group })
        }
      }
    }
  }
  // Then ensure every group used by a route has an entry (fallback)
  const usedGroupIds = new Set<string>()
  for (const route of getAllRoutes()) {
    if (route.nav && route.group) {
      usedGroupIds.add(route.group)
    }
  }
  for (const groupId of usedGroupIds) {
    if (!groupsMap.has(groupId)) {
      groupsMap.set(groupId, { id: groupId, label: groupId, order: 999 })
    }
  }
  return Array.from(groupsMap.values()).sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
}

export const getNavItems = (): NavItem[] => {
  const routes = getAllRoutes().filter(route => route.nav === true)
  return routes.map(route => ({
    id: `${route.moduleName}.${route.path}`,
    label: route.label,
    icon: route.icon ?? null,
    group: route.group ?? "default",
    href: route.path,
    permission: route.permission,
  }))
}

// ========== Auto‑discovery (Synchronous, Eager) ==========
export const autoRegisterModulesSync = (): void => {
  const modulesMap = import.meta.glob<{ default?: Module }>(
    "/src/modules/*/index.{ts,tsx}",
    { eager: true }
  )
  for (const path in modulesMap) {
    const moduleExports = modulesMap[path]
    const mod = moduleExports.default
    if (mod && typeof mod === "object" && "name" in mod && "routes" in mod && "locales" in mod) {
      registerModule(mod as Module)
    } else {
      console.warn(`Module at ${path} does not export a valid Module object as default.`)
    }
  }
}

// ========== Auto‑discovery (Asynchronous, Lazy) ==========
export const autoRegisterModules = async (): Promise<void> => {
  const modulesGlob = import.meta.glob<{ default?: Module }>(
    "/src/modules/*/index.{ts,tsx}",
    { eager: false }
  )
  for (const path in modulesGlob) {
    const loadModule = modulesGlob[path]
    const moduleExports = await loadModule()
    const mod = moduleExports.default
    if (mod && typeof mod === "object" && "name" in mod && "routes" in mod && "locales" in mod) {
      registerModule(mod as Module)
    } else {
      console.warn(`Module at ${path} does not export a valid Module object as default.`)
    }
  }
}