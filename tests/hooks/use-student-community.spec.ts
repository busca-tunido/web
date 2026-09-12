if (!process.env.NEXT_PUBLIC_API_URL) {
  process.env.NEXT_PUBLIC_API_URL = '/api';
}

import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createReviewSchema, usePensionReviews } from '@/hooks/use-pension-reviews';
import {
  formatStayDate,
  formatStayDateRange,
  useStayHistory,
} from '@/hooks/use-stay-history';
import { useStudentFavorites } from '@/hooks/use-student-favorites';
import { createError, createSuccess } from '@/lib/api-response';
import type { PensionItemDto } from '@/types/api-contracts';
import { favoritesService } from '@/services/favorites.service';
import { reviewsService } from '@/services/reviews.service';
import { staysService } from '@/services/stays.service';

const mockPension: PensionItemDto = {
  id: 'pen-1',
  title: 'Residencia Alameda Central',
  city: 'Santiago',
  baseMonthlyPrice: 280000,
};

describe('useStudentFavorites', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('loads student favorites on mount', async () => {
    vi.spyOn(favoritesService, 'fetchStudentFavorites').mockResolvedValue(
      createSuccess([mockPension]),
    );

    const { result } = renderHook(() => useStudentFavorites());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.favorites).toEqual(['pen-1']);
    expect(result.current.favoritePensions).toEqual([mockPension]);
    expect(result.current.isFavorite('pen-1')).toBe(true);
    expect(result.current.isFavorite('pen-999')).toBe(false);
  });

  it('performs optimistic toggling when adding a favorite', async () => {
    vi.spyOn(favoritesService, 'fetchStudentFavorites').mockResolvedValue(
      createSuccess([]),
    );
    const toggleSpy = vi
      .spyOn(favoritesService, 'toggleFavorite')
      .mockResolvedValue(createSuccess({ isFavorite: true }));

    const { result } = renderHook(() => useStudentFavorites());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    let togglePromise: Promise<boolean>;
    act(() => {
      togglePromise = result.current.toggleFavorite('pen-new');
    });

    expect(result.current.favorites).toContain('pen-new');

    await act(async () => {
      await togglePromise;
    });

    expect(toggleSpy).toHaveBeenCalledWith('pen-new', false);
    expect(result.current.favorites).toContain('pen-new');
    expect(result.current.errorMessage).toBeNull();
  });

  it('reverts state and sets error message on toggle error', async () => {
    vi.spyOn(favoritesService, 'fetchStudentFavorites').mockResolvedValue(
      createSuccess([mockPension]),
    );
    vi.spyOn(favoritesService, 'toggleFavorite').mockResolvedValue(
      createError('Error de red', 500),
    );

    const { result } = renderHook(() => useStudentFavorites());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.favorites).toEqual(['pen-1']);

    await act(async () => {
      await result.current.toggleFavorite('pen-1');
    });

    expect(result.current.favorites).toEqual(['pen-1']);
    expect(result.current.favoritePensions).toEqual([mockPension]);
    expect(result.current.errorMessage).toBe(
      'No se pudo actualizar tu lista de favoritos. Reintentando...',
    );

    act(() => {
      result.current.clearError();
    });
    expect(result.current.errorMessage).toBeNull();
  });
});

describe('useStayHistory and Date Formatting', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('formats stay dates and date ranges with Intl.DateTimeFormat', () => {
    const range = formatStayDateRange('2024-03-01', '2024-12-15', 'es-CL');
    expect(range).toContain('hasta');
    expect(range).toContain('2024');

    const formattedDate = formatStayDate('2024-08-20', 'es-CL');
    expect(formattedDate).toContain('2024');
    expect(formattedDate).toContain('agosto');
  });

  it('loads verified stays and splits reviewed vs pending stays', async () => {
    const mockStays = [
      {
        id: 'stay-1',
        pensionId: 'pen-1',
        pensionTitle: 'Pensión Uno',
        pensionCity: 'Santiago',
        roomTitle: 'Habitación Individual',
        startDate: '2024-03-01',
        endDate: '2024-12-15',
        hasReview: false,
        monthlyPaidClp: 280000,
        imageUrl: '/test.jpg',
      },
      {
        id: 'stay-2',
        pensionId: 'pen-2',
        pensionTitle: 'Pensión Dos',
        pensionCity: 'Santiago',
        roomTitle: 'Habitación Compartida',
        startDate: '2023-03-01',
        endDate: '2023-12-15',
        hasReview: true,
        monthlyPaidClp: 250000,
        imageUrl: '/test2.jpg',
      },
    ];

    vi.spyOn(staysService, 'fetchStudentStays').mockResolvedValue(
      createSuccess(mockStays),
    );

    const { result } = renderHook(() => useStayHistory());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.stays).toHaveLength(2);
    expect(result.current.pendingReviewStays).toHaveLength(1);
    expect(result.current.pendingReviewStays[0].id).toBe('stay-1');
    expect(result.current.reviewedStays).toHaveLength(1);
    expect(result.current.reviewedStays[0].id).toBe('stay-2');
  });
});

