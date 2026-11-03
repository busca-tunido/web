import { apiFetch } from '@/lib/api-client-base';
import { type ApiResponse, createSuccess, isApiSuccess } from '@/lib/api-response';
import type { StayHistoryItem } from '@/lib/types';

export async function fetchStudentStays(): Promise<ApiResponse<StayHistoryItem[]>> {
  const response = await apiFetch<StayHistoryItem[]>('/stays', {
    method: 'GET',
  });

  if (!isApiSuccess(response)) {
    return response;
  }

  const list = Array.isArray(response.data) ? response.data : [];
  return createSuccess<StayHistoryItem[]>(list, response.statusCode);
}

export const staysService = {
  fetchStudentStays,
};
