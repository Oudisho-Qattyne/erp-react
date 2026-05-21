// src/core/auth/AuthProvider.tsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getUserFromToken, isTokenValid, removeToken, setToken } from './authStorage';

interface AuthContextType {
  isAuthenticated: boolean;
  user: any | null;
  loading: boolean;
  login: (token: string, userData?: any) => void;
  logout: () => void;
  hasPermission: (permission?: string) => boolean;
  hasRole: (roles?: string | string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(() => {
    const valid = isTokenValid();
    setIsAuthenticated(valid);
    if (valid) {
      setUser(getUserFromToken());
    } else {
      setUser(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    checkAuth();
    // Optional: listen for storage events (if token changes in another tab)
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, [checkAuth]);

  const login = (token: string, userData?: any) => {
    setToken(token);
    setIsAuthenticated(true);
    setUser(userData || getUserFromToken());
  };

  const logout = () => {
    removeToken();
    setIsAuthenticated(false);
    setUser(null);
  };

  const hasPermission = (permission?: string): boolean => {
    if (!permission) return true;
    if (!isAuthenticated) return false;
    return user?.permissions?.includes(permission) ?? false;
  };

  const hasRole = (roles?: string | string[]): boolean => {
    if (!roles) return true;
    if (!isAuthenticated) return false;
    const userRole = user?.role;
    if (!userRole) return false;
    const roleList = Array.isArray(roles) ? roles : [roles];
    return roleList.includes(userRole);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loading, login, logout, hasPermission, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};