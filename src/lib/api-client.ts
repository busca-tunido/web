import createClient from 'openapi-fetch';
import type { components, paths } from './api-schema';
import { MOCK_CITIES, MOCK_PENSIONS, MOCK_UNIVERSITIES } from './mock-data';
import type {
  CityInfo,
  NearbyCityCount,
  PaginatedPensionsResponse,
  PaginationMeta,
  PensionItem,
  PensionReview,
  RoomInfo,
  SearchFilters,
  UniversityInfo,
  UserProfile,
} from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;
if (!API_BASE) {
  throw new Error('Missing env var: NEXT_PUBLIC_API_URL must be defined in environment (.env).');
}

export const apiClient = createClient<paths>({
  baseUrl: API_BASE,
});

export * from '@/types/api-contracts';
export * from './api-client-base';
export * from './api-response';

export type ApiResponseEnvelope<T> = {
  success: boolean;
  statusCode: number;
  timestamp: string;
  data: T;
};

export type CreateProposalInput = components['schemas']['CreateProposalDto'];
export type CreateReviewInput = components['schemas']['CreateReviewDto'];

export type ApiPensionPayload = {
  id?: string;
  slug?: string;
  title?: string;
  description?: string;
  address?: string;
  neighborhood?: string;
  city?: string;
  latitude?: number | string;
  longitude?: number | string;
  baseMonthlyPrice?: number | string;
  deposit?: number | string | null;
  currency?: string;
  waterIncluded?: boolean;
  electricityIncluded?: boolean;
  gasIncluded?: boolean;
  internetIncluded?: boolean;
  curfewTime?: string | null;
  guestsAllowed?: boolean;
  smokingAllowed?: boolean;
  petsAllowed?: boolean;
  genderPreference?: 'ANY' | 'FEMALE_ONLY' | 'MALE_ONLY';
  quietHoursStart?: string | null;
  quietHoursEnd?: string | null;
  verificationStatus?: string;
  ratingAverage?: number | string;
  ratingCount?: number;
  distanceKm?: number;
  relevanceScore?: number;
  images?: Array<{ url: string; caption?: string; isFeatured?: boolean } | string>;
  amenities?: Array<{ slug: string; name?: string }>;
  nearbyUniversities?: Array<{
    distanceMeters?: number;
    walkingMinutes?: number;
    university?: {
      name?: string;
      shortName?: string;
    };
  }>;
  rooms?: Array<{
    id: string;
    title?: string;
    roomType?: 'SINGLE' | 'SHARED';
    priceMonthly?: number | string;
    hasPrivateBathroom?: boolean;
    isAvailable?: boolean;
    photos?: string[];
  }>;
  _count?: {
    reviews?: number;
    rooms?: number;
  };
};

export function mapRawPensionToPensionItem(raw: ApiPensionPayload): PensionItem {
  const images = Array.isArray(raw.images)
    ? raw.images.map((img) => (typeof img === 'string' ? img : img.url))
    : [];
  const photos =
    images.length > 0
      ? images
      : [
          'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80',
        ];

  const firstNearby = raw.nearbyUniversities?.[0];
  const nearestUniName =
    firstNearby?.university?.shortName || firstNearby?.university?.name || 'Universidad de Chile';
  const distanceMeters = firstNearby?.distanceMeters ?? 450;

  const amenitiesSlugs = new Set((raw.amenities || []).map((a) => a.slug));

  const rooms: RoomInfo[] =
    Array.isArray(raw.rooms) && raw.rooms.length > 0
      ? raw.rooms.map((r) => ({
          id: r.id,
          title: r.title ?? 'Habitación individual',
          roomType: r.roomType === 'SHARED' ? 'SHARED' : 'SINGLE',
          priceMonthlyClp: Number(r.priceMonthly) || Number(raw.baseMonthlyPrice) || 280000,
          hasPrivateBathroom: Boolean(r.hasPrivateBathroom),
          isAvailable: r.isAvailable ?? true,
          photos: Array.isArray(r.photos) && r.photos.length > 0 ? r.photos : photos,
        }))
      : [
          {
            id: `room-${raw.id}-1`,
            title: 'Habitación Individual Clásica',
            roomType: 'SINGLE',
            priceMonthlyClp: Number(raw.baseMonthlyPrice) || 280000,
            hasPrivateBathroom: true,
            isAvailable: true,
            photos,
          },
        ];

  const pensionId = String(raw.id ?? '');
  return {
    id: pensionId,
    slug: raw.slug ?? `pension-${pensionId}`,
    title: raw.title ?? 'Pensión Universitaria',
    description: raw.description ?? '',
    address: raw.address ?? '',
    neighborhood: raw.neighborhood ?? 'Centro',
    city: raw.city ?? 'Santiago',
    latitude: Number(raw.latitude) || -33.4489,
    longitude: Number(raw.longitude) || -70.6693,
    priceMonthlyClp: Number(raw.baseMonthlyPrice) || 280000,
    depositClp: Number(raw.deposit) || 0,
    ratingAverage: Number(raw.ratingAverage) || 4.5,
    reviewsCount: Number(raw.ratingCount ?? raw._count?.reviews ?? 0),
    isVerified:
      raw.verificationStatus === 'OFFICIALLY_VERIFIED' ||
      raw.verificationStatus === 'COMMUNITY_VERIFIED',
    genderPreference:
      raw.genderPreference === 'MALE_ONLY'
        ? 'MALE_ONLY'
        : raw.genderPreference === 'FEMALE_ONLY'
          ? 'FEMALE_ONLY'
          : 'MIXED',
    includesMeals: Boolean(amenitiesSlugs.has('comida-incluida')),
    includesWifi: raw.internetIncluded ?? true,
    includesLaundry: Boolean(amenitiesSlugs.has('lavanderia')),
    includesStudyRoom: Boolean(amenitiesSlugs.has('sala-estudio')),
    nearestUniversityName: nearestUniName,
    distanceToUniversityMeters: distanceMeters,
    distanceKm:
      typeof raw.distanceKm === 'number' ? Math.round(raw.distanceKm * 10) / 10 : undefined,
    relevanceScore:
      typeof raw.relevanceScore === 'number' ? Math.round(raw.relevanceScore) : undefined,
    photos,
    rooms,
    curfewDescription: raw.curfewTime ? `Toque de queda ${raw.curfewTime}` : undefined,
    visitsPolicy: raw.guestsAllowed ? 'Visitas permitidas' : 'Sin visitas',
  };
}

