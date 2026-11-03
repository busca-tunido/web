import { mapRawPensionToPensionItem } from '@/lib/api-client';
import { apiFetch } from '@/lib/api-client-base';
import { type ApiResponse, createSuccess, isApiSuccess } from '@/lib/api-response';
import type { components, paths } from '@/lib/api-schema';
import type { PensionItem, PriceBinItem, PriceHistogramResponse } from '@/lib/types';
import { normalizeImageUrl } from '@/lib/utils';
import type {
  CreatePensionDto,
  PaginatedPensionsResponse,
  PensionDetailDto,
  PensionItemDto,
  ReviewItemDto,
  UpdatePensionDto,
} from '@/types/api-contracts';

export type PensionFilterParams = Omit<
  NonNullable<paths['/pensions']['get']['parameters']['query']>,
  'genderPreference'
> & {
  genderPreference?: 'ANY' | 'FEMALE_ONLY' | 'MALE_ONLY' | 'MIXED';
  minLat?: number;
  maxLat?: number;
  minLng?: number;
  maxLng?: number;
  roomType?: 'SINGLE' | 'SHARED' | 'STUDIO';
  minPriceClp?: number;
  maxPriceClp?: number;
  hasPrivateBathroom?: boolean;
  includesMeals?: boolean;
  minBeds?: number;
};

type RawPensionsResponse = {
  items?: Array<Record<string, unknown>>;
  pagination?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    hasMore?: boolean;
  };
  nearbyCityCounts?: Array<{
    city: string;
    count: number;
    distanceKm?: number;
  }>;
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
  hasMore?: boolean;
};

function buildQueryString(params?: PensionFilterParams): string {
  if (!params) {
    return '';
  }
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') {
      continue;
    }
    if (key === 'genderPreference') {
      const val = value === 'MIXED' ? 'ANY' : String(value);
      searchParams.set(key, val);
      continue;
    }
    if (Array.isArray(value)) {
      if (value.length > 0) {
        searchParams.set(key, value.join(','));
      }
    } else {
      searchParams.set(key, String(value));
    }
  }
  const qs = searchParams.toString();
  return qs ? `?${qs}` : '';
}

export function mapReviewItemDto(raw: Record<string, unknown>): ReviewItemDto {
  const user = (raw.user ?? {}) as Record<string, unknown>;
  const rawCount = (raw._count as { helpfulVotes?: number } | undefined)?.helpfulVotes;
  const helpfulCount = typeof rawCount === 'number' ? rawCount : Number(raw.helpfulCount ?? 0);

  const userDto = raw.user
    ? {
        id: String(user.id ?? raw.userId ?? ''),
        firstName: String(user.firstName ?? ''),
        lastName: String(user.lastName ?? ''),
        avatarUrl: typeof user.avatarUrl === 'string' ? user.avatarUrl : null,
      }
    : undefined;

  return {
    id: String(raw.id ?? ''),
    pensionId: String(raw.pensionId ?? ''),
    userId: String(raw.userId ?? user.id ?? ''),
    rating: Number(raw.rating ?? raw.overallRating ?? 0),
    overallRating: Number(raw.overallRating ?? raw.rating ?? 0),
    cleanlinessRating:
      raw.cleanlinessRating !== undefined && raw.cleanlinessRating !== null
        ? Number(raw.cleanlinessRating)
        : undefined,
    landlordRating:
      raw.landlordRating !== undefined && raw.landlordRating !== null
        ? Number(raw.landlordRating)
        : undefined,
    locationRating:
      raw.locationRating !== undefined && raw.locationRating !== null
        ? Number(raw.locationRating)
        : undefined,
    roomType: typeof raw.roomType === 'string' ? raw.roomType : undefined,
    comment: String(raw.comment ?? ''),
    stayDuration: typeof raw.stayDuration === 'string' ? raw.stayDuration : undefined,
    images: Array.isArray(raw.images)
      ? (raw.images as string[]).map(normalizeImageUrl).filter(Boolean)
      : [],
    isVerifiedStay: Boolean(raw.isVerifiedStay ?? raw.isResidentVerified),
    isResidentVerified: Boolean(raw.isResidentVerified ?? raw.isVerifiedStay),
    isAnonymous: Boolean(raw.isAnonymous),
    helpfulCount,
    user: userDto,
    createdAt: typeof raw.createdAt === 'string' ? raw.createdAt : '',
  };
}

