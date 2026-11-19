'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { countActiveFilters } from '@/lib/filter-chips';
import type { SearchFilters } from '@/lib/types';

export type SearchFiltersContextType = {
  filters: SearchFilters;
  setFilters: React.Dispatch<React.SetStateAction<SearchFilters>>;
  resetFilters: () => void;
  activeFilterCount: number;
  clearCity: () => void;
};

export type SearchFiltersProviderProps = {
  children: React.ReactNode;
  initialFilters?: SearchFilters;
};

const DEFAULT_FILTERS: SearchFilters = {
  query: '',
};

const SearchFiltersContext = createContext<SearchFiltersContextType | null>(null);

export function SearchFiltersProvider({ children, initialFilters }: SearchFiltersProviderProps) {
  const [filters, setFilters] = useState<SearchFilters>(() => initialFilters ?? DEFAULT_FILTERS);

  useEffect(() => {
    if (initialFilters || typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const uni = params.get('uni');
    const city = params.get('city');
    if (uni || city) {
      setFilters((prev) => ({
        ...prev,
        query: uni || prev.query,
        city: city || prev.city,
      }));
    }
  }, [initialFilters]);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const clearCity = useCallback(() => {
    setFilters((prev) => ({ ...prev, city: undefined }));
  }, []);

  const activeFilterCount = useMemo(
    () => countActiveFilters(filters, { includeCity: true }),
    [filters],
  );

  const value = useMemo<SearchFiltersContextType>(
    () => ({
      filters,
      setFilters,
      resetFilters,
      activeFilterCount,
      clearCity,
    }),
    [filters, resetFilters, activeFilterCount, clearCity],
  );

  return <SearchFiltersContext.Provider value={value}>{children}</SearchFiltersContext.Provider>;
}

export function useSearchFilters(): SearchFiltersContextType {
  const context = useContext(SearchFiltersContext);
  if (!context) {
    throw new Error('useSearchFilters must be used within a SearchFiltersProvider');
  }
  return context;
}
