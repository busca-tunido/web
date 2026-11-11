'use client';

import { ChevronLeft } from 'lucide-react';
import { useState } from 'react';
import { ReviewCard } from '@/components/reviews/review-card';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { FullScreenImageViewer } from '@/components/ui/fullscreen-image-viewer';
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

  const hasSubRatings = Boolean(
    review.cleanlinessRating ||
      review.landlordRating ||
      review.quietnessRating ||
      review.wifiRating,
  );

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent
        id="user-review-drawer"
        className="max-h-[92dvh] flex flex-col bg-background border-border select-none max-w-lg md:max-w-2xl mx-auto md:rounded-3xl"
      >
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
              <h3 className="text-base font-bold text-foreground">Tu reseña publicada</h3>
              <p className="text-[11px] text-muted-foreground truncate max-w-sm">
                {stay.pensionTitle} • {stay.pensionCity}
              </p>
            </div>
          </div>
        </div>

        <DrawerHeader className="sr-only">
          <DrawerTitle>Tu reseña de {stay.pensionTitle}</DrawerTitle>
          <DrawerDescription>Detalle de la reseña que publicaste como estudiante</DrawerDescription>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-4">
          {hasSubRatings && (
            <div className="grid grid-cols-2 gap-2.5">
              {review.cleanlinessRating && (
                <div className="flex flex-col gap-1 rounded-xl border border-border/80 bg-card p-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground">Limpieza</span>
                    <span className="text-xs font-bold text-primary">
                      {review.cleanlinessRating}.0
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">Áreas comunes y baño</p>
                </div>
              )}

              {review.landlordRating && (
                <div className="flex flex-col gap-1 rounded-xl border border-border/80 bg-card p-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground">Anfitrión</span>
                    <span className="text-xs font-bold text-primary">
                      {review.landlordRating}.0
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">Trato y comunicación</p>
                </div>
              )}

              {review.quietnessRating && (
                <div className="flex flex-col gap-1 rounded-xl border border-border/80 bg-card p-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground">
                      Silencio / Estudio
                    </span>
                    <span className="text-xs font-bold text-primary">
                      {review.quietnessRating}.0
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">Ambiente de descanso</p>
                </div>
              )}

              {review.wifiRating && (
                <div className="flex flex-col gap-1 rounded-xl border border-border/80 bg-card p-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground">
                      Conectividad Wi-Fi
                    </span>
                    <span className="text-xs font-bold text-primary">{review.wifiRating}.0</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">Velocidad y estabilidad</p>
                </div>
              )}
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
      </DrawerContent>
    </Drawer>
  );
}
