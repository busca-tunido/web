import type { PensionItemDto, UniversityDto } from '@/types/api-contracts';

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
