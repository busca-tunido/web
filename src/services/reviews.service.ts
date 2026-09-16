import { apiFetch } from '@/lib/api-client-base';
import { type ApiResponse, createSuccess, isApiSuccess } from '@/lib/api-response';
import type {
  CreateReviewDto,
  PaginatedReviewsResponse,
  ReviewItemDto,
  UpdateReviewDto,
} from '@/types/api-contracts';

export type PaginationQuery = {
  page?: number;
  limit?: number;
};

type RawReviewResponse = {
  id: string;
  pensionId: string;
  userId: string;
  overallRating: number;
  cleanlinessRating?: number | null;
  landlordRating?: number | null;
  quietnessRating?: number | null;
  wifiRating?: number | null;
  comment: string;
  images?: string[];
  stayDurationCategory?: string | null;
  isResidentVerified?: boolean;
  isHidden?: boolean;
  createdAt: string;
  updatedAt?: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string | null;
    university?: {
      shortName?: string | null;
      name?: string;
    } | null;
  };
};

function mapRawReviewToItem(raw: RawReviewResponse): ReviewItemDto {
  const userName = raw.user ? `${raw.user.firstName} ${raw.user.lastName}`.trim() : undefined;

  return {
    id: raw.id,
    pensionId: raw.pensionId,
    userId: raw.userId,
    userName,
    rating: raw.overallRating,
    cleanlinessRating: raw.cleanlinessRating ?? undefined,
    landlordRating: raw.landlordRating ?? undefined,
    locationRating: raw.quietnessRating ?? undefined,
    comment: raw.comment,
    stayDuration: raw.stayDurationCategory ?? undefined,
    images: Array.isArray(raw.images) ? raw.images : [],
    helpfulCount: 0,
    createdAt: raw.createdAt,
    user: raw.user ?? undefined,
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

  const response = await apiFetch<RawReviewResponse[] | PaginatedReviewsResponse>(endpoint, {
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

    return createSuccess<PaginatedReviewsResponse>(response.data, response.statusCode);
  }

  return response;
}

export async function createPensionReview(
  pensionId: string,
  payload: CreateReviewDto,
): Promise<ApiResponse<ReviewItemDto>> {
  const response = await apiFetch<RawReviewResponse>(
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
  const response = await apiFetch<RawReviewResponse>(`/reviews/${encodeURIComponent(reviewId)}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });

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
        helpfulCount: response.data.helpfulCount ?? 1,
        voted: response.data.voted ?? true,
      },
      response.statusCode,
    );
  }

  return response;
}

export const reviewsService = {
  fetchPensionReviews,
  createPensionReview,
  createReview: createPensionReview,
  updateReview,
  deleteReview,
  voteReviewHelpful,
};
