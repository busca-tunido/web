import type { NavTab } from './types.js';

export type UrlNavigationState = {
  tab: NavTab;
  city: string | null;
  uni: string | null;
  pensionId: string | null;
  isFiltersOpen: boolean;
  reviewsPensionId: string | null;
  publishReviewPensionId: string | null;
};

export const VALID_TABS: readonly NavTab[] = [
  'explore',
  'favorites',
  'map',
  'history',
  'account',
] as const;

export function isValidTab(value: string | null): value is NavTab {
  return value !== null && (VALID_TABS as readonly string[]).includes(value);
}

export function parseNavigationParams(
  search: string,
  defaultTab: NavTab = 'explore',
): UrlNavigationState {
  const params = new URLSearchParams(search);
  const rawTab = params.get('tab');
  const tab: NavTab = isValidTab(rawTab) ? rawTab : defaultTab;
  const city = params.get('city') || null;
  const uni = params.get('uni') || null;
  const pensionId = params.get('pension') || null;
  const isFiltersOpen = params.get('filters') === 'true';
  const reviewsPensionId = params.get('reviews') || null;
  const publishReviewPensionId = params.get('publish_review') || null;

  return {
    tab,
    city,
    uni,
    pensionId,
    isFiltersOpen,
    reviewsPensionId,
    publishReviewPensionId,
  };
}

export function parseSearchParams(
  params: Record<string, string | string[] | undefined>,
  defaultTab: NavTab = 'explore',
): UrlNavigationState {
  const getSingle = (val: string | string[] | undefined): string | null => {
    if (typeof val === 'string') return val;
    if (Array.isArray(val) && val.length > 0 && typeof val[0] === 'string') return val[0];
    return null;
  };

  const rawTab = getSingle(params.tab);
  const tab: NavTab = isValidTab(rawTab) ? rawTab : defaultTab;
  const city = getSingle(params.city);
  const uni = getSingle(params.uni);
  const pensionId = getSingle(params.pension);
  const isFiltersOpen = getSingle(params.filters) === 'true';
  const reviewsPensionId = getSingle(params.reviews);
  const publishReviewPensionId = getSingle(params.publish_review);

  return {
    tab,
    city,
    uni,
    pensionId,
    isFiltersOpen,
    reviewsPensionId,
    publishReviewPensionId,
  };
}

export function serializeNavigationParams(state: UrlNavigationState): string {
  const params = new URLSearchParams();
  if (state.tab) {
    params.set('tab', state.tab);
  }
  if (state.city) {
    params.set('city', state.city);
  }
  if (state.uni) {
    params.set('uni', state.uni);
  }
  if (state.pensionId) {
    params.set('pension', state.pensionId);
  }
  if (state.isFiltersOpen) {
    params.set('filters', 'true');
  }
  if (state.reviewsPensionId) {
    params.set('reviews', state.reviewsPensionId);
  }
  if (state.publishReviewPensionId) {
    params.set('publish_review', state.publishReviewPensionId);
  }
  const query = params.toString();
  return query ? `?${query}` : '';
}

export function buildNavigationUrl(
  basePath: string,
  state: UrlNavigationState,
  overrides?: Partial<UrlNavigationState>,
): string {
  const merged: UrlNavigationState = { ...state, ...overrides };
  const query = serializeNavigationParams(merged);
  const cleanPath = basePath || '/';
  return `${cleanPath}${query}`;
}
