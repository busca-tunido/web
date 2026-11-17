'use client';

import {
  AlertCircle,
  Camera,
  Droplets,
  HeartHandshake,
  Moon,
  RefreshCw,
  Star,
  Wifi,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ReviewCard } from '@/components/reviews/review-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FullScreenImageViewer } from '@/components/ui/fullscreen-image-viewer';
import { ReviewsSkeleton } from '@/components/ui/skeletons/reviews-skeleton';
import { usePensionReviews } from '@/hooks/use-pension-reviews';
import { isApiSuccess } from '@/lib/api-response';
import type { PensionDetailDto, PensionItem } from '@/lib/types';
import { cn } from '@/lib/utils';
import { pensionsService } from '@/services/pensions.service';

export type LandlordReviewsScreenProps = {
  pensionId?: string;
  pension?: PensionItem | PensionDetailDto | null;
  className?: string;
};

type ReviewFilterType = 'ALL' | 'WITH_PHOTOS' | '5_STARS' | '4_PLUS' | 'LOW_RATING' | 'LONG_STAY';

function getSatisfactionLabel(
  score: number,
  count: number,
): {
  label: string;
  variant: 'default' | 'secondary' | 'outline' | 'destructive';
  colorClass: string;
} {
  if (count === 0 || score === 0) {
    return {
      label: 'Sin datos',
      variant: 'secondary',
      colorClass: 'text-muted-foreground',
    };
  }
  if (score >= 4.5) {
    return {
      label: 'Excelente',
      variant: 'outline',
      colorClass: 'text-foreground bg-muted/40 border-border',
    };
  }
  if (score >= 4.0) {
    return {
      label: 'Muy Bueno',
      variant: 'outline',
      colorClass: 'text-foreground bg-muted/40 border-border',
    };
  }
  if (score >= 3.0) {
    return {
      label: 'Aceptable',
      variant: 'outline',
      colorClass: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/30',
    };
  }
  return {
    label: 'Por Mejorar',
    variant: 'destructive',
    colorClass: 'text-destructive bg-destructive/10 border-destructive/30',
  };
}

