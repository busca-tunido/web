import { apiFetch, wrapApiResponse } from '@/lib/api-fetch';
import { type ApiResponse, createSuccess, isApiSuccess } from '@/lib/api-response';
import type { paths } from '@/lib/api-schema';
import { getUniversityImageUrl } from '@/lib/location-images';
import type {
  CampusAreaDto,
  CreateUniversityDto,
  UniversityDto,
  UpdateUniversityDto,
} from '@/lib/types';

export type UniversitiesFilterQuery = NonNullable<
  paths['/universities']['get']['parameters']['query']
>;

export function mapUniversityDto(raw: UniversityDto): UniversityDto {
  const name = String(raw.name ?? '');
  const acronym = String(raw.acronym ?? raw.shortName ?? '');
  const rawImage =
    typeof raw.imageUrl === 'string' && raw.imageUrl.trim().length > 0 ? raw.imageUrl : undefined;

  return {
    ...raw,
    imageUrl: rawImage ?? getUniversityImageUrl(name, acronym),
  };
}

export async function fetchUniversities(
  params?: UniversitiesFilterQuery,
): Promise<ApiResponse<UniversityDto[]>> {
  const result = await apiFetch.GET('/universities', {
    params: {
      query: params,
    },
  });
  const res = wrapApiResponse<UniversityDto[]>(result, 'Error al obtener universidades');
  if (!isApiSuccess(res)) {
    return res;
  }
  const items = Array.isArray(res.data) ? res.data.map(mapUniversityDto) : [];
  return createSuccess(items, res.statusCode);
}

export async function fetchCampusAreas(params?: {
  city?: string;
}): Promise<ApiResponse<CampusAreaDto[]>> {
  const result = await apiFetch.GET('/universities/campuses', {
    params: {
      query: params,
    },
  });
  return wrapApiResponse<CampusAreaDto[]>(result, 'Error al obtener campus universitarios');
}

export async function fetchUniversityDetail(id: string): Promise<ApiResponse<UniversityDto>> {
  const result = await apiFetch.GET('/universities/{id}', {
    params: {
      path: { id },
    },
  });
  const res = wrapApiResponse<UniversityDto>(result, 'Error al obtener detalle de la universidad');
  if (!isApiSuccess(res)) {
    return res;
  }
  return createSuccess(mapUniversityDto(res.data), res.statusCode);
}

export async function createUniversity(
  payload: CreateUniversityDto,
): Promise<ApiResponse<UniversityDto>> {
  const result = await apiFetch.POST('/universities', {
    body: payload,
  });
  const res = wrapApiResponse<UniversityDto>(result, 'Error al crear universidad');
  if (!isApiSuccess(res)) {
    return res;
  }
  return createSuccess(mapUniversityDto(res.data), res.statusCode);
}

export async function updateUniversity(
  id: string,
  payload: UpdateUniversityDto,
): Promise<ApiResponse<UniversityDto>> {
  const result = await apiFetch.PATCH('/universities/{id}', {
    params: {
      path: { id },
    },
    body: payload,
  });
  const res = wrapApiResponse<UniversityDto>(result, 'Error al actualizar universidad');
  if (!isApiSuccess(res)) {
    return res;
  }
  return createSuccess(mapUniversityDto(res.data), res.statusCode);
}

export async function deleteUniversity(id: string): Promise<ApiResponse<{ success: boolean }>> {
  const result = await apiFetch.DELETE('/universities/{id}', {
    params: {
      path: { id },
    },
  });
  const res = wrapApiResponse<{ deleted?: boolean }>(result, 'Error al eliminar universidad');
  if (!isApiSuccess(res)) {
    return res;
  }
  return createSuccess({ success: res.data.deleted ?? true }, res.statusCode);
}
