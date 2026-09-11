'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { NavTab } from '@/lib/types';

export type UrlNavigationState = {
  tab: NavTab;
  city: string | null;
  uni: string | null;
  pensionId: string | null;
  isFiltersOpen: boolean;
  reviewsPensionId: string | null;
  publishReviewPensionId: string | null;
};

export type UseUrlNavigationOptions = {
  defaultTab?: NavTab;
  syncInitialUrl?: boolean;
};

export type UseUrlNavigationReturn = {
  tab: NavTab;
  city: string | null;
  uni: string | null;
  pensionId: string | null;
  isFiltersOpen: boolean;
  reviewsPensionId: string | null;
  publishReviewPensionId: string | null;
  isPensionDetailOpen: boolean;
  isReviewsOpen: boolean;
  isPublishReviewOpen: boolean;
  hasOpenOverlay: boolean;
  navigateTab: (tab: NavTab) => void;
  setTab: (tab: NavTab) => void;
  setCity: (city: string | null, options?: { push?: boolean }) => void;
  setUni: (uni: string | null, options?: { push?: boolean }) => void;
  setCityAndUni: (
    params: { city?: string | null; uni?: string | null },
    options?: { push?: boolean },
  ) => void;
  openPensionDetail: (pensionId: string) => void;
  closePensionDetail: () => void;
  openFilters: () => void;
  closeFilters: () => void;
  openReviews: (pensionId: string) => void;
  closeReviews: () => void;
  openPublishReview: (pensionId: string) => void;
  closePublishReview: () => void;
  closeAllOverlays: () => void;
  buildUrl: (overrides?: Partial<UrlNavigationState>) => string;
};

