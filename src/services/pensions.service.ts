import { apiFetch } from '@/lib/api-client-base';
import { type ApiResponse, createSuccess, isApiSuccess } from '@/lib/api-response';
import type { operations } from '@/lib/api-schema';
import type {
  CreatePensionDto,
  PaginatedPensionsResponse,
  PensionDetailDto,
  PensionItemDto,
  ReviewItemDto,
  RoomDto,
  UpdatePensionDto,
} from '@/types/api-contracts';
import { mapRoomDto } from './rooms.service';

export type PensionFilterParams = Omit<
  NonNullable<operations['PensionsController_findAll']['parameters']['query']>,
  'genderPreference'
> & {
  genderPreference?: 'ANY' | 'FEMALE_ONLY' | 'MALE_ONLY' | 'MIXED';
  minLat?: number;
  maxLat?: number;
  minLng?: number;
  maxLng?: number;
  roomType?: 'SINGLE' | 'SHARED';
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
  const userName =
    typeof raw.userName === 'string'
      ? raw.userName
      : user.firstName
        ? `${user.firstName} ${user.lastName ?? ''}`.trim()
        : undefined;

  return {
    id: String(raw.id ?? ''),
    pensionId: String(raw.pensionId ?? ''),
    userId: String(raw.userId ?? user.id ?? ''),
    userName,
    rating: Number(raw.rating ?? 5),
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
    images: Array.isArray(raw.images) ? (raw.images as string[]) : undefined,
    helpfulCount: Number(raw.helpfulCount ?? 0),
    userVoted: typeof raw.userVoted === 'boolean' ? raw.userVoted : undefined,
    createdAt: String(raw.createdAt ?? new Date().toISOString()),
  };
}

export function mapPensionItemDto(raw: Record<string, unknown>): PensionItemDto {
  const rawImages = Array.isArray(raw.images) ? raw.images : [];
  const images = rawImages.map((img, index) => {
    if (typeof img === 'string') {
      return {
        id: `img-${index}`,
        url: img,
        order: index,
        isMain: index === 0,
      };
    }
    const imgObj = img as Record<string, unknown>;
    return {
      id: String(imgObj.id ?? `img-${index}`),
      url: String(imgObj.url ?? ''),
      order: Number(imgObj.order ?? imgObj.sortOrder ?? index),
      isMain: Boolean(imgObj.isMain ?? imgObj.isFeatured ?? index === 0),
    };
  });

  const rawRooms = Array.isArray(raw.rooms) ? raw.rooms : [];
  const rooms: RoomDto[] = rawRooms.map((r) => mapRoomDto(r as Record<string, unknown>));

  const rawReviews = Array.isArray(raw.reviews) ? raw.reviews : [];
  const reviews: ReviewItemDto[] = rawReviews.map((rev) =>
    mapReviewItemDto(rev as Record<string, unknown>),
  );

  return {
    id: String(raw.id ?? ''),
    slug: typeof raw.slug === 'string' ? raw.slug : undefined,
    title: String(raw.title ?? ''),
    description: typeof raw.description === 'string' ? raw.description : undefined,
    address: typeof raw.address === 'string' ? raw.address : undefined,
    neighborhood: typeof raw.neighborhood === 'string' ? raw.neighborhood : undefined,
    city: String(raw.city ?? ''),
    latitude:
      raw.latitude !== undefined && raw.latitude !== null ? Number(raw.latitude) : undefined,
    longitude:
      raw.longitude !== undefined && raw.longitude !== null ? Number(raw.longitude) : undefined,
    baseMonthlyPrice:
      raw.baseMonthlyPrice !== undefined && raw.baseMonthlyPrice !== null
        ? Number(raw.baseMonthlyPrice)
        : undefined,
    currency: typeof raw.currency === 'string' ? raw.currency : undefined,
    deposit: raw.deposit !== undefined && raw.deposit !== null ? Number(raw.deposit) : null,
    waterIncluded: typeof raw.waterIncluded === 'boolean' ? raw.waterIncluded : undefined,
    electricityIncluded:
      typeof raw.electricityIncluded === 'boolean' ? raw.electricityIncluded : undefined,
    gasIncluded: typeof raw.gasIncluded === 'boolean' ? raw.gasIncluded : undefined,
    internetIncluded: typeof raw.internetIncluded === 'boolean' ? raw.internetIncluded : undefined,
    curfewTime: typeof raw.curfewTime === 'string' ? raw.curfewTime : null,
    guestsAllowed: typeof raw.guestsAllowed === 'boolean' ? raw.guestsAllowed : undefined,
    smokingAllowed: typeof raw.smokingAllowed === 'boolean' ? raw.smokingAllowed : undefined,
    petsAllowed: typeof raw.petsAllowed === 'boolean' ? raw.petsAllowed : undefined,
    genderPreference: raw.genderPreference as PensionItemDto['genderPreference'],
    quietHoursStart: typeof raw.quietHoursStart === 'string' ? raw.quietHoursStart : null,
    quietHoursEnd: typeof raw.quietHoursEnd === 'string' ? raw.quietHoursEnd : null,
    verificationStatus:
      typeof raw.verificationStatus === 'string' ? raw.verificationStatus : undefined,
    isActive: typeof raw.isActive === 'boolean' ? raw.isActive : undefined,
    images: images.length > 0 ? images : undefined,
    rooms: rooms.length > 0 ? rooms : undefined,
    reviews: reviews.length > 0 ? reviews : undefined,
    averageRating:
      raw.averageRating !== undefined && raw.averageRating !== null
        ? Number(raw.averageRating)
        : raw.ratingAverage !== undefined && raw.ratingAverage !== null
          ? Number(raw.ratingAverage)
          : undefined,
    ratingAverage:
      raw.ratingAverage !== undefined && raw.ratingAverage !== null
        ? Number(raw.ratingAverage)
        : raw.averageRating !== undefined && raw.averageRating !== null
          ? Number(raw.averageRating)
          : undefined,
    reviewsCount:
      raw.reviewsCount !== undefined && raw.reviewsCount !== null
        ? Number(raw.reviewsCount)
        : raw.ratingCount !== undefined && raw.ratingCount !== null
          ? Number(raw.ratingCount)
          : undefined,
    ratingCount:
      raw.ratingCount !== undefined && raw.ratingCount !== null
        ? Number(raw.ratingCount)
        : raw.reviewsCount !== undefined && raw.reviewsCount !== null
          ? Number(raw.reviewsCount)
          : undefined,
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

export const pensionsService = {
  fetchPaginatedPensions,
  fetchPensionDetail,
  fetchPensionById,
  fetchNearbyPensions,
  createPension,
  updatePension,
  deletePension,
};
