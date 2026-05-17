import type { ReactNode } from "react"

export type ModuleRoute = {
  path: string
  element: ReactNode
  layout?: 'default' | 'dashboard' | 'auth' | 'none'
  label: string
  nav?: boolean
  order?: number
  moduleName: string
}

export type Module = {
  name: string
  routes: ModuleRoute[]
  locales: Record<string, Record<string, string>>
}

// Registry store (plain object)
let modules: Module[] = []

export const registerModule = (module: Module): void => {
  modules.push(module)
}

export const getModules = (): Module[] => {
  return [...modules]
}

export const getAllRoutes = (): ModuleRoute[] => {
  return modules.flatMap(module => module.routes)
}

export const getNavItems = (): ModuleRoute[] => {
  return getAllRoutes()
    .filter(route => route.nav === true)
    .sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
}



// Auto‑discover modules using Vite's glob import
export const autoRegisterModules = async (): Promise<void> => {
  // This glob matches all index.ts files inside module folders
  const modulesGlob = import.meta.glob<{ default?: Module; [key: string]: unknown }>(
    '/src/modules/*/index.tsx',
    { eager: false }
  )

  for (const path in modulesGlob) {
    const loadModule = modulesGlob[path]
    const moduleExports = await loadModule()
    // Expect the module to be exported as default or as a named export 'default'
    const mod = moduleExports.default || moduleExports
    if (mod && typeof mod === 'object' && 'name' in mod && 'routes' in mod && 'locales' in mod) {
      registerModule(mod as Module)
    }
  }
}