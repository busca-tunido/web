import { apiFetch } from '@/lib/api-client-base';
import { type ApiResponse, createSuccess, isApiSuccess } from '@/lib/api-response';
import type {
  CreateUniversityDto,
  UniversityDto,
  UpdateUniversityDto,
} from '@/types/api-contracts';

export function mapUniversityDto(raw: Record<string, unknown>): UniversityDto {
  return {
    id: String(raw.id ?? ''),
    name: String(raw.name ?? ''),
    acronym: String(raw.acronym ?? raw.shortName ?? ''),
    city: String(raw.city ?? ''),
    campus: typeof raw.campus === 'string' ? raw.campus : undefined,
    latitude: Number(raw.latitude ?? 0),
    longitude: Number(raw.longitude ?? 0),
    imageUrl:
      typeof raw.imageUrl === 'string'
        ? raw.imageUrl
        : typeof raw.campusImageUrl === 'string'
          ? raw.campusImageUrl
          : undefined,
  };
}

export async function fetchUniversities(params?: {
  city?: string;
}): Promise<ApiResponse<UniversityDto[]>> {
  const query = params?.city ? `?city=${encodeURIComponent(params.city)}` : '';
  const response = await apiFetch<Array<Record<string, unknown>>>(`/universities${query}`, {
    method: 'GET',
  });

  if (!isApiSuccess(response)) {
    return response;
  }

  const items = Array.isArray(response.data) ? response.data.map(mapUniversityDto) : [];
  return createSuccess(items, response.statusCode);
}

export async function fetchUniversityDetail(id: string): Promise<ApiResponse<UniversityDto>> {
  const response = await apiFetch<Record<string, unknown>>(
    `/universities/${encodeURIComponent(id)}`,
    {
      method: 'GET',
    },
  );

  if (!isApiSuccess(response)) {
    return response;
  }

  return createSuccess(mapUniversityDto(response.data), response.statusCode);
}

export async function createUniversity(
  payload: CreateUniversityDto,
): Promise<ApiResponse<UniversityDto>> {
  const response = await apiFetch<Record<string, unknown>>('/universities', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (!isApiSuccess(response)) {
    return response;
  }

  return createSuccess(mapUniversityDto(response.data), response.statusCode);
}

export async function updateUniversity(
  id: string,
  payload: UpdateUniversityDto,
): Promise<ApiResponse<UniversityDto>> {
  const response = await apiFetch<Record<string, unknown>>(
    `/universities/${encodeURIComponent(id)}`,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    },
  );

  if (!isApiSuccess(response)) {
    return response;
  }

  return createSuccess(mapUniversityDto(response.data), response.statusCode);
}

export async function deleteUniversity(id: string): Promise<ApiResponse<{ success: boolean }>> {
  const response = await apiFetch<{ id?: string; deleted?: boolean }>(
    `/universities/${encodeURIComponent(id)}`,
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
