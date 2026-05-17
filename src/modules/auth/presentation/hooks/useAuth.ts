import { useState } from 'react';
import { createAuthRepository } from '../../infrastructure/repositories/authRepository';
import { createLoginUseCase } from '../../application/useCases/loginUseCase';
import { createFetchApiClient } from '../../../../core/infrastructure/api/fetchApiClient';
import type { AuthResponse, LoginCredentials } from '../../domain/entities/AuthTypes';

// Singleton instances to be reused
const apiClient = createFetchApiClient(import.meta.env.VITE_PUBLIC_API_URL || '' );
const authRepository = createAuthRepository(apiClient);
const loginUseCase = createLoginUseCase(authRepository);

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await loginUseCase.execute(credentials);
      return response;
    } catch (err: any) {
      const errorMessage = err.message || 'فشل تسجيل الدخول. يرجى التحقق من بياناتك.';
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
