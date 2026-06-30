// src/App.tsx
import { useEffect, useState } from 'react'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import { autoRegisterModulesSync, getAllRoutes } from './core/moduleRegistry'
import LayoutSwitcher from './core/presentation/layouts/LayoutSwitcher'
import { ThemeProvider } from './core/presentation/context/theme/ThemeProvider'
import { SidebarProvider } from './core/presentation/context/SidebarContext/SidebarContext'
import { LanguageProvider } from './core/presentation/context/i18n/I18nProvider'
import { ApiClientProvider } from './core/presentation/context/api/ApiClinetProvider'
import { StorageProvider } from './core/registry/storage/StorageProvider'
import { HrProvider } from './core/registry/hr/HrProvider'
import { ProtectedRoute } from './core/infrastructure/auth/ProtectedRoute'
import { AuthProvider } from './core/infrastructure/auth/AuthProvider'
import { Spinner } from './core/presentation/layouts/ui/state/Spinner'
import { NotFoundPage } from './core/presentation/pages/NotFoundPage'
import { UnauthorizedPage } from './core/presentation/pages/UnauthorizedPage'
import { Toaster } from 'sonner'
import { Sandbox } from './Sabdbox'

function App() {
   const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    autoRegisterModulesSync();
    setIsReady(true);
  }, []);

  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Spinner size="xl" className="mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading modules...</p>
        </div>
      </div>
    )
  }

  const registeredRoutes = getAllRoutes();

  // Build the routes array
  const routeConfigs = registeredRoutes.map(route => {
    const requiresAuth = route.requiresAuth !== false;
    const element = (
      <LayoutSwitcher layout={route.layout}>
        {requiresAuth ? (
          <ProtectedRoute
            requiredRole={route.requiredRole}
            requiredPermission={route.requiredPermission}
          >
            {route.element}
          </ProtectedRoute>
        ) : (
          route.element
        )}
      </LayoutSwitcher>
    );

    return {
      path: route.path,
      element,
    };
  });

  routeConfigs.push({
    path: '/unauthorized',
    element: <UnauthorizedPage />,
  });

  // Add catch‑all route (404) at the end
  routeConfigs.push({
    path: '*',
    element: <NotFoundPage />,
  });

  routeConfigs.push({
    path: '/',
    element: (
      // <LayoutSwitcher layout="default">
      <Navigate to={'/hr'}/>
        // <NotFoundPage />
      // </LayoutSwitcher>
    ),
  });
  routeConfigs.push({
    path: '/my-sandbox',
    element: (
      // <LayoutSwitcher layout="default">
      <Sandbox />
        // <NotFoundPage />
      // </LayoutSwitcher>
    ),
  });

  // Optional: add a redirect from root to dashboard or home
  // const hasRootRoute = registeredRoutes.some(r => r.path === '/');
  // if (!hasRootRoute) {
  //   routeConfigs.unshift({
  //     path: '/',
  //     element: <Navigate to="/hr" replace />,
  //   });
  // }

  const router = createBrowserRouter(routeConfigs);

  return (
    <ThemeProvider>
      <SidebarProvider>
        <LanguageProvider>
          <ApiClientProvider>
            <AuthProvider>
              <StorageProvider>
                <HrProvider>
                  <Toaster
                    position="bottom-center"
                    dir="rtl"
                    richColors
                  />
                  <RouterProvider router={router} />
                </HrProvider>
              </StorageProvider>
            </AuthProvider>
          </ApiClientProvider>
        </LanguageProvider>
      </SidebarProvider>
    </ThemeProvider>
  )
}
export default App