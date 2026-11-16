'use client';

import { useState } from 'react';
import { ReviewCard } from '@/components/reviews/review-card';
import { FullScreenImageViewer } from '@/components/ui/fullscreen-image-viewer';
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalDescription,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from '@/components/ui/responsive-modal';
import type { PensionReview, StayHistoryItem } from '@/lib/types';

type UserReviewModalProps = {
  isOpen: boolean;
  onClose: () => void;
  stay: StayHistoryItem | null;
};

export function UserReviewModal({ isOpen, onClose, stay }: UserReviewModalProps) {
  const [viewerState, setViewerState] = useState<{
    images: string[];
    initialIndex: number;
    title?: string;
  } | null>(null);

  if (!stay?.review) return null;

  const review: PensionReview = stay.review;

  const subRatings = [
    { label: 'Limpieza', value: review.cleanlinessRating },
    { label: 'Anfitrión', value: review.landlordRating },
    { label: 'Silencio / Estudio', value: review.quietnessRating },
    { label: 'Wi-Fi', value: review.wifiRating },
  ].filter((item): item is { label: string; value: number } => Boolean(item.value));

  return (
    <ResponsiveModal open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <ResponsiveModalContent
        id="user-review-drawer"
        showClose={false}
        className="max-w-lg md:max-w-2xl md:max-h-[82vh] mx-auto flex flex-col bg-card border-border select-none md:rounded-3xl"
      >
        <ResponsiveModalHeader className="px-5 py-4 border-b border-border/60 shrink-0 text-left">
          <ResponsiveModalTitle className="text-lg font-bold text-foreground">
            Tu reseña publicada
          </ResponsiveModalTitle>
          <ResponsiveModalDescription className="text-xs text-muted-foreground mt-0.5 truncate">
            {stay.pensionTitle} • {stay.pensionCity}
          </ResponsiveModalDescription>
        </ResponsiveModalHeader>

        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-subtle px-5 py-5 pb-6 flex flex-col gap-4">
          {subRatings.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {subRatings.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between gap-2 rounded-xl border border-border/70 bg-muted/35 px-3 py-2.5"
                >
                  <span className="text-xs font-medium text-muted-foreground truncate">
                    {item.label}
                  </span>
                  <span className="text-xs font-bold text-primary tabular-nums shrink-0">
                    {item.value}.0
                  </span>
                </div>
              ))}
            </div>
          )}

          <ReviewCard
            review={review}
            onEnlargePhoto={(url, index = 0, allPhotos) => {
              setViewerState({
                images: allPhotos && allPhotos.length > 0 ? allPhotos : [url],
                initialIndex: index,
                title: `Tu reseña • ${stay.pensionTitle}`,
              });
            }}
            showHelpfulButton={false}
          />
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
  );
}
