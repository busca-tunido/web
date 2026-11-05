import { apiFetch, wrapApiResponse } from '@/lib/api-fetch';
import type { ApiResponse } from '@/lib/api-response';
import type { components, paths } from '@/lib/api-schema';
import type {
  CreatePensionDto,
  DeleteResultDto,
  PaginatedPensionsResponse,
  PensionAmenityCatalogItemDto,
  PensionDetailDto,
  PensionItemDto,
  PriceHistogramResponse,
  UpdatePensionDto,
} from '@/lib/types';

export type PensionFilterParams = Omit<
  NonNullable<paths['/pensions']['get']['parameters']['query']>,
  'genderPreference'
> & {
  genderPreference?: 'ANY' | 'FEMALE_ONLY' | 'MALE_ONLY' | 'MIXED' | 'ALL';
  minPriceClp?: number;
  maxPriceClp?: number;
  query?: string;
};

function toBackendQueryParams(
  params?: PensionFilterParams,
): paths['/pensions']['get']['parameters']['query'] {
  if (!params) {
    return undefined;
  }
  const { genderPreference, minPriceClp, maxPriceClp, minPrice, maxPrice, query, ...rest } = params;
  const gp = genderPreference === 'MIXED' || genderPreference === 'ALL' ? 'ANY' : genderPreference;
  return {
    ...rest,
    search: rest.search ?? query,
    genderPreference: gp,
    minPrice: minPrice ?? minPriceClp,
    maxPrice: maxPrice ?? maxPriceClp,
  };
}

export async function fetchPaginatedPensions(
  params?: PensionFilterParams,
): Promise<ApiResponse<PaginatedPensionsResponse>> {
  const result = await apiFetch.GET('/pensions', {
    params: {
      query: toBackendQueryParams(params),
    },
  });
  return wrapApiResponse<PaginatedPensionsResponse>(result, 'Error al obtener pensiones');
}

export async function fetchPensionDetail(idOrSlug: string): Promise<ApiResponse<PensionDetailDto>> {
  const result = await apiFetch.GET('/pensions/{idOrSlug}', {
    params: {
      path: { idOrSlug },
    },
  });
  return wrapApiResponse<PensionDetailDto>(result, 'Error al obtener detalle de la pensión');
}

export const fetchPensionById = fetchPensionDetail;

export async function createPension(
  payload: CreatePensionDto,
): Promise<ApiResponse<PensionDetailDto>> {
  const result = await apiFetch.POST('/pensions', {
    body: payload,
  });
  return wrapApiResponse<PensionDetailDto>(result, 'Error al crear la pensión');
}

export async function updatePension(
  id: string,
  payload: UpdatePensionDto,
): Promise<ApiResponse<PensionDetailDto>> {
  const result = await apiFetch.PATCH('/pensions/{id}', {
    params: {
      path: { id },
    },
    body: payload as components['schemas']['UpdatePensionDto'],
  });
  return wrapApiResponse<PensionDetailDto>(result, 'Error al actualizar pensión');
}

export async function deletePension(id: string): Promise<ApiResponse<DeleteResultDto>> {
  const result = await apiFetch.DELETE('/pensions/{id}', {
    params: {
      path: { id },
    },
  });
  return wrapApiResponse<DeleteResultDto>(result, 'Error al eliminar pensión');
}

export async function fetchNearbyPensions(
  latitude: number,
  longitude: number,
  radiusKm = 30,
): Promise<ApiResponse<PaginatedPensionsResponse>> {
  return fetchPaginatedPensions({
    latitude,
    longitude,
    radiusKm,
    sortBy: 'distance',
  });
}

export async function fetchPriceHistogram(
  params?: PensionFilterParams,
): Promise<ApiResponse<PriceHistogramResponse>> {
  const result = await apiFetch.GET('/pensions/price-histogram', {
    params: {
      query: toBackendQueryParams(params),
    },
  });
  return wrapApiResponse<PriceHistogramResponse>(result, 'Error al obtener histograma de precios');
}

export async function fetchMinePensions(): Promise<ApiResponse<PensionItemDto[]>> {
  const result = await apiFetch.GET('/pensions/mine');
  return wrapApiResponse<PensionItemDto[]>(result, 'Error al obtener pensiones propias');
}

export async function fetchAmenitiesCatalog(): Promise<
  ApiResponse<PensionAmenityCatalogItemDto[]>
> {
  const result = await apiFetch.GET('/pensions/amenities');
  return wrapApiResponse<PensionAmenityCatalogItemDto[]>(
    result,
    'Error al obtener catálogo de comodidades',
  );
}

export const pensionsService = {
  fetchPaginatedPensions,
  fetchPensionDetail,
  fetchPensionById,
  fetchNearbyPensions,
  fetchPriceHistogram,
  fetchMinePensions,
  fetchAmenitiesCatalog,
  getAmenities: fetchAmenitiesCatalog,
  createPension,
  updatePension,
  update: updatePension,
  deletePension,
  delete: deletePension,
};