export function LandlordReviewsScreen({
  pensionId: propPensionId,
  pension: initialPension = null,
  className,
}: LandlordReviewsScreenProps) {
  const [activePension, setActivePension] = useState<PensionDetailDto | PensionItem | null>(
    initialPension,
  );
  const [activeFilter, setActiveFilter] = useState<ReviewFilterType>('ALL');
  const [viewerState, setViewerState] = useState<{
    images: string[];
    initialIndex: number;
    title?: string;
  } | null>(null);

  const effectivePensionId = propPensionId || activePension?.id || '';

  const {
    reviews,
    rawItems,
    ratingStats,
    isLoading: isLoadingReviews,
    error: reviewsError,
    userVotes,
    voteHelpful,
    refetch: reloadReviews,
  } = usePensionReviews(effectivePensionId || null, {
    average:
      activePension?.ratingAverage ?? (activePension as PensionDetailDto)?.averageRating ?? 0,
    count: activePension?.reviewsCount ?? (activePension as PensionDetailDto)?.ratingCount ?? 0,
  });

  const loadPensionIfMissing = useCallback(async () => {
    if (activePension || effectivePensionId) return;
    const mineRes = await pensionsService.fetchMinePensions();
    if (isApiSuccess(mineRes) && mineRes.data.length > 0) {
      setActivePension(mineRes.data[0]);
    }
  }, [activePension, effectivePensionId]);

  useEffect(() => {
    loadPensionIfMissing();
  }, [loadPensionIfMissing]);

  const satisfactionMetrics = useMemo(() => {
    let cleanSum = 0;
    let cleanCount = 0;
    let landlordSum = 0;
    let landlordCount = 0;
    let quietSum = 0;
    let quietCount = 0;
    let wifiSum = 0;
    let wifiCount = 0;

    for (const r of rawItems) {
      const raw = r as unknown as {
        cleanlinessRating?: number | null;
        landlordRating?: number | null;
        quietnessRating?: number | null;
        locationRating?: number | null;
        wifiRating?: number | null;
      };

      const clean = raw.cleanlinessRating ?? r.cleanlinessRating;
      if (typeof clean === 'number' && clean > 0) {
        cleanSum += clean;
        cleanCount++;
      }

      const land = raw.landlordRating ?? r.landlordRating;
      if (typeof land === 'number' && land > 0) {
        landlordSum += land;
        landlordCount++;
      }

      const quiet = raw.quietnessRating ?? raw.locationRating ?? r.locationRating;
      if (typeof quiet === 'number' && quiet > 0) {
        quietSum += quiet;
        quietCount++;
      }

      const wifi = raw.wifiRating;
      if (typeof wifi === 'number' && wifi > 0) {
        wifiSum += wifi;
        wifiCount++;
      }
    }

    return {
      cleanliness: cleanCount > 0 ? Number((cleanSum / cleanCount).toFixed(1)) : 0,
      cleanlinessCount: cleanCount,
      landlord: landlordCount > 0 ? Number((landlordSum / landlordCount).toFixed(1)) : 0,
      landlordCount,
      quietness: quietCount > 0 ? Number((quietSum / quietCount).toFixed(1)) : 0,
      quietnessCount: quietCount,
      wifi: wifiCount > 0 ? Number((wifiSum / wifiCount).toFixed(1)) : 0,
      wifiCount,
    };
  }, [rawItems]);

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

  const countsSummary = useMemo(() => {
    const withPhotos = reviews.filter((r) => (r.images?.length ?? 0) > 0).length;
    const count5 = reviews.filter((r) => (r.overallRating ?? r.rating ?? 5) >= 5).length;
    const count4Plus = reviews.filter((r) => (r.overallRating ?? r.rating ?? 5) >= 4).length;
    const countLow = reviews.filter((r) => (r.overallRating ?? r.rating ?? 5) < 4).length;
    const countLong = reviews.filter((r) => {
      const dur = r.stayDurationCategory || r.stayDuration;
      return dur === 'ONE_YEAR' || dur === 'MORE_THAN_A_YEAR';
    }).length;

    return {
      all: reviews.length,
      withPhotos,
      count5,
      count4Plus,
      countLow,
      countLong,
    };
  }, [reviews]);

  const averageRatingValue = ratingStats.average > 0 ? ratingStats.average : 0;
  const totalReviewsCount = ratingStats.count > 0 ? ratingStats.count : reviews.length;

  return (
    <div className={cn('flex flex-col gap-5 pb-24 text-left', className)}>
      <div className="flex flex-col gap-1 px-1">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold tracking-tight text-foreground sm:text-xl">
            Reseñas
          </h2>
          {totalReviewsCount > 0 && (
            <Badge
              variant="outline"
              className="border-border/80 text-foreground text-xs font-normal px-2.5 py-0.5"
            >
              {totalReviewsCount} {totalReviewsCount === 1 ? 'reseña' : 'reseñas'}
            </Badge>
          )}
        </div>
      </div>

      <Card className="border-border/70 bg-card shadow-none rounded-xl overflow-hidden">
        <CardHeader className="p-4 sm:p-5 pb-3 border-b border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Star className="h-5 w-5 fill-amber-400 text-amber-400 shrink-0" />
              <CardTitle className="text-sm font-semibold text-foreground">
                Calificaciones por Área
              </CardTitle>
            </div>

            <div className="flex items-center gap-1.5 rounded-lg bg-muted/30 px-2.5 py-1 border border-border/60">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="text-sm font-bold text-foreground tabular-nums">
                {averageRatingValue > 0 ? averageRatingValue.toFixed(1) : 'Nuevo'}
              </span>
              <span className="text-[10px] text-muted-foreground">/ 5.0</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-lg border border-border/60 bg-muted/10 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Droplets className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-xs font-semibold text-foreground">Limpieza</span>
                </div>

                {(() => {
                  const info = getSatisfactionLabel(
                    satisfactionMetrics.cleanliness,
                    satisfactionMetrics.cleanlinessCount,
                  );
                  return (
                    <Badge
                      variant={info.variant}
                      className={cn('text-[10px] font-medium border', info.colorClass)}
                    >
                      {info.label}
                    </Badge>
                  );
                })()}
              </div>

              <div className="flex items-center gap-2.5 pt-1">
                <div className="relative flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full bg-zinc-700 dark:bg-zinc-300 rounded-full transition-all duration-500"
                    style={{
                      width: `${(satisfactionMetrics.cleanliness / 5) * 100}%`,
                    }}
                  />
                </div>
                <span className="text-xs font-bold text-foreground w-12 text-right tabular-nums">
                  {satisfactionMetrics.cleanliness > 0
                    ? `${satisfactionMetrics.cleanliness.toFixed(1)} / 5`
                    : '- / 5'}
                </span>
              </div>
            </div>

            <div className="rounded-lg border border-border/60 bg-muted/10 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HeartHandshake className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-xs font-semibold text-foreground">Trato del Anfitrión</span>
                </div>

                {(() => {
                  const info = getSatisfactionLabel(
                    satisfactionMetrics.landlord,
                    satisfactionMetrics.landlordCount,
                  );
                  return (
                    <Badge
                      variant={info.variant}
                      className={cn('text-[10px] font-medium border', info.colorClass)}
                    >
                      {info.label}
                    </Badge>
                  );
                })()}
              </div>

              <div className="flex items-center gap-2.5 pt-1">
                <div className="relative flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full bg-zinc-700 dark:bg-zinc-300 rounded-full transition-all duration-500"
                    style={{
                      width: `${(satisfactionMetrics.landlord / 5) * 100}%`,
                    }}
                  />
                </div>
                <span className="text-xs font-bold text-foreground w-12 text-right tabular-nums">
                  {satisfactionMetrics.landlord > 0
                    ? `${satisfactionMetrics.landlord.toFixed(1)} / 5`
                    : '- / 5'}
                </span>
              </div>
            </div>

            <div className="rounded-lg border border-border/60 bg-muted/10 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Moon className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-xs font-semibold text-foreground">Tranquilidad</span>
                </div>

                {(() => {
                  const info = getSatisfactionLabel(
                    satisfactionMetrics.quietness,
                    satisfactionMetrics.quietnessCount,
                  );
                  return (
                    <Badge
                      variant={info.variant}
                      className={cn('text-[10px] font-medium border', info.colorClass)}
                    >
                      {info.label}
                    </Badge>
                  );
                })()}
              </div>

              <div className="flex items-center gap-2.5 pt-1">
                <div className="relative flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full bg-zinc-700 dark:bg-zinc-300 rounded-full transition-all duration-500"
                    style={{
                      width: `${(satisfactionMetrics.quietness / 5) * 100}%`,
                    }}
                  />
                </div>
                <span className="text-xs font-bold text-foreground w-12 text-right tabular-nums">
                  {satisfactionMetrics.quietness > 0
                    ? `${satisfactionMetrics.quietness.toFixed(1)} / 5`
                    : '- / 5'}
                </span>
              </div>
            </div>

            <div className="rounded-lg border border-border/60 bg-muted/10 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wifi className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-xs font-semibold text-foreground">Conectividad Wi-Fi</span>
                </div>

                {(() => {
                  const info = getSatisfactionLabel(
                    satisfactionMetrics.wifi,
                    satisfactionMetrics.wifiCount,
                  );
                  return (
                    <Badge
                      variant={info.variant}
                      className={cn('text-[10px] font-medium border', info.colorClass)}
                    >
                      {info.label}
                    </Badge>
                  );
                })()}
              </div>

              <div className="flex items-center gap-2.5 pt-1">
                <div className="relative flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full bg-zinc-700 dark:bg-zinc-300 rounded-full transition-all duration-500"
                    style={{
                      width: `${(satisfactionMetrics.wifi / 5) * 100}%`,
                    }}
                  />
                </div>
                <span className="text-xs font-bold text-foreground w-12 text-right tabular-nums">
                  {satisfactionMetrics.wifi > 0
                    ? `${satisfactionMetrics.wifi.toFixed(1)} / 5`
                    : '- / 5'}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border/60 bg-muted/10 p-3 flex flex-col gap-1.5 pt-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
              Distribución de Estrellas
            </span>
            <div className="flex flex-col gap-1">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = starCounts[stars as keyof typeof starCounts] || 0;
                const total = Math.max(reviews.length, 1);
                const percent = Math.round((count / total) * 100);

                return (
                  <div key={`star-bar-${stars}`} className="flex items-center gap-2 text-xs">
                    <span className="w-4 text-right font-bold text-muted-foreground">{stars}</span>
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400 shrink-0" />
                    <div className="relative flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full transition-all duration-300"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="w-10 text-right text-[10px] font-medium text-muted-foreground">
                      {count} ({percent}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm sm:text-base font-bold text-foreground">
            Feed de Reseñas de Estudiantes
          </h3>
          <span className="text-xs text-muted-foreground">
            Mostrando {filteredReviews.length} de {reviews.length}
          </span>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1.5 no-scrollbar -mx-1 px-1 shrink-0">
          <button
            type="button"
            onClick={() => setActiveFilter('ALL')}
            className={cn(
              'min-h-[44px] shrink-0 rounded-full px-3.5 py-1 text-xs font-bold transition cursor-pointer select-none',
              activeFilter === 'ALL'
                ? 'bg-foreground text-background shadow-xs'
                : 'border border-border/80 bg-card text-foreground hover:bg-secondary',
            )}
          >
            Todas ({countsSummary.all})
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('WITH_PHOTOS')}
            className={cn(
              'min-h-[44px] shrink-0 rounded-full px-3.5 py-1 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer select-none',
              activeFilter === 'WITH_PHOTOS'
                ? 'bg-foreground text-background shadow-xs'
                : 'border border-border/80 bg-card text-foreground hover:bg-secondary',
            )}
          >
            <Camera className="h-3.5 w-3.5" />
            <span>Con Fotos ({countsSummary.withPhotos})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('5_STARS')}
            className={cn(
              'min-h-[44px] shrink-0 rounded-full px-3.5 py-1 text-xs font-bold transition cursor-pointer select-none',
              activeFilter === '5_STARS'
                ? 'bg-foreground text-background shadow-xs'
                : 'border border-border/80 bg-card text-foreground hover:bg-secondary',
            )}
          >
            5 Estrellas ({countsSummary.count5})
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('4_PLUS')}
            className={cn(
              'min-h-[44px] shrink-0 rounded-full px-3.5 py-1 text-xs font-bold transition cursor-pointer select-none',
              activeFilter === '4_PLUS'
                ? 'bg-foreground text-background shadow-xs'
                : 'border border-border/80 bg-card text-foreground hover:bg-secondary',
            )}
          >
            4+ Estrellas ({countsSummary.count4Plus})
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('LOW_RATING')}
            className={cn(
              'min-h-[44px] shrink-0 rounded-full px-3.5 py-1 text-xs font-bold transition cursor-pointer select-none',
              activeFilter === 'LOW_RATING'
                ? 'bg-foreground text-background shadow-xs'
                : 'border border-border/80 bg-card text-foreground hover:bg-secondary',
            )}
          >
            Por Mejorar ({countsSummary.countLow})
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('LONG_STAY')}
            className={cn(
              'min-h-[44px] shrink-0 rounded-full px-3.5 py-1 text-xs font-bold transition cursor-pointer select-none',
              activeFilter === 'LONG_STAY'
                ? 'bg-foreground text-background shadow-xs'
                : 'border border-border/80 bg-card text-foreground hover:bg-secondary',
            )}
          >
            Larga Estadía ({countsSummary.countLong})
          </button>
        </div>

        {isLoadingReviews ? (
          <ReviewsSkeleton count={3} />
        ) : reviewsError ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-2xl border border-destructive/20 bg-destructive/5 space-y-3">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <p className="text-xs text-muted-foreground">{reviewsError}</p>
            <Button
              type="button"
              variant="outline"
              onClick={() => reloadReviews()}
              className="min-h-[48px] px-4 text-xs font-semibold cursor-pointer"
            >
              <RefreshCw className="h-4 w-4 mr-1.5" />
              Reintentar
            </Button>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 px-4 text-center rounded-2xl border border-dashed border-border/80 bg-card/50">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground mb-3">
              <Star className="h-6 w-6" />
            </div>
            <h4 className="text-sm font-bold text-foreground">
              {reviews.length === 0
                ? 'Aún no hay reseñas registradas'
                : 'No hay reseñas con este filtro'}
            </h4>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs leading-relaxed">
              {reviews.length === 0
                ? 'Las opiniones y evaluaciones de estudiantes que residan en tu alojamiento aparecerán aquí una vez verificadas.'
                : 'Intenta seleccionar otra categoría de filtro para ver otras opiniones.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {filteredReviews.map((review) => {
              const isLiked = Boolean(userVotes[review.id]);
              const calculatedLikes = Math.max(0, (review.helpfulCount ?? 0) + (isLiked ? 1 : 0));

              return (
                <ReviewCard
                  key={review.id}
                  review={{
                    ...review,
                    isResidentVerified: review.isResidentVerified ?? review.isVerifiedStay,
                  }}
                  isLiked={isLiked}
                  likesCount={calculatedLikes}
                  onToggleHelpful={voteHelpful}
                  onEnlargePhoto={(url, index = 0, allPhotos) => {
                    setViewerState({
                      images: allPhotos && allPhotos.length > 0 ? allPhotos : [url],
                      initialIndex: index,
                      title: `Foto de reseña • ${review.user?.firstName || 'Estudiante'}`,
                    });
                  }}
                  className="shadow-none rounded-xl border-border/70"
                />
              );
            })}
          </div>
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
    </div>
  );
}
