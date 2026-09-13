'use client';

import { Award, Camera, ChevronLeft, Star, X } from 'lucide-react';
import Image from 'next/image';
import { Suspense, useMemo, useState } from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { ReviewsSkeleton } from '@/components/ui/skeletons/reviews-skeleton';
import type { PensionItem, PensionReview } from '@/lib/types';
import { reviewsService } from '@/services/reviews.service';
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
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('ALL');
  const [userLiked, setUserLiked] = useState<Record<string, boolean>>({});
  const [enlargedPhoto, setEnlargedPhoto] = useState<string | null>(null);

  const starCounts = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    for (const r of reviews) {
      const score = Math.round(r.overallRating ?? r.rating ?? 5);
      if (score >= 1 && score <= 5) {
        counts[score as keyof typeof counts] = (counts[score as keyof typeof counts] || 0) + 1;
      }
    }
    return counts;
  }, [reviews]);

  const categoryAverages = useMemo(() => {
    let cleanSum = 0;
    let landlordSum = 0;
    let quietSum = 0;
    let wifiSum = 0;
    let count = 0;

    for (const r of reviews) {
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
  }, [reviews]);

  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
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
  }, [reviews, activeFilter]);

  const toggleHelpful = async (reviewId: string) => {
    setUserLiked((prev) => ({
      ...prev,
      [reviewId]: !prev[reviewId],
    }));
    try {
      await reviewsService.voteReviewHelpful(reviewId);
    } catch {
      setUserLiked((prev) => ({
        ...prev,
        [reviewId]: !prev[reviewId],
      }));
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="max-h-[92dvh] max-w-lg md:max-w-3xl mx-auto flex flex-col bg-background border-border select-none md:rounded-3xl">
        <div className="flex items-center justify-between px-5 py-3 border-b border-border/70 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary hover:bg-secondary/80 text-foreground transition cursor-pointer"
              aria-label="Volver"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div>
              <h3 className="text-base font-bold text-foreground">Reseñas de la pensión</h3>
              <p className="text-[11px] text-muted-foreground truncate max-w-sm">{pension.title}</p>
            </div>
          </div>
        </div>

        <DrawerHeader className="sr-only">
          <DrawerTitle>Reseñas de {pension.title}</DrawerTitle>
          <DrawerDescription>Comentarios y calificaciones de estudiantes</DrawerDescription>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-6">
          <div className="flex flex-col items-center justify-center rounded-2xl border border-primary/20 bg-primary/5 p-5 text-center">
            <div className="flex items-center gap-3">
              <span className="text-4xl font-black tracking-tight text-foreground">
                {pension.ratingAverage > 0 ? pension.ratingAverage.toFixed(1) : 'Nuevo'}
              </span>
              <div className="flex flex-col items-start">
                <div className="flex items-center gap-0.5 text-amber-500">
                  {[1, 2, 3, 4, 5].map((starVal) => (
                    <Star
                      key={`star-${starVal}`}
                      className={`h-4 w-4 ${
                        pension.ratingAverage >= starVal
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-muted-foreground/30'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-semibold text-muted-foreground mt-0.5">
                  {reviews.length > 0
                    ? `${reviews.length} ${reviews.length === 1 ? 'reseña verificada' : 'reseñas verificadas'}`
                    : 'Sin reseñas registradas'}
                </span>
              </div>
            </div>

            {pension.ratingAverage >= 4.5 && reviews.length > 0 && (
              <div className="mt-3.5 flex items-center gap-1.5 rounded-full bg-background px-3 py-1 border border-border text-xs font-semibold text-foreground shadow-xs">
                <Award className="h-3.5 w-3.5 text-primary" />
                <span>Favorito de estudiantes universitarios</span>
              </div>
            )}
          </div>

          {reviews.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground flex flex-col items-center justify-center">
              <Star className="h-8 w-8 text-muted-foreground/30 mb-2" />
              <p className="text-sm font-semibold text-foreground">
                Esta pensión aún no tiene reseñas
              </p>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                Las calificaciones y comentarios de estudiantes aparecerán aquí cuando califiquen su
                estadía.
              </p>
            </div>
          ) : (
            <>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2.5">
                  Desglose de calificaciones
                </h4>
                <div className="flex flex-col gap-1.5">
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const count = starCounts[stars as keyof typeof starCounts] || 0;
                    const total = Math.max(reviews.length, 1);
                    const percent = Math.round((count / total) * 100);

                    return (
                      <div key={`breakdown-${stars}`} className="flex items-center gap-2 text-xs">
                        <span className="w-5 text-right font-semibold text-muted-foreground">
                          {stars}
                        </span>
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400 shrink-0" />
                        <div className="relative flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <span className="w-8 text-right text-[11px] text-muted-foreground">
                          {percent}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="flex flex-col gap-1 rounded-xl border border-border/80 bg-card p-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground">Limpieza</span>
                    <span className="text-xs font-bold text-primary">
                      {categoryAverages.cleanliness}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">Áreas comunes y sanitarios</p>
                </div>

                <div className="flex flex-col gap-1 rounded-xl border border-border/80 bg-card p-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground">Anfitrión</span>
                    <span className="text-xs font-bold text-primary">
                      {categoryAverages.landlord}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">Atención y resolución</p>
                </div>

                <div className="flex flex-col gap-1 rounded-xl border border-border/80 bg-card p-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground">
                      Silencio / Estudio
                    </span>
                    <span className="text-xs font-bold text-primary">
                      {categoryAverages.quietness}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">Ambiente para concentrarse</p>
                </div>

                <div className="flex flex-col gap-1 rounded-xl border border-border/80 bg-card p-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground">
                      Conectividad Wi-Fi
                    </span>
                    <span className="text-xs font-bold text-primary">{categoryAverages.wifi}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">Estabilidad y velocidad</p>
                </div>
              </div>

              <div className="flex gap-2 overflow-x-auto py-1 no-scrollbar -mx-1 px-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveFilter('ALL')}
                  className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
                    activeFilter === 'ALL'
                      ? 'bg-foreground text-background'
                      : 'border border-border bg-card text-foreground hover:bg-secondary'
                  }`}
                >
                  Todas ({reviews.length})
                </button>

                <button
                  type="button"
                  onClick={() => setActiveFilter('WITH_PHOTOS')}
                  className={`shrink-0 flex items-center gap-1 rounded-full px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
                    activeFilter === 'WITH_PHOTOS'
                      ? 'bg-foreground text-background'
                      : 'border border-border bg-card text-foreground hover:bg-secondary'
                  }`}
                >
                  <Camera className="h-3.5 w-3.5" />
                  <span>Con fotos</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveFilter('5_STARS')}
                  className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
                    activeFilter === '5_STARS'
                      ? 'bg-foreground text-background'
                      : 'border border-border bg-card text-foreground hover:bg-secondary'
                  }`}
                >
                  5 Estrellas
                </button>

                <button
                  type="button"
                  onClick={() => setActiveFilter('LOW_RATING')}
                  className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
                    activeFilter === 'LOW_RATING'
                      ? 'bg-foreground text-background'
                      : 'border border-border bg-card text-foreground hover:bg-secondary'
                  }`}
                >
                  Bajas calificaciones
                </button>

                <button
                  type="button"
                  onClick={() => setActiveFilter('LONG_STAY')}
                  className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
                    activeFilter === 'LONG_STAY'
                      ? 'bg-foreground text-background'
                      : 'border border-border bg-card text-foreground hover:bg-secondary'
                  }`}
                >
                  Larga Estadía (&gt;1 año)
                </button>
              </div>

              <Suspense fallback={<ReviewsSkeleton />}>
                <ReviewFeedList
                  filteredReviews={filteredReviews}
                  userLiked={userLiked}
                  toggleHelpful={toggleHelpful}
                  setEnlargedPhoto={setEnlargedPhoto}
                />
              </Suspense>
            </>
          )}
        </div>

        {enlargedPhoto && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Foto ampliada"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
          >
            <button
              type="button"
              aria-label="Cerrar vista previa"
              onClick={() => setEnlargedPhoto(null)}
              className="absolute inset-0 h-full w-full cursor-default"
            />
            <div className="relative max-h-[85vh] max-w-[90vw] aspect-square w-[420px] overflow-hidden rounded-2xl bg-black z-10">
              <Image
                src={enlargedPhoto}
                alt="Foto ampliada"
                fill
                unoptimized
                className="object-contain"
              />
              <button
                type="button"
                onClick={() => setEnlargedPhoto(null)}
                className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
}

type ReviewFeedListProps = {
  filteredReviews: PensionReview[];
  userLiked: Record<string, boolean>;
  toggleHelpful: (id: string) => void;
  setEnlargedPhoto: (url: string | null) => void;
};

function ReviewFeedList({
  filteredReviews,
  userLiked,
  toggleHelpful,
  setEnlargedPhoto,
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
        const isLiked = Boolean(userLiked[review.id]);
        const baseLikes = (review.comment.length % 4) + 1;
        const likesCount = baseLikes + (isLiked ? 1 : 0);

        return (
          <ReviewCard
            key={`full-review-${review.id}`}
            review={review}
            isLiked={isLiked}
            likesCount={likesCount}
            onToggleHelpful={toggleHelpful}
            onEnlargePhoto={setEnlargedPhoto}
          />
        );
      })}
    </div>
  );
}
