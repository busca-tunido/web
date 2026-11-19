import { cookies } from 'next/headers';
import { env } from '@/env';
import { type LandlordInitialData, normalizeAmenitiesCatalog } from '@/lib/landlord-prefetch';
import type { PensionAmenityCatalogItemDto, PensionItem } from '@/lib/types';

function getApiBaseUrl(): string {
  return env.API_INTERNAL_URL.replace(/\/+$/, '');
}

async function fetchMinePensionsServer(
  baseUrl: string,
  token: string,
): Promise<PensionItem[] | undefined> {
  try {
    const res = await fetch(`${baseUrl}/pensions/mine`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(4000),
    });

    if (!res.ok) {
      return undefined;
    }

    const json = (await res.json().catch(() => null)) as
      | { data?: PensionItem[] }
      | PensionItem[]
      | null;

    if (!json) {
      return undefined;
    }

    if (Array.isArray(json)) {
      return json;
    }

    if (Array.isArray(json.data)) {
      return json.data;
    }

    return undefined;
  } catch {
    return undefined;
  }
}

async function fetchAmenitiesCatalogServer(
  baseUrl: string,
): Promise<PensionAmenityCatalogItemDto[] | undefined> {
  try {
    const res = await fetch(`${baseUrl}/pensions/amenities`, {
      method: 'GET',
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(4000),
    });

    if (!res.ok) {
      return undefined;
    }

    const json = (await res.json().catch(() => null)) as
      | { data?: PensionAmenityCatalogItemDto[] }
      | PensionAmenityCatalogItemDto[]
      | null;

    if (!json) {
      return undefined;
    }

    const raw = Array.isArray(json) ? json : Array.isArray(json.data) ? json.data : null;
    if (!raw) {
      return undefined;
    }

    return normalizeAmenitiesCatalog(raw);
  } catch {
    return undefined;
  }
}

export async function getLandlordInitialData(): Promise<LandlordInitialData> {
  const cookieStore = await cookies();
  const token = cookieStore.get('tunido_token')?.value;
  const role = cookieStore.get('tunido_role')?.value?.toUpperCase();
  const canFetchMine = Boolean(token && (role === 'LANDLORD' || role === 'ADMIN'));
  const baseUrl = getApiBaseUrl();

  const [pensions, amenities] = await Promise.all([
    canFetchMine && token ? fetchMinePensionsServer(baseUrl, token) : Promise.resolve(undefined),
    fetchAmenitiesCatalogServer(baseUrl),
  ]);

  return {
    pensions,
    amenities,
  };
}