export const mapRawPensionToItem = mapRawPensionToPensionItem;

export type FetchPensionsParams = Partial<SearchFilters> & {
  page?: number;
  limit?: number;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  minLat?: number;
  maxLat?: number;
  minLng?: number;
  maxLng?: number;
  sortBy?: 'relevance' | 'distance' | 'price_asc' | 'price_desc' | 'rating';
};

export async function fetchPaginatedPensions(
  params?: FetchPensionsParams,
): Promise<PaginatedPensionsResponse> {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 12;

  try {
    const { response } = await apiClient.GET('/pensions', {
      params: {
        query: {
          city: params?.city,
          universityId: params?.universityId,
          search: params?.query,
          maxPrice: params?.maxPriceClp,
          latitude: params?.latitude,
          longitude: params?.longitude,
          radiusKm: params?.radiusKm,
          minLat: params?.minLat,
          maxLat: params?.maxLat,
          minLng: params?.minLng,
          maxLng: params?.maxLng,
          sortBy: params?.sortBy,
          page,
          limit,
        } as Record<string, unknown>,
      },
    });

    if (response.ok) {
      const json = (await response.json()) as ApiResponseEnvelope<{
        items: ApiPensionPayload[];
        pagination?: PaginationMeta;
        nearbyCityCounts?: NearbyCityCount[];
      }>;
      if (json?.data?.items) {
        const items = json.data.items.map(mapRawPensionToPensionItem);
        const pagination = json.data.pagination ?? {
          page,
          limit,
          total: items.length,
          totalPages: Math.ceil(items.length / limit) || 1,
          hasMore: false,
        };
        const nearbyCityCounts = json.data.nearbyCityCounts ?? [];
        return {
          items,
          pagination,
          nearbyCityCounts,
        };
      }
    }
  } catch {}

  let results = [...MOCK_PENSIONS];
  const minLat = params?.minLat;
  const maxLat = params?.maxLat;
  const minLng = params?.minLng;
  const maxLng = params?.maxLng;
  if (minLat !== undefined && maxLat !== undefined) {
    results = results.filter((p) => p.latitude >= minLat && p.latitude <= maxLat);
  }
  if (minLng !== undefined && maxLng !== undefined) {
    results = results.filter((p) => p.longitude >= minLng && p.longitude <= maxLng);
  }
  if (params?.city) {
    results = results.filter((p) => p.city.toLowerCase() === params.city?.toLowerCase());
  }
  if (params?.query) {
    const q = params.query.toLowerCase();
    results = results.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.neighborhood.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q) ||
        p.nearestUniversityName.toLowerCase().includes(q),
    );
  }
  if (params?.maxPriceClp) {
    results = results.filter((p) => p.priceMonthlyClp <= (params.maxPriceClp ?? Infinity));
  }
  if (params?.hasPrivateBathroom) {
    results = results.filter((p) => p.rooms.some((r) => r.hasPrivateBathroom));
  }
  if (params?.includesMeals) {
    results = results.filter((p) => p.includesMeals);
  }

  const total = results.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const skip = (page - 1) * limit;
  const items = results.slice(skip, skip + limit);
  const hasMore = page < totalPages;

  const cityMap = new Map<string, number>();
  for (const p of results) {
    cityMap.set(p.city, (cityMap.get(p.city) || 0) + 1);
  }
  const nearbyCityCounts: NearbyCityCount[] = Array.from(cityMap.entries()).map(
    ([city, count]) => ({
      city,
      count,
      distanceKm: 0,
    }),
  );

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasMore,
    },
    nearbyCityCounts,
  };
}

export async function fetchPensions(filters?: SearchFilters): Promise<PensionItem[]> {
  const res = await fetchPaginatedPensions({ ...filters, limit: 50 });
  return res.items;
}

