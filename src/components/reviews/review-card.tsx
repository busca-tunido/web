'use client';

import { CheckCircle2, Star, ThumbsUp } from 'lucide-react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import type { PensionReview } from '@/lib/types';
import { normalizeImageUrl } from '@/lib/utils';

export function formatStayDuration(cat?: string): string {
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

export function formatDate(isoString?: string): string {
  if (!isoString) return 'Reciente';
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' });
  } catch {
    return 'Reciente';
  }
}

export type ReviewCardProps = {
  review: PensionReview;
  isLiked?: boolean;
  likesCount?: number;
  onToggleHelpful?: (reviewId: string) => void;
  onEnlargePhoto?: (url: string) => void;
  className?: string;
  showHelpfulButton?: boolean;
};

export function ReviewCard({
  review,
  isLiked = false,
  likesCount,
  onToggleHelpful,
  onEnlargePhoto,
  className = '',
  showHelpfulButton = true,
}: ReviewCardProps) {
  const rating = review.overallRating ?? review.rating ?? 5;
  const photos = review.images?.slice(0, 3) || [];
  const calculatedLikes =
    likesCount !== undefined
      ? likesCount
      : Math.max(0, (review.helpfulCount ?? 0) + (isLiked && !review.userVoted ? 1 : 0));

  return (
    <div
      className={`rounded-2xl border border-border/80 bg-card p-4 shadow-xs flex flex-col gap-3 ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-muted border border-border">
            {review.user.avatarUrl ? (
              <Image
                src={normalizeImageUrl(review.user.avatarUrl)}
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
              {review.isResidentVerified && (
                <Badge
                  variant="outline"
                  className="gap-1 border-primary/40 bg-primary/5 text-primary text-[10px] py-0 px-1.5"
                >
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Estudiante verificado</span>
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground">
              <span>{formatStayDuration(review.stayDurationCategory || review.stayDuration)}</span>
              {review.user.university?.name && (
                <>
                  <span>•</span>
                  <span className="font-medium text-foreground/80">
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
                className={`h-3 w-3 ${
                  starVal < rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'
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
        <div className="flex gap-2 overflow-x-auto py-1 no-scrollbar shrink-0">
          {photos.map((img, photoIdx) => {
            const rawUrl = typeof img === 'string' ? img : img?.url || '';
            const photoUrl = normalizeImageUrl(rawUrl);
            const caption =
              typeof img === 'string' ? 'Foto de la pensión' : img?.caption || 'Foto de la pensión';
            if (!photoUrl) return null;

            return (
              <button
                key={`review-photo-${review.id}-${photoIdx}`}
                type="button"
                onClick={() => onEnlargePhoto?.(photoUrl)}
                className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-border/80 bg-muted hover:opacity-90 transition cursor-pointer"
              >
                <Image
                  src={photoUrl}
                  alt={caption}
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

      <div className="flex items-center justify-between pt-2 border-t border-border/60">
        {showHelpfulButton ? (
          <button
            type="button"
            onClick={() => onToggleHelpful?.(review.id)}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition cursor-pointer ${
              isLiked
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
            }`}
          >
            <ThumbsUp className="h-3 w-3" />
            <span>Útil ({calculatedLikes})</span>
          </button>
        ) : (
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <ThumbsUp className="h-3 w-3" />
            <span>{calculatedLikes} votos útiles</span>
          </div>
        )}

        <span className="text-[10px] text-muted-foreground">Reseña verificada por moderación</span>
      </div>
    </div>
  );
}
