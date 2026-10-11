import { apiFetch } from '@/lib/api-client-base';
import { type ApiResponse, createSuccess, isApiSuccess } from '@/lib/api-response';
import { getCityImageUrl } from '@/lib/location-images';
import type { CityInfo } from '@/lib/types';
import { fetchUniversities as apiFetchUniversities } from '@/services/universities.service';
import type { CitySummaryDto, PensionItemDto, UniversityDto } from '@/types/api-contracts';

export type CityLocationItem = {
  city: string;
  latitude: number;
  longitude: number;
  distanceKm?: number;
};

export type CityStats = {
  city: string;
  count: number;
};

export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const earthRadiusKm = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(earthRadiusKm * c * 10) / 10;
}

export function extractUniqueCities(items: Array<{ city?: string | null }>): string[] {
  const citySet = new Set<string>();
  for (const item of items) {
    if (item.city) {
      const normalized = item.city.trim();
      if (normalized.length > 0) {
        citySet.add(normalized);
      }
    }
  }
  return Array.from(citySet).sort((a, b) => a.localeCompare(b));
}

export function extractUniqueCitiesFromPensions(pensions: PensionItemDto[]): string[] {
  return extractUniqueCities(pensions);
}

export function extractUniqueCitiesFromUniversities(universities: UniversityDto[]): string[] {
  return extractUniqueCities(universities);
}

export function extractCitiesWithCounts(items: Array<{ city?: string | null }>): CityStats[] {
  const countsMap = new Map<string, number>();
  for (const item of items) {
    if (item.city) {
      const normalized = item.city.trim();
      if (normalized.length > 0) {
        countsMap.set(normalized, (countsMap.get(normalized) ?? 0) + 1);
      }
    }
  }
  return Array.from(countsMap.entries())
    .map(([city, count]) => ({ city, count }))
    .sort((a, b) => b.count - a.count || a.city.localeCompare(b.city));
}

export function sortLocationsByDistance<
  T extends { latitude?: number | null; longitude?: number | null },
>(items: T[], userLat: number, userLng: number): Array<T & { distanceKm: number }> {
  return items
    .map((item) => {
      const lat = item.latitude;
      const lng = item.longitude;
      const distanceKm =
        typeof lat === 'number' && typeof lng === 'number'
          ? calculateHaversineDistanceKm(userLat, userLng, lat, lng)
          : Number.POSITIVE_INFINITY;
      return {
        ...item,
        distanceKm,
      };
    })
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

export function sortCitiesByCoordinates(
  cities: CityLocationItem[],
  userLat: number,
  userLng: number,
): Array<CityLocationItem & { distanceKm: number }> {
  return sortLocationsByDistance(cities, userLat, userLng);
}

export async function fetchCities(): Promise<ApiResponse<CityInfo[]>> {
  const citiesRes = await apiFetch<CitySummaryDto[]>('/cities', { method: 'GET' });
  if (isApiSuccess(citiesRes) && Array.isArray(citiesRes.data) && citiesRes.data.length > 0) {
    const cities: CityInfo[] = citiesRes.data.map((c) => ({
      id: c.id,
      name: c.name,
      region: 'Chile',
      pensionsCount: Number(c.pensionsCount ?? 0),
      imageUrl: getCityImageUrl(c.name),
      latitude: Number(c.latitude ?? 0),
      longitude: Number(c.longitude ?? 0),
    }));
    return createSuccess(cities, citiesRes.statusCode);
  }

  const uniRes = await apiFetchUniversities();
  if (isApiSuccess(uniRes) && Array.isArray(uniRes.data)) {
    const cityMap = new Map<string, { lat: number; lng: number }>();
    for (const u of uniRes.data) {
      if (u.city) {
        const existing = cityMap.get(u.city) ?? {
          lat: Number(u.latitude) || 0,
          lng: Number(u.longitude) || 0,
        };
        cityMap.set(u.city, existing);
      }
    }
    const cities: CityInfo[] = Array.from(cityMap.entries()).map(([cityName, data]) => ({
      id: cityName.toLowerCase().replace(/\s+/g, '-'),
      name: cityName,
      region: 'Chile',
      pensionsCount: 0,
      imageUrl: getCityImageUrl(cityName),
      latitude: data.lat,
      longitude: data.lng,
    }));
    return createSuccess(cities);
  }
  return createSuccess<CityInfo[]>([]);
}

async function fetchUniversities(params?: {
  city?: string;
}): Promise<ApiResponse<UniversityDto[]>> {
  return apiFetchUniversities(params);
}

export type ReverseGeocodeResponse = {
  address: string;
  neighborhood: string;
  city: string;
  displayName?: string;
  rawAddress?: Record<string, string>;
};

export type ForwardGeocodeResponse = {
  lat: number;
  lng: number;
  displayName: string;
};

export function normalizeCityName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

export function findClosestCity<T extends { lat: number; lng: number }>(
  lat: number,
  lng: number,
  candidates: readonly T[],
): T {
  let closest = candidates[0];
  let minDistance = Number.POSITIVE_INFINITY;
  for (const item of candidates) {
    const dist = calculateHaversineDistanceKm(lat, lng, item.lat, item.lng);
    if (dist < minDistance) {
      minDistance = dist;
      closest = item;
    }
  }
  return closest;
}

export async function reverseGeocode(
  lat: number,
  lng: number,
  signal?: AbortSignal,
): Promise<ReverseGeocodeResponse | null> {
  try {
    const res = await fetch(`/api/geocoding/reverse?lat=${lat}&lng=${lng}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal,
    });
    if (!res.ok) return null;
    const body = (await res.json()) as { success?: boolean; data?: ReverseGeocodeResponse };
    return body.data ?? null;
  } catch {
    return null;
  }
}

export async function forwardGeocode(
  query: string,
  signal?: AbortSignal,
): Promise<ForwardGeocodeResponse | null> {
  const trimmed = query.trim();
  if (trimmed.length < 3) return null;

  try {
    const res = await fetch(`/api/geocoding/forward?q=${encodeURIComponent(trimmed)}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal,
    });
    if (!res.ok) return null;
    const body = (await res.json()) as { success?: boolean; data?: ForwardGeocodeResponse | null };
    return body.data ?? null;
  } catch {
    return null;
  }
}

export const locationsService = {
  fetchCities,
  fetchUniversities,
  calculateHaversineDistanceKm,
  extractUniqueCities,
  extractUniqueCitiesFromPensions,
  extractUniqueCitiesFromUniversities,
  extractCitiesWithCounts,
  sortLocationsByDistance,
  sortCitiesByCoordinates,
  normalizeCityName,
  findClosestCity,
  reverseGeocode,
  forwardGeocode,
};
