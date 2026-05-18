import type { ApiClient } from "../../../../core/domain/common/api/ApiClient";
import type { AuthResponse, LoginCredentials } from "../../domain/entities/AuthTypes";
import type { AuthRepository } from "../../domain/repositories/AuthRepository";

export function createAuthRepository(apiClient: ApiClient): AuthRepository {
  return {
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
      // Assuming API endpoint is /users/login as per spec
      return apiClient.post<AuthResponse, LoginCredentials>('/users/login', credentials);
    }
  };
}