export function mapPensionItemDto(raw: Record<string, unknown>): PensionItemDto {
  const rawImages = Array.isArray(raw.images) ? raw.images : [];
  const images = rawImages.map((img, index) => {
    if (typeof img === 'string') {
      return {
        id: `img-${index}`,
        url: normalizeImageUrl(img),
        thumbnailUrl: normalizeImageUrl(img),
        caption: null,
        isFeatured: index === 0,
      };
    }
    const imgObj = img as Record<string, unknown>;
    const url = normalizeImageUrl(String(imgObj.url ?? ''));
    return {
      id: String(imgObj.id ?? `img-${index}`),
      url,
      thumbnailUrl: normalizeImageUrl(String(imgObj.thumbnailUrl ?? url)),
      caption: typeof imgObj.caption === 'string' ? imgObj.caption : null,
      isFeatured: Boolean(imgObj.isFeatured ?? imgObj.isMain ?? index === 0),
    };
  });

  const pensionId = String(raw.id ?? '');
  const rawRooms = Array.isArray(raw.rooms) ? raw.rooms : [];
  const rooms = rawRooms.map((r) => {
    const rObj = r as Record<string, unknown>;
    return {
      id: String(rObj.id ?? ''),
      pensionId: String(rObj.pensionId ?? pensionId),
      roomNumber: typeof rObj.roomNumber === 'string' ? rObj.roomNumber : null,
      title: String(rObj.title ?? rObj.name ?? 'Habitación'),
      type: (rObj.type as components['schemas']['RoomType']) ?? 'SINGLE',
      monthlyPrice: Number(rObj.monthlyPrice ?? 0),
      isAvailable: typeof rObj.isAvailable === 'boolean' ? rObj.isAvailable : true,
      isActive: typeof rObj.isActive === 'boolean' ? rObj.isActive : true,
      hasPrivateBathroom: Boolean(rObj.hasPrivateBathroom ?? rObj.bathType === 'PRIVATE'),
    };
  });

  const rawAmenities = Array.isArray(raw.amenities) ? raw.amenities : [];
  const amenities = rawAmenities.map((item) => {
    if (typeof item === 'string') {
      return { slug: item, name: item };
    }
    const obj = item as { slug?: string; name?: string };
    return {
      slug: String(obj.slug ?? ''),
      name: String(obj.name ?? obj.slug ?? ''),
    };
  });

  const rawNearby = Array.isArray(raw.nearbyUniversities) ? raw.nearbyUniversities : [];
  const nearbyUniversities = rawNearby.map((nu) => {
    const obj = nu as Record<string, unknown>;
    const uni = (obj.university || {}) as Record<string, unknown>;
    return {
      distanceMeters: Number(obj.distanceMeters ?? 0),
      walkingMinutes: typeof obj.walkingMinutes === 'number' ? obj.walkingMinutes : undefined,
      university: {
        id: String(uni.id ?? obj.universityId ?? ''),
        name: String(uni.name ?? ''),
        shortName: typeof uni.shortName === 'string' ? uni.shortName : null,
      },
    };
  });

  const countObj = (raw._count || {}) as Record<string, unknown>;
  const count = {
    rooms: Number(countObj.rooms ?? rooms.length),
    reviews: Number(countObj.reviews ?? raw.reviewsCount ?? 0),
  };

  return {
    id: pensionId,
    slug: String(raw.slug ?? `pension-${pensionId}`),
    title: String(raw.title ?? ''),
    description: String(raw.description ?? ''),
    address: String(raw.address ?? ''),
    neighborhood: String(raw.neighborhood ?? ''),
    city: String(raw.city ?? ''),
    latitude: Number(raw.latitude ?? 0),
    longitude: Number(raw.longitude ?? 0),
    baseMonthlyPrice: Number(raw.baseMonthlyPrice ?? 0),
    currency: String(raw.currency ?? 'CLP'),
    deposit: raw.deposit !== undefined && raw.deposit !== null ? Number(raw.deposit) : null,
    waterIncluded: Boolean(raw.waterIncluded),
    electricityIncluded: Boolean(raw.electricityIncluded),
    gasIncluded: Boolean(raw.gasIncluded),
    internetIncluded: Boolean(raw.internetIncluded),
    curfewTime: typeof raw.curfewTime === 'string' ? raw.curfewTime : null,
    guestsAllowed: Boolean(raw.guestsAllowed),
    smokingAllowed: Boolean(raw.smokingAllowed),
    petsAllowed: Boolean(raw.petsAllowed),
    genderPreference: (raw.genderPreference as components['schemas']['GenderPreference']) ?? 'ANY',
    quietHoursStart: typeof raw.quietHoursStart === 'string' ? raw.quietHoursStart : null,
    quietHoursEnd: typeof raw.quietHoursEnd === 'string' ? raw.quietHoursEnd : null,
    contactName: typeof raw.contactName === 'string' ? raw.contactName : null,
    contactPhone: typeof raw.contactPhone === 'string' ? raw.contactPhone : null,
    contactWhatsapp: typeof raw.contactWhatsapp === 'string' ? raw.contactWhatsapp : null,
    contactEmail: typeof raw.contactEmail === 'string' ? raw.contactEmail : null,
    verificationStatus:
      (raw.verificationStatus as components['schemas']['VerificationStatus']) ?? 'UNVERIFIED',
    isActive: typeof raw.isActive === 'boolean' ? raw.isActive : true,
    images,
    rooms,
    amenities,
    nearbyUniversities,
    _count: count,
    ratingAverage: Number(raw.ratingAverage ?? raw.averageRating ?? 0),
    averageRating: Number(raw.ratingAverage ?? raw.averageRating ?? 0),
    reviewsCount: Number(raw.reviewsCount ?? raw.ratingCount ?? 0),
    ratingCount: Number(raw.ratingCount ?? raw.reviewsCount ?? 0),
  };
}

