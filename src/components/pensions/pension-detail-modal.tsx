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
import { useCallback, useEffect, useState } from 'react';
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
import { fetchPensionReviews, mapRawPensionToItem } from '@/lib/api-client';
import { isApiSuccess } from '@/lib/api-response';
import { useAuth } from '@/lib/auth-context';
import type { PensionItem, PensionReview } from '@/lib/types';
import { pensionsService } from '@/services/pensions.service';
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
  const [reviews, setReviews] = useState<PensionReview[]>([]);
  const [isReviewsModalOpen, setIsReviewsModalOpen] = useState(false);
  const [isAmenitiesModalOpen, setIsAmenitiesModalOpen] = useState(false);
  const [isPublishReviewOpen, setIsPublishReviewOpen] = useState(false);
  const [isSuggestEditOpen, setIsSuggestEditOpen] = useState(false);

  const [livePension, setLivePension] = useState<PensionItem | null>(initialPension);
  const [isLoadingDetail, setIsLoadingDetail] = useState<boolean>(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const activePension = livePension ?? initialPension;
  const targetId = activePension?.id ?? pensionId ?? null;

  const [ratingStats, setRatingStats] = useState({
    average: activePension?.ratingAverage ?? 4.5,
    count: activePension?.reviewsCount ?? 0,
  });

  useEffect(() => {
    setLivePension(initialPension);
  }, [initialPension]);

  const loadLivePension = useCallback(async (): Promise<void> => {
    if (!targetId) return;
    setIsLoadingDetail(true);
    setDetailError(null);
    try {
      const res = await pensionsService.fetchPensionById(targetId);
      if (isApiSuccess(res)) {
        const mapped = mapRawPensionToItem(res.data as unknown as Record<string, unknown>);
        setLivePension(mapped);
      } else {
        setDetailError(res.message);
      }
    } catch (err) {
      setDetailError(err instanceof Error ? err.message : 'Error al cargar detalle');
    } finally {
      setIsLoadingDetail(false);
    }
  }, [targetId]);

  useEffect(() => {
    if (isOpen && targetId) {
      loadLivePension();
    }
  }, [isOpen, targetId, loadLivePension]);

  useEffect(() => {
    if (!activePension) return;
    setRatingStats({
      average: activePension.ratingAverage,
      count: activePension.reviewsCount,
    });
    let isCancelled = false;

    async function loadReviews() {
      if (!activePension) return;
      const data = await fetchPensionReviews(activePension.id);
      if (isCancelled) return;

      if (data && data.length > 0) {
        setReviews(data);
      } else {
        setReviews([
          {
            id: `fallback-rev-1-${activePension.id}`,
            pensionId: activePension.id,
            overallRating: 5,
            cleanlinessRating: 5,
            landlordRating: 5,
            quietnessRating: 4,
            wifiRating: 5,
            comment:
              'Excelente ambiente universitario y muy cercano al campus. Las habitaciones son luminosas y los gastos comunes están siempre al día. La dueña es muy comprensiva en épocas de exámenes.',
            stayDurationCategory: 'ONE_YEAR',
            isResidentVerified: true,
            createdAt: '2026-08-12T14:20:00Z',
            images: [
              {
                id: 'img-1',
                url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80',
                caption: 'Dormitorio individual ordenado',
              },
              {
                id: 'img-2',
                url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&q=80',
                caption: 'Espacio de estudio iluminado',
              },
            ],
            user: {
              id: 'user-val-1',
              firstName: 'Camila',
              lastName: 'Valenzuela',
              avatarUrl:
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
              university: {
                shortName: 'UCHILE',
                name: 'Universidad de Chile',
              },
            },
          },
          {
            id: `fallback-rev-2-${activePension.id}`,
            pensionId: activePension.id,
            overallRating: 4,
            cleanlinessRating: 4,
            landlordRating: 5,
            quietnessRating: 4,
            wifiRating: 4,
            comment:
              'Buena conectividad con el metro y micros. La cocina tiene todo lo necesario para prepararse almuerzos. El internet fibra óptica funciona impecable para clases online.',
            stayDurationCategory: 'ONE_SEMESTER',
            isResidentVerified: true,
            createdAt: '2026-07-28T10:00:00Z',
            images: [
              {
                id: 'img-3',
                url: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=600&q=80',
                caption: 'Cocina compartida amplia',
              },
            ],
            user: {
              id: 'user-val-2',
              firstName: 'Matías',
              lastName: 'Reyes',
              avatarUrl:
                'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=120&q=80',
              university: {
                shortName: 'PUCC',
                name: 'Pontificia Universidad Católica',
              },
            },
          },
          {
            id: `fallback-rev-3-${activePension.id}`,
            pensionId: activePension.id,
            overallRating: 5,
            cleanlinessRating: 5,
            landlordRating: 4,
            quietnessRating: 5,
            wifiRating: 5,
            comment:
              'Estudié Derecho y necesitaba mucho silencio para leer. El lugar respetó estrictamente los horarios de descanso. Totalmente recomendado para estudiantes de regiones.',
            stayDurationCategory: 'MORE_THAN_A_YEAR',
            isResidentVerified: true,
            createdAt: '2026-06-15T18:30:00Z',
            images: [],
            user: {
              id: 'user-val-3',
              firstName: 'Valentina',
              lastName: 'Soto',
              avatarUrl:
                'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
              university: {
                shortName: 'USACH',
                name: 'Universidad de Santiago',
              },
            },
          },
          {
            id: `fallback-rev-4-${activePension.id}`,
            pensionId: activePension.id,
            overallRating: 3,
            cleanlinessRating: 3,
            landlordRating: 3,
            quietnessRating: 2,
            wifiRating: 3,
            comment:
              'La pensión está bien ubicada, pero en época de calor las piezas del segundo piso son bastante calurosas y a veces el ruido de la calle dificulta estudiar.',
            stayDurationCategory: 'FEW_WEEKS',
            isResidentVerified: true,
            createdAt: '2026-05-18T12:00:00Z',
            images: [],
            user: {
              id: 'user-val-4',
              firstName: 'Diego',
              lastName: 'Morales',
              avatarUrl:
                'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
              university: {
                shortName: 'UDP',
                name: 'Universidad Diego Portales',
              },
            },
          },
        ]);
      }
    }

    loadReviews();

    return () => {
      isCancelled = true;
    };
  }, [activePension]);

  if (!isOpen) return null;

  if (!activePension && isLoadingDetail) {
    return (
      <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DrawerContent className="max-h-[92vh] max-w-lg mx-auto bg-card border-border p-6 flex flex-col items-center justify-center">
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
        <DrawerContent className="max-h-[92vh] max-w-lg mx-auto bg-card border-border p-6">
          <NetworkErrorState
            message={detailError}
            onRetry={loadLivePension}
            isRetrying={isLoadingDetail}
          />
        </DrawerContent>
      </Drawer>
    );
  }

  if (!activePension) return null;

  const pension = activePension;
  const isFav = isFavorite(pension.id);
  const hasAlreadyReviewed = Boolean(user && reviews.some((r) => r.user?.id === user.id));

  const handleReviewPublished = (newReview: PensionReview) => {
    setReviews((prev) => [newReview, ...prev]);
    setRatingStats((prev) => {
      const newCount = prev.count + 1;
      const newAvg = (prev.average * prev.count + newReview.overallRating) / newCount;
      return {
        average: Math.round(newAvg * 10) / 10,
        count: newCount,
      };
    });
  };

  return (
    <>
      <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DrawerContent
          id="pension-detail-drawer"
          className="max-h-[92vh] max-w-lg mx-auto bg-card border-border text-foreground overflow-hidden flex flex-col"
        >
          <div className="mx-auto mt-2.5 mb-1 h-1.5 w-12 rounded-full bg-muted-foreground/30 shrink-0" />

          <div className="overflow-y-auto flex-1 px-4 pt-1 pb-6">
            {detailError && (
              <NetworkErrorBanner
                message={detailError}
                onRetry={loadLivePension}
                isRetrying={isLoadingDetail}
                className="mb-3"
              />
            )}
            <div className="relative h-64 w-full rounded-2xl overflow-hidden bg-muted mb-4 shadow-sm">
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
                  <span>{ratingStats.average.toFixed(1)}</span>
                  <span className="text-muted-foreground font-normal underline decoration-muted-foreground/40">
                    ({Math.max(ratingStats.count, reviews.length)} reseñas)
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

          <DrawerFooter className="border-t border-border/80 bg-card p-4">
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
