'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { loginWithEmail } from './api-client';
import type { UserProfile, UserRole } from './types';

type AuthContextType = {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  isLoading: boolean;
  favorites: string[];
  loginAsStudent: (email: string) => Promise<void>;
  loginAsDemo: (role: UserRole) => void;
  continueAsGuest: () => void;
  logout: () => void;
  toggleFavorite: (pensionId: string) => void;
  isFavorite: (pensionId: string) => boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

const DEMO_USERS: Record<UserRole, UserProfile> = {
  STUDENT: {
    id: 'usr-student-1',
    email: 'camilavalenzuela@uchile.cl',
    firstName: 'Camila',
    lastName: 'Valenzuela',
    role: 'STUDENT',
    universityName: 'Universidad de Chile',
    isForeignStudent: true,
    avatarUrl:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  },
  LANDLORD: {
    id: 'usr-landlord-1',
    email: 'contacto@residenciaschile.cl',
    firstName: 'Rodrigo',
    lastName: 'Fuentes',
    role: 'LANDLORD',
    phone: '+56 9 8765 4321',
    avatarUrl:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  },
  ADMIN: {
    id: 'usr-admin-1',
    email: 'admin@buscatunido.cl',
    firstName: 'Administrador',
    lastName: 'Sistema',
    role: 'ADMIN',
    avatarUrl:
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
  },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>(['pen-1', 'pen-2']);
  const [isGuest, setIsGuest] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('tunido_user');
      const savedToken = localStorage.getItem('tunido_token');
      const savedFavs = localStorage.getItem('tunido_favs');
      const savedGuest = sessionStorage.getItem('tunido_guest');
      if (savedUser && savedToken) {
        setUser(JSON.parse(savedUser));
        setToken(savedToken);
      }
      if (savedFavs) {
        setFavorites(JSON.parse(savedFavs));
      }
      if (savedGuest === 'true') {
        setIsGuest(true);
      }
    } catch {
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginAsStudent = async (email: string) => {
    const res = await loginWithEmail(email);
    setUser(res.user);
    setToken(res.token);
    setIsGuest(false);
    try {
      localStorage.setItem('tunido_user', JSON.stringify(res.user));
      localStorage.setItem('tunido_token', res.token);
      sessionStorage.removeItem('tunido_guest');
    } catch {}
  };

  const loginAsDemo = (role: UserRole) => {
    const demo = DEMO_USERS[role];
    setUser(demo);
    setToken(`demo-token-${role.toLowerCase()}`);
    setIsGuest(false);
    try {
      localStorage.setItem('tunido_user', JSON.stringify(demo));
      localStorage.setItem('tunido_token', `demo-token-${role.toLowerCase()}`);
      sessionStorage.removeItem('tunido_guest');
    } catch {}
  };

  const continueAsGuest = () => {
    setIsGuest(true);
    try {
      sessionStorage.setItem('tunido_guest', 'true');
    } catch {}
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setIsGuest(false);
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
        isGuest,
        isLoading,
        favorites,
        loginAsStudent,
        loginAsDemo,
        continueAsGuest,
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
