'use client';

import {
  AlertCircle,
  Camera,
  CheckCircle2,
  ChevronRight,
  Droplets,
  GraduationCap,
  HeartHandshake,
  Loader2,
  MessageSquare,
  Moon,
  RefreshCw,
  Star,
  ThumbsUp,
  Wifi,
} from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { LandlordProposalsDrawer } from '@/components/landlord/landlord-proposals-drawer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { usePensionReviews } from '@/hooks/use-pension-reviews';
import { isApiSuccess } from '@/lib/api-response';
import type { PensionItem } from '@/lib/types';
import { cn, normalizeImageUrl } from '@/lib/utils';
import { pensionsService } from '@/services/pensions.service';
import { proposalsService } from '@/services/proposals.service';
import type { PensionDetailDto, ProposalDto } from '@/types/api-contracts';

export type LandlordReviewsScreenProps = {
  pensionId?: string;
  pension?: PensionItem | PensionDetailDto | null;
  className?: string;
  onOpenProposals?: () => void;
};

type ReviewFilterType = 'ALL' | 'WITH_PHOTOS' | '5_STARS' | '4_PLUS' | 'LOW_RATING' | 'LONG_STAY';

function formatStayDuration(cat?: string): string {
  switch (cat) {
    case 'FEW_DAYS':
      return 'Estadía de unos días';
    case 'FEW_WEEKS':
      return 'Estadía de varias semanas';
    case 'ONE_SEMESTER':
      return 'Estadía de 1 semestre académico';
    case 'ONE_YEAR':
      return 'Estadía de 1 año universitario';
    case 'MORE_THAN_A_YEAR':
      return 'Estadía de más de 1 año';
    default:
      return 'Estudiante residente';
  }
}

