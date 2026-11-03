import { apiFetch, wrapApiResponse } from '@/lib/api-fetch';
import { type ApiResponse, createSuccess, isApiSuccess } from '@/lib/api-response';
import type { UpdatePensionStatusDto, UpdateReviewVisibilityDto } from '@/lib/types';

export type UpdateVisibilityDto = UpdateReviewVisibilityDto;

export async function toggleReviewVisibility(
  reviewId: string,
  payload: UpdateVisibilityDto,
): Promise<ApiResponse<{ success: boolean }>> {
  const result = await apiFetch.PATCH('/moderation/reviews/{id}/visibility', {
    params: {
      path: { id: reviewId },
    },
    body: payload,
  });
  const res = wrapApiResponse(result, 'Error al cambiar la visibilidad de la reseña');
  if (isApiSuccess(res)) {
    return createSuccess({ success: true }, res.statusCode);
  }
  return res;
}

export async function updatePensionStatus(
  pensionId: string,
  payload: UpdatePensionStatusDto,
): Promise<ApiResponse<{ success: boolean }>> {
  const result = await apiFetch.PATCH('/moderation/pensions/{id}/status', {
    params: {
      path: { id: pensionId },
    },
    body: payload,
  });
  const res = wrapApiResponse(result, 'Error al actualizar el estado de la pensión');
  if (isApiSuccess(res)) {
    return createSuccess({ success: true }, res.statusCode);
  }
  return res;
}

export const moderationService = {
  toggleReviewVisibility,
  updatePensionStatus,
};
