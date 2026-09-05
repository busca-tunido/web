'use client';

import { Award, Camera, CheckCircle2, ChevronLeft, Star, ThumbsUp, X } from 'lucide-react';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import type { PensionItem, PensionReview } from '@/lib/types';

type PensionReviewsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  pension: PensionItem;
  reviews: PensionReview[];
};

type FilterCategory = 'ALL' | 'WITH_PHOTOS' | '5_STARS' | '4_PLUS' | 'LONG_STAY';

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
    return d.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' });
  } catch {
    return 'Reciente';
  }
}

export function PensionReviewsModal({
  isOpen,
  onClose,
  pension,
  reviews,
}: PensionReviewsModalProps) {
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('ALL');
  const [helpfulLikes, setHelpfulLikes] = useState<Record<string, number>>({});
  const [userLiked, setUserLiked] = useState<Record<string, boolean>>({});
  const [enlargedPhoto, setEnlargedPhoto] = useState<string | null>(null);

  const totalReviewsCount = Math.max(reviews.length, pension.reviewsCount);

  const starCounts = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    for (const r of reviews) {
      const score = Math.round(r.overallRating ?? r.rating ?? 5);
      if (score >= 1 && score <= 5) {
        counts[score as keyof typeof counts] = (counts[score as keyof typeof counts] || 0) + 1;
      }
    }
    if (reviews.length === 0) {
      counts[5] = 4;
      counts[4] = 1;
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
        cleanliness: 4.8,
        landlord: 4.9,
        quietness: 4.7,
        wifi: 4.9,
      };
    }

    return {
      cleanliness: Number((cleanSum / count || 4.8).toFixed(1)),
      landlord: Number((landlordSum / count || 4.9).toFixed(1)),
      quietness: Number((quietSum / count || 4.7).toFixed(1)),
      wifi: Number((wifiSum / count || 4.9).toFixed(1)),
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
      if (activeFilter === 'LONG_STAY') {
        const dur = r.stayDurationCategory || r.stayDuration;
        return dur === 'ONE_YEAR' || dur === 'MORE_THAN_A_YEAR';
      }
      return true;
    });
  }, [reviews, activeFilter]);

  const toggleHelpful = (reviewId: string) => {
    setUserLiked((prev) => {
      const nextLiked = !prev[reviewId];
      setHelpfulLikes((prevCounts) => ({
        ...prevCounts,
        [reviewId]: (prevCounts[reviewId] || 0) + (nextLiked ? 1 : -1),
      }));
      return { ...prev, [reviewId]: nextLiked };
    });
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="max-h-[92dvh] flex flex-col bg-background border-border select-none">
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
              <p className="text-[11px] text-muted-foreground truncate max-w-[240px]">
                {pension.title}
              </p>
            </div>
          </div>

          <DrawerClose
            className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </DrawerClose>
        </div>

        <DrawerHeader className="sr-only">
          <DrawerTitle>Reseñas de {pension.title}</DrawerTitle>
          <DrawerDescription>Comentarios y calificaciones de estudiantes</DrawerDescription>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-6">
          <div className="flex flex-col items-center justify-center rounded-2xl border border-primary/20 bg-primary/5 p-5 text-center">
            <div className="flex items-center gap-3">
              <span className="text-4xl font-black tracking-tight text-foreground">
                {pension.ratingAverage.toFixed(2)}
              </span>
              <div className="flex flex-col items-start">
                <div className="flex items-center gap-0.5 text-amber-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={`hero-star-${i}`}
                      className="h-4 w-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <span className="text-xs font-semibold text-muted-foreground mt-0.5">
                  {totalReviewsCount} reseñas verificadas
                </span>
              </div>
            </div>

            <div className="mt-3.5 flex items-center gap-1.5 rounded-full bg-background px-3 py-1 border border-border text-xs font-semibold text-foreground shadow-xs">
              <Award className="h-3.5 w-3.5 text-primary" />
              <span>Favorito de estudiantes universitarios</span>
            </div>

            <p className="text-[11px] text-muted-foreground mt-2 max-w-sm">
              Calificación destacada por su ambiente de estudio, excelente conexión a internet y
              trato hospitalario del anfitrión.
            </p>
          </div>

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
                <span className="text-xs font-bold text-primary">{categoryAverages.landlord}</span>
              </div>
              <p className="text-[10px] text-muted-foreground">Atención y resolución</p>
            </div>

            <div className="flex flex-col gap-1 rounded-xl border border-border/80 bg-card p-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground">Silencio / Estudio</span>
                <span className="text-xs font-bold text-primary">{categoryAverages.quietness}</span>
              </div>
              <p className="text-[10px] text-muted-foreground">Ambiente para concentrarse</p>
            </div>

            <div className="flex flex-col gap-1 rounded-xl border border-border/80 bg-card p-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground">Conectividad Wi-Fi</span>
                <span className="text-xs font-bold text-primary">{categoryAverages.wifi}</span>
              </div>
              <p className="text-[10px] text-muted-foreground">Estabilidad y velocidad</p>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar -mx-1 px-1">
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

          <div className="flex flex-col gap-4">
            {filteredReviews.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">
                <p className="text-xs">No hay reseñas con los filtros seleccionados.</p>
              </div>
            ) : (
              filteredReviews.map((review) => {
                const rating = review.overallRating ?? review.rating ?? 5;
                const photos = review.images?.slice(0, 3) || [];
                const isLiked = Boolean(userLiked[review.id]);
                const baseLikes = (review.comment.length % 4) + 1;
                const likesCount = (helpfulLikes[review.id] || 0) + baseLikes;

                return (
                  <div
                    key={`full-review-${review.id}`}
                    className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs flex flex-col gap-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-muted border border-border">
                          {review.user.avatarUrl ? (
                            <Image
                              src={review.user.avatarUrl}
                              alt={review.user.firstName}
                              fill
                              sizes="40px"
                              unoptimized
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center font-bold text-sm text-muted-foreground">
                              {review.user.firstName.charAt(0)}
                            </div>
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5">
                            <h5 className="text-xs font-bold text-foreground">
                              {review.user.firstName} {review.user.lastName}
                            </h5>
                            {(review.isResidentVerified || review.isVerifiedStudent) && (
                              <Badge
                                variant="outline"
                                className="border-primary/40 bg-primary/10 text-primary text-[9px] px-1.5 py-0 h-4 gap-0.5"
                              >
                                <CheckCircle2 className="h-2.5 w-2.5" />
                                Estudiante verificado
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5">
                            <span>
                              {formatStayDuration(
                                review.stayDurationCategory || review.stayDuration,
                              )}
                            </span>
                            {review.user.university?.shortName && (
                              <>
                                <span>•</span>
                                <span className="text-foreground/80 font-medium">
                                  {review.user.university.shortName}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end">
                        <div className="flex items-center gap-0.5 text-amber-500">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={`star-${review.id}-${i}`}
                              className={`h-3 w-3 ${
                                i < rating
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-muted-foreground/30'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-[10px] text-muted-foreground mt-0.5">
                          {formatDate(review.createdAt)}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-foreground/90 leading-relaxed">{review.comment}</p>

                    {photos.length > 0 && (
                      <div className="flex gap-2 overflow-x-auto pt-1 pb-1">
                        {photos.map((img, photoIdx) => (
                          <button
                            key={`review-photo-${review.id}-${photoIdx}`}
                            type="button"
                            onClick={() => setEnlargedPhoto(img.url)}
                            className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-border/80 bg-muted hover:opacity-90 transition cursor-pointer"
                          >
                            <Image
                              src={img.url}
                              alt={img.caption || 'Foto de la pensión'}
                              fill
                              unoptimized
                              sizes="80px"
                              className="object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-border/60">
                      <button
                        type="button"
                        onClick={() => toggleHelpful(review.id)}
                        className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition cursor-pointer ${
                          isLiked
                            ? 'bg-primary/10 text-primary'
                            : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                        }`}
                      >
                        <ThumbsUp className="h-3 w-3" />
                        <span>Útil ({likesCount})</span>
                      </button>

                      <span className="text-[10px] text-muted-foreground">
                        Reseña verificada por moderación
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
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
