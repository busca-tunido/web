import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  buildNavigationUrl,
  isValidTab,
  parseNavigationParams,
  serializeNavigationParams,
  useUrlNavigationState,
} from '@/hooks/use-url-navigation-state';

describe('useUrlNavigationState and URL serialization', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('parameter parsing and serialization', () => {
    it('validates tab identifiers correctly', () => {
      expect(isValidTab('explore')).toBe(true);
      expect(isValidTab('map')).toBe(true);
      expect(isValidTab('favorites')).toBe(true);
      expect(isValidTab('history')).toBe(true);
      expect(isValidTab('account')).toBe(true);
      expect(isValidTab('invalid')).toBe(false);
      expect(isValidTab('')).toBe(false);
      expect(isValidTab(null)).toBe(false);
    });

    it('parses empty query params with default tab', () => {
      const parsed = parseNavigationParams('');
      expect(parsed).toEqual({
        tab: 'explore',
        city: null,
        uni: null,
        pensionId: null,
        isFiltersOpen: false,
        reviewsPensionId: null,
        publishReviewPensionId: null,
      });
    });

    it('parses custom default tab when none provided', () => {
      const parsed = parseNavigationParams('', 'map');
      expect(parsed.tab).toBe('map');
    });

    it('parses invalid tab falling back to default tab', () => {
      const parsed = parseNavigationParams('?tab=nonexistent', 'favorites');
      expect(parsed.tab).toBe('favorites');
    });

    it('parses all supported URL search parameters', () => {
      const query =
        '?tab=map&city=valparaiso&uni=uv&pension=pen-123&filters=true&reviews=pen-123&publish_review=pen-123';
      const parsed = parseNavigationParams(query);

      expect(parsed.tab).toBe('map');
      expect(parsed.city).toBe('valparaiso');
      expect(parsed.uni).toBe('uv');
      expect(parsed.pensionId).toBe('pen-123');
      expect(parsed.isFiltersOpen).toBe(true);
      expect(parsed.reviewsPensionId).toBe('pen-123');
      expect(parsed.publishReviewPensionId).toBe('pen-123');
    });

    it('serializes navigation state to query string', () => {
      const serialized = serializeNavigationParams({
        tab: 'history',
        city: 'concepcion',
        uni: 'udec',
        pensionId: 'pension-99',
        isFiltersOpen: true,
        reviewsPensionId: 'pension-99',
        publishReviewPensionId: null,
      });

      expect(serialized).toContain('tab=history');
      expect(serialized).toContain('city=concepcion');
      expect(serialized).toContain('uni=udec');
      expect(serialized).toContain('pension=pension-99');
      expect(serialized).toContain('filters=true');
      expect(serialized).toContain('reviews=pension-99');
      expect(serialized).not.toContain('publish_review');
    });

    it('builds full URL with overrides', () => {
      const initial = parseNavigationParams('?tab=explore&city=santiago');
      const url = buildNavigationUrl('/app', initial, {
        tab: 'favorites',
        city: null,
      });

      expect(url).toBe('/app?tab=favorites');
    });
  });

  describe('direct deep linking initialization', () => {
    it('initializes tab from deep link', () => {
      window.history.replaceState(null, '', '/?tab=favorites');
      const { result } = renderHook(() => useUrlNavigationState());

      expect(result.current.tab).toBe('favorites');
      expect(result.current.hasOpenOverlay).toBe(false);
    });

    it('initializes open pension detail drawer from deep link', () => {
      window.history.replaceState(
        null,
        '',
        '/?tab=map&city=valparaiso&uni=uv&pension=pension-uuid-1',
      );
      const { result } = renderHook(() => useUrlNavigationState());

      expect(result.current.tab).toBe('map');
      expect(result.current.city).toBe('valparaiso');
      expect(result.current.uni).toBe('uv');
      expect(result.current.pensionId).toBe('pension-uuid-1');
      expect(result.current.isPensionDetailOpen).toBe(true);
      expect(result.current.hasOpenOverlay).toBe(true);
    });

    it('initializes reviews and filters overlays from deep link', () => {
      window.history.replaceState(
        null,
        '',
        '/?filters=true&reviews=pension-uuid-2',
      );
      const { result } = renderHook(() => useUrlNavigationState());

      expect(result.current.isFiltersOpen).toBe(true);
      expect(result.current.reviewsPensionId).toBe('pension-uuid-2');
      expect(result.current.isReviewsOpen).toBe(true);
      expect(result.current.hasOpenOverlay).toBe(true);
    });
  });

  describe('tab transitions and history deduplication', () => {
    it('navigates tab and pushes state into history', () => {
      const pushStateSpy = vi.spyOn(window.history, 'pushState');
      const { result } = renderHook(() => useUrlNavigationState());

      act(() => {
        result.current.navigateTab('map');
      });

      expect(result.current.tab).toBe('map');
      expect(pushStateSpy).toHaveBeenCalledWith(
        expect.objectContaining({ tunidoOverlay: false }),
        '',
        '/?tab=map',
      );
      expect(window.location.search).toBe('?tab=map');
    });

    it('prevents duplicate consecutive history states when clicking the same tab twice', () => {
      const pushStateSpy = vi.spyOn(window.history, 'pushState');
      const { result } = renderHook(() => useUrlNavigationState());

      act(() => {
        result.current.navigateTab('favorites');
      });
      expect(pushStateSpy).toHaveBeenCalledTimes(1);

      act(() => {
        result.current.navigateTab('favorites');
      });
      expect(pushStateSpy).toHaveBeenCalledTimes(1);
    });

    it('closes open overlays when switching tabs', () => {
      window.history.replaceState(null, '', '/?tab=explore&pension=pension-1');
      const { result } = renderHook(() => useUrlNavigationState());

      expect(result.current.isPensionDetailOpen).toBe(true);

      act(() => {
        result.current.navigateTab('account');
      });

      expect(result.current.tab).toBe('account');
      expect(result.current.pensionId).toBeNull();
      expect(result.current.isPensionDetailOpen).toBe(false);
      expect(window.location.search).toBe('?tab=account');
    });
  });

  describe('overlay lifecycle and history stack operations', () => {
    it('opens and closes pension detail drawer', () => {
      const pushStateSpy = vi.spyOn(window.history, 'pushState');
      const backSpy = vi.spyOn(window.history, 'back');
      const { result } = renderHook(() => useUrlNavigationState());

      act(() => {
        result.current.openPensionDetail('pen-abc');
      });

      expect(result.current.pensionId).toBe('pen-abc');
      expect(result.current.isPensionDetailOpen).toBe(true);
      expect(pushStateSpy).toHaveBeenCalledWith(
        expect.objectContaining({ tunidoOverlay: true }),
        '',
        '/?tab=explore&pension=pen-abc',
      );

      act(() => {
        result.current.closePensionDetail();
      });

      expect(backSpy).toHaveBeenCalledTimes(1);
    });

    it('safely replaces URL without history.back if overlay was deep-linked without prior in-session history', () => {
      window.history.replaceState(null, '', '/?tab=explore&pension=direct-123');
      const replaceStateSpy = vi.spyOn(window.history, 'replaceState');
      const backSpy = vi.spyOn(window.history, 'back');

      const { result } = renderHook(() => useUrlNavigationState());

      act(() => {
        result.current.closePensionDetail();
      });

      expect(backSpy).not.toHaveBeenCalled();
      expect(replaceStateSpy).toHaveBeenCalledWith(
        expect.objectContaining({ tunidoOverlay: false }),
        '',
        '/?tab=explore',
      );
      expect(result.current.pensionId).toBeNull();
    });

    it('opens and closes filters drawer', () => {
      const pushStateSpy = vi.spyOn(window.history, 'pushState');
      const backSpy = vi.spyOn(window.history, 'back');
      const { result } = renderHook(() => useUrlNavigationState());

      act(() => {
        result.current.openFilters();
      });

      expect(result.current.isFiltersOpen).toBe(true);
      expect(pushStateSpy).toHaveBeenCalledWith(
        expect.objectContaining({ tunidoOverlay: true }),
        '',
        '/?tab=explore&filters=true',
      );

      act(() => {
        result.current.closeFilters();
      });

      expect(backSpy).toHaveBeenCalledTimes(1);
    });

    it('opens and closes reviews modal', () => {
      const pushStateSpy = vi.spyOn(window.history, 'pushState');
      const backSpy = vi.spyOn(window.history, 'back');
      const { result } = renderHook(() => useUrlNavigationState());

      act(() => {
        result.current.openReviews('pension-test');
      });

      expect(result.current.reviewsPensionId).toBe('pension-test');
      expect(result.current.isReviewsOpen).toBe(true);
      expect(pushStateSpy).toHaveBeenCalledWith(
        expect.objectContaining({ tunidoOverlay: true }),
        '',
        '/?tab=explore&pension=pension-test&reviews=pension-test',
      );

      act(() => {
        result.current.closeReviews();
      });

      expect(backSpy).toHaveBeenCalledTimes(1);
    });

    it('opens and closes publish review modal', () => {
      const pushStateSpy = vi.spyOn(window.history, 'pushState');
      const backSpy = vi.spyOn(window.history, 'back');
      const { result } = renderHook(() => useUrlNavigationState());

      act(() => {
        result.current.openPublishReview('pension-test-2');
      });

      expect(result.current.publishReviewPensionId).toBe('pension-test-2');
      expect(result.current.isPublishReviewOpen).toBe(true);
      expect(pushStateSpy).toHaveBeenCalled();

      act(() => {
        result.current.closePublishReview();
      });

      expect(backSpy).toHaveBeenCalledTimes(1);
    });

    it('closes all overlays at once', () => {
      const { result } = renderHook(() => useUrlNavigationState());

      act(() => {
        result.current.openPensionDetail('pension-1');
        result.current.openFilters();
      });

      expect(result.current.hasOpenOverlay).toBe(true);

      act(() => {
        result.current.closeAllOverlays();
      });

      expect(result.current.pensionId).toBeNull();
      expect(result.current.isFiltersOpen).toBe(false);
      expect(result.current.hasOpenOverlay).toBe(false);
    });
  });

  describe('popstate browser back and forward coordination', () => {
    it('closes overlays in reverse order before switching tabs on browser back', () => {
      const { result } = renderHook(() => useUrlNavigationState());

      act(() => {
        result.current.navigateTab('map');
      });
      expect(result.current.tab).toBe('map');

      act(() => {
        result.current.openPensionDetail('pension-step-1');
      });
      expect(result.current.pensionId).toBe('pension-step-1');

      act(() => {
        result.current.openReviews('pension-step-1');
      });
      expect(result.current.reviewsPensionId).toBe('pension-step-1');

      act(() => {
        window.history.replaceState(null, '', '/?tab=map&pension=pension-step-1');
        window.dispatchEvent(new PopStateEvent('popstate'));
      });

      expect(result.current.reviewsPensionId).toBeNull();
      expect(result.current.isReviewsOpen).toBe(false);
      expect(result.current.pensionId).toBe('pension-step-1');
      expect(result.current.isPensionDetailOpen).toBe(true);
      expect(result.current.tab).toBe('map');

      act(() => {
        window.history.replaceState(null, '', '/?tab=map');
        window.dispatchEvent(new PopStateEvent('popstate'));
      });

      expect(result.current.pensionId).toBeNull();
      expect(result.current.isPensionDetailOpen).toBe(false);
      expect(result.current.tab).toBe('map');

      act(() => {
        window.history.replaceState(null, '', '/?tab=explore');
        window.dispatchEvent(new PopStateEvent('popstate'));
      });

      expect(result.current.tab).toBe('explore');
    });
  });

  describe('city and university query parameters', () => {
    it('sets city using replaceState by default', () => {
      const replaceStateSpy = vi.spyOn(window.history, 'replaceState');
      const { result } = renderHook(() => useUrlNavigationState());

      act(() => {
        result.current.setCity('valparaiso');
      });

      expect(result.current.city).toBe('valparaiso');
      expect(replaceStateSpy).toHaveBeenCalledWith(
        expect.anything(),
        '',
        '/?tab=explore&city=valparaiso',
      );
    });

    it('sets uni using replaceState by default', () => {
      const replaceStateSpy = vi.spyOn(window.history, 'replaceState');
      const { result } = renderHook(() => useUrlNavigationState());

      act(() => {
        result.current.setUni('uv');
      });

      expect(result.current.uni).toBe('uv');
      expect(replaceStateSpy).toHaveBeenCalled();
    });

    it('sets city and uni simultaneously', () => {
      const { result } = renderHook(() => useUrlNavigationState());

      act(() => {
        result.current.setCityAndUni({ city: 'concepcion', uni: 'udec' });
      });

      expect(result.current.city).toBe('concepcion');
      expect(result.current.uni).toBe('udec');
      expect(window.location.search).toContain('city=concepcion');
      expect(window.location.search).toContain('uni=udec');
    });

    it('can build navigation url on demand', () => {
      const { result } = renderHook(() => useUrlNavigationState());

      const url = result.current.buildUrl({ tab: 'history', city: 'iquique' });
      expect(url).toContain('tab=history');
      expect(url).toContain('city=iquique');
    });
  });
});
