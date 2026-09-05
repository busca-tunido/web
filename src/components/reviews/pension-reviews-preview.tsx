'use client';

import { ArrowRight, Camera, CheckCircle2, ChevronRight, GraduationCap, Star } from 'lucide-react';
import Image from 'next/image';
import type { PensionItem, PensionReview } from '@/lib/types';

type PensionReviewsPreviewProps = {
  pension: PensionItem;
  reviews: PensionReview[];
  onOpenFullReviews: () => void;
};

function formatStayDuration(cat?: string): string {
  switch (cat) {
    case 'FEW_DAYS':
      return 'Unos días';
    case 'FEW_WEEKS':
      return 'Semanas';
    case 'ONE_SEMESTER':
      return '1 Semestre';
    case 'ONE_YEAR':
      return '1 Año';
    case 'MORE_THAN_A_YEAR':
      return '> 1 Año';
    default:
      return 'Residente';
  }
}

function formatDate(isoString?: string): string {
  if (!isoString) return 'Reciente';
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString('es-CL', { month: 'short', year: 'numeric' });
  } catch {
    return 'Reciente';
  }
}

export function PensionReviewsPreview({
  pension,
  reviews,
  onOpenFullReviews,
}: PensionReviewsPreviewProps) {
  const displayReviews = reviews.slice(0, 5);
  const totalCount = Math.max(reviews.length, pension.reviewsCount);

  return (
    <div className="mb-6 rounded-2xl border border-border/80 bg-card/60 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-foreground">Reseñas de estudiantes</h4>
            <span className="flex items-center gap-0.5 rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] font-bold text-amber-600 dark:text-amber-400">
              <Star className="h-3 w-3 fill-current" />
              {pension.ratingAverage.toFixed(1)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Experiencias reales de universitarios que vivieron aquí
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenFullReviews}
          className="text-xs font-semibold text-primary hover:opacity-80 transition flex items-center gap-0.5 cursor-pointer shrink-0"
        >
          <span>Ver todas</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 snap-x no-scrollbar -mx-1 px-1">
        {displayReviews.map((review) => {
          const rating = review.overallRating ?? review.rating ?? 5;
          const photoCount = review.images?.length ?? 0;

          return (
            <div
              key={review.id}
              className="w-[270px] shrink-0 snap-start rounded-xl border border-border bg-background/90 p-3.5 flex flex-col justify-between shadow-xs transition hover:border-primary/40"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-muted border border-border">
                      {review.user.avatarUrl ? (
                        <Image
                          src={review.user.avatarUrl}
                          alt={review.user.firstName}
                          fill
                          sizes="32px"
                          unoptimized
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center font-bold text-xs text-muted-foreground">
                          {review.user.firstName.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="truncate">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-foreground truncate">
                          {review.user.firstName} {review.user.lastName?.charAt(0)}.
                        </span>
                        {(review.isResidentVerified || review.isVerifiedStudent) && (
                          <CheckCircle2 className="h-3 w-3 text-primary shrink-0" />
                        )}
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {formatStayDuration(review.stayDurationCategory || review.stayDuration)}
                      </span>
                    </div>
                  </div>

                  {photoCount > 0 && (
                    <span className="flex items-center gap-1 rounded-md bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground shrink-0">
                      <Camera className="h-3 w-3" />
                      {photoCount}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 mb-1.5 text-amber-500">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star
                      key={`star-${review.id}-${idx}`}
                      className={`h-3 w-3 ${
                        idx < rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'
                      }`}
                    />
                  ))}
                  <span className="text-[10px] text-muted-foreground ml-1">
                    {formatDate(review.createdAt)}
                  </span>
                </div>

                <p className="text-xs text-foreground/90 leading-relaxed line-clamp-3 italic">
                  "{review.comment}"
                </p>
              </div>

              {review.user.university?.shortName && (
                <div className="mt-3 flex items-center gap-1 text-[10px] font-medium text-muted-foreground pt-2 border-t border-border/60">
                  <GraduationCap className="h-3 w-3 text-primary" />
                  <span>{review.user.university.shortName}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onOpenFullReviews}
        className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-primary/30 bg-primary/5 py-2.5 text-xs font-bold text-primary hover:bg-primary/10 transition cursor-pointer"
      >
        <span>Ver todas las {totalCount} reseñas</span>
        <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
