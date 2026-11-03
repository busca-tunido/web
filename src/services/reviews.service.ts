import { apiFetch } from '@/lib/api-client-base';
import { type ApiResponse, createSuccess, isApiSuccess } from '@/lib/api-response';
import type { components } from '@/lib/api-schema';
import type {
  CreateReviewDto,
  PaginatedReviewsResponse,
  ReviewItemDto,
  UpdateReviewDto,
  UserHelpfulVotesResponse,
} from '@/types/api-contracts';

export type PaginationQuery = {
  page?: number;
  limit?: number;
};

function mapRawReviewToItem(
  raw: components['schemas']['ReviewResponseDto'] | Record<string, unknown>,
): ReviewItemDto {
  const user = ('user' in raw && raw.user ? raw.user : undefined) as
    | {
        id?: string;
        firstName?: string;
        lastName?: string;
        avatarUrl?: string | null;
        university?: { name?: string; shortName?: string | null } | null;
      }
    | undefined;
  const userName = user ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() : undefined;
  const helpfulCount = typeof raw.helpfulCount === 'number' ? raw.helpfulCount : 0;
  const overall = Number(raw.overallRating ?? raw.rating ?? 0);
  const isVerifiedStay = Boolean(raw.isVerifiedStay ?? raw.isResidentVerified);

  return {
    id: String(raw.id ?? ''),
    pensionId: String(raw.pensionId ?? ''),
    userId: String(raw.userId ?? ''),
    userName,
    rating: overall,
    overallRating: overall,
    cleanlinessRating:
      raw.cleanlinessRating !== undefined && raw.cleanlinessRating !== null
        ? Number(raw.cleanlinessRating)
        : undefined,
    landlordRating:
      raw.landlordRating !== undefined && raw.landlordRating !== null
        ? Number(raw.landlordRating)
        : undefined,
    ownerRating:
      raw.landlordRating !== undefined && raw.landlordRating !== null
        ? Number(raw.landlordRating)
        : undefined,
    locationRating:
      raw.locationRating !== undefined && raw.locationRating !== null
        ? Number(raw.locationRating)
        : undefined,
    quietnessRating:
      raw.quietnessRating !== undefined && raw.quietnessRating !== null
        ? Number(raw.quietnessRating)
        : undefined,
    wifiRating:
      raw.wifiRating !== undefined && raw.wifiRating !== null ? Number(raw.wifiRating) : undefined,
    comment: String(raw.comment ?? ''),
    stayDurationCategory:
      (raw.stayDurationCategory as components['schemas']['StayDurationCategory']) ?? undefined,
    images: Array.isArray(raw.images) ? (raw.images as string[]) : [],
    isVerifiedStay,
    isResidentVerified: isVerifiedStay,
    isAnonymous: Boolean(raw.isAnonymous),
    helpfulCount,
    userVoted:
      typeof (raw as Record<string, unknown>).userVoted === 'boolean'
        ? ((raw as Record<string, unknown>).userVoted as boolean)
        : undefined,
    createdAt: raw.createdAt
      ? raw.createdAt instanceof Date
        ? raw.createdAt.toISOString()
        : String(raw.createdAt)
      : '',
    user: user
      ? {
          id: String(user.id ?? raw.userId ?? ''),
          firstName: user.firstName ?? '',
          lastName: user.lastName ?? '',
          avatarUrl: user.avatarUrl ?? null,
          university: user.university ?? null,
        }
      : undefined,
  };
}

