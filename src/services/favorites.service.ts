import { apiFetch, wrapApiResponse } from '@/lib/api-fetch';
import { type ApiResponse, createSuccess, isApiSuccess } from '@/lib/api-response';
import type { FavoriteItemDto, FavoritePensionSummaryDto } from '@/lib/types';

export async function fetchStudentFavorites(): Promise<ApiResponse<FavoritePensionSummaryDto[]>> {
  const result = await apiFetch.GET('/favorites');
  const res = wrapApiResponse<FavoriteItemDto[]>(result, 'Error al obtener favoritos');
  if (isApiSuccess(res)) {
    const list = Array.isArray(res.data) ? res.data : [];
    const pensions = list.map((item) => item.pension);
    return createSuccess<FavoritePensionSummaryDto[]>(pensions, res.statusCode);
  }
  return res;
}

export async function addFavorite(pensionId: string): Promise<ApiResponse<{ success: boolean }>> {
  const result = await apiFetch.POST('/favorites/{pensionId}', {
    params: {
      path: { pensionId },
    },
  });
  const res = wrapApiResponse<{ added?: boolean }>(result, 'Error al agregar favorito');
  if (isApiSuccess(res)) {
    return createSuccess({ success: true }, res.statusCode);
  }
  return res;
}

export async function removeFavorite(
  pensionId: string,
): Promise<ApiResponse<{ success: boolean }>> {
  const result = await apiFetch.DELETE('/favorites/{pensionId}', {
    params: {
      path: { pensionId },
    },
  });
  const res = wrapApiResponse<{ removed?: boolean }>(result, 'Error al eliminar favorito');
  if (isApiSuccess(res)) {
    return createSuccess({ success: true }, res.statusCode);
  }
  return res;
}

export async function toggleFavorite(
  pensionId: string,
  isCurrentlyFav: boolean,
): Promise<ApiResponse<{ isFavorite: boolean }>> {
  if (isCurrentlyFav) {
    const res = await removeFavorite(pensionId);
    if (isApiSuccess(res)) {
      return createSuccess({ isFavorite: false }, res.statusCode);
    }
    return res;
  }

  const res = await addFavorite(pensionId);
  if (isApiSuccess(res)) {
    return createSuccess({ isFavorite: true }, res.statusCode);
  }
  return res;
}

export const favoritesService = {
  fetchStudentFavorites,
  addFavorite,
  removeFavorite,
  toggleFavorite,
};
