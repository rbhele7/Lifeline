import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, UserRole } from '../types';
import api from '../lib/api';

export interface RegisterData {
  full_name: string;
  email: string;
  phone?: string;
  password: string;
  role?: string;
  emergency_contact?: string;
  license_number?: string;
}

export interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  register: (data: RegisterData) => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => { throw new Error('Not implemented'); },
  logout: () => {},
  register: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('lifeline_token');
    const storedUser = localStorage.getItem('lifeline_user');
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser) as User);
      } catch {
        localStorage.removeItem('lifeline_token');
        localStorage.removeItem('lifeline_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<User> => {
    const resp = await api.post('/api/auth/login/json', {
      email,
      password,
    });
    const { access_token, user: loggedUser } = resp.data as {
      access_token: string;
      token_type: string;
      user: User;
    };

    localStorage.setItem('lifeline_token', access_token);
    localStorage.setItem('lifeline_user', JSON.stringify(loggedUser));
    setToken(access_token);
    setUser(loggedUser);
    return loggedUser;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('lifeline_token');
    localStorage.removeItem('lifeline_user');
    setToken(null);
    setUser(null);
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    await api.post('/api/auth/register', data);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