const VALID_TABS: readonly NavTab[] = [
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

export function useUrlNavigationState(
  options: UseUrlNavigationOptions = {},
): UseUrlNavigationReturn {
  const { defaultTab = 'explore', syncInitialUrl = false } = options;

  const [state, setState] = useState<UrlNavigationState>(() => {
    if (typeof window === 'undefined') {
      return {
        tab: defaultTab,
        city: null,
        uni: null,
        pensionId: null,
        isFiltersOpen: false,
        reviewsPensionId: null,
        publishReviewPensionId: null,
      };
    }
    return parseNavigationParams(window.location.search, defaultTab);
  });

  const overlayDepthRef = useRef<number>(0);
  const stateRef = useRef<UrlNavigationState>(state);
  stateRef.current = state;

  const getPathname = useCallback((): string => {
    if (typeof window === 'undefined') return '/';
    return window.location.pathname || '/';
  }, []);

  const updateHistory = useCallback(
    (
      nextState: UrlNavigationState,
      mode: 'push' | 'replace',
      isOverlayTransition?: boolean,
    ): void => {
      if (typeof window === 'undefined') return;
      const url = buildNavigationUrl(getPathname(), nextState);
      const currentFullUrl = `${window.location.pathname}${window.location.search}`;

      if (url === currentFullUrl) return;

      const historyData = {
        ...(window.history.state ?? {}),
        tunidoOverlay: isOverlayTransition ?? false,
        tunidoDepth: overlayDepthRef.current,
      };

      if (mode === 'push') {
        window.history.pushState(historyData, '', url);
      } else {
        window.history.replaceState(historyData, '', url);
      }
    },
    [getPathname],
  );

  const navigateTab = useCallback(
    (tab: NavTab): void => {
      const hasAnyOverlay =
        Boolean(stateRef.current.pensionId) ||
        stateRef.current.isFiltersOpen ||
        Boolean(stateRef.current.reviewsPensionId) ||
        Boolean(stateRef.current.publishReviewPensionId);

      if (stateRef.current.tab === tab && !hasAnyOverlay) {
        return;
      }

      overlayDepthRef.current = 0;
      const nextState: UrlNavigationState = {
        ...stateRef.current,
        tab,
        pensionId: null,
        isFiltersOpen: false,
        reviewsPensionId: null,
        publishReviewPensionId: null,
      };
      updateHistory(nextState, 'push', false);
      setState(nextState);
    },
    [updateHistory],
  );

  const setCity = useCallback(
    (city: string | null, options?: { push?: boolean }): void => {
      const mode = options?.push ? 'push' : 'replace';
      const nextState: UrlNavigationState = {
        ...stateRef.current,
        city,
      };
      updateHistory(nextState, mode, false);
      setState(nextState);
    },
    [updateHistory],
  );

  const setUni = useCallback(
    (uni: string | null, options?: { push?: boolean }): void => {
      const mode = options?.push ? 'push' : 'replace';
      const nextState: UrlNavigationState = {
        ...stateRef.current,
        uni,
      };
      updateHistory(nextState, mode, false);
      setState(nextState);
    },
    [updateHistory],
  );

  const setCityAndUni = useCallback(
    (params: { city?: string | null; uni?: string | null }, options?: { push?: boolean }): void => {
      const mode = options?.push ? 'push' : 'replace';
      const nextState: UrlNavigationState = {
        ...stateRef.current,
        city: params.city !== undefined ? params.city : stateRef.current.city,
        uni: params.uni !== undefined ? params.uni : stateRef.current.uni,
      };
      updateHistory(nextState, mode, false);
      setState(nextState);
    },
    [updateHistory],
  );

  const openPensionDetail = useCallback(
    (pensionId: string): void => {
      if (stateRef.current.pensionId === pensionId) return;
      overlayDepthRef.current += 1;
      const nextState: UrlNavigationState = {
        ...stateRef.current,
        pensionId,
      };
      updateHistory(nextState, 'push', true);
      setState(nextState);
    },
    [updateHistory],
  );

  const closePensionDetail = useCallback((): void => {
    if (!stateRef.current.pensionId) return;
    if (overlayDepthRef.current > 0 && typeof window !== 'undefined') {
      window.history.back();
      return;
    }
    const nextState: UrlNavigationState = {
      ...stateRef.current,
      pensionId: null,
      reviewsPensionId: null,
      publishReviewPensionId: null,
    };
    updateHistory(nextState, 'replace', false);
    setState(nextState);
  }, [updateHistory]);

  const openFilters = useCallback((): void => {
    if (stateRef.current.isFiltersOpen) return;
    overlayDepthRef.current += 1;
    const nextState: UrlNavigationState = {
      ...stateRef.current,
      isFiltersOpen: true,
    };
    updateHistory(nextState, 'push', true);
    setState(nextState);
  }, [updateHistory]);

  const closeFilters = useCallback((): void => {
    if (!stateRef.current.isFiltersOpen) return;
    if (overlayDepthRef.current > 0 && typeof window !== 'undefined') {
      window.history.back();
      return;
    }
    const nextState: UrlNavigationState = {
      ...stateRef.current,
      isFiltersOpen: false,
    };
    updateHistory(nextState, 'replace', false);
    setState(nextState);
  }, [updateHistory]);

  const openReviews = useCallback(
    (pensionId: string): void => {
      if (stateRef.current.reviewsPensionId === pensionId) return;
      overlayDepthRef.current += 1;
      const nextState: UrlNavigationState = {
        ...stateRef.current,
        pensionId: stateRef.current.pensionId || pensionId,
        reviewsPensionId: pensionId,
      };
      updateHistory(nextState, 'push', true);
      setState(nextState);
    },
    [updateHistory],
  );

  const closeReviews = useCallback((): void => {
    if (!stateRef.current.reviewsPensionId) return;
    if (overlayDepthRef.current > 0 && typeof window !== 'undefined') {
      window.history.back();
      return;
    }
    const nextState: UrlNavigationState = {
      ...stateRef.current,
      reviewsPensionId: null,
    };
    updateHistory(nextState, 'replace', false);
    setState(nextState);
  }, [updateHistory]);

  const openPublishReview = useCallback(
    (pensionId: string): void => {
      if (stateRef.current.publishReviewPensionId === pensionId) return;
      overlayDepthRef.current += 1;
      const nextState: UrlNavigationState = {
        ...stateRef.current,
        pensionId: stateRef.current.pensionId || pensionId,
        publishReviewPensionId: pensionId,
      };
      updateHistory(nextState, 'push', true);
      setState(nextState);
    },
    [updateHistory],
  );

  const closePublishReview = useCallback((): void => {
    if (!stateRef.current.publishReviewPensionId) return;
    if (overlayDepthRef.current > 0 && typeof window !== 'undefined') {
      window.history.back();
      return;
    }
    const nextState: UrlNavigationState = {
      ...stateRef.current,
      publishReviewPensionId: null,
    };
    updateHistory(nextState, 'replace', false);
    setState(nextState);
  }, [updateHistory]);

  const closeAllOverlays = useCallback((): void => {
    const hasAnyOverlay =
      Boolean(stateRef.current.pensionId) ||
      stateRef.current.isFiltersOpen ||
      Boolean(stateRef.current.reviewsPensionId) ||
      Boolean(stateRef.current.publishReviewPensionId);

    if (!hasAnyOverlay) return;

    if (overlayDepthRef.current > 0 && typeof window !== 'undefined') {
      const steps = overlayDepthRef.current;
      overlayDepthRef.current = 0;
      window.history.go(-steps);
      return;
    }

    const nextState: UrlNavigationState = {
      ...stateRef.current,
      pensionId: null,
      isFiltersOpen: false,
      reviewsPensionId: null,
      publishReviewPensionId: null,
    };
    updateHistory(nextState, 'replace', false);
    setState(nextState);
  }, [updateHistory]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handlePopState = (): void => {
      const parsed = parseNavigationParams(window.location.search, defaultTab);
      const hasOverlay =
        Boolean(parsed.pensionId) ||
        parsed.isFiltersOpen ||
        Boolean(parsed.reviewsPensionId) ||
        Boolean(parsed.publishReviewPensionId);

      if (!hasOverlay) {
        overlayDepthRef.current = 0;
      } else if (overlayDepthRef.current > 0) {
        overlayDepthRef.current -= 1;
      }

      setState(parsed);
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [defaultTab]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (syncInitialUrl && !window.location.search) {
      updateHistory(stateRef.current, 'replace', false);
    }
  }, [syncInitialUrl, updateHistory]);

  const isPensionDetailOpen = Boolean(state.pensionId);
  const isReviewsOpen = Boolean(state.reviewsPensionId);
  const isPublishReviewOpen = Boolean(state.publishReviewPensionId);
  const hasOpenOverlay =
    isPensionDetailOpen || state.isFiltersOpen || isReviewsOpen || isPublishReviewOpen;

  const buildUrl = useCallback(
    (overrides?: Partial<UrlNavigationState>): string => {
      return buildNavigationUrl(getPathname(), stateRef.current, overrides);
    },
    [getPathname],
  );

  return {
    tab: state.tab,
    city: state.city,
    uni: state.uni,
    pensionId: state.pensionId,
    isFiltersOpen: state.isFiltersOpen,
    reviewsPensionId: state.reviewsPensionId,
    publishReviewPensionId: state.publishReviewPensionId,
    isPensionDetailOpen,
    isReviewsOpen,
    isPublishReviewOpen,
    hasOpenOverlay,
    navigateTab,
    setTab: navigateTab,
    setCity,
    setUni,
    setCityAndUni,
    openPensionDetail,
    closePensionDetail,
    openFilters,
    closeFilters,
    openReviews,
    closeReviews,
    openPublishReview,
    closePublishReview,
    closeAllOverlays,
    buildUrl,
  };
}
