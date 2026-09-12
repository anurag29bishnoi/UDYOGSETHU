import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Company, UserRole } from '../types';
import { api } from '../api/client';

interface AuthContextType {
  user: User | null;
  company: Company | null;
  token: string | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  switchDemoRole: (roleOrEmail: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState<boolean>(true);

  const fetchProfile = async () => {
    try {
      if (!token) {
        setLoading(false);
        return;
      }
      const data = await api.get('/auth/me');
      setUser(data.user);
      setCompany(data.companies?.[0] || null);
    } catch (e) {
      console.error('Failed to load user profile, clearing token:', e);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [token]);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const data = await api.post('/auth/login', { email, password: pass });
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
      setCompany(data.company || null);
    } finally {
      setLoading(false);
    }
  };

  const register = async (formData: any) => {
    setLoading(true);
    try {
      const data = await api.post('/auth/register', formData);
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
      setCompany(data.company || null);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setCompany(null);
  };

  const switchDemoRole = async (roleOrEmail: string) => {
    setLoading(true);
    try {
      const payload = roleOrEmail.includes('@')
        ? { email: roleOrEmail }
        : { role: roleOrEmail };
      const data = await api.post('/auth/demo-switch', payload);
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
      setCompany(data.company || null);
    } catch (e) {
      console.error('Demo switch failed:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        company,
        token,
        loading,
        login,
        register,
        logout,
        switchDemoRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