export async function fetchCities(): Promise<CityInfo[]> {
  return MOCK_CITIES;
}

export async function fetchUniversities(city?: string): Promise<UniversityInfo[]> {
  try {
    const { response } = await apiClient.GET('/universities', {
      params: {
        query: city ? { city } : undefined,
      },
    });

    if (response.ok) {
      const json = (await response.json()) as ApiResponseEnvelope<
        Array<{
          id: string;
          name: string;
          shortName?: string;
          city: string;
          latitude?: number | string;
          longitude?: number | string;
          logoUrl?: string;
          campusImageUrl?: string;
          domains?: string[];
        }>
      >;
      if (json?.data && Array.isArray(json.data) && json.data.length > 0) {
        return json.data.map((u, i) => ({
          id: u.id,
          name: u.name,
          acronym: u.shortName || u.name.slice(0, 4).toUpperCase(),
          city: u.city,
          domains: u.domains || ['uchile.cl'],
          foreignStudentRate: 0.15 + (i % 5) * 0.03,
          pensionsNearbyCount: 12 + i * 2,
          logoUrl: u.logoUrl,
          imageUrl:
            u.campusImageUrl ||
            MOCK_UNIVERSITIES[i % MOCK_UNIVERSITIES.length]?.imageUrl ||
            'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80',
          latitude: Number(u.latitude) || -33.4489,
          longitude: Number(u.longitude) || -70.6693,
        }));
      }
    }
  } catch {}

  if (city) {
    return MOCK_UNIVERSITIES.filter((u) => u.city.toLowerCase() === city.toLowerCase());
  }
  return MOCK_UNIVERSITIES;
}

export async function fetchPensionReviews(pensionId: string): Promise<PensionReview[]> {
  try {
    const { response } = await apiClient.GET('/pensions/{pensionId}/reviews', {
      params: {
        path: { pensionId },
      },
    });

    if (response.ok) {
      const json = (await response.json()) as ApiResponseEnvelope<PensionReview[]>;
      if (json?.data && Array.isArray(json.data)) {
        return json.data;
      }
    }
  } catch {}
  return [];
}

export async function loginWithEmail(
  email: string,
  password = 'Password123!',
): Promise<{ user: UserProfile; token: string }> {
  try {
    const { response } = await apiClient.POST('/auth/login', {
      body: { email, password },
    });

    if (response.ok) {
      const json = (await response.json()) as ApiResponseEnvelope<{
        user: UserProfile;
        accessToken: string;
      }>;
      return {
        user: json.data.user,
        token: json.data.accessToken,
      };
    }
  } catch {}

  const isLandlord = email.includes('propietario') || email.includes('contacto');
  const isStudent = !isLandlord;
  return {
    user: {
      id: isLandlord ? 'usr-landlord-demo' : 'usr-student-demo',
      email,
      firstName: isLandlord ? 'Propietario' : 'Estudiante',
      lastName: 'Demo',
      role: isLandlord ? 'LANDLORD' : 'STUDENT',
      universityName: isStudent ? 'Universidad de Chile' : undefined,
      isForeignStudent: isStudent,
      avatarUrl: isLandlord
        ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
        : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    },
    token: isLandlord ? 'mock-jwt-token-landlord' : 'mock-jwt-token-student',
  };
}

export async function submitPensionReview(
  pensionId: string,
  review: CreateReviewInput,
  token?: string,
): Promise<PensionReview | null> {
  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const { response } = await apiClient.POST('/pensions/{pensionId}/reviews', {
    params: {
      path: { pensionId },
    },
    body: review,
    headers,
  });

  if (response.ok) {
    const json = (await response.json()) as ApiResponseEnvelope<PensionReview>;
    return json.data;
  }
  const errJson = (await response.json().catch(() => ({}))) as { message?: string };
  throw new Error(errJson.message || 'No se pudo publicar la reseña');
}

export async function submitPensionProposal(
  pensionId: string,
  proposal: CreateProposalInput,
  token?: string,
): Promise<{ id: string } | null> {
  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const { response } = await apiClient.POST('/pensions/{id}/proposals', {
    params: {
      path: { id: pensionId },
    },
    body: proposal,
    headers,
  });

  if (response.ok) {
    const json = (await response.json()) as ApiResponseEnvelope<{ id: string }>;
    return json.data;
  }
  const errJson = (await response.json().catch(() => ({}))) as { message?: string };
  throw new Error(errJson.message || 'No se pudo enviar la propuesta');
}

export async function uploadImageFile(
  file: File,
  token?: string,
): Promise<{ url: string; thumbnailUrl: string }> {
  const formData = new FormData();
  formData.append('file', file);

  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}/uploads/images`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(err.message || 'Error al subir la imagen');
  }

  const json = (await res.json()) as ApiResponseEnvelope<{
    url: string;
    thumbnailUrl: string;
    width: number;
    height: number;
    format: string;
    size: number;
  }>;

  return {
    url: json.data.url,
    thumbnailUrl: json.data.thumbnailUrl,
  };
}