function formatDate(isoString?: string): string {
  if (!isoString) return 'Reciente';
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString('es-CL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return 'Reciente';
  }
}

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
      variant: 'default',
      colorClass: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    };
  }
  if (score >= 4.0) {
    return {
      label: 'Muy Bueno',
      variant: 'outline',
      colorClass: 'text-primary bg-primary/10 border-primary/30',
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
  onOpenProposals,
}: LandlordReviewsScreenProps) {
  const [activePension, setActivePension] = useState<PensionDetailDto | PensionItem | null>(
    initialPension,
  );
  const [isProposalsDrawerOpen, setIsProposalsDrawerOpen] = useState<boolean>(false);
  const [proposals, setProposals] = useState<ProposalDto[]>([]);
  const [_isLoadingProposals, setIsLoadingProposals] = useState<boolean>(false);
  const [activeFilter, setActiveFilter] = useState<ReviewFilterType>('ALL');
  const [enlargedPhotoUrl, setEnlargedPhotoUrl] = useState<string | null>(null);

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

  const loadProposals = useCallback(async () => {
    if (!effectivePensionId) return;
    setIsLoadingProposals(true);
    const res = await proposalsService.fetchPensionProposals(effectivePensionId);
    if (isApiSuccess(res)) {
      setProposals(res.data);
    }
    setIsLoadingProposals(false);
  }, [effectivePensionId]);

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

  useEffect(() => {
    if (effectivePensionId) {
      loadProposals();
    }
  }, [effectivePensionId, loadProposals]);

  const pendingProposals = useMemo(() => {
    return proposals.filter((p) => !p.status || p.status === 'PENDING');
  }, [proposals]);

  const pendingCount = pendingProposals.length;

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

  const handleOpenProposalsDrawer = () => {
    if (onOpenProposals) {
      onOpenProposals();
    } else {
      setIsProposalsDrawerOpen(true);
    }
  };

  const handleProposalReviewed = () => {
    loadProposals();
    reloadReviews();
  };

  const averageRatingValue = ratingStats.average > 0 ? ratingStats.average : 0;
  const totalReviewsCount = ratingStats.count > 0 ? ratingStats.count : reviews.length;

  return (
    <div className={cn('flex flex-col gap-5 pb-24 text-left', className)}>
      <div className="flex flex-col gap-1 px-1">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold tracking-tight text-foreground sm:text-xl">
            Reseñas e Inspección
          </h2>
          {totalReviewsCount > 0 && (
            <Badge
              variant="outline"
              className="border-primary/30 bg-primary/5 text-primary text-xs font-semibold px-2.5 py-0.5"
            >
              {totalReviewsCount} {totalReviewsCount === 1 ? 'reseña' : 'reseñas'}
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Calidad percibida por residentes, métricas de satisfacción y sugerencias de la comunidad
        </p>
      </div>

      <div
        className={cn(
          'rounded-2xl border p-4 sm:p-5 shadow-xs transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5',
          pendingCount > 0 ? 'border-primary/40 bg-primary/5' : 'border-border/80 bg-card',
        )}
      >
        <div className="flex items-start gap-3 min-w-0">
          <div
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
              pendingCount > 0
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'bg-muted text-muted-foreground',
            )}
          >
            <MessageSquare className="h-5 w-5" />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs sm:text-sm font-bold text-foreground">
                Sugerencias de la Comunidad
              </span>
              {pendingCount > 0 ? (
                <Badge className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0">
                  {pendingCount} {pendingCount === 1 ? 'pendiente' : 'pendientes'}
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px]"
                >
                  Al día
                </Badge>
              )}
            </div>

            <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
              {pendingCount > 0
                ? 'Estudiantes que conocen tu alojamiento han sugerido actualizaciones de datos o servicios.'
                : 'No hay sugerencias comunitarias pendientes de revisión en este momento.'}
            </p>
          </div>
        </div>

        <Button
          type="button"
          onClick={handleOpenProposalsDrawer}
          className={cn(
            'w-full sm:w-auto min-h-[48px] px-5 text-xs font-bold shrink-0 cursor-pointer shadow-xs',
            pendingCount > 0
              ? 'bg-primary text-primary-foreground hover:bg-primary/90'
              : 'border border-border bg-background text-foreground hover:bg-secondary',
          )}
        >
          <span>{pendingCount > 0 ? 'Revisar Sugerencias' : 'Ver Historial'}</span>
          <ChevronRight className="h-4 w-4 ml-1.5" />
        </Button>
      </div>

      <Card className="border-border/80 bg-card shadow-xs rounded-2xl overflow-hidden">
        <CardHeader className="p-4 sm:p-5 pb-3 border-b border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                <Star className="h-5 w-5 fill-amber-500" />
              </div>
              <div>
                <CardTitle className="text-sm sm:text-base font-bold text-foreground">
                  Satisfacción en 4 Dimensiones
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  Desglose por áreas clave evaluadas exclusivamente por universitarios
                </CardDescription>
              </div>
            </div>

            <div className="flex items-center gap-1.5 rounded-xl bg-muted/40 px-3 py-1.5 border border-border/60">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="text-sm font-black text-foreground">
                {averageRatingValue > 0 ? averageRatingValue.toFixed(1) : 'Nuevo'}
              </span>
              <span className="text-[10px] text-muted-foreground">/ 5.0</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="rounded-xl border border-border/70 bg-muted/15 p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500/10 text-sky-500">
                    <Droplets className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-foreground block">Limpieza</span>
                    <span className="text-[10px] text-muted-foreground">
                      Higiene en baños y áreas comunes
                    </span>
                  </div>
                </div>

                {(() => {
                  const info = getSatisfactionLabel(
                    satisfactionMetrics.cleanliness,
                    satisfactionMetrics.cleanlinessCount,
                  );
                  return (
                    <Badge
                      variant={info.variant}
                      className={cn('text-[10px] font-semibold border', info.colorClass)}
                    >
                      {info.label}
                    </Badge>
                  );
                })()}
              </div>

              <div className="flex items-center gap-2.5 pt-1">
                <div className="relative flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full bg-sky-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${(satisfactionMetrics.cleanliness / 5) * 100}%`,
                    }}
                  />
                </div>
                <span className="text-xs font-bold text-foreground w-12 text-right">
                  {satisfactionMetrics.cleanliness > 0
                    ? `${satisfactionMetrics.cleanliness.toFixed(1)} / 5`
                    : '- / 5'}
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-border/70 bg-muted/15 p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/10 text-rose-500">
                    <HeartHandshake className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-foreground block">
                      Trato del Anfitrión
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      Disposición, amabilidad y resolución
                    </span>
                  </div>
                </div>

                {(() => {
                  const info = getSatisfactionLabel(
                    satisfactionMetrics.landlord,
                    satisfactionMetrics.landlordCount,
                  );
                  return (
                    <Badge
                      variant={info.variant}
                      className={cn('text-[10px] font-semibold border', info.colorClass)}
                    >
                      {info.label}
                    </Badge>
                  );
                })()}
              </div>

              <div className="flex items-center gap-2.5 pt-1">
                <div className="relative flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full bg-rose-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${(satisfactionMetrics.landlord / 5) * 100}%`,
                    }}
                  />
                </div>
                <span className="text-xs font-bold text-foreground w-12 text-right">
                  {satisfactionMetrics.landlord > 0
                    ? `${satisfactionMetrics.landlord.toFixed(1)} / 5`
                    : '- / 5'}
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-border/70 bg-muted/15 p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500">
                    <Moon className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-foreground block">Tranquilidad</span>
                    <span className="text-[10px] text-muted-foreground">
                      Ambiente de silencio y estudio
                    </span>
                  </div>
                </div>

                {(() => {
                  const info = getSatisfactionLabel(
                    satisfactionMetrics.quietness,
                    satisfactionMetrics.quietnessCount,
                  );
                  return (
                    <Badge
                      variant={info.variant}
                      className={cn('text-[10px] font-semibold border', info.colorClass)}
                    >
                      {info.label}
                    </Badge>
                  );
                })()}
              </div>

              <div className="flex items-center gap-2.5 pt-1">
                <div className="relative flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${(satisfactionMetrics.quietness / 5) * 100}%`,
                    }}
                  />
                </div>
                <span className="text-xs font-bold text-foreground w-12 text-right">
                  {satisfactionMetrics.quietness > 0
                    ? `${satisfactionMetrics.quietness.toFixed(1)} / 5`
                    : '- / 5'}
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-border/70 bg-muted/15 p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                    <Wifi className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-foreground block">
                      Conectividad Wi-Fi
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      Estabilidad y cobertura para clases
                    </span>
                  </div>
                </div>

                {(() => {
                  const info = getSatisfactionLabel(
                    satisfactionMetrics.wifi,
                    satisfactionMetrics.wifiCount,
                  );
                  return (
                    <Badge
                      variant={info.variant}
                      className={cn('text-[10px] font-semibold border', info.colorClass)}
                    >
                      {info.label}
                    </Badge>
                  );
                })()}
              </div>

              <div className="flex items-center gap-2.5 pt-1">
                <div className="relative flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${(satisfactionMetrics.wifi / 5) * 100}%`,
                    }}
                  />
                </div>
                <span className="text-xs font-bold text-foreground w-12 text-right">
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
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-xs font-medium">Cargando reseñas de estudiantes...</p>
          </div>
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
              const rating = review.overallRating ?? review.rating ?? 5;
              const photos = review.images?.slice(0, 4) || [];
              const isLiked = userVotes[review.id] ?? Boolean(review.userVoted);
              const calculatedLikes = Math.max(
                0,
                (review.helpfulCount ?? 0) + (isLiked && !review.userVoted ? 1 : 0),
              );

              return (
                <Card
                  key={review.id}
                  className="border-border/80 bg-card shadow-xs rounded-2xl overflow-hidden"
                >
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-muted border border-border">
                          {review.user?.avatarUrl ? (
                            <Image
                              src={normalizeImageUrl(review.user.avatarUrl)}
                              alt={review.user.firstName || 'Estudiante'}
                              fill
                              sizes="40px"
                              unoptimized
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center font-bold text-sm text-muted-foreground">
                              {review.user?.firstName ? review.user.firstName.charAt(0) : 'E'}
                            </div>
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-xs font-bold text-foreground">
                              {review.user?.firstName || 'Estudiante'}{' '}
                              {review.user?.lastName ? `${review.user.lastName.charAt(0)}.` : ''}
                            </h4>
                            {(review.isResidentVerified || review.isVerifiedStudent) && (
                              <Badge
                                variant="outline"
                                className="gap-1 border-primary/40 bg-primary/5 text-primary text-[10px] py-0 px-1.5"
                              >
                                <CheckCircle2 className="h-3 w-3" />
                                <span>Verificado</span>
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-muted-foreground">
                            <span>
                              {formatStayDuration(
                                review.stayDurationCategory || review.stayDuration,
                              )}
                            </span>
                            {review.user?.university?.name && (
                              <>
                                <span>•</span>
                                <span className="font-medium text-foreground/80 flex items-center gap-1">
                                  <GraduationCap className="h-3 w-3 text-primary" />
                                  {review.user.university.shortName || review.user.university.name}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end">
                        <div className="flex items-center gap-0.5 text-amber-500">
                          {[1, 2, 3, 4, 5].map((starVal) => (
                            <Star
                              key={`star-${review.id}-${starVal}`}
                              className={cn(
                                'h-3.5 w-3.5',
                                starVal <= rating
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-muted-foreground/30',
                              )}
                            />
                          ))}
                        </div>
                        <span className="text-[10px] text-muted-foreground mt-0.5">
                          {formatDate(review.createdAt)}
                        </span>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-4 pt-1 space-y-3">
                    <p className="text-xs text-foreground/90 leading-relaxed italic">
                      "{review.comment}"
                    </p>

                    {photos.length > 0 && (
                      <div className="flex gap-2 overflow-x-auto py-1 no-scrollbar shrink-0">
                        {photos.map((img, photoIdx) => {
                          const rawUrl = typeof img === 'string' ? img : img?.url || '';
                          const photoUrl = normalizeImageUrl(rawUrl);
                          if (!photoUrl) return null;

                          return (
                            <button
                              key={`review-photo-${review.id}-${photoIdx}`}
                              type="button"
                              onClick={() => setEnlargedPhotoUrl(photoUrl)}
                              className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-border/80 bg-muted hover:opacity-90 transition cursor-pointer select-none"
                            >
                              <Image
                                src={photoUrl}
                                alt="Foto adjunta por estudiante"
                                fill
                                unoptimized
                                sizes="80px"
                                className="object-cover"
                              />
                            </button>
                          );
                        })}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2.5 border-t border-border/60">
                      <button
                        type="button"
                        onClick={() => voteHelpful(review.id)}
                        className={cn(
                          'flex min-h-[44px] items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition cursor-pointer',
                          isLiked
                            ? 'bg-primary/10 text-primary'
                            : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                        )}
                      >
                        <ThumbsUp className={cn('h-3.5 w-3.5', isLiked && 'fill-primary')} />
                        <span>Útil ({calculatedLikes})</span>
                      </button>

                      <span className="text-[10px] text-muted-foreground">
                        Reseña moderada y verificada
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <LandlordProposalsDrawer
        isOpen={isProposalsDrawerOpen}
        onClose={() => setIsProposalsDrawerOpen(false)}
        pensionId={effectivePensionId}
        onProposalReviewed={handleProposalReviewed}
      />

      <Dialog
        open={Boolean(enlargedPhotoUrl)}
        onOpenChange={(open) => !open && setEnlargedPhotoUrl(null)}
      >
        <DialogContent className="max-w-md p-2 bg-background/95 backdrop-blur-md rounded-2xl overflow-hidden">
          <DialogHeader className="sr-only">
            <DialogTitle>Foto de reseña</DialogTitle>
          </DialogHeader>
          {enlargedPhotoUrl && (
            <div className="relative aspect-4/3 w-full overflow-hidden rounded-xl bg-black">
              <Image
                src={enlargedPhotoUrl}
                alt="Foto ampliada de la pensión"
                fill
                unoptimized
                className="object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
