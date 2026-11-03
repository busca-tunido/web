'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { isApiSuccess } from '@/lib/api-response';
import type { NearbyCityCount, PensionItem, SearchFilters } from '@/lib/types';
import { fetchPaginatedPensions } from '@/services/pensions.service';

export type UseInfinitePensionsOptions = {
  filters?: SearchFilters;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  sortBy?: 'relevance' | 'distance' | 'price_asc' | 'price_desc' | 'rating';
  limit?: number;
  minLat?: number;
  maxLat?: number;
  minLng?: number;
  maxLng?: number;
};

export function useInfinitePensions(options?: UseInfinitePensionsOptions) {
  const {
    filters,
    latitude,
    longitude,
    radiusKm = 30,
    sortBy = 'relevance',
    limit = 12,
    minLat,
    maxLat,
    minLng,
    maxLng,
  } = options || {};

  const [items, setItems] = useState<PensionItem[]>([]);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState<number>(0);
  const [nearbyCityCounts, setNearbyCityCounts] = useState<NearbyCityCount[]>([]);

  const isMountedRef = useRef<boolean>(true);
  const activeRequestIdRef = useRef<number>(0);

  const city = filters?.city;
  const universityId = filters?.universityId;
  const query = filters?.query;
  const maxPriceClp = filters?.maxPriceClp;
  const hasPrivateBathroom = filters?.hasPrivateBathroom;
  const includesMeals = filters?.includesMeals;
  const genderPreference = filters?.genderPreference;

  const loadInitialPage = useCallback(async () => {
    const requestId = ++activeRequestIdRef.current;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetchPaginatedPensions({
        city,
        universityId,
        query: query ?? '',
        maxPriceClp,
        hasPrivateBathroom,
        includesMeals,
        genderPreference,
        latitude,
        longitude,
        radiusKm,
        sortBy,
        minLat,
        maxLat,
        minLng,
        maxLng,
        page: 1,
        limit,
      });

      if (!isApiSuccess(res)) {
        throw new Error(res.message);
      }

      if (requestId === activeRequestIdRef.current && isMountedRef.current) {
        setItems(res.data.items);
        setPage(1);
        setHasMore(res.data.hasMore ?? res.data.pagination?.hasMore ?? false);
        setTotal(res.data.total ?? res.data.pagination?.total ?? 0);
        setNearbyCityCounts(res.data.nearbyCityCounts ?? []);
      }
    } catch (err) {
      if (requestId === activeRequestIdRef.current && isMountedRef.current) {
        setError(err instanceof Error ? err.message : 'Error al cargar pensiones');
      }
    } finally {
      if (requestId === activeRequestIdRef.current && isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [
    city,
    universityId,
    query,
    maxPriceClp,
    hasPrivateBathroom,
    includesMeals,
    genderPreference,
    latitude,
    longitude,
    radiusKm,
    sortBy,
    limit,
    minLat,
    maxLat,
    minLng,
    maxLng,
  ]);

  useEffect(() => {
    loadInitialPage();
  }, [loadInitialPage]);

  const loadMore = useCallback(async () => {
    if (isLoading || isLoadingMore || !hasMore) return;

    const nextPage = page + 1;
    setIsLoadingMore(true);
    setError(null);

    try {
      const res = await fetchPaginatedPensions({
        city,
        universityId,
        query: query ?? '',
        maxPriceClp,
        hasPrivateBathroom,
        includesMeals,
        genderPreference,
        latitude,
        longitude,
        radiusKm,
        sortBy,
        minLat,
        maxLat,
        minLng,
        maxLng,
        page: nextPage,
        limit,
      });

      if (!isApiSuccess(res)) {
        throw new Error(res.message);
      }

      if (isMountedRef.current) {
        setItems((prev) => {
          const existingIds = new Set(prev.map((i) => i.id));
          const uniqueNew = res.data.items.filter((i) => !existingIds.has(i.id));
          return [...prev, ...uniqueNew];
        });
        setPage(nextPage);
        setHasMore(res.data.hasMore ?? res.data.pagination?.hasMore ?? false);
        setTotal(res.data.total ?? res.data.pagination?.total ?? 0);
        if (res.data.nearbyCityCounts && res.data.nearbyCityCounts.length > 0) {
          setNearbyCityCounts(res.data.nearbyCityCounts);
        }
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err instanceof Error ? err.message : 'Error al cargar más resultados');
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoadingMore(false);
      }
    }
  }, [
    city,
    universityId,
    query,
    maxPriceClp,
    hasPrivateBathroom,
    includesMeals,
    genderPreference,
    latitude,
    longitude,
    radiusKm,
    sortBy,
    limit,
    minLat,
    maxLat,
    minLng,
    maxLng,
    page,
    hasMore,
    isLoading,
    isLoadingMore,
  ]);

  const refresh = useCallback(async () => {
    await loadInitialPage();
  }, [loadInitialPage]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return {
    items,
    page,
    hasMore,
    isLoading,
    isLoadingMore,
    error,
    total,
    nearbyCityCounts,
    loadMore,
    refresh,
  };
}
