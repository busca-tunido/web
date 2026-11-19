import { isApiSuccess } from '@/lib/api-response';
import { cacheStore } from '@/lib/cache-store';
import type {
  CampusAreaDto,
  FavoritePensionSummaryDto,
  NavTab,
  PensionItem,
  StayHistoryItem,
} from '@/lib/types';
import { favoritesService } from '@/services/favorites.service';
import { pensionsService } from '@/services/pensions.service';
import { staysService } from '@/services/stays.service';
import { fetchCampusAreas } from '@/services/universities.service';

export const STUDENT_CACHE_KEYS = {
  favoritesList: 'student:favorites:list',
  staysList: 'student:stays:list',
  campusAreas: (city?: string) => `student:campus-areas:${city?.trim().toLowerCase() || 'all'}`,
  pensionDetail: (id: string) => `pension:detail:${id}`,
  pensionsFeed: (queryKey: string) => `student:pensions:feed:${queryKey}`,
} as const;

export const STUDENT_CACHE_TTLS = {
  favorites: 30_000,
  stays: 60_000,
  campusAreas: 300_000,
  pensionDetail: 60_000,
  pensionsFeed: 30_000,
} as const;

const loadedTabChunks = new Set<string>();

export function preloadStudentTabChunk(tab: NavTab): void {
  if (typeof window === 'undefined' || process.env.NODE_ENV === 'test') return;
  if (loadedTabChunks.has(tab)) return;
  loadedTabChunks.add(tab);

  switch (tab) {
    case 'explore':
      void import('@/components/explore/explore-screen');
      break;
    case 'map':
      void import('@/components/map/map-screen');
      break;
    case 'favorites':
      void import('@/components/favorites/favorites-screen');
      break;
    case 'history':
      void import('@/components/history/history-screen');
      break;
    case 'account':
      void import('@/components/account/student-account-screen');
      break;
  }
}

export function preloadStudentModalChunk(modal: 'detail' | 'filters' | 'auth'): void {
  if (typeof window === 'undefined' || process.env.NODE_ENV === 'test') return;
  const key = `modal:${modal}`;
  if (loadedTabChunks.has(key)) return;
  loadedTabChunks.add(key);

  switch (modal) {
    case 'detail':
      void import('@/components/pensions/pension-detail-modal');
      break;
    case 'filters':
      void import('@/components/layout/filter-drawer');
      break;
    case 'auth':
      void import('@/components/auth/auth-modal');
      break;
  }
}

export async function prefetchStudentTabData(
  tab: NavTab,
  options?: { isAuthenticated?: boolean; city?: string | null },
): Promise<void> {
  if (typeof window === 'undefined' || process.env.NODE_ENV === 'test') return;

  const isAuthenticated = Boolean(options?.isAuthenticated);

  if (tab === 'map') {
    const city = options?.city?.trim() || undefined;
    const key = STUDENT_CACHE_KEYS.campusAreas(city);
    if (!cacheStore.has(key) || cacheStore.isStale(key, STUDENT_CACHE_TTLS.campusAreas)) {
      try {
        const res = await cacheStore.dedupePromise(key, () =>
          fetchCampusAreas(city ? { city } : undefined),
        );
        if (isApiSuccess(res) && Array.isArray(res.data)) {
          cacheStore.set<CampusAreaDto[]>(key, res.data);
        }
      } catch {
        // Ignore background prefetch failures
      }
    }
    return;
  }

  if (tab === 'favorites' && isAuthenticated) {
    const key = STUDENT_CACHE_KEYS.favoritesList;
    if (!cacheStore.has(key) || cacheStore.isStale(key, STUDENT_CACHE_TTLS.favorites)) {
      try {
        const res = await cacheStore.dedupePromise(key, () =>
          favoritesService.fetchStudentFavorites(),
        );
        if (isApiSuccess(res)) {
          const list = Array.isArray(res.data) ? res.data : [];
          cacheStore.set<FavoritePensionSummaryDto[]>(key, list);
        }
      } catch {
        // Ignore background prefetch failures
      }
    }
    return;
  }

  if (tab === 'history' && isAuthenticated) {
    const key = STUDENT_CACHE_KEYS.staysList;
    if (!cacheStore.has(key) || cacheStore.isStale(key, STUDENT_CACHE_TTLS.stays)) {
      try {
        const res = await cacheStore.dedupePromise(key, () => staysService.fetchStudentStays());
        if (isApiSuccess(res)) {
          const list = Array.isArray(res.data) ? res.data : [];
          cacheStore.set<StayHistoryItem[]>(key, list);
        }
      } catch {
        // Ignore background prefetch failures
      }
    }
  }
}

export function preloadStudentTab(
  tab: NavTab,
  options?: { isAuthenticated?: boolean; city?: string | null },
): void {
  preloadStudentTabChunk(tab);
  void prefetchStudentTabData(tab, options);
}

export async function prefetchPensionDetail(pensionId: string): Promise<void> {
  if (typeof window === 'undefined' || process.env.NODE_ENV === 'test' || !pensionId) return;

  preloadStudentModalChunk('detail');

  const key = STUDENT_CACHE_KEYS.pensionDetail(pensionId);
  if (cacheStore.has(key) && !cacheStore.isStale(key, STUDENT_CACHE_TTLS.pensionDetail)) {
    return;
  }

  try {
    const res = await cacheStore.dedupePromise(key, () =>
      pensionsService.fetchPensionById(pensionId),
    );
    if (isApiSuccess(res) && res.data) {
      cacheStore.set<PensionItem>(key, res.data);
    }
  } catch {
    // Ignore background prefetch failures
  }
}
