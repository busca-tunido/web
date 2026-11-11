'use client';

import {
  ArrowLeft,
  BookOpen,
  Building2,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Heart,
  MapPin,
  PenLine,
  ShieldCheck,
  Star,
  Utensils,
  Wifi,
  Wind,
} from 'lucide-react';
import { AnimatePresence, motion, type PanInfo } from 'motion/react';
import Image from 'next/image';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useOptionalNavigation } from '@/contexts/navigation-context';
import { useFavoriteAction } from '@/hooks/use-favorite-action';
import { usePensionReviews } from '@/hooks/use-pension-reviews';
import { useAuth } from '@/lib/auth-context';
import type { PensionDetailViewItem, PensionItem, PensionReview } from '@/lib/types';
import { PensionReviewsModal } from '../reviews/pension-reviews-modal';
import { PensionReviewsPreview } from '../reviews/pension-reviews-preview';
import { PublishReviewModal } from '../reviews/publish-review-modal';
import { AmenitiesBreakdownModal } from './amenities-breakdown-modal';
import { PensionLocationMap } from './pension-location-map';
import { SuggestEditModal } from './suggest-edit-modal';

export type PensionDetailContentProps = {
  pension: PensionDetailViewItem;
  isLoadingDetail?: boolean;
  onBack?: () => void;
  showBackButton?: boolean;
};

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : direction < 0 ? '-100%' : 0,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? '100%' : direction > 0 ? '-100%' : 0,
    opacity: 0,
  }),
};

