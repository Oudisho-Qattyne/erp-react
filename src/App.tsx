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
import { ChatProvider } from './core/registry/chat/ChatProvider'
import { UserProvider } from './core/registry/user/UserProvider'
import { PersonProvider } from './core/registry/person/PersonProvider'
import { ProtectedRoute } from './core/infrastructure/auth/ProtectedRoute'
import { AuthProvider, useAuth } from './core/infrastructure/auth/AuthProvider'
import { Spinner } from './core/presentation/layouts/ui/state/Spinner'
import { NotFoundPage } from './core/presentation/pages/NotFoundPage'
import { UnauthorizedPage } from './core/presentation/pages/UnauthorizedPage'
import { Toaster } from 'sonner'
import { Sandbox } from './Sabdbox'

function FullPageSpinner({ text }: { text: string }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center">
        <Spinner size="xl" className="mx-auto text-primary" />
        <p className="mt-4 text-text-muted">{text}</p>
      </div>
    </div>
  );
}

function AppContent() {
  const { loading } = useAuth();

  if (loading) {
    return <FullPageSpinner text="جاري التحقق من المصادقة..." />;
  }

  const registeredRoutes = getAllRoutes();
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
    return { path: route.path, element };
  });

  routeConfigs.push({ path: '/unauthorized', element: <UnauthorizedPage /> });
  routeConfigs.push({ path: '*', element: <NotFoundPage /> });
  routeConfigs.push({ path: '/', element: <Navigate to={'/hr'} /> });
  routeConfigs.push({ path: '/my-sandbox', element: <Sandbox /> });

  const router = createBrowserRouter(routeConfigs);

  return (
    <>
      <StorageProvider>
        <HrProvider>
        <ChatProvider>
        <UserProvider>
          <PersonProvider>
          <Toaster position="bottom-center" dir="rtl" richColors />
          <RouterProvider router={router} />
          </PersonProvider>
        </UserProvider>
        </ChatProvider>
        </HrProvider>
      </StorageProvider>
    </>
  );
}

function App() {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    autoRegisterModulesSync();
    setIsReady(true);
  }, []);

  if (!isReady) {
    return <FullPageSpinner text="جاري تحميل الوحدات..." />;
  }

  return (
    <ThemeProvider>
      <SidebarProvider>
        <LanguageProvider>
          <ApiClientProvider>
            <AuthProvider>
              <AppContent />
            </AuthProvider>
          </ApiClientProvider>
        </LanguageProvider>
      </SidebarProvider>
    </ThemeProvider>
  )
}

export default App