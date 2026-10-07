'use client';

import { useCallback, useMemo } from 'react';
import { useCachedQuery } from '@/hooks/use-cached-query';
import { isApiSuccess } from '@/lib/api-response';
import type { PriceHistogramResponse } from '@/lib/types';
import { fetchPriceHistogram, type PensionFilterParams } from '@/services/pensions.service';

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
    data: queryResult.data,
    isLoading: queryResult.isLoading,
    isValidating: queryResult.isValidating,
    error: queryResult.error,
    refetch: queryResult.refetch,
  };
}

export default usePriceHistogram;
