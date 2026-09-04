'use client';

import { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark' | 'system';

type ThemeContextType = {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('tunido_theme') as Theme | null;
      const initial =
        saved === 'light' || saved === 'dark' || saved === 'system' ? saved : 'system';
      setThemeState(initial);

      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const computeResolved = (t: Theme): 'light' | 'dark' => {
        if (t === 'system') return mediaQuery.matches ? 'dark' : 'light';
        return t;
      };

      const resolved = computeResolved(initial);
      setResolvedTheme(resolved);
      applyThemeClass(resolved);

      const handleChange = (e: MediaQueryListEvent) => {
        const currentSaved = localStorage.getItem('tunido_theme') as Theme | null;
        if (!currentSaved || currentSaved === 'system') {
          const newResolved = e.matches ? 'dark' : 'light';
          setResolvedTheme(newResolved);
          applyThemeClass(newResolved);
        }
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } catch {
      applyThemeClass('dark');
    }
  }, []);

  const applyThemeClass = (resolved: 'light' | 'dark') => {
    const root = document.documentElement;
    if (resolved === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const resolved = newTheme === 'system' ? (mediaQuery.matches ? 'dark' : 'light') : newTheme;
    setResolvedTheme(resolved);
    applyThemeClass(resolved);
    try {
      if (newTheme === 'system') {
        localStorage.removeItem('tunido_theme');
      } else {
        localStorage.setItem('tunido_theme', newTheme);
      }
    } catch {
      // Ignore
    }
  };

  const toggleTheme = () => {
    const next = resolvedTheme === 'dark' ? 'light' : 'dark';
    setTheme(next);
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
