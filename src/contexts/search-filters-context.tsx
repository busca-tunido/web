'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
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
  const [filters, setFilters] = useState<SearchFilters>(() => {
    if (initialFilters) {
      return initialFilters;
    }
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const uni = params.get('uni');
      const city = params.get('city');
      return {
        query: uni || '',
        city: city || undefined,
      };
    }
    return DEFAULT_FILTERS;
  });

  const initialCity = initialFilters?.city;
  const initialQuery = initialFilters?.query;

  useEffect(() => {
    if (initialCity !== undefined || initialQuery !== undefined) {
      setFilters((prev) => {
        if (prev.city === initialCity && prev.query === (initialQuery ?? '')) {
          return prev;
        }
        return {
          ...prev,
          city: initialCity,
          query: initialQuery ?? prev.query,
        };
      });
    }
  }, [initialCity, initialQuery]);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const clearCity = useCallback(() => {
    setFilters((prev) => ({ ...prev, city: undefined }));
  }, []);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.hasPrivateBathroom) count += 1;
    if (filters.includesMeals) count += 1;
    if (filters.maxPriceClp) count += 1;
    if (filters.city) count += 1;
    if (filters.genderPreference && filters.genderPreference !== 'ALL') count += 1;
    if (filters.roomType) count += 1;
    return count;
  }, [filters]);

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