export async function fetchPensionReviews(
  pensionId: string,
  query?: PaginationQuery,
): Promise<ApiResponse<PaginatedReviewsResponse>> {
  const queryParams = new URLSearchParams();
  if (query?.page) {
    queryParams.set('page', String(query.page));
  }
  if (query?.limit) {
    queryParams.set('limit', String(query.limit));
  }
  const queryString = queryParams.toString();
  const endpoint = `/pensions/${encodeURIComponent(pensionId)}/reviews${queryString ? `?${queryString}` : ''}`;

  const response = await apiFetch<
    components['schemas']['ReviewResponseDto'][] | Record<string, unknown>
  >(endpoint, {
    method: 'GET',
  });

  if (isApiSuccess(response)) {
    if (Array.isArray(response.data)) {
      const allMapped = response.data.map(mapRawReviewToItem);
      const page = query?.page ?? 1;
      const limit = query?.limit ?? (allMapped.length || 10);
      const startIndex = (page - 1) * limit;
      const paginatedItems = allMapped.slice(startIndex, startIndex + limit);

      return createSuccess<PaginatedReviewsResponse>(
        {
          items: paginatedItems,
          total: allMapped.length,
          page,
          limit,
          hasMore: startIndex + limit < allMapped.length,
        },
        response.statusCode,
      );
    }

    const rawData = response.data as Record<string, unknown>;
    const rawItems = Array.isArray(rawData?.items)
      ? (rawData.items as components['schemas']['ReviewResponseDto'][])
      : [];
    const page = typeof rawData?.page === 'number' ? rawData.page : (query?.page ?? 1);
    const limit =
      typeof rawData?.limit === 'number'
        ? rawData.limit
        : (query?.limit ?? (rawItems.length || 10));
    const total = typeof rawData?.total === 'number' ? rawData.total : rawItems.length;
    const hasMore = typeof rawData?.hasMore === 'boolean' ? rawData.hasMore : page * limit < total;

    return createSuccess<PaginatedReviewsResponse>(
      {
        items: rawItems.map(mapRawReviewToItem),
        total,
        page,
        limit,
        hasMore,
      },
      response.statusCode,
    );
  }

  return response;
}

export async function createPensionReview(
  pensionId: string,
  payload: CreateReviewDto,
): Promise<ApiResponse<ReviewItemDto>> {
  const response = await apiFetch<components['schemas']['ReviewResponseDto']>(
    `/pensions/${encodeURIComponent(pensionId)}/reviews`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
  );

  if (isApiSuccess(response)) {
    return createSuccess<ReviewItemDto>(mapRawReviewToItem(response.data), response.statusCode);
  }

  return response;
}

export async function updateReview(
  reviewId: string,
  payload: UpdateReviewDto,
): Promise<ApiResponse<ReviewItemDto>> {
  const response = await apiFetch<components['schemas']['ReviewResponseDto']>(
    `/reviews/${encodeURIComponent(reviewId)}`,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    },
  );

  if (isApiSuccess(response)) {
    return createSuccess<ReviewItemDto>(mapRawReviewToItem(response.data), response.statusCode);
  }

  return response;
}

export async function deleteReview(reviewId: string): Promise<ApiResponse<{ success: boolean }>> {
  const response = await apiFetch<{ id?: string; deleted?: boolean }>(
    `/reviews/${encodeURIComponent(reviewId)}`,
    {
      method: 'DELETE',
    },
  );

  if (isApiSuccess(response)) {
    return createSuccess<{ success: boolean }>({ success: true }, response.statusCode);
  }

  return response;
}

export async function voteReviewHelpful(
  reviewId: string,
): Promise<ApiResponse<{ helpfulCount: number; voted: boolean }>> {
  const response = await apiFetch<{ helpfulCount?: number; voted?: boolean }>(
    `/reviews/${encodeURIComponent(reviewId)}/helpful`,
    {
      method: 'POST',
    },
  );

  if (isApiSuccess(response)) {
    return createSuccess(
      {
        helpfulCount: response.data.helpfulCount ?? 0,
        voted: Boolean(response.data.voted),
      },
      response.statusCode,
    );
  }

  return response;
}

export async function fetchUserHelpfulVotes(): Promise<ApiResponse<UserHelpfulVotesResponse>> {
  return apiFetch<UserHelpfulVotesResponse>('/reviews/helpful/voted', {
    method: 'GET',
  });
}

export const reviewsService = {
  fetchPensionReviews,
  createPensionReview,
  createReview: createPensionReview,
  updateReview,
  deleteReview,
  voteReviewHelpful,
  fetchUserHelpfulVotes,
};
