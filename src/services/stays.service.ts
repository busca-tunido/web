import { apiFetch } from '@/lib/api-client-base';
import { type ApiResponse, createSuccess, isApiSuccess } from '@/lib/api-response';
import type { StayHistoryItem } from '@/lib/types';

export async function fetchStudentStays(): Promise<ApiResponse<StayHistoryItem[]>> {
  const response = await apiFetch<StayHistoryItem[]>('/stays', {
    method: 'GET',
  });

  if (isApiSuccess(response) && Array.isArray(response.data)) {
    return response;
  }

  return createSuccess<StayHistoryItem[]>([], 200);
}

export const staysService = {
  fetchStudentStays,
};
