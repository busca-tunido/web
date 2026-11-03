import { apiFetch, wrapApiResponse } from '@/lib/api-fetch';
import type { ApiResponse } from '@/lib/api-response';
import type { StayHistoryItem } from '@/lib/types';

export async function fetchStudentStays(): Promise<ApiResponse<StayHistoryItem[]>> {
  const result = await apiFetch.GET('/stays');
  return wrapApiResponse<StayHistoryItem[]>(result, 'Error al obtener historial de estancias');
}

export const staysService = {
  fetchStudentStays,
};