describe('usePensionReviews & createReviewSchema', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('validates review payload via Zod: rejects comments under 15 characters', () => {
    const invalidShortComment = {
      rating: 5,
      comment: 'Muy buena',
    };
    const result = createReviewSchema.safeParse(invalidShortComment);
    expect(result.success).toBe(false);
  });

  it('validates review payload via Zod: rejects more than 3 images', () => {
    const tooManyImages = {
      rating: 4,
      comment: 'Este comentario tiene más de quince caracteres válidos.',
      images: ['img1.jpg', 'img2.jpg', 'img3.jpg', 'img4.jpg'],
    };
    const result = createReviewSchema.safeParse(tooManyImages);
    expect(result.success).toBe(false);
  });

  it('validates review payload via Zod: accepts valid review', () => {
    const valid = {
      rating: 4,
      comment: 'Excelente ambiente para estudiantes universitarios.',
      images: ['img1.jpg', 'img2.jpg'],
    };
    const result = createReviewSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('loads reviews and handles optimistic helpful voting', async () => {
    const mockReviewItem = {
      id: 'rev-1',
      pensionId: 'pen-1',
      userId: 'usr-1',
      rating: 5,
      comment: 'Excelente lugar para estudiar y descansar tranquilo.',
      helpfulCount: 2,
      createdAt: '2024-05-10T12:00:00Z',
    };

    vi.spyOn(reviewsService, 'fetchPensionReviews').mockResolvedValue(
      createSuccess({
        items: [mockReviewItem],
        total: 1,
        page: 1,
        limit: 10,
        hasMore: false,
      }),
    );
    const voteSpy = vi
      .spyOn(reviewsService, 'voteReviewHelpful')
      .mockResolvedValue(createSuccess({ helpfulCount: 3, voted: true }));

    const { result } = renderHook(() => usePensionReviews('pen-1'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.reviews).toHaveLength(1);
    expect(result.current.reviews[0].helpfulCount).toBe(2);

    let votePromise: Promise<boolean>;
    act(() => {
      votePromise = result.current.voteReviewHelpful('rev-1');
    });

    expect(result.current.reviews[0].helpfulCount).toBe(3);
    expect(result.current.reviews[0].userVoted).toBe(true);

    await act(async () => {
      await votePromise;
    });

    expect(voteSpy).toHaveBeenCalledWith('rev-1');
  });

  it('reverts helpful vote count if backend call fails', async () => {
    const mockReviewItem = {
      id: 'rev-2',
      pensionId: 'pen-1',
      userId: 'usr-2',
      rating: 4,
      comment: 'Muy buena experiencia durante el año académico.',
      helpfulCount: 5,
      createdAt: '2024-05-10T12:00:00Z',
    };

    vi.spyOn(reviewsService, 'fetchPensionReviews').mockResolvedValue(
      createSuccess({
        items: [mockReviewItem],
        total: 1,
        page: 1,
        limit: 10,
        hasMore: false,
      }),
    );
    vi.spyOn(reviewsService, 'voteReviewHelpful').mockResolvedValue(
      createError('Fallo al registrar voto', 500),
    );

    const { result } = renderHook(() => usePensionReviews('pen-1'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.reviews[0].helpfulCount).toBe(5);

    await act(async () => {
      await result.current.voteReviewHelpful('rev-2');
    });

    expect(result.current.reviews[0].helpfulCount).toBe(5);
    expect(result.current.userVotes['rev-2']).toBe(false);
  });
});
