'use client';

import { Camera, Star } from 'lucide-react';
import { Suspense, useMemo, useState } from 'react';
import { EmailCheckStep } from '@/components/auth/email-check-step';
import { FullScreenImageViewer } from '@/components/ui/fullscreen-image-viewer';
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalDescription,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from '@/components/ui/responsive-modal';
import { ReviewsSkeleton } from '@/components/ui/skeletons/reviews-skeleton';
import { usePensionReviews } from '@/hooks/use-pension-reviews';
import { useAuth } from '@/lib/auth-context';
import type { PensionItem, PensionReview } from '@/lib/types';
import { ReviewCard } from './review-card';

type PensionReviewsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  pension: PensionItem;
  reviews: PensionReview[];
};

type FilterCategory = 'ALL' | 'WITH_PHOTOS' | '5_STARS' | '4_PLUS' | 'LOW_RATING' | 'LONG_STAY';

export function PensionReviewsModal({
  isOpen,
  onClose,
  pension,
  reviews,
}: PensionReviewsModalProps) {
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('ALL');
  const [submittingVoteId, setSubmittingVoteId] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [viewerState, setViewerState] = useState<{
    images: string[];
    initialIndex: number;
    title?: string;
  } | null>(null);

  const { voteHelpful, reviews: hookReviews } = usePensionReviews(isOpen ? pension.id : null);
  const activeReviews = hookReviews.length > 0 ? hookReviews : reviews;

  const starCounts = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    for (const r of activeReviews) {
      const score = Math.round(r.overallRating ?? r.rating ?? 5);
      if (score >= 1 && score <= 5) {
        counts[score as keyof typeof counts] = (counts[score as keyof typeof counts] || 0) + 1;
      }
    }
    return counts;
  }, [activeReviews]);

  const categoryAverages = useMemo(() => {
    let cleanSum = 0;
    let landlordSum = 0;
    let quietSum = 0;
    let wifiSum = 0;
    let count = 0;

    for (const r of activeReviews) {
      if (r.cleanlinessRating) cleanSum += r.cleanlinessRating;
      if (r.landlordRating) landlordSum += r.landlordRating;
      if (r.quietnessRating) quietSum += r.quietnessRating;
      if (r.wifiRating) wifiSum += r.wifiRating;
      count++;
    }

    if (count === 0) {
      return {
        cleanliness: 0,
        landlord: 0,
        quietness: 0,
        wifi: 0,
      };
    }

    return {
      cleanliness: Number((cleanSum / count).toFixed(1)),
      landlord: Number((landlordSum / count).toFixed(1)),
      quietness: Number((quietSum / count).toFixed(1)),
      wifi: Number((wifiSum / count).toFixed(1)),
    };
  }, [activeReviews]);

  const filteredReviews = useMemo(() => {
    return activeReviews.filter((r) => {
      const rating = r.overallRating ?? r.rating ?? 5;
      if (activeFilter === 'WITH_PHOTOS') {
        return (r.images?.length ?? 0) > 0;
      }
      if (activeFilter === '5_STARS') {
        return rating >= 5;
      }
      if (activeFilter === '4_PLUS') {
        return rating >= 4;
      }
      if (activeFilter === 'LOW_RATING') {
        return rating < 4;
      }
      if (activeFilter === 'LONG_STAY') {
        const dur = r.stayDurationCategory || r.stayDuration;
        return dur === 'ONE_YEAR' || dur === 'MORE_THAN_A_YEAR';
      }
      return true;
    });
  }, [activeReviews, activeFilter]);

  if (!isOpen) return null;

  const toggleHelpful = async (reviewId: string) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    if (submittingVoteId === reviewId) {
      return;
    }

    setSubmittingVoteId(reviewId);
    try {
      const success = await voteHelpful(reviewId);
      if (!success && !user) {
        setIsAuthModalOpen(true);
      }
    } finally {
      setSubmittingVoteId(null);
    }
  };

  return (
    <>
      <ResponsiveModal open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <ResponsiveModalContent
          showClose={false}
          className="max-w-lg md:max-w-3xl md:max-h-[84vh] mx-auto flex flex-col bg-card border-border select-none md:rounded-3xl"
        >
          <ResponsiveModalHeader className="px-5 py-4 border-b border-border/60 shrink-0 text-left">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <ResponsiveModalTitle className="text-lg font-bold text-foreground">
                  Reseñas de la pensión
                </ResponsiveModalTitle>
                <ResponsiveModalDescription className="text-xs text-muted-foreground mt-0.5 truncate">
                  {pension.title}
                </ResponsiveModalDescription>
              </div>
              {reviews.length > 0 && (
                <span className="shrink-0 rounded-full border border-border/70 bg-muted/40 px-2.5 py-1 text-[11px] font-semibold text-muted-foreground tabular-nums">
                  {reviews.length} {reviews.length === 1 ? 'reseña' : 'reseñas'}
                </span>
              )}
            </div>
          </ResponsiveModalHeader>

          <div className="flex-1 min-h-0 overflow-y-auto scrollbar-subtle px-5 py-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] md:pb-6 flex flex-col gap-5">
            {reviews.length === 0 ? (
              <>
                <div className="flex flex-col items-center justify-center rounded-2xl border border-primary/20 bg-primary/5 p-5 text-center">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl font-black tracking-tight text-foreground tabular-nums">
                      {pension.ratingAverage > 0 ? pension.ratingAverage.toFixed(1) : 'Nuevo'}
                    </span>
                    <div className="flex flex-col items-start">
                      <div className="flex items-center gap-0.5 text-warning">
                        {[1, 2, 3, 4, 5].map((starVal) => (
                          <Star
                            key={`star-${starVal}`}
                            className={`h-4 w-4 ${
                              pension.ratingAverage >= starVal
                                ? 'fill-warning text-warning'
                                : 'text-muted-foreground/30'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs font-semibold text-muted-foreground mt-0.5 tabular-nums">
                        Sin reseñas registradas
                      </span>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-dashed border-border px-8 pt-10 pb-14 text-center text-muted-foreground flex flex-col items-center justify-center">
                  <Star className="h-8 w-8 text-muted-foreground/30 mb-2 -translate-y-0.5" />
                  <p className="text-sm font-semibold text-foreground">
                    Esta pensión aún no tiene reseñas
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                    Las calificaciones y comentarios de estudiantes aparecerán aquí cuando
                    califiquen su estadía.
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="rounded-2xl border border-border/70 bg-muted/35 p-4 grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-4 sm:gap-6 items-center">
                  <div className="flex items-center gap-3 sm:pr-5 sm:border-r sm:border-border/60">
                    <span className="text-4xl font-black tracking-tight text-foreground tabular-nums">
                      {pension.ratingAverage > 0 ? pension.ratingAverage.toFixed(1) : 'Nuevo'}
                    </span>
                    <div className="flex flex-col items-start">
                      <div className="flex items-center gap-0.5 text-warning">
                        {[1, 2, 3, 4, 5].map((starVal) => (
                          <Star
                            key={`star-${starVal}`}
                            className={`h-4 w-4 ${
                              pension.ratingAverage >= starVal
                                ? 'fill-warning text-warning'
                                : 'text-muted-foreground/30'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs font-semibold text-muted-foreground mt-0.5 tabular-nums">
                        {reviews.length}{' '}
                        {reviews.length === 1 ? 'reseña verificada' : 'reseñas verificadas'}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 min-w-0">
                    {[5, 4, 3, 2, 1].map((stars) => {
                      const count = starCounts[stars as keyof typeof starCounts] || 0;
                      const total = Math.max(reviews.length, 1);
                      const percent = Math.round((count / total) * 100);

                      return (
                        <div key={`breakdown-${stars}`} className="flex items-center gap-2 text-xs">
                          <span className="w-4 text-right font-semibold text-muted-foreground tabular-nums">
                            {stars}
                          </span>
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400 shrink-0" />
                          <div className="relative flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full transition-all duration-500"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                          <span className="w-8 text-right text-[11px] text-muted-foreground tabular-nums">
                            {percent}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { label: 'Limpieza', value: categoryAverages.cleanliness },
                    { label: 'Anfitrión', value: categoryAverages.landlord },
                    { label: 'Silencio / Estudio', value: categoryAverages.quietness },
                    { label: 'Wi-Fi', value: categoryAverages.wifi },
                  ].map((aspect) => (
                    <div
                      key={aspect.label}
                      className="flex items-center justify-between gap-2 rounded-xl border border-border/70 bg-muted/35 px-3 py-2.5"
                    >
                      <span className="text-xs font-medium text-muted-foreground truncate">
                        {aspect.label}
                      </span>
                      <span className="text-xs font-bold text-primary tabular-nums shrink-0">
                        {aspect.value}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 overflow-x-auto py-1 no-scrollbar -mx-1 px-1 shrink-0">
                  {[
                    { id: 'ALL' as const, label: `Todas (${reviews.length})` },
                    { id: 'WITH_PHOTOS' as const, label: 'Con fotos', withCamera: true },
                    { id: '5_STARS' as const, label: '5 Estrellas' },
                    { id: 'LOW_RATING' as const, label: 'Bajas calificaciones' },
                    { id: 'LONG_STAY' as const, label: 'Larga Estadía (>1 año)' },
                  ].map((pill) => (
                    <button
                      key={pill.id}
                      type="button"
                      onClick={() => setActiveFilter(pill.id)}
                      className={`shrink-0 flex items-center gap-1 rounded-full px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
                        activeFilter === pill.id
                          ? 'bg-foreground text-background'
                          : 'border border-border bg-muted/30 text-foreground hover:bg-secondary'
                      }`}
                    >
                      {pill.withCamera && <Camera className="h-3.5 w-3.5" />}
                      <span>{pill.label}</span>
                    </button>
                  ))}
                </div>

                <Suspense fallback={<ReviewsSkeleton />}>
                  <ReviewFeedList
                    filteredReviews={filteredReviews}
                    toggleHelpful={toggleHelpful}
                    onEnlargePhoto={(url, index = 0, allPhotos) => {
                      setViewerState({
                        images: allPhotos && allPhotos.length > 0 ? allPhotos : [url],
                        initialIndex: index,
                        title: `Fotos de reseña • ${pension.title}`,
                      });
                    }}
                    submittingVoteId={submittingVoteId}
                  />
                </Suspense>
              </>
            )}
          </div>

          {viewerState && (
            <FullScreenImageViewer
              isOpen={Boolean(viewerState)}
              onClose={() => setViewerState(null)}
              images={viewerState.images}
              initialIndex={viewerState.initialIndex}
              title={viewerState.title}
            />
          )}
        </ResponsiveModalContent>
      </ResponsiveModal>

      {isAuthModalOpen && (
        <ResponsiveModal open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen}>
          <ResponsiveModalContent
            showClose={false}
            className="max-w-md mx-auto p-6 bg-card border-border md:rounded-3xl"
          >
            <ResponsiveModalHeader className="px-0 pb-4 border-b-0 text-left">
              <ResponsiveModalTitle className="text-lg font-bold text-foreground">
                Inicia sesión para votar
              </ResponsiveModalTitle>
              <ResponsiveModalDescription className="text-xs text-muted-foreground">
                Para indicar si una reseña te ha resultado útil, ingresa con tu cuenta universitaria
                de BuscaTuNido.
              </ResponsiveModalDescription>
            </ResponsiveModalHeader>
            <EmailCheckStep onSuccess={() => setIsAuthModalOpen(false)} />
          </ResponsiveModalContent>
        </ResponsiveModal>
      )}
    </>
  );
}

type ReviewFeedListProps = {
  filteredReviews: PensionReview[];
  toggleHelpful: (id: string) => void;
  onEnlargePhoto: (url: string, index?: number, allPhotos?: string[]) => void;
  submittingVoteId: string | null;
};

function ReviewFeedList({
  filteredReviews,
  toggleHelpful,
  onEnlargePhoto,
  submittingVoteId,
}: ReviewFeedListProps) {
  if (filteredReviews.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">
        <p className="text-xs">No hay reseñas con los filtros seleccionados.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {filteredReviews.map((review) => {
        return (
          <ReviewCard
            key={`full-review-${review.id}`}
            review={review}
            isLiked={Boolean(review.userVoted)}
            likesCount={review.helpfulCount ?? 0}
            onToggleHelpful={toggleHelpful}
            onEnlargePhoto={onEnlargePhoto}
            isVoting={submittingVoteId === review.id}
          />
        );
      })}
    </div>
  );
}
