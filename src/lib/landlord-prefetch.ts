import { isApiSuccess } from '@/lib/api-response';
import type { components } from '@/lib/api-schema';
import { cacheStore } from '@/lib/cache-store';
import type { LandlordTab } from '@/lib/landlord-routes';
import type {
  PensionAmenityCatalogItemDto,
  PensionItem,
  ProposalDto,
  ReviewItemDto,
  RoomDto,
} from '@/lib/types';
import { pensionsService } from '@/services/pensions.service';
import { proposalsService } from '@/services/proposals.service';
import { reviewsService } from '@/services/reviews.service';
import { roomsService } from '@/services/rooms.service';

export type LandlordInitialData = {
  pensions?: PensionItem[];
  amenities?: PensionAmenityCatalogItemDto[];
};

export const LANDLORD_PENSIONS_MINE_KEY = 'landlord:pensions:mine';
export const LANDLORD_PENSIONS_TTL_MS = 60_000;

export const AMENITIES_CATALOG_KEY = 'pensions:amenities:catalog';
export const AMENITIES_CATALOG_TTL_MS = 300_000;

export const LANDLORD_ROOMS_TTL_MS = 45_000;
export const LANDLORD_PROPOSALS_TTL_MS = 30_000;
export const LANDLORD_REVIEWS_TTL_MS = 30_000;

const REDUNDANT_UTILITY_SLUGS = new Set(['wifi-alta-velocidad', 'luz-incluida', 'gas-incluido']);

export function normalizeAmenitiesCatalog(
  raw: PensionAmenityCatalogItemDto[],
): PensionAmenityCatalogItemDto[] {
  return raw
    .filter((a) => !REDUNDANT_UTILITY_SLUGS.has(a.slug))
    .map((a) =>
      a.slug === 'agua-caliente' || a.slug === 'calefaccion'
        ? { ...a, category: 'ROOM_FEATURE' as const }
        : a,
    );
}

export function landlordRoomsKey(pensionId: string): string {
  return `landlord:rooms:${pensionId}`;
}

export function landlordProposalsKey(pensionId: string): string {
  return `landlord:proposals:${pensionId}`;
}

export function landlordReviewsKey(pensionId: string, userId?: string | null): string {
  return `reviews:${pensionId}:${userId ?? 'anon'}:default`;
}

const preloadedTabs = new Set<LandlordTab>();

export function preloadLandlordTabChunk(tab: LandlordTab): void {
  if (typeof window === 'undefined' || preloadedTabs.has(tab)) {
    return;
  }
  preloadedTabs.add(tab);

  if (tab === 'rooms') {
    void import('@/components/landlord/landlord-rooms-screen');
  } else if (tab === 'reviews') {
    void import('@/components/landlord/landlord-reviews-screen');
  } else if (tab === 'proposals') {
    void import('@/components/landlord/landlord-proposals-screen');
  } else if (tab === 'account') {
    void import('@/components/account/landlord-account-screen');
  }
}

export async function prefetchLandlordTabData(
  tab: LandlordTab,
  options?: { pensionId?: string | null; userId?: string | null },
): Promise<void> {
  if (typeof window === 'undefined') {
    return;
  }

  const pensionId = options?.pensionId;

  if (tab === 'pension') {
    const cached = cacheStore.get<PensionAmenityCatalogItemDto[]>(AMENITIES_CATALOG_KEY);
    if (!cached || cacheStore.isStale(AMENITIES_CATALOG_KEY, AMENITIES_CATALOG_TTL_MS)) {
      await cacheStore
        .dedupePromise(AMENITIES_CATALOG_KEY, async () => {
          const res = await pensionsService.fetchAmenitiesCatalog();
          if (isApiSuccess(res) && Array.isArray(res.data)) {
            const normalized = normalizeAmenitiesCatalog(res.data);
            if (normalized.length > 0) {
              cacheStore.set(AMENITIES_CATALOG_KEY, normalized);
            }
            return normalized;
          }
          return null;
        })
        .catch(() => null);
    }
    return;
  }

  if (!pensionId) {
    return;
  }

  if (tab === 'rooms') {
    const key = landlordRoomsKey(pensionId);
    const cached = cacheStore.get<RoomDto[]>(key);
    if (!cached || cacheStore.isStale(key, LANDLORD_ROOMS_TTL_MS)) {
      await cacheStore
        .dedupePromise(key, async () => {
          const res = await roomsService.fetchPensionRooms(pensionId);
          if (isApiSuccess(res) && Array.isArray(res.data)) {
            cacheStore.set(key, res.data);
            return res.data;
          }
          return null;
        })
        .catch(() => null);
    }
    return;
  }

  if (tab === 'proposals') {
    const key = landlordProposalsKey(pensionId);
    const cached = cacheStore.get<ProposalDto[]>(key);
    if (!cached || cacheStore.isStale(key, LANDLORD_PROPOSALS_TTL_MS)) {
      await cacheStore
        .dedupePromise(key, async () => {
          const res = await proposalsService.fetchPensionProposals(pensionId);
          if (isApiSuccess(res)) {
            const list = res.data ?? [];
            cacheStore.set(key, list);
            return list;
          }
          return null;
        })
        .catch(() => null);
    }
    return;
  }

  if (tab === 'reviews') {
    const key = landlordReviewsKey(pensionId, options?.userId);
    const cached = cacheStore.get<{
      items: ReviewItemDto[];
      total: number;
      hasMore: boolean;
      summary?: components['schemas']['ReviewSummaryDto'];
    }>(key);
    if (!cached || cacheStore.isStale(key, LANDLORD_REVIEWS_TTL_MS)) {
      await cacheStore
        .dedupePromise(key, async () => {
          const res = await reviewsService.fetchPensionReviews(pensionId);
          if (isApiSuccess(res)) {
            const payload = {
              items: [...res.data.items],
              total: res.data.total ?? res.data.items.length,
              hasMore: Boolean(res.data.hasMore ?? res.data.pagination?.hasMore),
              summary: res.data.summary,
            };
            cacheStore.set(key, payload);
            return payload;
          }
          return null;
        })
        .catch(() => null);
    }
  }
}

export function preloadLandlordTab(
  tab: LandlordTab,
  options?: { pensionId?: string | null; userId?: string | null },
): void {
  preloadLandlordTabChunk(tab);
  void prefetchLandlordTabData(tab, options);
}
