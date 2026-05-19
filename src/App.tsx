// src/App.tsx
import { useEffect, useState } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { autoRegisterModules, getAllRoutes } from './core/moduleRegistry'
import LayoutSwitcher from './core/presentation/layouts/LayoutSwitcher'
import { ThemeProvider } from './core/presentation/context/theme/ThemeProvider'
import { SidebarProvider } from './core/presentation/context/SidebarContext/SidebarContext'
import { LanguageProvider } from './core/presentation/context/i18n/I18nProvider'
import { ApiClientProvider } from './core/presentation/context/api/ApiClinetProvider'


function App() {
  const [isReady, setIsReady] = useState(false)



  useEffect(() => {
    autoRegisterModules().then(() => {
      setIsReady(true)
    })
  }, [])

  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading modules...</p>
        </div>
      </div>
    )
  }

  const routes = getAllRoutes()
  const router = createBrowserRouter([
    {
      path: '*',
      element: (
        <LayoutSwitcher layout="none">
          <div />
        </LayoutSwitcher>
      ),
    },
    ...routes.map(route => ({
      path: route.path,
      element: (
        <LayoutSwitcher layout={route.layout}>
          {route.element}
        </LayoutSwitcher>
      ),
    }))
  ])

  return (

    <ThemeProvider>
      <SidebarProvider>
        <LanguageProvider>
        <ApiClientProvider> 
          <RouterProvider router={router} />
          </ApiClientProvider>
        </LanguageProvider>
      </SidebarProvider>
    </ThemeProvider>
  )
}

export default App