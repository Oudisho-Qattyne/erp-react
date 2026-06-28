// src/core/auth/AuthProvider.tsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getUserFromToken, getAuthUser, setAuthUser, removeAuthUser, isTokenValid, removeToken, setToken } from './authStorage';

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


// "permissions": [
//         "hr.employees.list",
//         "hr.employees.view",
//         "hr.employees.create",
//         "hr.employees.update",
//         "hr.employees.delete",
//         "hr.organizational-levels.list",
//         "hr.organizational-levels.view",
//         "hr.organizational-levels.create",
//         "hr.organizational-levels.update",
//         "hr.organizational-levels.delete",
//         "hr.chronic-diseases.list",
//         "hr.chronic-diseases.view",
//         "hr.chronic-diseases.create",
//         "hr.chronic-diseases.update",
//         "hr.chronic-diseases.delete",
//         "hr.leave-types.list",
//         "hr.leave-types.view",
//         "hr.leave-types.create",
//         "hr.leave-types.update",
//         "hr.leave-types.delete",
//         "hr.leave-balance.adjust",
//         "hr.leave-balance.list",
//         "hr.leave-requests.list",
//         "hr.job-statuses.list",
//         "hr.job-statuses.view",
//         "hr.job-statuses.create",
//         "hr.job-statuses.update",
//         "hr.job-statuses.delete",
//         "hr.employee-statuses.list",
//         "hr.employee-statuses.view",
//         "hr.employee-statuses.create",
//         "hr.employee-statuses.update",
//         "hr.employee-statuses.delete",
//         "storage.storage.view",
//         "storage.folder.create",
//         "storage.folder.rename",
//         "storage.folder.move",
//         "storage.folder.delete",
//         "storage.file.upload",
//         "storage.file.download",
//         "storage.file.rename",
//         "storage.file.move",
//         "storage.file.delete",
//         "users.users.view",
//         "users.users.add",
//         "users.users.edit",
//         "users.users.export",
//         "users.roles.view",
//         "users.roles.add",
//         "users.roles.edit",
//         "users.roles.delete",
//         "users.settings.change"
//       ]