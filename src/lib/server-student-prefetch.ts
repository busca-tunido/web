import { headers } from 'next/headers';
import type { InitialPrefetchData } from '@/components/shells/role-router';
import { env } from '@/env';
import { type ApiPensionPayload, mapRawPensionToPensionItem } from '@/lib/api-client';
import { getCityImageUrl, getUniversityImageUrl } from '@/lib/location-images';
import { extractServerGeoLocation } from '@/lib/server-geo';
import type { CityInfo, PensionItem, UniversityInfo } from '@/lib/types';

function getApiBaseUrl(): string {
  return env.API_INTERNAL_URL.replace(/\/+$/, '');
}

type InitialPensionsFetchResult = {
  items: PensionItem[];
  total?: number;
};

export async function fetchInitialPensions(
  baseUrl: string,
  options?: { city?: string; limit?: number },
): Promise<InitialPensionsFetchResult> {
  try {
    const limit = options?.limit ?? 12;
    const cityQuery = options?.city ? `&city=${encodeURIComponent(options.city)}` : '';
    const res = await fetch(
      `${baseUrl}/pensions?limit=${limit}&page=1&sortBy=relevance${cityQuery}`,
      {
        next: { revalidate: 60 },
        signal: AbortSignal.timeout(4000),
      },
    );
    if (!res.ok) {
      return { items: [] };
    }
    const json = (await res.json()) as {
      data?:
        | {
            items?: ApiPensionPayload[];
            total?: number;
          }
        | ApiPensionPayload[];
      items?: ApiPensionPayload[];
      total?: number;
    };
    let rawItems: ApiPensionPayload[] = [];
    let total: number | undefined;
    if (json.data) {
      if (Array.isArray(json.data)) {
        rawItems = json.data;
      } else if (Array.isArray(json.data.items)) {
        rawItems = json.data.items;
        total = typeof json.data.total === 'number' ? json.data.total : undefined;
      }
    } else if (Array.isArray(json.items)) {
      rawItems = json.items;
      total = typeof json.total === 'number' ? json.total : undefined;
    }
    return {
      items: rawItems.map(mapRawPensionToPensionItem),
      total,
    };
  } catch {
    return { items: [] };
  }
}

export async function fetchInitialCities(baseUrl: string): Promise<CityInfo[]> {
  try {
    const res = await fetch(`${baseUrl}/universities`, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) {
      return [];
    }
    const json = (await res.json()) as {
      data?: Array<{
        city?: string;
        latitude?: number | string;
        longitude?: number | string;
      }>;
    };
    const rawList = Array.isArray(json.data)
      ? json.data
      : Array.isArray(json)
        ? (json as Array<{
            city?: string;
            latitude?: number | string;
            longitude?: number | string;
          }>)
        : [];
    const cityMap = new Map<string, { lat: number; lng: number; count: number }>();
    for (const u of rawList) {
      if (u.city && typeof u.city === 'string' && u.city.trim().length > 0) {
        const cityName = u.city.trim();
        const existing = cityMap.get(cityName) ?? {
          lat: Number(u.latitude) || 0,
          lng: Number(u.longitude) || 0,
          count: 0,
        };
        existing.count += 1;
        cityMap.set(cityName, existing);
      }
    }
    return Array.from(cityMap.entries()).map(([cityName, data]) => ({
      id: cityName.toLowerCase().replace(/\s+/g, '-'),
      name: cityName,
      region: 'Chile',
      pensionsCount: 0,
      imageUrl: getCityImageUrl(cityName),
      latitude: data.lat,
      longitude: data.lng,
    }));
  } catch {
    return [];
  }
}

export async function fetchInitialUniversities(baseUrl: string): Promise<UniversityInfo[]> {
  try {
    const res = await fetch(`${baseUrl}/universities`, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) {
      return [];
    }
    const json = (await res.json()) as {
      data?: Array<{
        id?: string;
        name?: string;
        shortName?: string;
        acronym?: string;
        city?: string;
        latitude?: number | string;
        longitude?: number | string;
        logoUrl?: string;
        campusImageUrl?: string;
        imageUrl?: string;
        domains?: string[];
        emailDomains?: string[];
        _count?: { nearbyPensions?: number };
      }>;
    };
    const rawList = Array.isArray(json.data)
      ? json.data
      : Array.isArray(json)
        ? (json as Array<{
            id?: string;
            name?: string;
            shortName?: string;
            acronym?: string;
            city?: string;
            latitude?: number | string;
            longitude?: number | string;
            logoUrl?: string;
            campusImageUrl?: string;
            imageUrl?: string;
            domains?: string[];
            emailDomains?: string[];
            _count?: { nearbyPensions?: number };
          }>)
        : [];

    return rawList.map((u) => {
      const name = String(u.name ?? '');
      const shortName = u.shortName || u.acronym;
      const acronym = shortName ? String(shortName) : name.slice(0, 4).toUpperCase();
      const rawImage =
        typeof u.imageUrl === 'string' && u.imageUrl.trim().length > 0
          ? u.imageUrl
          : typeof u.campusImageUrl === 'string' && u.campusImageUrl.trim().length > 0
            ? u.campusImageUrl
            : undefined;

      return {
        id: String(u.id ?? ''),
        name,
        acronym,
        city: String(u.city ?? ''),
        domains: Array.isArray(u.emailDomains)
          ? u.emailDomains
          : Array.isArray(u.domains)
            ? u.domains
            : [],
        pensionsNearbyCount: u._count?.nearbyPensions ?? 0,
        logoUrl: typeof u.logoUrl === 'string' ? u.logoUrl : undefined,
        imageUrl: rawImage ?? getUniversityImageUrl(name, acronym),
        latitude: Number(u.latitude) || 0,
        longitude: Number(u.longitude) || 0,
      };
    });
  } catch {
    return [];
  }
}

export async function getStudentInitialData(options?: {
  city?: string;
}): Promise<InitialPrefetchData> {
  const baseUrl = getApiBaseUrl();
  const [requestHeaders, initialPensionsResult, initialCitiesResult, initialUniversitiesResult] =
    await Promise.all([
      headers(),
      fetchInitialPensions(baseUrl, options),
      fetchInitialCities(baseUrl),
      fetchInitialUniversities(baseUrl),
    ]);

  const serverGeo = extractServerGeoLocation(requestHeaders);

  return {
    pensions: initialPensionsResult.items,
    totalPensions: initialPensionsResult.total,
    cities: initialCitiesResult,
    universities: initialUniversitiesResult,
    serverGeo,
  };
}
