import { apiFetch } from '@/lib/api-client-base';
import { type ApiResponse, createSuccess, isApiSuccess } from '@/lib/api-response';
import type { PensionItemDto } from '@/types/api-contracts';

type RawFavoritePension = Partial<PensionItemDto> & {
  ratingAverage?: number;
  ratingCount?: number;
  images?: Array<{ url: string; sortOrder?: number; isMain?: boolean } | string>;
};

type RawFavoriteRecord = {
  id?: string;
  userId?: string;
  pensionId?: string;
  createdAt?: string;
  pension?: RawFavoritePension;
};

function normalizePensionItem(raw: Partial<PensionItemDto> | RawFavoriteRecord): PensionItemDto {
  if ('pension' in raw && raw.pension) {
    const p = raw.pension;
    const images = Array.isArray(p.images)
      ? p.images.map((img, idx) =>
          typeof img === 'string'
            ? { id: `img-${idx}`, url: img, order: idx, isMain: idx === 0 }
            : {
                id: (img as { id?: string }).id ?? `img-${idx}`,
                url: img.url,
                order:
                  (img as { sortOrder?: number; order?: number }).sortOrder ??
                  (img as { order?: number }).order ??
                  idx,
                isMain: (img as { isMain?: boolean }).isMain ?? idx === 0,
              },
        )
      : [];

    return {
      id: p.id ?? raw.pensionId ?? '',
      slug: p.slug,
      title: p.title ?? '',
      city: p.city ?? '',
      neighborhood: p.neighborhood,
      address: p.address,
      description: p.description,
      baseMonthlyPrice: p.baseMonthlyPrice,
      averageRating: p.averageRating ?? p.ratingAverage,
      reviewsCount: p.reviewsCount ?? p.ratingCount,
      images,
      verificationStatus: p.verificationStatus,
      isActive: p.isActive,
    };
  }

  const item = raw as PensionItemDto;
  return {
    ...item,
    id: item.id ?? '',
    title: item.title ?? '',
    city: item.city ?? '',
  };
}

export async function fetchStudentFavorites(): Promise<ApiResponse<PensionItemDto[]>> {
  const response = await apiFetch<Array<RawFavoriteRecord | PensionItemDto>>('/favorites', {
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
