'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { z } from 'zod';
import { isApiSuccess } from '@/lib/api-response';
import { useAuth } from '@/lib/auth-context';
import type { PensionReview } from '@/lib/types';
import { reviewsService } from '@/services/reviews.service';
import type { ReviewItemDto } from '@/types/api-contracts';

export const createReviewSchema = z
  .object({
    rating: z
      .number()
      .int()
      .min(1, 'La calificación mínima es 1')
      .max(5, 'La calificación máxima es 5')
      .optional(),
    overallRating: z
      .number()
      .int()
      .min(1, 'La calificación mínima es 1')
      .max(5, 'La calificación máxima es 5')
      .optional(),
    comment: z.string().trim().min(15, 'El comentario debe tener al menos 15 caracteres'),
    cleanlinessRating: z.number().int().min(1).max(5).optional(),
    landlordRating: z.number().int().min(1).max(5).optional(),
    locationRating: z.number().int().min(1).max(5).optional(),
    quietnessRating: z.number().int().min(1).max(5).optional(),
    wifiRating: z.number().int().min(1).max(5).optional(),
    stayDuration: z.string().optional(),
    stayDurationCategory: z
      .enum(['FEW_DAYS', 'FEW_WEEKS', 'ONE_SEMESTER', 'ONE_YEAR', 'MORE_THAN_A_YEAR'])
      .optional(),
    roomType: z.string().optional(),
    images: z.array(z.string()).max(3, 'Máximo 3 fotos permitidas').optional().default([]),
  })
  .refine((data) => data.rating !== undefined || data.overallRating !== undefined, {
    message: 'La calificación es obligatoria',
    path: ['rating'],
  });

export type CreateReviewInput = z.infer<typeof createReviewSchema>;

