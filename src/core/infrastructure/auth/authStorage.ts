export function getToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('access_token');
  }
  return null;
}

export function setToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('access_token', token);
  }
}

export function removeToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token');
  }
}

export function setAuthUser(user: any): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_user', JSON.stringify(user));
  }
}

export function getAuthUser(): any | null {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem('auth_user');
    return userStr ? JSON.parse(userStr) : null;
  }
  return null;
}

export function removeAuthUser(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_user');
  }
}



export const isTokenValid = (): boolean => {
  const token = getToken();
  if (!token) return false;
  
  // Optional: decode JWT and check expiration
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp;
    if (exp && Date.now() >= exp * 1000) {
      removeToken();
      return false;
    }
    return true;
  } catch {
    return !!token; // if not JWT, just check existence
  }
};

export const getUserFromToken = (): any | null => {
  const token = getToken();
  if (!token) return null;
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
};