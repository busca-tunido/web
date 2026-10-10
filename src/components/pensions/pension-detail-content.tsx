'use client';

import {
  ArrowLeft,
  BookOpen,
  Building2,
  Check,
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
import Image from 'next/image';
import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useOptionalNavigation } from '@/contexts/navigation-context';
import { usePensionReviews } from '@/hooks/use-pension-reviews';
import { useAuth } from '@/lib/auth-context';
import type { PensionItem, PensionReview } from '@/lib/types';
import { PensionReviewsModal } from '../reviews/pension-reviews-modal';
import { PensionReviewsPreview } from '../reviews/pension-reviews-preview';
import { PublishReviewModal } from '../reviews/publish-review-modal';
import { AmenitiesBreakdownModal } from './amenities-breakdown-modal';
import { PensionLocationMap } from './pension-location-map';
import { SuggestEditModal } from './suggest-edit-modal';

export type PensionDetailContentProps = {
  pension: PensionItem;
  onBack?: () => void;
  showBackButton?: boolean;
};

export function PensionDetailContent({
  pension: initialPension,
  onBack,
  showBackButton = false,
}: PensionDetailContentProps) {
  const { user, isFavorite, toggleFavorite } = useAuth();
  const navigation = useOptionalNavigation();
  const openAuthModal = navigation?.openAuthModal;

  const [activePhotoIdx, setActivePhotoIdx] = useState<number>(0);
  const [isReviewsModalOpen, setIsReviewsModalOpen] = useState<boolean>(false);
  const [isAmenitiesModalOpen, setIsAmenitiesModalOpen] = useState<boolean>(false);
  const [isPublishReviewOpen, setIsPublishReviewOpen] = useState<boolean>(false);
  const [isSuggestEditOpen, setIsSuggestEditOpen] = useState<boolean>(false);

  const {
    reviews,
    ratingStats,
    refetch: reloadReviews,
  } = usePensionReviews(initialPension.id, {
    average: initialPension.ratingAverage ?? 0,
    count: initialPension.reviewsCount ?? 0,
  });

  const pension = useMemo(() => {
    const effectiveAverage =
      ratingStats.average > 0 ? ratingStats.average : (initialPension.ratingAverage ?? 0);
    const effectiveCount =
      ratingStats.count > 0 ? ratingStats.count : (initialPension.reviewsCount ?? 0);

    return {
      ...initialPension,
      ratingAverage: effectiveAverage,
      reviewsCount: effectiveCount,
    };
  }, [initialPension, ratingStats]);

  const isFav = isFavorite(pension.id);
  const hasAlreadyReviewed = Boolean(user && reviews.some((r) => r.user?.id === user.id));

  const handleReviewPublished = (_newReview: PensionReview) => {
    reloadReviews();
  };

  return (
    <div className="flex flex-col w-full">
      <div className="relative h-64 sm:h-80 md:h-96 w-full rounded-2xl overflow-hidden bg-muted mb-4 shadow-sm">
        {(pension.photos[activePhotoIdx] ?? pension.photos[0]) ? (
          <Image
            src={pension.photos[activePhotoIdx] ?? pension.photos[0]}
            alt={pension.title}
            fill
            unoptimized
            sizes="(max-width: 640px) 100vw, 896px"
            className="object-cover transition duration-300"
            priority
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted/60">
            <Building2 className="h-16 w-16 text-muted-foreground/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

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

        <div className="absolute top-3 right-3 flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (!user) {
                openAuthModal?.();
                return;
              }
              toggleFavorite(pension.id);
            }}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-black/60 backdrop-blur-md text-white hover:text-primary active:scale-90 transition shadow-sm cursor-pointer"
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
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  i === activePhotoIdx ? 'w-6 bg-primary' : 'w-2 bg-white/40'
                }`}
                aria-label={`Ver foto ${i + 1}`}
              />
            ))}
          </div>
          <Badge className="bg-primary text-primary-foreground font-bold text-xs shadow">
            ${pension.priceMonthlyClp.toLocaleString('es-CL')} CLP/mes
          </Badge>
        </div>
      </div>

      <div className="flex flex-col gap-1 mb-4">
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
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
            <span>{pension.ratingAverage > 0 ? pension.ratingAverage.toFixed(1) : 'Nuevo'}</span>
            <span className="text-muted-foreground font-normal underline decoration-muted-foreground/40">
              (
              {pension.reviewsCount > 0
                ? `${pension.reviewsCount} ${pension.reviewsCount === 1 ? 'reseña' : 'reseñas'}`
                : 'Sin reseñas'}
              )
            </span>
          </button>
        </div>

        <h1 className="text-xl sm:text-2xl font-bold text-foreground leading-tight">
          {pension.title}
        </h1>
        <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
          <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <span>
            {pension.address}, {pension.neighborhood}, {pension.city}
          </span>
        </p>
      </div>

      {Boolean(
        pension.distanceToUniversityMeters &&
          pension.distanceToUniversityMeters > 0 &&
          pension.nearestUniversityName,
      ) && (
        <div className="mb-4 rounded-xl border border-primary/20 bg-primary/5 p-3">
          <div className="flex items-center gap-2 text-xs font-medium text-primary">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span>
              A {pension.distanceToUniversityMeters}m de {pension.nearestUniversityName}
            </span>
          </div>
        </div>
      )}

      <div className="mb-5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
          Descripción de la Pensión
        </h2>
        <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line">
          {pension.description}
        </p>
      </div>

      <div className="mb-5">
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Servicios y Comodidades
          </h2>
          <button
            type="button"
            onClick={() => setIsAmenitiesModalOpen(true)}
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            <span>Ver más detalles</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div
            className={`flex items-center gap-2 rounded-lg border p-2.5 ${
              pension.includesWifi
                ? 'border-primary/30 bg-muted/40 text-foreground'
                : 'border-border text-muted-foreground line-through opacity-50'
            }`}
          >
            <Wifi
              className={`h-4 w-4 shrink-0 ${
                pension.includesWifi ? 'text-primary' : 'text-muted-foreground/60'
              }`}
            />
            <span>WiFi Alta Velocidad</span>
          </div>
          <div
            className={`flex items-center gap-2 rounded-lg border p-2.5 ${
              pension.includesMeals
                ? 'border-primary/30 bg-muted/40 text-foreground'
                : 'border-border text-muted-foreground opacity-50'
            }`}
          >
            <Utensils
              className={`h-4 w-4 shrink-0 ${
                pension.includesMeals ? 'text-primary' : 'text-muted-foreground/60'
              }`}
            />
            <span>{pension.includesMeals ? 'Cocina equipada' : 'Sin cocina'}</span>
          </div>
          <div
            className={`flex items-center gap-2 rounded-lg border p-2.5 ${
              pension.includesStudyRoom
                ? 'border-primary/30 bg-muted/40 text-foreground'
                : 'border-border text-muted-foreground opacity-50'
            }`}
          >
            <BookOpen
              className={`h-4 w-4 shrink-0 ${
                pension.includesStudyRoom ? 'text-primary' : 'text-muted-foreground/60'
              }`}
            />
            <span>Sala de Estudio</span>
          </div>
          <div
            className={`flex items-center gap-2 rounded-lg border p-2.5 ${
              pension.includesLaundry
                ? 'border-primary/30 bg-muted/40 text-foreground'
                : 'border-border text-muted-foreground opacity-50'
            }`}
          >
            <Wind
              className={`h-4 w-4 shrink-0 ${
                pension.includesLaundry ? 'text-primary' : 'text-muted-foreground/60'
              }`}
            />
            <span>Lavandería</span>
          </div>
        </div>
      </div>

      <PensionReviewsPreview
        pension={pension}
        reviews={reviews}
        onOpenFullReviews={() => setIsReviewsModalOpen(true)}
      />

      {pension.curfewDescription && (
        <div className="mb-5 rounded-xl border border-border bg-muted/30 p-3.5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
            Reglas de Convivencia
          </h2>
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

      <div className="mb-5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
          Habitaciones Registradas
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {pension.rooms.map((room, idx) => (
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
                <span className="text-xs font-bold text-primary">
                  ${room.priceMonthlyClp.toLocaleString('es-CL')}
                </span>
                <span className="block text-[10px] text-muted-foreground">CLP / mes</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <PensionLocationMap
        latitude={pension.latitude}
        longitude={pension.longitude}
        title={pension.title}
        city={pension.city}
        neighborhood={pension.neighborhood}
        address={pension.address}
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
          pension={pension}
          reviews={reviews}
        />
      )}

      {isAmenitiesModalOpen && (
        <AmenitiesBreakdownModal
          isOpen={isAmenitiesModalOpen}
          onClose={() => setIsAmenitiesModalOpen(false)}
          pension={pension}
        />
      )}

      {isPublishReviewOpen && (
        <PublishReviewModal
          isOpen={isPublishReviewOpen}
          onClose={() => setIsPublishReviewOpen(false)}
          pension={pension}
          onReviewPublished={handleReviewPublished}
        />
      )}

      {isSuggestEditOpen && (
        <SuggestEditModal
          isOpen={isSuggestEditOpen}
          onClose={() => setIsSuggestEditOpen(false)}
          pension={pension}
        />
      )}
    </div>
  );
}