function useOptionalAuthUser() {
  try {
    const auth = useAuth();
    return auth.user;
  } catch {
    if (typeof window === 'undefined') return null;
    try {
      const savedUser = localStorage.getItem('tunido_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  }
}

export function usePensionReviews(
  pensionId: string | null,
  fallbackRating?: { average?: number; count?: number },
) {
  const user = useOptionalAuthUser();
  const [rawItems, setRawItems] = useState<ReviewItemDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userVotes, setUserVotes] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let isMounted = true;
    if (!user) {
      setUserVotes({});
      return;
    }

    async function loadUserVotes() {
      try {
        const res = await reviewsService.fetchUserHelpfulVotes();
        if (isMounted && isApiSuccess(res)) {
          const voteMap: Record<string, boolean> = {};
          for (const id of res.data.reviewIds) {
            voteMap[id] = true;
          }
          setUserVotes(voteMap);
        }
      } catch {
        // ignore
      }
    }

    loadUserVotes();
    return () => {
      isMounted = false;
    };
  }, [user]);

  const loadReviews = useCallback(async () => {
    if (!pensionId) {
      setRawItems([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const res = await reviewsService.fetchPensionReviews(pensionId);
      if (isApiSuccess(res)) {
        setRawItems(res.data.items);
      } else {
        setError(res.message);
      }
    } catch {
      setError('Error al cargar reseñas');
    } finally {
      setIsLoading(false);
    }
  }, [pensionId]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const reviews: PensionReview[] = useMemo(() => {
    return rawItems.map((r) => {
      const firstName = r.user?.firstName || r.userName?.split(' ')[0] || 'Estudiante';
      const lastName = r.user?.lastName || r.userName?.split(' ').slice(1).join(' ') || '';

      const rawOverall = (r as unknown as { overallRating?: number }).overallRating;
      const score =
        typeof r.rating === 'number' && !Number.isNaN(r.rating)
          ? r.rating
          : typeof rawOverall === 'number' && !Number.isNaN(rawOverall)
            ? rawOverall
            : 5;

      const isVoted = userVotes[r.id] !== undefined ? userVotes[r.id] : Boolean(r.userVoted);

      return {
        id: r.id,
        pensionId: r.pensionId,
        overallRating: score,
        rating: score,
        cleanlinessRating: r.cleanlinessRating,
        landlordRating: r.landlordRating,
        quietnessRating: r.locationRating,
        wifiRating: undefined,
        comment: r.comment,
        stayDurationCategory: r.stayDuration,
        stayDuration: r.stayDuration,
        isResidentVerified: true,
        helpfulCount: r.helpfulCount ?? 0,
        userVoted: isVoted,
        images: r.images ?? [],
        createdAt: r.createdAt,
        user: {
          id: r.user?.id || r.userId,
          firstName,
          lastName,
          avatarUrl: r.user?.avatarUrl ?? undefined,
          university: r.user?.university
            ? {
                name: r.user.university.name,
                shortName: r.user.university.shortName ?? undefined,
              }
            : undefined,
        },
      };
    });
  }, [rawItems, userVotes]);

  const ratingStats = useMemo(() => {
    if (rawItems.length === 0) {
      return {
        average: fallbackRating?.average ?? 0,
        count: fallbackRating?.count ?? 0,
      };
    }
    const sum = rawItems.reduce((acc, r) => {
      const rawOverall = (r as unknown as { overallRating?: number }).overallRating;
      const score =
        typeof r.rating === 'number' && !Number.isNaN(r.rating)
          ? r.rating
          : typeof rawOverall === 'number' && !Number.isNaN(rawOverall)
            ? rawOverall
            : 0;
      return acc + score;
    }, 0);
    const calculatedAvg = Math.round((sum / rawItems.length) * 10) / 10;
    return {
      average: calculatedAvg > 0 ? calculatedAvg : (fallbackRating?.average ?? 0),
      count: rawItems.length > 0 ? rawItems.length : (fallbackRating?.count ?? 0),
    };
  }, [rawItems, fallbackRating]);

  const publishReview = useCallback(
    async (
      input: CreateReviewInput,
    ): Promise<{ success: boolean; review?: ReviewItemDto; error?: string }> => {
      if (!pensionId) {
        return { success: false, error: 'ID de pensión no especificado' };
      }

      const parsed = createReviewSchema.safeParse(input);
      if (!parsed.success) {
        const errorMsg = parsed.error.issues[0]?.message || 'Datos de reseña inválidos';
        return { success: false, error: errorMsg };
      }

      try {
        const payload = parsed.data;
        const score = payload.overallRating ?? payload.rating ?? 5;
        const durationCategory =
          payload.stayDurationCategory ??
          (payload.stayDuration as
            | 'FEW_DAYS'
            | 'FEW_WEEKS'
            | 'ONE_SEMESTER'
            | 'ONE_YEAR'
            | 'MORE_THAN_A_YEAR'
            | undefined);

        const res = await reviewsService.createReview(pensionId, {
          overallRating: score,
          comment: payload.comment,
          cleanlinessRating: payload.cleanlinessRating,
          landlordRating: payload.landlordRating,
          quietnessRating: payload.quietnessRating ?? payload.locationRating,
          wifiRating: payload.wifiRating,
          images: payload.images,
          stayDurationCategory: durationCategory,
        });

        if (isApiSuccess(res)) {
          setRawItems((prev) => [res.data, ...prev]);
          return { success: true, review: res.data };
        }

        return { success: false, error: res.message };
      } catch {
        return { success: false, error: 'Error al publicar la reseña' };
      }
    },
    [pensionId],
  );

  const voteReviewHelpful = useCallback(
    async (reviewId: string): Promise<boolean> => {
      const currentItem = rawItems.find((r) => r.id === reviewId);
      const previousVoted =
        userVotes[reviewId] !== undefined ? userVotes[reviewId] : Boolean(currentItem?.userVoted);
      const nextVoted = !previousVoted;
      const previousCount = currentItem?.helpfulCount ?? 0;
      const optimisticCount = Math.max(0, previousCount + (nextVoted ? 1 : -1));

      setUserVotes((prev) => ({ ...prev, [reviewId]: nextVoted }));
      setRawItems((prev) =>
        prev.map((r) =>
          r.id === reviewId
            ? {
                ...r,
                helpfulCount: optimisticCount,
                userVoted: nextVoted,
              }
            : r,
        ),
      );

      try {
        const res = await reviewsService.voteReviewHelpful(reviewId);
        if (!isApiSuccess(res)) {
          setUserVotes((prev) => ({ ...prev, [reviewId]: previousVoted }));
          setRawItems((prev) =>
            prev.map((r) =>
              r.id === reviewId
                ? {
                    ...r,
                    helpfulCount: previousCount,
                    userVoted: previousVoted,
                  }
                : r,
            ),
          );
          return false;
        }

        const serverCount = res.data.helpfulCount;
        const serverVoted = res.data.voted;
        setUserVotes((prev) => ({ ...prev, [reviewId]: serverVoted }));
        setRawItems((prev) =>
          prev.map((r) =>
            r.id === reviewId
              ? {
                  ...r,
                  helpfulCount: serverCount,
                  userVoted: serverVoted,
                }
              : r,
          ),
        );
        return true;
      } catch {
        setUserVotes((prev) => ({ ...prev, [reviewId]: previousVoted }));
        setRawItems((prev) =>
          prev.map((r) =>
            r.id === reviewId
              ? {
                  ...r,
                  helpfulCount: previousCount,
                  userVoted: previousVoted,
                }
              : r,
          ),
        );
        return false;
      }
    },
    [userVotes, rawItems],
  );

  return {
    reviews,
    rawItems,
    ratingStats,
    isLoading,
    error,
    userVotes,
    publishReview,
    voteHelpful: voteReviewHelpful,
    voteReviewHelpful,
    refetch: loadReviews,
    refreshReviews: loadReviews,
  };
}
