'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '@/services/auth.service';
import { isApiSuccess } from './api-response';
import type { UserProfile } from './types';

type AuthContextType = {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  favorites: string[];
  login: (email: string, password?: string) => Promise<void>;
  logout: () => void;
  toggleFavorite: (pensionId: string) => void;
  isFavorite: (pensionId: string) => boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>(['pen-1', 'pen-2']);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('tunido_user');
      const savedToken = localStorage.getItem('tunido_token');
      const savedFavs = localStorage.getItem('tunido_favs');
      if (savedUser && savedToken) {
        setUser(JSON.parse(savedUser));
        setToken(savedToken);
      }
      if (savedFavs) {
        setFavorites(JSON.parse(savedFavs));
      }
    } catch {
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password = 'Password123!') => {
    const res = await authService.loginWithCredentials({ email, password });
    if (!isApiSuccess(res)) {
      throw new Error(res.message);
    }
    const profile: UserProfile = {
      id: res.data.user.id,
      email: res.data.user.email,
      firstName: res.data.user.firstName,
      lastName: res.data.user.lastName,
      role: res.data.user.role,
    };
    setUser(profile);
    setToken(res.data.token);
    try {
      localStorage.setItem('tunido_user', JSON.stringify(profile));
      localStorage.setItem('tunido_token', res.data.token);
      sessionStorage.removeItem('tunido_guest');
    } catch {}
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    try {
      localStorage.removeItem('tunido_user');
      localStorage.removeItem('tunido_token');
      sessionStorage.removeItem('tunido_guest');
    } catch {}
  };

  const toggleFavorite = (pensionId: string) => {
    setFavorites((prev) => {
      const next = prev.includes(pensionId)
        ? prev.filter((id) => id !== pensionId)
        : [...prev, pensionId];
      try {
        localStorage.setItem('tunido_favs', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const isFavorite = (pensionId: string) => favorites.includes(pensionId);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        favorites,
        login,
        logout,
        toggleFavorite,
        isFavorite,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
