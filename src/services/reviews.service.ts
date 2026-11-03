import { apiFetch, wrapApiResponse } from '@/lib/api-fetch';
import { type ApiResponse, createSuccess, isApiSuccess } from '@/lib/api-response';
import type { paths } from '@/lib/api-schema';
import type {
  CreateReviewDto,
  PaginatedReviewsResponse,
  ReviewItemDto,
  UpdateReviewDto,
  UserHelpfulVotesResponse,
} from '@/lib/types';

export type PaginationQuery = NonNullable<
  paths['/pensions/{pensionId}/reviews']['get']['parameters']['query']
>;

export async function fetchPensionReviews(
  pensionId: string,
  query?: PaginationQuery,
): Promise<ApiResponse<PaginatedReviewsResponse>> {
  const result = await apiFetch.GET('/pensions/{pensionId}/reviews', {
    params: {
      path: { pensionId },
      query,
    },
  });
  return wrapApiResponse<PaginatedReviewsResponse>(result, 'Error al obtener reseñas');
}

export async function createReview(
  pensionId: string,
  payload: CreateReviewDto,
): Promise<ApiResponse<ReviewItemDto>> {
  const result = await apiFetch.POST('/pensions/{pensionId}/reviews', {
    params: {
      path: { pensionId },
    },
    body: payload,
  });
  return wrapApiResponse<ReviewItemDto>(result, 'Error al publicar la reseña');
}

export async function updateReview(
  reviewId: string,
  payload: UpdateReviewDto,
): Promise<ApiResponse<ReviewItemDto>> {
  const result = await apiFetch.PATCH('/reviews/{id}', {
    params: {
      path: { id: reviewId },
    },
    body: payload,
  });
  return wrapApiResponse<ReviewItemDto>(result, 'Error al actualizar reseña');
}

export async function deleteReview(reviewId: string): Promise<ApiResponse<{ success: boolean }>> {
  const result = await apiFetch.DELETE('/reviews/{id}', {
    params: {
      path: { id: reviewId },
    },
  });
  const res = wrapApiResponse<{ deleted?: boolean }>(result, 'Error al eliminar reseña');
  if (isApiSuccess(res)) {
    return createSuccess({ success: res.data.deleted ?? true }, res.statusCode);
  }
  return res;
}

export async function voteReviewHelpful(
  reviewId: string,
): Promise<ApiResponse<{ voted: boolean; helpfulCount: number }>> {
  const result = await apiFetch.POST('/reviews/{id}/helpful', {
    params: {
      path: { id: reviewId },
    },
  });
  return wrapApiResponse<{ voted: boolean; helpfulCount: number }>(
    result,
    'Error al registrar voto',
  );
}

export async function fetchUserHelpfulVotes(): Promise<ApiResponse<UserHelpfulVotesResponse>> {
  const result = await apiFetch.GET('/reviews/helpful/voted');
  return wrapApiResponse<UserHelpfulVotesResponse>(result, 'Error al obtener votos de utilidad');
}

export const reviewsService = {
  fetchPensionReviews,
  createReview,
  updateReview,
  deleteReview,
  voteReviewHelpful,
  fetchUserHelpfulVotes,
};
