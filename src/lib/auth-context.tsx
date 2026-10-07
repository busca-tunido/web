'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { authService } from '@/services/auth.service';
import { favoritesService } from '@/services/favorites.service';
import { isApiSuccess } from './api-response';
import type { UserProfile } from './types';

type AuthContextType = {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  favorites: string[];
  login: (email: string, password: string) => Promise<void>;
  setSession: (profile: UserProfile, token: string) => void;
  logout: () => void;
  toggleFavorite: (pensionId: string) => void;
  isFavorite: (pensionId: string) => boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const setSession = useCallback((profile: UserProfile, sessionToken: string) => {
    setUser(profile);
    setToken(sessionToken);
    try {
      localStorage.setItem('tunido_user', JSON.stringify(profile));
      localStorage.setItem('tunido_token', sessionToken);
      sessionStorage.removeItem('tunido_guest');
    } catch {}
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        const savedUser = localStorage.getItem('tunido_user');
        const savedToken = localStorage.getItem('tunido_token');
        const savedFavs = localStorage.getItem('tunido_favs');

        if (savedFavs) {
          const parsed = JSON.parse(savedFavs);
          if (Array.isArray(parsed)) {
            const cleaned = parsed.filter(
              (id: unknown) => typeof id === 'string' && !id.startsWith('pen-'),
            );
            if (isMounted) setFavorites(cleaned);
            localStorage.setItem('tunido_favs', JSON.stringify(cleaned));
          }
        }

        if (savedUser && savedToken) {
          const parsed = JSON.parse(savedUser);
          if (isMounted) {
            setUser(parsed);
            setToken(savedToken);
            setIsLoading(false);
          }
          return;
        }

        const meRes = await authService.getCurrentUserProfile();
        if (isMounted && isApiSuccess(meRes) && meRes.data?.id) {
          const raw = meRes.data as unknown as Record<string, unknown>;
          const userProfile: UserProfile = {
            id: String(raw.id),
            email: String(raw.email),
            firstName: String(raw.firstName ?? ''),
            lastName: String(raw.lastName ?? ''),
            role: (raw.role as UserProfile['role']) ?? 'STUDENT',
          };
          const resolvedToken = (raw.token as string) ?? savedToken ?? '';
          setSession(userProfile, resolvedToken);
        }
      } catch {
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void initAuth();

    return () => {
      isMounted = false;
    };
  }, [setSession]);

  useEffect(() => {
    const handleFavsUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<string[]>;
      if (Array.isArray(customEvent.detail)) {
        setFavorites(customEvent.detail);
      }
    };
    window.addEventListener('tunido_favs_updated', handleFavsUpdate);
    return () => {
      window.removeEventListener('tunido_favs_updated', handleFavsUpdate);
    };
  }, []);

  useEffect(() => {
    if (!token) {
      setFavorites([]);
      return;
    }
    favoritesService
      .fetchStudentFavorites()
      .then((res) => {
        if (isApiSuccess(res) && Array.isArray(res.data)) {
          const ids = res.data.map((p) => p.id);
          setFavorites(ids);
          try {
            localStorage.setItem('tunido_favs', JSON.stringify(ids));
            window.dispatchEvent(new CustomEvent('tunido_favs_updated', { detail: ids }));
          } catch {}
        }
      })
      .catch(() => {});
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await authService.loginWithCredentials({ email, password });
    if (!isApiSuccess(res)) {
      throw new Error(res.message);
    }
    const raw = res.data as unknown as Record<string, unknown>;
    const nested =
      raw && typeof raw === 'object' && 'data' in raw && raw.data
        ? (raw.data as Record<string, unknown>)
        : raw;
    const user = (nested?.user ?? raw?.user) as UserProfile | undefined;
    const token =
      (nested?.token as string) ??
      (nested?.accessToken as string) ??
      (raw?.token as string) ??
      (raw?.accessToken as string) ??
      '';

    if (!user?.id) {
      throw new Error('No se pudo obtener el perfil del usuario');
    }

    const profile: UserProfile = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    };
    setSession(profile, token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setFavorites([]);
    try {
      authService.logoutSession();
      localStorage.removeItem('tunido_favs');
      window.dispatchEvent(new CustomEvent('tunido_favs_updated', { detail: [] }));
    } catch {}
  };

  const toggleFavorite = (pensionId: string) => {
    const wasFav = favorites.includes(pensionId);
    const next = wasFav ? favorites.filter((id) => id !== pensionId) : [...favorites, pensionId];
    setFavorites(next);
    try {
      localStorage.setItem('tunido_favs', JSON.stringify(next));
      window.dispatchEvent(new CustomEvent('tunido_favs_updated', { detail: next }));
    } catch {}
    if (token) {
      favoritesService.toggleFavorite(pensionId, wasFav).catch(() => {});
    }
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
        setSession,
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
