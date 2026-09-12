'use client';

import { useCallback, useEffect, useState } from 'react';
import { z } from 'zod';
import { isApiSuccess } from '@/lib/api-response';
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

export function usePensionReviews(pensionId: string) {
  const [reviews, setReviews] = useState<ReviewItemDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userVotes, setUserVotes] = useState<Record<string, boolean>>({});

  const loadReviews = useCallback(async () => {
    if (!pensionId) {
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const res = await reviewsService.fetchPensionReviews(pensionId);
      if (isApiSuccess(res)) {
        setReviews(res.data.items);
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

  const publishReview = useCallback(
    async (
      input: CreateReviewInput,
    ): Promise<{ success: boolean; review?: ReviewItemDto; error?: string }> => {
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
          setReviews((prev) => [res.data, ...prev]);
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
      const alreadyVoted = Boolean(userVotes[reviewId]);
      const nextVoted = !alreadyVoted;

      setUserVotes((prev) => ({ ...prev, [reviewId]: nextVoted }));
      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId
            ? {
                ...r,
                helpfulCount: Math.max(0, (r.helpfulCount ?? 0) + (nextVoted ? 1 : -1)),
                userVoted: nextVoted,
              }
            : r,
        ),
      );

      try {
        const res = await reviewsService.voteReviewHelpful(reviewId);
        if (!isApiSuccess(res)) {
          setUserVotes((prev) => ({ ...prev, [reviewId]: alreadyVoted }));
          setReviews((prev) =>
            prev.map((r) =>
              r.id === reviewId
                ? {
                    ...r,
                    helpfulCount: Math.max(0, (r.helpfulCount ?? 0) + (alreadyVoted ? 1 : -1)),
                    userVoted: alreadyVoted,
                  }
                : r,
            ),
          );
          return false;
        }
        return true;
      } catch {
        setUserVotes((prev) => ({ ...prev, [reviewId]: alreadyVoted }));
        setReviews((prev) =>
          prev.map((r) =>
            r.id === reviewId
              ? {
                  ...r,
                  helpfulCount: Math.max(0, (r.helpfulCount ?? 0) + (alreadyVoted ? 1 : -1)),
                  userVoted: alreadyVoted,
                }
              : r,
          ),
        );
        return false;
      }
    },
    [userVotes],
  );

  return {
    reviews,
    isLoading,
    error,
    userVotes,
    publishReview,
    voteReviewHelpful,
    refreshReviews: loadReviews,
  };
}
