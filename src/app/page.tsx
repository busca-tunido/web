import { type InitialPrefetchData, RoleRouter } from '@/components/shells/role-router';
import { env } from '@/env';
import { parseSearchParams } from '@/hooks/use-url-navigation-state';
import { type ApiPensionPayload, mapRawPensionToPensionItem } from '@/lib/api-client';
import { getCityImageUrl, getUniversityImageUrl } from '@/lib/location-images';
import type { CityInfo, PensionItem, UniversityInfo } from '@/lib/types';

function getApiBaseUrl(): string {
  return env.API_INTERNAL_URL.replace(/\/+$/, '');
}

type InitialPensionsFetchResult = {
  items: PensionItem[];
  total?: number;
};

async function fetchInitialPensions(baseUrl: string): Promise<InitialPensionsFetchResult> {
  try {
    const res = await fetch(`${baseUrl}/pensions?limit=12&page=1&sortBy=relevance`, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(4000),
    });
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

async function fetchInitialCities(baseUrl: string): Promise<CityInfo[]> {
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
          lat: Number(u.latitude) || -33.4489,
          lng: Number(u.longitude) || -70.6693,
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
      foreignStudentRate: 0.12,
      pensionsCount: data.count * 10,
      averagePriceClp: 300000,
      imageUrl: getCityImageUrl(cityName),
      latitude: data.lat,
      longitude: data.lng,
    }));
  } catch {
    return [];
  }
}

async function fetchInitialUniversities(baseUrl: string): Promise<UniversityInfo[]> {
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
          }>)
        : [];

    return rawList.map((u, i) => {
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
        domains: Array.isArray(u.domains) ? u.domains : ['uchile.cl'],
        foreignStudentRate: 0.15 + (i % 5) * 0.03,
        pensionsNearbyCount: 12 + i * 2,
        logoUrl: typeof u.logoUrl === 'string' ? u.logoUrl : undefined,
        imageUrl: rawImage ?? getUniversityImageUrl(name, acronym),
        latitude: Number(u.latitude) || -33.4489,
        longitude: Number(u.longitude) || -70.6693,
      };
    });
  } catch {
    return [];
  }
}

type HomePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function HomePage(props: HomePageProps) {
  const resolvedSearchParams = props.searchParams ? await props.searchParams : {};
  const initialNavState = parseSearchParams(resolvedSearchParams, 'explore');
  const baseUrl = getApiBaseUrl();

  const [initialPensionsResult, initialCitiesResult, initialUniversitiesResult] =
    await Promise.allSettled([
      fetchInitialPensions(baseUrl),
      fetchInitialCities(baseUrl),
      fetchInitialUniversities(baseUrl),
    ]);

  const pensionsData =
    initialPensionsResult.status === 'fulfilled'
      ? initialPensionsResult.value
      : { items: [], total: undefined };

  const initialData: InitialPrefetchData = {
    pensions: pensionsData.items,
    totalPensions: pensionsData.total,
    cities: initialCitiesResult.status === 'fulfilled' ? initialCitiesResult.value : [],
    universities:
      initialUniversitiesResult.status === 'fulfilled' ? initialUniversitiesResult.value : [],
  };

  return (
    <RoleRouter
      initialData={initialData}
      initialNavigationState={initialNavState}
      initialTab={initialNavState.tab}
    />
  );
}
