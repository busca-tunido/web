import { apiFetch } from '@/lib/api-client-base';
import { type ApiResponse, createSuccess, isApiSuccess } from '@/lib/api-response';
import type { UpdatePensionStatusDto, UpdateReviewVisibilityDto } from '@/types/api-contracts';

export type UpdateVisibilityDto = UpdateReviewVisibilityDto;

export async function toggleReviewVisibility(
  reviewId: string,
  payload: UpdateVisibilityDto,
): Promise<ApiResponse<{ success: boolean }>> {
  const response = await apiFetch<unknown>(
    `/moderation/reviews/${encodeURIComponent(reviewId)}/visibility`,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    },
  );

  if (isApiSuccess(response)) {
    return createSuccess<{ success: boolean }>({ success: true }, response.statusCode);
  }

  return response;
}

export async function updatePensionStatus(
  pensionId: string,
  payload: UpdatePensionStatusDto,
): Promise<ApiResponse<{ success: boolean }>> {
  const response = await apiFetch<unknown>(
    `/moderation/pensions/${encodeURIComponent(pensionId)}/status`,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    },
  );

  if (isApiSuccess(response)) {
    return createSuccess<{ success: boolean }>({ success: true }, response.statusCode);
  }

  return response;
}

export const moderationService = {
  toggleReviewVisibility,
  updatePensionStatus,
};
