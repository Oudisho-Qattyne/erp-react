import type { AuthResponse, LoginCredentials } from "../entities/AuthTypes";

export interface AuthRepository {
  login(credentials: LoginCredentials): Promise<AuthResponse>;
}
