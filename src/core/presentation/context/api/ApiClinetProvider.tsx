// src/core/infrastructure/api/ApiClientProvider.tsx
import React, { createContext, useContext, useRef, useEffect, useMemo } from 'react';
import type { ApiClient } from '../../../domain/common/api/ApiClient';
import { useLanguage } from '../i18n/I18nProvider';
import { createFetchApiClient } from '../../../infrastructure/api/fetchApiClient';

const ApiClientContext = createContext<ApiClient | undefined>(undefined);

const API_BASE_URL = import.meta.env.VITE_PUBLIC_API_URL || 'http://localhost:3000/api';

export function ApiClientProvider({ children }: { children: React.ReactNode }) {
  const { language } = useLanguage();
  const languageRef = useRef(language);

  // Keep the ref updated whenever language changes
  useEffect(() => {
    languageRef.current = language;
  }, [language]);

  // Create the client once; it depends only on the getLanguage function (stable)
  const client = useMemo(
    () => createFetchApiClient(API_BASE_URL, () => languageRef.current),
    [] // stable: getLanguage always returns current ref value
  );

  return (
    <ApiClientContext.Provider value={client}>
      {children}
    </ApiClientContext.Provider>
  );
}

export function useApiClient(): ApiClient {
  const context = useContext(ApiClientContext);
  if (!context) {
    throw new Error('useApiClient must be used within an ApiClientProvider');
  }
  return context;
}