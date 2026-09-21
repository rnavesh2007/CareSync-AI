import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types/index.js';
import api from '../services/api.js';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  switchRole: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('caresync_token'));
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('caresync_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data);
        } catch {
          localStorage.removeItem('caresync_token');
          localStorage.removeItem('caresync_user');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: receivedToken, user: receivedUser } = res.data;
    localStorage.setItem('caresync_token', receivedToken);
    localStorage.setItem('caresync_user', JSON.stringify(receivedUser));
    setToken(receivedToken);
    setUser(receivedUser);
  };

  const logout = () => {
    localStorage.removeItem('caresync_token');
    localStorage.removeItem('caresync_user');
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  };

  const switchRole = async (role: UserRole) => {
    try {
      const res = await api.post('/auth/demo-switch', { role });
      const { token: receivedToken, user: receivedUser } = res.data;
      localStorage.setItem('caresync_token', receivedToken);
      localStorage.setItem('caresync_user', JSON.stringify(receivedUser));
      setToken(receivedToken);
      setUser(receivedUser);

      // Redirect to respective dashboard
      if (role === 'PATIENT') window.location.href = '/patient/dashboard';
      else if (role === 'DOCTOR') window.location.href = '/doctor/dashboard';
      else if (role === 'ADMIN') window.location.href = '/admin/dashboard';
    } catch (err) {
      console.error('Failed to switch demo role', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, switchRole }}>
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
