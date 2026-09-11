import { apiFetch } from '@/lib/api-client-base';
import { type ApiResponse, createSuccess, isApiSuccess } from '@/lib/api-response';
import { MOCK_STAY_HISTORY } from '@/lib/mock-data';
import type { StayHistoryItem } from '@/lib/types';

export async function fetchStudentStays(): Promise<ApiResponse<StayHistoryItem[]>> {
  const response = await apiFetch<StayHistoryItem[]>('/stays', {
    method: 'GET',
  });

  if (isApiSuccess(response) && Array.isArray(response.data) && response.data.length > 0) {
    return response;
  }

  return createSuccess<StayHistoryItem[]>(MOCK_STAY_HISTORY, 200);
}

export const staysService = {
  fetchStudentStays,
};
