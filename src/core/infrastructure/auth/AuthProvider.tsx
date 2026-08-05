import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getUserFromToken, getAuthUser, setAuthUser, removeAuthUser, isTokenValid, removeToken, setToken } from './authStorage';
import { getUserApi } from '../../registry/user/userRegistry';

interface AuthContextType {
  isAuthenticated: boolean;
  user: any | null;
  loading: boolean;
  login: (token: string, userData?: any) => void;
  logout: () => void;
  hasPermission: (permission?: string | string[]) => boolean;
  hasRole: (roles?: string | string[]) => boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(() => {
    const valid = isTokenValid();
    setIsAuthenticated(valid);
    if (valid) {
      setUser(getAuthUser() || getUserFromToken());
    } else {
      setUser(null);
      removeAuthUser();
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, [checkAuth]);

  useEffect(() => {
    if (!isAuthenticated) return;

    let cancelled = false;
    const api = getUserApi();

    if (!api?.getCurrentUser) {
      setLoading(false);
      return;
    }

    api.getCurrentUser()
      .then(res => {
        if (cancelled) return;
        if (res?.data) {
          setUser(res.data);
          setAuthUser(res.data);
        }
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        removeToken();
        removeAuthUser();
        setIsAuthenticated(false);
        setUser(null);
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [isAuthenticated]);

  const login = (token: string, userData?: any) => {
    setToken(token);
    setIsAuthenticated(true);
    const user = userData || getUserFromToken();
    setUser(user);
    if (userData) setAuthUser(userData);
  };

  const logout = () => {
    removeToken();
    removeAuthUser();
    setIsAuthenticated(false);
    setUser(null);
  };

  const hasPermission = (permission?: string | string[]): boolean => {
    if (!permission) return true;
    if (!isAuthenticated) return false;
    if (Array.isArray(permission)) {
      return permission.some(p => user?.permissions?.includes(p) ?? false);
    }
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

