import { createContext, useState, useEffect, useContext } from 'react';
import type { User, AuthContextType } from '../types';
import { apiClient } from '../services/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(localStorage.getItem('accessToken'));
  const [refreshToken, setRefreshToken] = useState<string | null>(localStorage.getItem('refreshToken'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedAccessToken = localStorage.getItem('accessToken');
      const storedRefreshToken = localStorage.getItem('refreshToken');
      if (storedAccessToken) {
        try {
          setAccessToken(storedAccessToken);
          if (storedRefreshToken) setRefreshToken(storedRefreshToken);
          const userData = await apiClient.getUser();
          setUser(userData);
        } catch (error) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          setAccessToken(null);
          setRefreshToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (username: string, password: string) => {
    const response = await apiClient.login(username, password) as any;
    if (response && typeof response === 'object') {
      if ('token' in response && response.token) {
        localStorage.setItem('accessToken', response.token);
        setAccessToken(response.token);
      } else if ('access' in response && response.access) {
        localStorage.setItem('accessToken', response.access);
        setAccessToken(response.access);
        if ('refresh' in response && response.refresh) {
          localStorage.setItem('refreshToken', response.refresh);
          setRefreshToken(response.refresh);
        }
      }
    }
    const userData = await apiClient.getUser();
    setUser(userData);
  };

  const register = async (username: string, email: string, password: string) => {
    const response = await apiClient.register(username, email, password);
    localStorage.setItem('accessToken', response.token);
    setAccessToken(response.token);
    setUser(response.user);
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, token: accessToken, login, register, logout, isAuthenticated: !!accessToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};