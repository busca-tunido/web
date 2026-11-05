import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useFavoriteAction } from '@/hooks/use-favorite-action';

const mockUseAuth = vi.fn();
const mockOpenAuthModal = vi.fn();

vi.mock('@/lib/auth-context', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('@/contexts/navigation-context', () => ({
  useOptionalNavigation: () => ({
    openAuthModal: mockOpenAuthModal,
  }),
}));

describe('useFavoriteAction', () => {
  const mockToggleFavorite = vi.fn();
  const mockIsFavorite = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('when unauthenticated', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: null,
        isFavorite: mockIsFavorite,
        toggleFavorite: mockToggleFavorite,
      });
    });

    it('returns UNAUTHENTICATED state and isFavorite always returns false', () => {
      mockIsFavorite.mockReturnValue(true);
      const { result } = renderHook(() => useFavoriteAction());

      expect(result.current.state).toBe('UNAUTHENTICATED');
      expect(result.current.isFavorite('pension-1')).toBe(false);
      expect(mockIsFavorite).not.toHaveBeenCalled();
    });

    it('opens auth modal and stops event propagation without calling toggleFavorite', () => {
      const { result } = renderHook(() => useFavoriteAction());
      const mockStopPropagation = vi.fn();
      const mockPreventDefault = vi.fn();
      const mockEvent = {
        stopPropagation: mockStopPropagation,
        preventDefault: mockPreventDefault,
      } as unknown as React.MouseEvent;

      act(() => {
        result.current.onFavoriteClick('pension-1', mockEvent);
      });

      expect(mockStopPropagation).toHaveBeenCalledTimes(1);
      expect(mockPreventDefault).toHaveBeenCalledTimes(1);
      expect(mockOpenAuthModal).toHaveBeenCalledTimes(1);
      expect(mockToggleFavorite).not.toHaveBeenCalled();
    });
  });

  describe('when authenticated', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: { id: 'usr-123', email: 'test@example.com' },
        isFavorite: mockIsFavorite,
        toggleFavorite: mockToggleFavorite,
      });
    });

    it('returns AUTHENTICATED state and delegates isFavorite to auth context', () => {
      mockIsFavorite.mockReturnValue(true);
      const { result } = renderHook(() => useFavoriteAction());

      expect(result.current.state).toBe('AUTHENTICATED');
      expect(result.current.isFavorite('pension-1')).toBe(true);
      expect(mockIsFavorite).toHaveBeenCalledWith('pension-1');
    });

    it('toggles favorite and stops propagation without opening auth modal', () => {
      const { result } = renderHook(() => useFavoriteAction());
      const mockStopPropagation = vi.fn();
      const mockPreventDefault = vi.fn();
      const mockEvent = {
        stopPropagation: mockStopPropagation,
        preventDefault: mockPreventDefault,
      } as unknown as React.MouseEvent;

      act(() => {
        result.current.onFavoriteClick('pension-1', mockEvent);
      });

      expect(mockStopPropagation).toHaveBeenCalledTimes(1);
      expect(mockPreventDefault).toHaveBeenCalledTimes(1);
      expect(mockToggleFavorite).toHaveBeenCalledWith('pension-1');
      expect(mockOpenAuthModal).not.toHaveBeenCalled();
    });
  });
});
