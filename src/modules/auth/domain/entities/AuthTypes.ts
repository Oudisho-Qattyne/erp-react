export interface AuthRole {
  id: number;
  name: string;
  display_name: string;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  mobile: string;
  status: string;
  photo: string | null;
  signature: string | null;
  role: AuthRole;
  created_at: string;
  permissions: string[];
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  status: string;
  plan: any;
  data: {
    user: AuthUser;
    token: string;
  };
}
