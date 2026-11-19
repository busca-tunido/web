'use client';

import { useCallback, useMemo } from 'react';
import { useCachedQuery } from '@/hooks/use-cached-query';
import { isApiSuccess } from '@/lib/api-response';
import type { PriceHistogramResponse, SearchFilters } from '@/lib/types';
import { fetchPriceHistogram, type PensionFilterParams } from '@/services/pensions.service';

export type UsePriceHistogramOptions = {
  city?: string | null;
  filters?: SearchFilters;
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
  const { city, filters, latitude, longitude, userLocation, radiusKm } = options;
  const lat = latitude ?? userLocation?.latitude;
  const lng = longitude ?? userLocation?.longitude;
  const activeCity = city ?? filters?.city;

  const filterKey = filters
    ? JSON.stringify({
        q: filters.query || undefined,
        nb: filters.neighborhood || undefined,
        uni: filters.universityId || undefined,
        rt: filters.roomType || undefined,
        bath: filters.hasPrivateBathroom || undefined,
        meals: filters.includesMeals || undefined,
        am: filters.amenities?.length ? [...filters.amenities].sort() : undefined,
        beds: filters.minBeds || undefined,
        avail: filters.onlyAvailable || undefined,
        gp:
          filters.genderPreference && filters.genderPreference !== 'ALL'
            ? filters.genderPreference
            : undefined,
        tier: filters.ratingTier || undefined,
      })
    : '';

  if (activeCity && activeCity.trim().length > 0) {
    return `price-histogram:city:${activeCity.trim().toLowerCase()}:${filterKey}`;
  }
  if (typeof lat === 'number' && typeof lng === 'number') {
    const r = radiusKm ?? 30;
    return `price-histogram:geo:${lat.toFixed(3)},${lng.toFixed(3)}:r${r}:${filterKey}`;
  }
  return `price-histogram:default:${filterKey}`;
}

export function usePriceHistogram(options?: UsePriceHistogramOptions): UsePriceHistogramResult {
  const enabled = options?.enabled ?? true;
  const ttlMs = options?.ttlMs ?? 5 * 60 * 1000;
  const f = options?.filters;
  const amenitiesKey = f?.amenities?.join(',') ?? '';

  const cacheKey = useMemo(() => getHistogramCacheKey(options), [options]);

  const fetcher = useCallback(async (): Promise<PriceHistogramResponse> => {
    const lat = options?.latitude ?? options?.userLocation?.latitude ?? undefined;
    const lng = options?.longitude ?? options?.userLocation?.longitude ?? undefined;
    const city = options?.city ?? f?.city ?? undefined;
    const radiusKm = options?.radiusKm ?? undefined;
    const parsedAmenities = amenitiesKey ? amenitiesKey.split(',') : undefined;

    const params: PensionFilterParams = {
      ...(city ? { city } : {}),
      ...(f?.neighborhood ? { neighborhood: f.neighborhood } : {}),
      ...(f?.universityId ? { universityId: f.universityId } : {}),
      ...(f?.query?.trim() ? { search: f.query.trim() } : {}),
      ...(f?.roomType ? { roomType: f.roomType } : {}),
      ...(f?.hasPrivateBathroom ? { hasPrivateBathroom: true } : {}),
      ...(f?.includesMeals ? { includesMeals: true } : {}),
      ...(parsedAmenities ? { amenities: parsedAmenities } : {}),
      ...(f?.minBeds ? { minBeds: f.minBeds } : {}),
      ...(f?.onlyAvailable ? { onlyAvailable: true } : {}),
      ...(f?.genderPreference && f.genderPreference !== 'ALL'
        ? { genderPreference: f.genderPreference }
        : {}),
      ...(f?.ratingTier ? { ratingTier: f.ratingTier } : {}),
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
    amenitiesKey,
    f?.city,
    f?.genderPreference,
    f?.hasPrivateBathroom,
    f?.includesMeals,
    f?.minBeds,
    f?.neighborhood,
    f?.onlyAvailable,
    f?.query,
    f?.ratingTier,
    f?.roomType,
    f?.universityId,
    options?.city,
    options?.latitude,
    options?.longitude,
    options?.radiusKm,
    options?.userLocation?.latitude,
    options?.userLocation?.longitude,
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