export async function fetchPaginatedPensions(
  params?: PensionFilterParams,
): Promise<ApiResponse<PaginatedPensionsResponse>> {
  const query = buildQueryString(params);
  const response = await apiFetch<RawPensionsResponse>(`/pensions${query}`, {
    method: 'GET',
  });

  if (!isApiSuccess(response)) {
    return response;
  }

  const raw = response.data;
  const items = Array.isArray(raw.items) ? raw.items.map(mapPensionItemDto) : [];
  const page = raw.page ?? raw.pagination?.page ?? 1;
  const limit = raw.limit ?? raw.pagination?.limit ?? items.length;
  const total = raw.total ?? raw.pagination?.total ?? items.length;
  const totalPages =
    raw.totalPages ?? raw.pagination?.totalPages ?? (Math.ceil(total / (limit || 1)) || 1);
  const hasMore =
    typeof raw.hasMore === 'boolean' ? raw.hasMore : (raw.pagination?.hasMore ?? page < totalPages);

  const payload: PaginatedPensionsResponse = {
    items,
    total,
    page,
    limit,
    hasMore,
    nearbyCityCounts: raw.nearbyCityCounts,
  };

  return createSuccess(payload, response.statusCode);
}

export async function fetchPensionDetail(idOrSlug: string): Promise<ApiResponse<PensionDetailDto>> {
  const response = await apiFetch<Record<string, unknown>>(
    `/pensions/${encodeURIComponent(idOrSlug)}`,
    {
      method: 'GET',
    },
  );

  if (!isApiSuccess(response)) {
    return response;
  }

  return createSuccess(mapPensionItemDto(response.data), response.statusCode);
}

