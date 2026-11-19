'use client';

import { ShieldCheck, Star, ThumbsUp } from 'lucide-react';
import { m } from 'motion/react';
import Image from 'next/image';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { FullScreenImageViewer } from '@/components/ui/fullscreen-image-viewer';
import { formatChileDate } from '@/lib/format-utils';
import { shouldBypassImageOptimization } from '@/lib/image-utils';
import type { PensionReview } from '@/lib/types';
import { normalizeImageUrl } from '@/lib/utils';

export function formatStayDuration(cat?: string | null): string {
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
  return formatChileDate(isoString, { month: 'long', year: 'numeric' }, 'Reciente');
}

export type ReviewCardProps = {
  review: PensionReview;
  isLiked?: boolean;
  likesCount?: number;
  onToggleHelpful?: (reviewId: string) => void;
  onEnlargePhoto?: (url: string, index?: number, allPhotos?: string[]) => void;
  className?: string;
  showHelpfulButton?: boolean;
  readOnlyHelpful?: boolean;
  isVoting?: boolean;
};

export function ReviewCard({
  review,
  isLiked = false,
  likesCount,
  onToggleHelpful,
  onEnlargePhoto,
  className = '',
  showHelpfulButton = true,
  readOnlyHelpful = false,
  isVoting = false,
}: ReviewCardProps) {
  const [internalViewerIndex, setInternalViewerIndex] = useState<number | null>(null);
  const rating = review.overallRating ?? review.rating ?? 0;
  const photos = review.images?.slice(0, 3) || [];
  const calculatedLikes =
    likesCount !== undefined
      ? likesCount
      : Math.max(0, (review.helpfulCount ?? 0) + (isLiked && !review.userVoted ? 1 : 0));

  const allValidUrls = photos
    .map((img) => {
      const rawUrl =
        typeof img === 'string' ? img : (img as unknown as { url?: string })?.url || '';
      return normalizeImageUrl(rawUrl);
    })
    .filter(Boolean);

  return (
    <div
      className={`rounded-2xl border border-border/80 bg-card p-4 shadow-xs flex flex-col gap-3 ${className}`}
    >
      <div className="flex items-start justify-between gap-2.5 min-w-0">
        <div className="flex items-start gap-2.5 min-w-0 flex-1">
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-muted border border-border">
            {review.user?.avatarUrl ? (
              <Image
                src={normalizeImageUrl(review.user.avatarUrl)}
                alt={review.user?.firstName || 'Usuario'}
                fill
                sizes="40px"
                unoptimized={shouldBypassImageOptimization(
                  normalizeImageUrl(review.user.avatarUrl),
                )}
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center font-bold text-sm text-muted-foreground">
                {review.user?.firstName?.charAt(0) || 'U'}
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <h5 className="text-xs font-bold text-foreground break-words">
                {review.user?.firstName || 'Usuario'} {review.user?.lastName || ''}
              </h5>
              {review.isResidentVerified && (
                <Badge
                  variant="outline"
                  className="gap-1 border-sage/30 bg-sage/10 text-sage-foreground text-[11px] py-0 px-1.5 font-semibold shrink-0"
                >
                  <ShieldCheck className="h-3 w-3 shrink-0" />
                  <span>Estudiante verificado</span>
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 mt-0.5 text-xs text-muted-foreground min-w-0">
              <span className="break-words">
                {formatStayDuration(review.stayDurationCategory || review.stayDuration)}
              </span>
              {review.user?.university?.name && (
                <>
                  <span aria-hidden="true">•</span>
                  <span className="font-medium text-foreground/80 break-words">
                    {review.user.university.shortName || review.user.university.name}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end shrink-0">
          <div className="flex items-center gap-0.5 text-warning">
            {[1, 2, 3, 4, 5].map((starVal) => (
              <Star
                key={`star-${review.id}-${starVal}`}
                className={`h-3 w-3 shrink-0 ${
                  starVal <= rating ? 'fill-warning text-warning' : 'text-muted-foreground/30'
                }`}
              />
            ))}
          </div>
          <span className="text-[11px] text-muted-foreground mt-0.5 tabular-nums whitespace-nowrap">
            {formatDate(review.createdAt)}
          </span>
        </div>
      </div>

      <p className="text-xs text-foreground/90 leading-relaxed text-pretty max-w-prose">
        {review.comment}
      </p>

      {photos.length > 0 && (
        <div className="flex gap-2 overflow-x-auto py-1 no-scrollbar shrink-0">
          {photos.map((img, photoIdx) => {
            const rawUrl =
              typeof img === 'string' ? img : (img as unknown as { url?: string })?.url || '';
            const photoUrl = normalizeImageUrl(rawUrl);
            const caption =
              typeof img === 'string'
                ? 'Foto de la pensión'
                : (img as unknown as { caption?: string })?.caption || 'Foto de la pensión';
            if (!photoUrl) return null;

            return (
              <button
                key={`review-photo-${review.id}-${photoIdx}`}
                type="button"
                onClick={() => {
                  if (onEnlargePhoto) {
                    onEnlargePhoto(photoUrl, photoIdx, allValidUrls);
                  } else {
                    setInternalViewerIndex(photoIdx);
                  }
                }}
                className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-border/80 bg-muted hover:opacity-90 transition cursor-pointer"
              >
                <Image
                  src={photoUrl}
                  alt={caption}
                  fill
                  unoptimized={shouldBypassImageOptimization(photoUrl)}
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            );
          })}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/60">
        {showHelpfulButton ? (
          <m.button
            type="button"
            whileTap={readOnlyHelpful ? undefined : { scale: 0.92 }}
            disabled={isVoting}
            aria-disabled={readOnlyHelpful || undefined}
            onClick={
              readOnlyHelpful
                ? (event) => event.preventDefault()
                : () => onToggleHelpful?.(review.id)
            }
            aria-pressed={readOnlyHelpful ? undefined : isLiked}
            aria-label={`Marcar como útil (${calculatedLikes} votos)`}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap shrink-0 ${
              readOnlyHelpful
                ? 'cursor-default text-muted-foreground'
                : isLiked
                  ? 'bg-primary/10 text-primary cursor-pointer'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground cursor-pointer'
            }`}
          >
            <ThumbsUp
              className={`h-3 w-3 shrink-0 ${isLiked && !readOnlyHelpful ? 'fill-primary' : ''}`}
            />
            <span>
              Útil (<span className="tabular-nums">{calculatedLikes}</span>)
            </span>
          </m.button>
        ) : (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap shrink-0">
            <ThumbsUp className="h-3 w-3 shrink-0" />
            <span>{calculatedLikes} votos útiles</span>
          </div>
        )}

        <span className="text-[11px] text-muted-foreground leading-tight">
          Reseña verificada por moderación
        </span>
      </div>

      {internalViewerIndex !== null && (
        <FullScreenImageViewer
          isOpen={internalViewerIndex !== null}
          onClose={() => setInternalViewerIndex(null)}
          images={allValidUrls}
          initialIndex={internalViewerIndex}
          title={`Foto de reseña • ${review.user?.firstName || 'Estudiante'}`}
          subtitle={review.comment}
        />
      )}
    </div>
  );
}
