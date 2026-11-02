import { apiFetch } from '@/lib/api-client-base';
import { type ApiResponse, createSuccess, isApiSuccess } from '@/lib/api-response';
import type { components } from '@/lib/api-schema';
import type { PensionItemDto } from '@/types/api-contracts';

export type FavoriteItemDto = components['schemas']['FavoriteItemResponseDto'];

function normalizePensionItem(raw: FavoriteItemDto | Record<string, unknown>): PensionItemDto {
  const p = ('pension' in raw && raw.pension ? raw.pension : raw) as Record<string, unknown>;
  const rawImages = Array.isArray(p.images) ? p.images : [];
  const images = rawImages.map((img: unknown, idx: number) => {
    const obj = img as Record<string, unknown>;
    const url = typeof obj === 'object' && obj ? String(obj.url ?? '') : String(img);
    return {
      id: typeof obj === 'object' && obj?.id ? String(obj.id) : `img-${idx}`,
      url,
      thumbnailUrl: typeof obj === 'object' && obj?.thumbnailUrl ? String(obj.thumbnailUrl) : url,
      caption: typeof obj === 'object' && typeof obj?.caption === 'string' ? obj.caption : null,
      isFeatured: typeof obj === 'object' && Boolean(obj?.isFeatured ?? idx === 0),
    };
  });

  return {
    id: String(p.id ?? ''),
    slug: String(p.slug ?? `pension-${p.id}`),
    title: String(p.title ?? ''),
    city: String(p.city ?? ''),
    neighborhood: typeof p.neighborhood === 'string' ? p.neighborhood : undefined,
    baseMonthlyPrice: Number(p.baseMonthlyPrice ?? 0),
    ratingAverage: Number(p.ratingAverage ?? 0),
    ratingCount: Number(p.ratingCount ?? 0),
    reviewsCount: Number(p.reviewsCount ?? p.ratingCount ?? 0),
    averageRating: Number(p.averageRating ?? p.ratingAverage ?? 0),
    images,
    verificationStatus: 'OFFICIALLY_VERIFIED',
    isActive: true,
    waterIncluded: false,
    electricityIncluded: false,
    gasIncluded: false,
    internetIncluded: false,
    includesWifi: false,
    guestsAllowed: true,
    smokingAllowed: false,
    petsAllowed: false,
    genderPreference: 'ANY',
    currency: 'CLP',
  };
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
