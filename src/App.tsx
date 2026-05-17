// src/App.tsx
import { useEffect, useState } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { autoRegisterModules, getAllRoutes } from './core/moduleRegistry'
import LayoutSwitcher from './core/layouts/LayoutSwitcher'
import { ThemeProvider } from './core/layouts/theme/ThemeProvider'
import { I18nProvider } from './core/layouts/i18n/I18nProvider'

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
  const router = createBrowserRouter(
    routes.map(route => ({
      path: route.path,
      element: (
        <LayoutSwitcher layout={route.layout}>
          {route.element}
        </LayoutSwitcher>
      ),
    }))
  )

  return (
    <ThemeProvider>
      <I18nProvider>
        <RouterProvider router={router} />
      </I18nProvider>
    </ThemeProvider>
  )
}

export default App