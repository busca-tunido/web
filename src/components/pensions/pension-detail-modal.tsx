'use client';

import {
  ArrowLeft,
  BookOpen,
  Check,
  ChevronRight,
  Clock,
  Heart,
  Loader2,
  MapPin,
  PenLine,
  ShieldCheck,
  Star,
  Utensils,
  Wifi,
  Wind,
} from 'lucide-react';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import { NetworkErrorBanner, NetworkErrorState } from '@/components/common/network-error-state';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { usePensionDetail } from '@/hooks/use-pension-detail';
import { usePensionReviews } from '@/hooks/use-pension-reviews';
import { useAuth } from '@/lib/auth-context';
import type { PensionItem } from '@/lib/types';
import { PensionReviewsModal } from '../reviews/pension-reviews-modal';
import { PensionReviewsPreview } from '../reviews/pension-reviews-preview';
import { PublishReviewModal } from '../reviews/publish-review-modal';
import { AmenitiesBreakdownModal } from './amenities-breakdown-modal';
import { SuggestEditModal } from './suggest-edit-modal';

type PensionDetailModalProps = {
  pension?: PensionItem | null;
  pensionId?: string | null;
  isOpen: boolean;
  onClose: () => void;
};

export function PensionDetailModal({
  pension: initialPension = null,
  pensionId = null,
  isOpen,
  onClose,
}: PensionDetailModalProps) {
  const { user, isFavorite, toggleFavorite } = useAuth();
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [isReviewsModalOpen, setIsReviewsModalOpen] = useState(false);
  const [isAmenitiesModalOpen, setIsAmenitiesModalOpen] = useState(false);
  const [isPublishReviewOpen, setIsPublishReviewOpen] = useState(false);
  const [isSuggestEditOpen, setIsSuggestEditOpen] = useState(false);

  const targetId = isOpen ? (initialPension?.id ?? pensionId ?? null) : null;

  const {
    activePension,
    isLoading: isLoadingDetail,
    error: detailError,
    refetch: loadLivePension,
  } = usePensionDetail(targetId, initialPension);

  const {
    reviews,
    ratingStats,
    refetch: reloadReviews,
  } = usePensionReviews(targetId, {
    average: activePension?.ratingAverage ?? 0,
    count: activePension?.reviewsCount ?? 0,
  });

  const pension = useMemo(() => {
    if (!activePension) return null;
    return {
      ...activePension,
      ratingAverage: ratingStats.average,
      reviewsCount: ratingStats.count,
    };
  }, [activePension, ratingStats]);

  const isFav = isFavorite(pension?.id ?? '');
  const hasAlreadyReviewed = Boolean(user && reviews.some((r) => r.user?.id === user.id));

  const handleReviewPublished = (newReview: PensionReview) => {
    setReviews((prev) => [newReview, ...prev]);
    setRatingStats((prev) => {
      const newCount = prev.count + 1;
      const reviewScore = newReview.overallRating ?? newReview.rating ?? 5;
      const newAvg = (prev.average * prev.count + reviewScore) / newCount;
      return {
        average: Math.round(newAvg * 10) / 10,
        count: newCount,
      };
    });
  };

  if (!isOpen) return null;

  if (!activePension && isLoadingDetail) {
    return (
      <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DrawerContent className="max-h-[92vh] max-w-lg md:max-w-xl mx-auto md:rounded-3xl bg-card border-border p-6 flex flex-col items-center justify-center">
          <div className="flex flex-col items-center gap-3 py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-xs text-muted-foreground">Cargando detalles de la pensión...</p>
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  if (!activePension && detailError) {
    return (
      <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DrawerContent className="max-h-[92vh] max-w-lg md:max-w-xl mx-auto md:rounded-3xl bg-card border-border p-6">
          <NetworkErrorState
            message={detailError}
            onRetry={loadLivePension}
            isRetrying={isLoadingDetail}
          />
        </DrawerContent>
      </Drawer>
    );
  }

  if (!pension) return null;

  return (
    <>
      <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DrawerContent
          id="pension-detail-drawer"
          className="max-h-[92vh] max-w-lg md:max-w-4xl mx-auto bg-card border-border text-foreground overflow-hidden flex flex-col md:rounded-3xl"
        >
          <div className="mx-auto mt-2.5 mb-1 h-1.5 w-12 rounded-full bg-muted-foreground/30 shrink-0 md:hidden" />

          <div className="overflow-y-auto flex-1 px-4 md:px-8 pt-2 pb-6">
            {detailError && (
              <NetworkErrorBanner
                message={detailError}
                onRetry={loadLivePension}
                isRetrying={isLoadingDetail}
                className="mb-3"
              />
            )}
            <div className="relative h-64 md:h-88 w-full rounded-2xl overflow-hidden bg-muted mb-4 shadow-sm">
              <Image
                src={pension.photos[activePhotoIdx] ?? pension.photos[0]}
                alt={pension.title}
                fill
                unoptimized
                sizes="(max-width: 640px) 100vw, 480px"
                className="object-cover transition duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

              <button
                type="button"
                onClick={onClose}
                className="absolute top-3 left-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md hover:bg-black/80 active:scale-90 transition shadow-sm"
                aria-label="Cerrar detalle"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>

              <div className="absolute top-3 right-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleFavorite(pension.id)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-black/60 backdrop-blur-md text-white hover:text-primary active:scale-90 transition shadow-sm"
                  aria-label="Guardar en favoritos"
                >
                  <Heart className={`h-5 w-5 ${isFav ? 'fill-primary text-primary' : ''}`} />
                </button>
              </div>

              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                <div className="flex gap-1.5">
                  {pension.photos.map((photoUrl, i) => (
                    <button
                      key={`photo-dot-${pension.id}-${i}-${photoUrl}`}
                      type="button"
                      onClick={() => setActivePhotoIdx(i)}
                      className={`h-1.5 rounded-full transition-all ${
                        i === activePhotoIdx ? 'w-6 bg-primary' : 'w-2 bg-white/40'
                      }`}
                    />
                  ))}
                </div>
                <Badge className="bg-primary text-primary-foreground font-bold text-xs shadow">
                  ${pension.priceMonthlyClp.toLocaleString('es-CL')} CLP/mes
                </Badge>
              </div>
            </div>

            <DrawerHeader className="p-0 text-left mb-4">
              <div className="flex items-center gap-2 mb-1.5">
                {pension.isVerified && (
                  <Badge
                    variant="outline"
                    className="border-primary/40 bg-primary/10 text-primary gap-1 text-[11px]"
                  >
                    <ShieldCheck className="h-3 w-3" />
                    Verificado BuscaTuNido
                  </Badge>
                )}
                <button
                  type="button"
                  onClick={() => setIsReviewsModalOpen(true)}
                  className="flex items-center gap-1 text-xs font-semibold text-amber-500 hover:opacity-80 transition cursor-pointer"
                >
                  <Star className="h-3.5 w-3.5 fill-amber-500" />
                  <span>{ratingStats.average > 0 ? ratingStats.average.toFixed(1) : 'Nuevo'}</span>
                  <span className="text-muted-foreground font-normal underline decoration-muted-foreground/40">
                    (
                    {ratingStats.count > 0
                      ? `${ratingStats.count} ${ratingStats.count === 1 ? 'reseña' : 'reseñas'}`
                      : 'Sin reseñas'}
                    )
                  </span>
                </button>
              </div>

              <DrawerTitle className="text-xl font-bold text-foreground leading-tight">
                {pension.title}
              </DrawerTitle>
              <DrawerDescription className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span>
                  {pension.address}, {pension.neighborhood}, {pension.city}
                </span>
              </DrawerDescription>
            </DrawerHeader>

            <div className="mb-4 rounded-xl border border-primary/20 bg-primary/5 p-3">
              <div className="flex items-center gap-2 text-xs font-medium text-primary">
                <MapPin className="h-3.5 w-3.5" />
                <span>
                  A {pension.distanceToUniversityMeters}m de {pension.nearestUniversityName}
                </span>
              </div>
            </div>

            <div className="mb-5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Descripción de la Pensión
              </h4>
              <p className="text-sm text-foreground/90 leading-relaxed">{pension.description}</p>
            </div>

            <div className="mb-5">
              <div className="flex items-center justify-between mb-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Servicios y Comodidades
                </h4>
                <button
                  type="button"
                  onClick={() => setIsAmenitiesModalOpen(true)}
                  className="text-xs font-semibold text-primary hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <span>Ver más detalles</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div
                  className={`flex items-center gap-2 rounded-lg border p-2.5 ${
                    pension.includesWifi
                      ? 'border-primary/30 bg-muted/40 text-foreground'
                      : 'border-border text-muted-foreground line-through opacity-50'
                  }`}
                >
                  <Wifi className="h-4 w-4 text-primary" />
                  <span>WiFi Alta Velocidad</span>
                </div>
                <div
                  className={`flex items-center gap-2 rounded-lg border p-2.5 ${
                    pension.includesMeals
                      ? 'border-primary/30 bg-muted/40 text-foreground'
                      : 'border-border text-muted-foreground opacity-50'
                  }`}
                >
                  <Utensils className="h-4 w-4 text-primary" />
                  <span>{pension.includesMeals ? 'Comida incluida' : 'Cocina libre uso'}</span>
                </div>
                <div
                  className={`flex items-center gap-2 rounded-lg border p-2.5 ${
                    pension.includesStudyRoom
                      ? 'border-primary/30 bg-muted/40 text-foreground'
                      : 'border-border text-muted-foreground opacity-50'
                  }`}
                >
                  <BookOpen className="h-4 w-4 text-primary" />
                  <span>Sala de Estudio</span>
                </div>
                <div
                  className={`flex items-center gap-2 rounded-lg border p-2.5 ${
                    pension.includesLaundry
                      ? 'border-primary/30 bg-muted/40 text-foreground'
                      : 'border-border text-muted-foreground opacity-50'
                  }`}
                >
                  <Wind className="h-4 w-4 text-primary" />
                  <span>Lavandería</span>
                </div>
              </div>

              <button
                type="button"
                id="btn-open-amenities-breakdown"
                onClick={() => setIsAmenitiesModalOpen(true)}
                className="mt-2.5 w-full py-2.5 px-3 rounded-xl border border-border/80 bg-muted/30 hover:bg-muted/60 text-xs font-semibold text-foreground flex items-center justify-between transition cursor-pointer"
              >
                <span>Ver todas las comodidades y normas</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            <PensionReviewsPreview
              pension={pension}
              reviews={reviews}
              onOpenFullReviews={() => setIsReviewsModalOpen(true)}
            />

            {pension.curfewDescription && (
              <div className="mb-5 rounded-xl border border-border bg-muted/30 p-3.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  Reglas de Convivencia
                </h4>
                <div className="flex flex-col gap-2 text-xs text-foreground/90">
                  <div className="flex items-start gap-2">
                    <Clock className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                    <span>{pension.curfewDescription}</span>
                  </div>
                  {pension.visitsPolicy && (
                    <div className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>{pension.visitsPolicy}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Habitaciones Disponibles
              </h4>
              <div className="flex flex-col gap-2">
                {pension.rooms.map((room, idx) => (
                  <div
                    key={room.id || `room-${pension.id}-${idx}`}
                    className="flex items-center justify-between rounded-xl border border-border bg-muted/30 p-3"
                  >
                    <div>
                      <h5 className="text-xs font-semibold text-foreground">{room.title}</h5>
                      <p className="text-[11px] text-muted-foreground">
                        {room.hasPrivateBathroom ? 'Baño privado' : 'Baño compartido'} •{' '}
                        {room.isAvailable ? 'Disponible ahora' : 'Ocupada'}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-primary">
                        ${room.priceMonthlyClp.toLocaleString('es-CL')}
                      </span>
                      <span className="block text-[10px] text-muted-foreground">CLP / mes</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 mb-2 p-3 rounded-xl bg-muted/30 border border-border/80 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  ¿Conoces este lugar o viste algo incorrecto?
                </span>
                <button
                  type="button"
                  id="btn-suggest-edit"
                  onClick={() => setIsSuggestEditOpen(true)}
                  className="text-xs font-semibold text-primary hover:underline transition cursor-pointer"
                >
                  Sugerir una corrección
                </button>
              </div>
            </div>
          </div>

          <DrawerFooter className="border-t border-border/80 bg-card p-4 md:px-8">
            {hasAlreadyReviewed ? (
              <Button
                id="btn-view-user-review"
                variant="outline"
                onClick={() => setIsReviewsModalOpen(true)}
                className="w-full h-12 border-primary/40 bg-primary/10 hover:bg-primary/20 text-primary font-bold text-sm rounded-xl transition cursor-pointer"
              >
                <Check className="mr-2 h-4 w-4 text-primary" /> Ya calificaste esta pensión (Ver
                opiniones)
              </Button>
            ) : (
              <Button
                id="btn-publish-review"
                onClick={() => setIsPublishReviewOpen(true)}
                className="w-full h-12 bg-primary hover:opacity-95 text-primary-foreground font-bold text-sm rounded-xl shadow-md active:scale-[0.98] transition cursor-pointer"
              >
                <PenLine className="mr-2 h-4 w-4" /> Publicar una reseña
              </Button>
            )}
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <PensionReviewsModal
        isOpen={isReviewsModalOpen}
        onClose={() => setIsReviewsModalOpen(false)}
        pension={pension}
        reviews={reviews}
      />

      <AmenitiesBreakdownModal
        isOpen={isAmenitiesModalOpen}
        onClose={() => setIsAmenitiesModalOpen(false)}
        pension={pension}
      />

      <PublishReviewModal
        isOpen={isPublishReviewOpen}
        onClose={() => setIsPublishReviewOpen(false)}
        pension={pension}
        onReviewPublished={handleReviewPublished}
      />

      <SuggestEditModal
        isOpen={isSuggestEditOpen}
        onClose={() => setIsSuggestEditOpen(false)}
        pension={pension}
      />
    </>
  );
}
