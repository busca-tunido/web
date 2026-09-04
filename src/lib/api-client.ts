import { MOCK_CITIES, MOCK_PENSIONS, MOCK_UNIVERSITIES } from './mock-data';
import type { CityInfo, PensionItem, SearchFilters, UniversityInfo, UserProfile } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api';

export type ApiResponseEnvelope<T> = {
  success: boolean;
  statusCode: number;
  timestamp: string;
  data: T;
};

export async function fetchPensions(filters?: SearchFilters): Promise<PensionItem[]> {
  try {
    const params = new URLSearchParams();
    if (filters?.city) params.set('city', filters.city);
    if (filters?.universityId) params.set('universityId', filters.universityId);
    if (filters?.query) params.set('search', filters.query);
    if (filters?.maxPriceClp) params.set('maxPrice', String(filters.maxPriceClp));

    const res = await fetch(`${API_BASE}/pensions?${params.toString()}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 30 },
    });

    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const json = (await res.json()) as ApiResponseEnvelope<{ items: PensionItem[] }>;
    if (json?.data?.items && json.data.items.length > 0) {
      return json.data.items;
    }
  } catch {
    // Graceful fallback to mock data
  }

  let results = [...MOCK_PENSIONS];
  if (filters?.city) {
    results = results.filter((p) => p.city.toLowerCase() === filters.city?.toLowerCase());
  }
  if (filters?.query) {
    const q = filters.query.toLowerCase();
    results = results.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.neighborhood.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q) ||
        p.nearestUniversityName.toLowerCase().includes(q),
    );
  }
  if (filters?.maxPriceClp) {
    results = results.filter((p) => p.priceMonthlyClp <= (filters.maxPriceClp ?? Infinity));
  }
  if (filters?.hasPrivateBathroom) {
    results = results.filter((p) => p.rooms.some((r) => r.hasPrivateBathroom));
  }
  if (filters?.includesMeals) {
    results = results.filter((p) => p.includesMeals);
  }
  return results;
}

export async function fetchCities(): Promise<CityInfo[]> {
  return MOCK_CITIES;
}

export async function fetchUniversities(city?: string): Promise<UniversityInfo[]> {
  try {
    const url = city
      ? `${API_BASE}/universities?city=${encodeURIComponent(city)}`
      : `${API_BASE}/universities`;
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (res.ok) {
      const json = (await res.json()) as ApiResponseEnvelope<UniversityInfo[]>;
      if (json?.data && json.data.length > 0) {
        return json.data;
      }
    }
  } catch {
    // Fallback
  }

  if (city) {
    return MOCK_UNIVERSITIES.filter((u) => u.city.toLowerCase() === city.toLowerCase());
  }
  return MOCK_UNIVERSITIES;
}

export async function loginWithEmail(
  email: string,
  password = 'Password123!',
): Promise<{ user: UserProfile; token: string }> {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) {
      const json = (await res.json()) as ApiResponseEnvelope<{
        user: UserProfile;
        accessToken: string;
      }>;
      return {
        user: json.data.user,
        token: json.data.accessToken,
      };
    }
  } catch {
    // Fallback
  }

  const isStudent = email.includes('.cl') || email.includes('alu') || email.includes('est');
  return {
    user: {
      id: 'demo-user-1',
      email,
      firstName: isStudent ? 'Camila' : 'Rodrigo',
      lastName: isStudent ? 'Valenzuela' : 'Fuentes',
      role: isStudent ? 'STUDENT' : 'LANDLORD',
      universityName: isStudent ? 'Universidad de Chile' : undefined,
      isForeignStudent: true,
      avatarUrl:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    },
    token: 'mock-jwt-token-preview',
  };
}
