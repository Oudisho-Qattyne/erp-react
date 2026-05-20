import { useState } from 'react';
import { createAuthRepository } from '../../infrastructure/repositories/authRepository';
import { createLoginUseCase } from '../../application/useCases/loginUseCase';
import { createFetchApiClient } from '../../../../core/infrastructure/api/fetchApiClient';
import type { AuthResponse, LoginCredentials } from '../../domain/entities/AuthTypes';
import { useApiClient } from '../../../../core/presentation/context/api/ApiClinetProvider';

import { useLanguage } from '../../../../core/presentation/context/i18n/I18nProvider';

// Singleton instances to be reused


export function useAuth() {
  const { t } = useLanguage();
  const apiClient = useApiClient()
  const authRepository = createAuthRepository(apiClient);
  const loginUseCase = createLoginUseCase(authRepository);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await loginUseCase.execute(credentials);
      return response;
    } catch (err: any) {
      const errorMessage = err.message || t('login.failed_message', 'auth');
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    login,
    isLoading,
    error,
    apiClient // Exposing the apiClient in case other hooks/components need it directly
  };
}