export function PensionDetailContent({
  pension: initialPension,
  isLoadingDetail = false,
  onBack,
  showBackButton = false,
}: PensionDetailContentProps) {
  const { user } = useAuth();
  const { isFavorite, onFavoriteClick } = useFavoriteAction();
  const navigation = useOptionalNavigation();
  const openAuthModal = navigation?.openAuthModal;

  const [activePhotoIdx, setActivePhotoIdx] = useState<number>(0);
  const [direction, setDirection] = useState<number>(0);
  const [isReviewsModalOpen, setIsReviewsModalOpen] = useState<boolean>(false);
  const [isAmenitiesModalOpen, setIsAmenitiesModalOpen] = useState<boolean>(false);
  const [isPublishReviewOpen, setIsPublishReviewOpen] = useState<boolean>(false);
  const [isSuggestEditOpen, setIsSuggestEditOpen] = useState<boolean>(false);

  const initialCount =
    ('reviewsCount' in initialPension && typeof initialPension.reviewsCount === 'number'
      ? initialPension.reviewsCount
      : 'ratingCount' in initialPension &&
          typeof (initialPension as { ratingCount?: number }).ratingCount === 'number'
        ? (initialPension as { ratingCount?: number }).ratingCount
        : 0) ?? 0;

  const {
    reviews,
    ratingStats,
    refetch: reloadReviews,
  } = usePensionReviews(initialPension.id, {
    average: initialPension.ratingAverage ?? 0,
    count: initialCount,
  });

  const pension: PensionDetailViewItem = useMemo(() => {
    const effectiveAverage =
      ratingStats.average > 0 ? ratingStats.average : (initialPension.ratingAverage ?? 0);
    const effectiveCount = ratingStats.count > 0 ? ratingStats.count : initialCount;

    return {
      ...initialPension,
      ratingAverage: effectiveAverage,
      reviewsCount: effectiveCount,
    };
  }, [initialPension, ratingStats, initialCount]);

  const isFav = isFavorite(pension.id);
  const hasAlreadyReviewed = Boolean(user && reviews.some((r) => r.user?.id === user.id));

  const handleReviewPublished = (_newReview: PensionReview) => {
    reloadReviews();
  };

  const displayPhotos = pension.images?.map((img) => img.url) ?? [];

  const pensionId = initialPension.id;
  useEffect(() => {
    if (pensionId) {
      setActivePhotoIdx(0);
      setDirection(0);
    }
  }, [pensionId]);

  const paginate = useCallback(
    (newDirection: number) => {
      if (displayPhotos.length <= 1) return;
      setDirection(newDirection);
      setActivePhotoIdx((prev) => {
        const next = prev + newDirection;
        if (next < 0) return displayPhotos.length - 1;
        if (next >= displayPhotos.length) return 0;
        return next;
      });
    },
    [displayPhotos.length],
  );

  const handleDragEnd = useCallback(
    (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const threshold = 40;
      const velocityThreshold = 300;
      if (info.offset.x < -threshold || info.velocity.x < -velocityThreshold) {
        paginate(1);
      } else if (info.offset.x > threshold || info.velocity.x > velocityThreshold) {
        paginate(-1);
      }
    },
    [paginate],
  );

  return (
    <div className="flex flex-col w-full">
      <div className="relative h-64 sm:h-80 md:h-96 w-full rounded-2xl overflow-hidden bg-muted mb-4 shadow-sm touch-pan-y select-none">
        {displayPhotos.length > 0 ? (
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={activePhotoIdx}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: 'spring', stiffness: 350, damping: 35 },
                opacity: { duration: 0.2 },
              }}
              drag={displayPhotos.length > 1 ? 'x' : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.25}
              onDragEnd={handleDragEnd}
              className="absolute inset-0 h-full w-full cursor-grab active:cursor-grabbing"
            >
              <Image
                src={displayPhotos[activePhotoIdx]}
                alt={`${pension.title} - Foto ${activePhotoIdx + 1}`}
                fill
                unoptimized
                draggable={false}
                sizes="(max-width: 640px) 100vw, 896px"
                className="object-cover pointer-events-none"
                priority={activePhotoIdx === 0}
              />
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted/60">
            <Building2 className="h-16 w-16 text-muted-foreground/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none z-10" />

        {showBackButton && onBack && (
          <button
            type="button"
            onClick={onBack}
            className="absolute top-3 left-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md hover:bg-black/80 active:scale-90 transition shadow-sm cursor-pointer"
            aria-label="Volver atrás"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}

        <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => onFavoriteClick(pension.id, e)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-black/60 backdrop-blur-md text-white hover:text-primary active:scale-90 transition shadow-sm cursor-pointer"
            aria-label="Guardar en favoritos"
          >
            <Heart className={`h-5 w-5 ${isFav ? 'fill-primary text-primary' : ''}`} />
          </button>
        </div>

        {displayPhotos.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => paginate(-1)}
              className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 z-20 h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md hover:bg-black/80 active:scale-95 transition shadow-sm cursor-pointer"
              aria-label="Foto anterior"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => paginate(1)}
              className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 z-20 h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md hover:bg-black/80 active:scale-95 transition shadow-sm cursor-pointer"
              aria-label="Siguiente foto"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        <div className="absolute bottom-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
          <div className="flex gap-1.5 pointer-events-auto items-center py-1">
            {displayPhotos.map((photoUrl, i) => (
              <button
                key={`photo-dot-${pension.id}-${i}-${photoUrl}`}
                type="button"
                onClick={() => {
                  if (i === activePhotoIdx) return;
                  setDirection(i > activePhotoIdx ? 1 : -1);
                  setActivePhotoIdx(i);
                }}
                className="relative py-2 px-0.5 -my-2 flex items-center cursor-pointer min-h-[32px]"
                aria-label={`Ver foto ${i + 1}`}
              >
                <span
                  className={`block h-1.5 rounded-full transition-all ${
                    i === activePhotoIdx ? 'w-6 bg-primary' : 'w-2 bg-white/40'
                  }`}
                />
              </button>
            ))}
          </div>
          <Badge className="bg-primary text-primary-foreground font-bold text-xs shadow pointer-events-auto">
            ${(pension.baseMonthlyPrice ?? 0).toLocaleString('es-CL')} CLP/mes
          </Badge>
        </div>
      </div>

      <div className="flex flex-col gap-1 mb-4">
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          {(pension.verificationStatus === 'OFFICIALLY_VERIFIED' ||
            pension.verificationStatus === 'COMMUNITY_VERIFIED') && (
            <Badge
              variant="outline"
              className="border-sage/30 bg-sage/10 text-sage-foreground gap-1 text-[11px] font-semibold"
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
            <span>{pension.ratingAverage > 0 ? pension.ratingAverage.toFixed(1) : 'Nuevo'}</span>
            <span className="text-muted-foreground font-normal underline decoration-muted-foreground/40">
              (
              {(pension.reviewsCount ?? 0) > 0
                ? `${pension.reviewsCount} ${(pension.reviewsCount ?? 0) === 1 ? 'reseña' : 'reseñas'}`
                : 'Sin reseñas'}
              )
            </span>
          </button>
        </div>

        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground leading-tight text-balance">
          {pension.title}
        </h1>
        <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
          <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <span>
            {[pension.address, pension.neighborhood, pension.city].filter(Boolean).join(', ')}
          </span>
        </p>
      </div>

      {Boolean(
        pension.nearestUniversity?.distanceMeters &&
          pension.nearestUniversity.distanceMeters > 0 &&
          pension.nearestUniversity.name,
      ) && (
        <div className="mb-4 rounded-xl border border-sage/25 bg-sage/5 p-3 min-h-[44px] flex items-center">
          <div className="flex items-center gap-2 text-xs font-semibold text-sage-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="text-foreground">
              A <span className="tabular-nums">{pension.nearestUniversity?.distanceMeters}</span>m
              de {pension.nearestUniversity?.name}
            </span>
          </div>
        </div>
      )}

      {pension.description ? (
        <div className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
            Descripción de la Pensión
          </h2>
          <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line text-pretty max-w-prose">
            {pension.description}
          </p>
        </div>
      ) : isLoadingDetail ? (
        <div className="mb-5" aria-hidden="true">
          <div className="h-3.5 w-36 rounded bg-muted animate-pulse mb-2.5" />
          <div className="space-y-2">
            <div className="h-3 w-full rounded bg-muted/70 animate-pulse" />
            <div className="h-3 w-4/5 rounded bg-muted/60 animate-pulse" />
            <div className="h-3 w-3/5 rounded bg-muted/50 animate-pulse" />
          </div>
        </div>
      ) : null}

      <div className="mb-5">
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Servicios y Comodidades
          </h2>
          {!isLoadingDetail && (
            <button
              type="button"
              onClick={() => setIsAmenitiesModalOpen(true)}
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              <span>Ver más detalles</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {isLoadingDetail && !pension.amenitySlugs && !pension.amenities ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs" aria-hidden="true">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={`amenity-skel-${i}`}
                className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 p-2.5 animate-pulse"
              >
                <div className="h-4 w-4 rounded-full bg-muted-foreground/20" />
                <div className="h-3 w-20 rounded bg-muted-foreground/20" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {(() => {
              const hasWifi = Boolean(
                pension.internetIncluded ||
                  pension.amenitySlugs?.includes('wifi-alta-velocidad') ||
                  pension.amenities?.some(
                    (a) => (typeof a === 'string' ? a : a.slug) === 'wifi-alta-velocidad',
                  ),
              );
              return (
                <div
                  className={`flex items-center gap-2 rounded-lg border p-2.5 ${
                    hasWifi
                      ? 'border-sage/25 bg-sage/8 text-foreground'
                      : 'border-border text-muted-foreground opacity-50'
                  }`}
                >
                  <Wifi
                    className={`h-4 w-4 shrink-0 ${
                      hasWifi ? 'text-sage-foreground' : 'text-muted-foreground/60'
                    }`}
                  />
                  <span>{hasWifi ? 'WiFi Alta Velocidad' : 'Sin WiFi'}</span>
                </div>
              );
            })()}
            {(() => {
              const hasMeals =
                pension.amenitySlugs?.includes('comida-incluida') ||
                pension.amenities?.some(
                  (a) => (typeof a === 'string' ? a : a.slug) === 'comida-incluida',
                );
              return (
                <div
                  className={`flex items-center gap-2 rounded-lg border p-2.5 ${
                    hasMeals
                      ? 'border-sage/25 bg-sage/8 text-foreground'
                      : 'border-border text-muted-foreground opacity-50'
                  }`}
                >
                  <Utensils
                    className={`h-4 w-4 shrink-0 ${
                      hasMeals ? 'text-sage-foreground' : 'text-muted-foreground/60'
                    }`}
                  />
                  <span>{hasMeals ? 'Comida incluida' : 'Sin alimentación'}</span>
                </div>
              );
            })()}
            {(() => {
              const hasStudy =
                pension.amenitySlugs?.includes('sala-estudio-cowork') ||
                pension.amenities?.some(
                  (a) => (typeof a === 'string' ? a : a.slug) === 'sala-estudio-cowork',
                );
              return (
                <div
                  className={`flex items-center gap-2 rounded-lg border p-2.5 ${
                    hasStudy
                      ? 'border-sage/25 bg-sage/8 text-foreground'
                      : 'border-border text-muted-foreground opacity-50'
                  }`}
                >
                  <BookOpen
                    className={`h-4 w-4 shrink-0 ${
                      hasStudy ? 'text-sage-foreground' : 'text-muted-foreground/60'
                    }`}
                  />
                  <span>Sala de Estudio</span>
                </div>
              );
            })()}
            {(() => {
              const hasLaundry =
                pension.amenitySlugs?.includes('lavadora-secadora') ||
                pension.amenities?.some(
                  (a) => (typeof a === 'string' ? a : a.slug) === 'lavadora-secadora',
                );
              return (
                <div
                  className={`flex items-center gap-2 rounded-lg border p-2.5 ${
                    hasLaundry
                      ? 'border-sage/25 bg-sage/8 text-foreground'
                      : 'border-border text-muted-foreground opacity-50'
                  }`}
                >
                  <Wind
                    className={`h-4 w-4 shrink-0 ${
                      hasLaundry ? 'text-sage-foreground' : 'text-muted-foreground/60'
                    }`}
                  />
                  <span>Lavandería</span>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      <PensionReviewsPreview
        pension={pension}
        reviews={reviews}
        onOpenFullReviews={() => setIsReviewsModalOpen(true)}
      />

      {Boolean(pension.curfewTime || pension.guestsAllowed !== undefined) && (
        <div className="mb-5 rounded-xl border border-border bg-muted/30 p-3.5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
            Reglas de Convivencia
          </h2>
          <div className="flex flex-col gap-2 text-xs text-foreground/90">
            {pension.curfewTime && (
              <div className="flex items-start gap-2">
                <Clock className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span>Toque de queda: {pension.curfewTime}</span>
              </div>
            )}
            {pension.guestsAllowed !== undefined && (
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>{pension.guestsAllowed ? 'Visitas permitidas' : 'Sin visitas'}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {(() => {
        const rooms = pension.rooms;
        if (Array.isArray(rooms) && rooms.length > 0) {
          return (
            <div className="mb-5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Habitaciones Registradas
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {rooms.map((room, idx) => (
                  <div
                    key={room.id || `room-${pension.id}-${idx}`}
                    className="flex items-center justify-between rounded-xl border border-border bg-muted/30 p-3"
                  >
                    <div>
                      <h3 className="text-xs font-semibold text-foreground">{room.title}</h3>
                      <p className="text-[11px] text-muted-foreground">
                        {room.hasPrivateBathroom ? 'Baño privado' : 'Baño compartido'} •{' '}
                        {room.isAvailable ? 'Disponible' : 'Ocupada'}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-primary tabular-nums">
                        ${(room.monthlyPrice ?? 0).toLocaleString('es-CL')}
                      </span>
                      <span className="block text-[10px] text-muted-foreground">CLP / mes</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        }

        if (isLoadingDetail && rooms === undefined) {
          return (
            <div className="mb-5" aria-hidden="true">
              <div className="h-3.5 w-40 rounded bg-muted animate-pulse mb-2.5" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[1, 2].map((i) => (
                  <div
                    key={`room-skel-${i}`}
                    className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-3 animate-pulse"
                  >
                    <div className="space-y-1.5">
                      <div className="h-3.5 w-24 rounded bg-muted-foreground/20" />
                      <div className="h-2.5 w-32 rounded bg-muted-foreground/15" />
                    </div>
                    <div className="h-4 w-16 rounded bg-muted-foreground/20" />
                  </div>
                ))}
              </div>
            </div>
          );
        }

        return null;
      })()}

      <PensionLocationMap
        latitude={pension.latitude}
        longitude={pension.longitude}
        title={pension.title}
        city={pension.city}
        neighborhood={pension.neighborhood}
        address={pension.address}
        isLoading={isLoadingDetail}
      />

      <div className="mt-4 mb-2 p-3 rounded-xl bg-muted/30 border border-border/80 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          ¿Conoces este lugar o viste algo incorrecto?
        </span>
        <button
          type="button"
          id="btn-suggest-edit"
          onClick={() => {
            if (!user) {
              openAuthModal?.();
              return;
            }
            setIsSuggestEditOpen(true);
          }}
          className="text-xs font-semibold text-primary hover:underline transition cursor-pointer"
        >
          Sugerir una corrección
        </button>
      </div>

      <div className="mt-6 pt-4 border-t border-border/80">
        {user ? (
          hasAlreadyReviewed ? (
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
          )
        ) : (
          <Button
            id="btn-auth-to-review"
            onClick={openAuthModal}
            className="w-full h-12 bg-primary hover:opacity-95 text-primary-foreground font-bold text-sm rounded-xl shadow-md active:scale-[0.98] transition cursor-pointer"
          >
            <PenLine className="mr-2 h-4 w-4" /> Inicia sesión para opinar o guardar
          </Button>
        )}
      </div>

      {isReviewsModalOpen && (
        <PensionReviewsModal
          isOpen={isReviewsModalOpen}
          onClose={() => setIsReviewsModalOpen(false)}
          pension={pension as PensionItem}
          reviews={reviews}
        />
      )}

      {isAmenitiesModalOpen && (
        <AmenitiesBreakdownModal
          isOpen={isAmenitiesModalOpen}
          onClose={() => setIsAmenitiesModalOpen(false)}
          pension={pension as PensionItem}
        />
      )}

      {isPublishReviewOpen && (
        <PublishReviewModal
          isOpen={isPublishReviewOpen}
          onClose={() => setIsPublishReviewOpen(false)}
          pension={pension as PensionItem}
          onReviewPublished={handleReviewPublished}
        />
      )}

      {isSuggestEditOpen && (
        <SuggestEditModal
          isOpen={isSuggestEditOpen}
          onClose={() => setIsSuggestEditOpen(false)}
          pension={pension as PensionItem}
        />
      )}
    </div>
  );
}