export async function createPension(
  payload: CreatePensionDto,
): Promise<ApiResponse<PensionDetailDto>> {
  const response = await apiFetch<Record<string, unknown>>('/pensions', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (!isApiSuccess(response)) {
    return response;
  }

  return createSuccess(mapPensionItemDto(response.data), response.statusCode);
}

export async function updatePension(
  id: string,
  payload: UpdatePensionDto,
): Promise<ApiResponse<PensionDetailDto>> {
  const response = await apiFetch<Record<string, unknown>>(`/pensions/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });

  if (!isApiSuccess(response)) {
    return response;
  }

  return createSuccess(mapPensionItemDto(response.data), response.statusCode);
}

export async function deletePension(id: string): Promise<ApiResponse<{ success: boolean }>> {
  const response = await apiFetch<{ id?: string; deleted?: boolean }>(
    `/pensions/${encodeURIComponent(id)}`,
    {
      method: 'DELETE',
    },
  );

  if (!isApiSuccess(response)) {
    return response;
  }

  return createSuccess(
    {
      success: response.data.deleted ?? true,
    },
    response.statusCode,
  );
}

export async function fetchNearbyPensions(
  latitude: number,
  longitude: number,
  radiusKm = 30,
): Promise<ApiResponse<PaginatedPensionsResponse>> {
  return fetchPaginatedPensions({
    latitude,
    longitude,
    radiusKm,
    sortBy: 'distance',
  });
}

export const fetchPensionById = fetchPensionDetail;

export async function fetchPriceHistogram(
  params?: PensionFilterParams,
): Promise<ApiResponse<PriceHistogramResponse>> {
  const query = buildQueryString(params);
  const response = await apiFetch<PriceHistogramResponse | Record<string, unknown>>(
    `/pensions/price-histogram${query}`,
    {
      method: 'GET',
    },
  );

  if (!isApiSuccess(response)) {
    return response;
  }

  const raw = response.data as Partial<PriceHistogramResponse> & Record<string, unknown>;
  const rawBins = Array.isArray(raw.bins) ? raw.bins : [];
  const bins: PriceBinItem[] = rawBins.map((b: Record<string, unknown>) => ({
    min: Number(b.min ?? 0),
    max: Number(b.max ?? 0),
    count: Number(b.count ?? 0),
  }));

  const payload: PriceHistogramResponse = {
    minPrice: raw.minPrice === null || raw.minPrice === undefined ? null : Number(raw.minPrice),
    maxPrice: raw.maxPrice === null || raw.maxPrice === undefined ? null : Number(raw.maxPrice),
    currency: String(raw.currency ?? 'CLP'),
    totalListings: Number(raw.totalListings ?? 0),
    bins,
  };

  return createSuccess(payload, response.statusCode);
}

export async function fetchMinePensions(): Promise<ApiResponse<PensionItem[]>> {
  const response = await apiFetch<unknown>('/pensions/mine', {
    method: 'GET',
  });

  if (!isApiSuccess(response)) {
    return response;
  }

  const rawData = response.data;
  let rawList: Record<string, unknown>[] = [];
  if (Array.isArray(rawData)) {
    rawList = rawData as Record<string, unknown>[];
  } else if (rawData && typeof rawData === 'object') {
    const obj = rawData as Record<string, unknown>;
    if (Array.isArray(obj.items)) {
      rawList = obj.items as Record<string, unknown>[];
    } else if (Array.isArray(obj.data)) {
      rawList = obj.data as Record<string, unknown>[];
    }
  }

  const items: PensionItem[] = rawList.map((raw) => {
    const item = mapRawPensionToPensionItem(raw);
    if (typeof raw.isActive === 'boolean') {
      item.isActive = raw.isActive;
    }
    return item;
  });

  return createSuccess(items, response.statusCode);
}

export const pensionsService = {
  fetchPaginatedPensions,
  fetchPensionDetail,
  fetchPensionById,
  fetchNearbyPensions,
  fetchPriceHistogram,
  fetchMinePensions,
  createPension,
  updatePension,
  update: updatePension,
  deletePension,
  delete: deletePension,
};
