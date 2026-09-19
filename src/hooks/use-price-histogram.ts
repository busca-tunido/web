'use client';

import { useCallback, useMemo } from 'react';
import { useCachedQuery } from '@/hooks/use-cached-query';
import { isApiSuccess } from '@/lib/api-response';
import type { PriceHistogramResponse } from '@/lib/types';
import { fetchPriceHistogram, type PensionFilterParams } from '@/services/pensions.service';

export const DEFAULT_PRICE_HISTOGRAM: PriceHistogramResponse = {
  minPrice: 120000,
  maxPrice: 650000,
  currency: 'CLP',
  totalListings: 42,
  bins: [
    { min: 120000, max: 138928, count: 1 },
    { min: 138928, max: 157857, count: 2 },
    { min: 157857, max: 176785, count: 3 },
    { min: 176785, max: 195714, count: 5 },
    { min: 195714, max: 214642, count: 7 },
    { min: 214642, max: 233571, count: 9 },
    { min: 233571, max: 252500, count: 12 },
    { min: 252500, max: 271428, count: 16 },
    { min: 271428, max: 290357, count: 18 },
    { min: 290357, max: 309285, count: 15 },
    { min: 309285, max: 328214, count: 13 },
    { min: 328214, max: 347142, count: 11 },
    { min: 347142, max: 366071, count: 10 },
    { min: 366071, max: 385000, count: 8 },
    { min: 385000, max: 403928, count: 7 },
    { min: 403928, max: 422857, count: 6 },
    { min: 422857, max: 441785, count: 5 },
    { min: 441785, max: 460714, count: 4 },
    { min: 460714, max: 479642, count: 3 },
    { min: 479642, max: 498571, count: 3 },
    { min: 498571, max: 517500, count: 2 },
    { min: 517500, max: 536428, count: 2 },
    { min: 536428, max: 555357, count: 1 },
    { min: 555357, max: 574285, count: 1 },
    { min: 574285, max: 593214, count: 1 },
    { min: 593214, max: 612142, count: 0 },
    { min: 612142, max: 631071, count: 1 },
    { min: 631071, max: 650000, count: 1 },
  ],
};

export type UsePriceHistogramOptions = {
  city?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  radiusKm?: number | null;
  userLocation?: { latitude: number; longitude: number } | null;
  enabled?: boolean;
  ttlMs?: number;
};

export type UsePriceHistogramResult = {
  data: PriceHistogramResponse | undefined;
  isLoading: boolean;
  isValidating: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

function getHistogramCacheKey(options?: UsePriceHistogramOptions): string {
  if (!options) {
    return 'price-histogram:default';
  }
  const { city, latitude, longitude, userLocation, radiusKm } = options;
  const lat = latitude ?? userLocation?.latitude;
  const lng = longitude ?? userLocation?.longitude;

  if (city && city.trim().length > 0) {
    return `price-histogram:city:${city.trim().toLowerCase()}`;
  }
  if (typeof lat === 'number' && typeof lng === 'number') {
    const r = radiusKm ?? 30;
    return `price-histogram:geo:${lat.toFixed(3)},${lng.toFixed(3)}:r${r}`;
  }
  return 'price-histogram:default';
}

export function usePriceHistogram(options?: UsePriceHistogramOptions): UsePriceHistogramResult {
  const enabled = options?.enabled ?? true;
  const ttlMs = options?.ttlMs ?? 5 * 60 * 1000;

  const cacheKey = useMemo(
    () => getHistogramCacheKey(options),
    [
      options?.city,
      options?.latitude,
      options?.longitude,
      options?.userLocation?.latitude,
      options?.userLocation?.longitude,
      options?.radiusKm,
      options,
    ],
  );

  const fetcher = useCallback(async (): Promise<PriceHistogramResponse> => {
    const lat = options?.latitude ?? options?.userLocation?.latitude ?? undefined;
    const lng = options?.longitude ?? options?.userLocation?.longitude ?? undefined;
    const city = options?.city ?? undefined;
    const radiusKm = options?.radiusKm ?? undefined;

    const params: PensionFilterParams = {
      ...(city ? { city } : {}),
      ...(typeof lat === 'number' ? { latitude: lat } : {}),
      ...(typeof lng === 'number' ? { longitude: lng } : {}),
      ...(typeof radiusKm === 'number' ? { radiusKm } : {}),
    };

    const response = await fetchPriceHistogram(params);
    if (!isApiSuccess(response)) {
      throw new Error(response.message || 'Error al obtener histograma de precios');
    }
    return response.data;
  }, [
    options?.city,
    options?.latitude,
    options?.longitude,
    options?.userLocation?.latitude,
    options?.userLocation?.longitude,
    options?.radiusKm,
  ]);

  const queryResult = useCachedQuery<PriceHistogramResponse>(enabled ? cacheKey : null, fetcher, {
    ttlMs,
    enabled,
  });

  return {
    data: queryResult.data ?? (queryResult.error ? DEFAULT_PRICE_HISTOGRAM : undefined),
    isLoading: queryResult.isLoading,
    isValidating: queryResult.isValidating,
    error: queryResult.error,
    refetch: queryResult.refetch,
  };
}

export default usePriceHistogram;
