import { apiFetch } from '@/lib/api-client-base';
import { type ApiResponse, createSuccess, isApiSuccess } from '@/lib/api-response';
import type { components } from '@/lib/api-schema';
import { mapPensionItemDto } from '@/services/pensions.service';
import type { PensionItemDto } from '@/types/api-contracts';

export type FavoriteItemDto = components['schemas']['FavoriteItemResponseDto'];

function normalizePensionItem(raw: FavoriteItemDto | Record<string, unknown>): PensionItemDto {
  const p = ('pension' in raw && raw.pension ? raw.pension : raw) as Record<string, unknown>;
  return mapPensionItemDto(p);
}

export async function fetchStudentFavorites(): Promise<ApiResponse<PensionItemDto[]>> {
  const response = await apiFetch<FavoriteItemDto[]>('/favorites', {
    method: 'GET',
  });

  if (isApiSuccess(response)) {
    const list = Array.isArray(response.data) ? response.data : [];
    const items = list.map(normalizePensionItem);
    return createSuccess<PensionItemDto[]>(items, response.statusCode);
  }

  return response;
}

export async function addFavorite(pensionId: string): Promise<ApiResponse<{ success: boolean }>> {
  const response = await apiFetch<{ added?: boolean }>(
    `/favorites/${encodeURIComponent(pensionId)}`,
    {
      method: 'POST',
      body: JSON.stringify({}),
    },
  );

  if (isApiSuccess(response)) {
    return createSuccess<{ success: boolean }>({ success: true }, response.statusCode);
  }

  return response;
}

export async function removeFavorite(
  pensionId: string,
): Promise<ApiResponse<{ success: boolean }>> {
  const response = await apiFetch<{ removed?: boolean }>(
    `/favorites/${encodeURIComponent(pensionId)}`,
    {
      method: 'DELETE',
    },
  );

  if (isApiSuccess(response)) {
    return createSuccess<{ success: boolean }>({ success: true }, response.statusCode);
  }

  return response;
}

export async function toggleFavorite(
  pensionId: string,
  isCurrentlyFav: boolean,
): Promise<ApiResponse<{ isFavorite: boolean }>> {
  if (isCurrentlyFav) {
    const res = await removeFavorite(pensionId);
    if (isApiSuccess(res)) {
      return createSuccess<{ isFavorite: boolean }>({ isFavorite: false }, res.statusCode);
    }
    return res;
  }

  const res = await addFavorite(pensionId);
  if (isApiSuccess(res)) {
    return createSuccess<{ isFavorite: boolean }>({ isFavorite: true }, res.statusCode);
  }
  return res;
}

export const favoritesService = {
  fetchStudentFavorites,
  addFavorite,
  removeFavorite,
  toggleFavorite,
};
