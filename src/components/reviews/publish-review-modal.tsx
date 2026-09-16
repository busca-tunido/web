'use client';

import {
  AlertCircle,
  Camera,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  Loader2,
  PenLine,
  Sparkles,
  Star,
  Wifi,
  Wind,
  X,
  Zap,
} from 'lucide-react';
import Image from 'next/image';
import { type ChangeEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { createReviewSchema, usePensionReviews } from '@/hooks/use-pension-reviews';
import { isApiSuccess } from '@/lib/api-response';
import { useAuth } from '@/lib/auth-context';
import { prepareImageForUpload, validateImageFile } from '@/lib/image-utils';
import type { PensionItem, PensionReview, StayDurationCategory } from '@/lib/types';
import { uploadSingleImage } from '@/services/uploads.service';

type PublishReviewModalProps = {
  isOpen: boolean;
  onClose: () => void;
  pension: PensionItem;
  onReviewPublished: (newReview: PensionReview) => void;
};

const STAY_DURATIONS: Array<{ id: StayDurationCategory; label: string }> = [
  { id: 'FEW_DAYS', label: 'Pocos días' },
  { id: 'FEW_WEEKS', label: 'Pocas semanas' },
  { id: 'ONE_SEMESTER', label: '1 semestre académico' },
  { id: 'ONE_YEAR', label: '1 año universitario' },
  { id: 'MORE_THAN_A_YEAR', label: 'Más de 1 año' },
];

const RATING_LABELS: Record<number, string> = {
  1: 'Muy mala',
  2: 'Regular',
  3: 'Aceptable',
  4: 'Muy buena',
  5: 'Excelente',
};

export function PublishReviewModal({
  isOpen,
  onClose,
  pension,
  onReviewPublished,
}: PublishReviewModalProps) {
  const { user } = useAuth();
  const { publishReview } = usePensionReviews(isOpen ? pension.id : null);

  const [overallRating, setOverallRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [showSubRatings, setShowSubRatings] = useState(false);

  const [cleanlinessRating, setCleanlinessRating] = useState<number | null>(null);
  const [landlordRating, setLandlordRating] = useState<number | null>(null);
  const [quietnessRating, setQuietnessRating] = useState<number | null>(null);
  const [wifiRating, setWifiRating] = useState<number | null>(null);

  const [stayDuration, setStayDuration] = useState<StayDurationCategory>('ONE_SEMESTER');
  const [comment, setComment] = useState('');

  const [selectedFiles, setSelectedFiles] = useState<Array<{ file: File; previewUrl: string }>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState(false);

  const handlePhotoSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const availableSlots = 3 - selectedFiles.length;
    const filesToAdd = Array.from(files).slice(0, availableSlots);

    const newEntries: Array<{ file: File; previewUrl: string }> = [];
    for (const file of filesToAdd) {
      const validation = validateImageFile(file);
      if (!validation.valid) {
        setErrorMessage(validation.error || 'Formato de imagen no compatible');
        continue;
      }
      try {
        const prepared = await prepareImageForUpload(file);
        newEntries.push({
          file: prepared,
          previewUrl: URL.createObjectURL(prepared),
        });
      } catch (err) {
        setErrorMessage(
          err instanceof Error
            ? err.message
            : 'No se pudo procesar la imagen seleccionada. Por favor, intenta con otra.',
        );
      }
    }

    if (newEntries.length > 0) {
      setSelectedFiles((prev) => [...prev, ...newEntries]);
    }
    e.target.value = '';
  };

  const removePhoto = (index: number) => {
    setSelectedFiles((prev) => {
      const target = prev[index];
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async () => {
    const validation = createReviewSchema.safeParse({
      rating: overallRating,
      comment: comment.trim(),
      cleanlinessRating: cleanlinessRating ?? undefined,
      landlordRating: landlordRating ?? undefined,
      locationRating: quietnessRating ?? undefined,
      stayDuration,
      images: selectedFiles.map((f) => f.previewUrl),
    });

    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message || 'Verifica los campos ingresados.';
      setErrorMessage(firstError);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const uploadedUrls: string[] = [];
      for (const item of selectedFiles) {
        const res = await uploadSingleImage(item.file);
        if (isApiSuccess(res) && res.data.url) {
          uploadedUrls.push(res.data.url);
        } else {
          const failMsg = !isApiSuccess(res)
            ? res.message
            : 'No fue posible subir la imagen. Verifica tu conexión e intenta de nuevo.';
          setErrorMessage(failMsg);
          setIsSubmitting(false);
          return;
        }
      }

      const result = await publishReview({
        overallRating,
        rating: overallRating,
        comment: comment.trim(),
        cleanlinessRating: cleanlinessRating ?? undefined,
        landlordRating: landlordRating ?? undefined,
        quietnessRating: quietnessRating ?? undefined,
        locationRating: quietnessRating ?? undefined,
        wifiRating: wifiRating ?? undefined,
        stayDurationCategory: stayDuration,
        stayDuration: stayDuration,
        images: uploadedUrls,
      });

      if (!result.success || !result.review) {
        setErrorMessage(result.error || 'Ocurrió un error al enviar tu reseña.');
        setIsSubmitting(false);
        return;
      }

      const serverReview = result.review;
      const createdReview: PensionReview = {
        id: serverReview.id || `rev-${Date.now()}`,
        pensionId: pension.id,
        overallRating: serverReview.rating ?? overallRating,
        cleanlinessRating: serverReview.cleanlinessRating ?? cleanlinessRating ?? undefined,
        landlordRating: serverReview.landlordRating ?? landlordRating ?? undefined,
        quietnessRating: serverReview.locationRating ?? quietnessRating ?? undefined,
        wifiRating: wifiRating ?? undefined,
        comment: serverReview.comment ?? comment.trim(),
        stayDurationCategory: stayDuration,
        isResidentVerified: true,
        createdAt: serverReview.createdAt ?? new Date().toISOString(),
        images: uploadedUrls.map((url, i) => ({ id: `img-${i}`, url })),
        user: {
          id: user?.id || 'usr-current',
          firstName: user?.firstName || 'Estudiante',
          lastName: user?.lastName || 'Residente',
          avatarUrl: user?.avatarUrl,
          university: {
            name: user?.universityName || 'Universidad de Chile',
            shortName: 'UCHILE',
          },
        },
      };

      setSuccessBanner(true);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('tunido_review_published'));
      }
      onReviewPublished(createdReview);

      setTimeout(() => {
        setSuccessBanner(false);
        onClose();
      }, 1500);
    } catch (err: unknown) {
      const errStr = (err as Error)?.message || '';
      if (
        errStr.includes('409') ||
        errStr.toLowerCase().includes('already reviewed') ||
        errStr.toLowerCase().includes('ya has publicado')
      ) {
        setErrorMessage(
          'Ya has publicado una reseña para esta pensión. Puedes editar tu opinión existente desde tu perfil.',
        );
      } else {
        setErrorMessage(errStr || 'Hubo un error al enviar tu reseña. Inténtalo nuevamente.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isMinLength = comment.trim().length >= 15;
  const currentRatingValue = hoverRating || overallRating;

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent
        id="publish-review-drawer"
        className="max-h-[92vh] max-w-lg md:max-w-2xl mx-auto bg-card border-border text-foreground flex flex-col overflow-hidden md:rounded-3xl"
      >
        <div className="mx-auto mt-2.5 mb-1 h-1.5 w-12 rounded-full bg-muted-foreground/30 shrink-0 md:hidden" />

        <div className="flex items-center justify-between px-4 py-2 border-b border-border/60">
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted text-muted-foreground transition cursor-pointer"
            aria-label="Volver"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Publicar Opinión
          </span>
          <div className="w-8" />
        </div>

        <div className="overflow-y-auto flex-1 px-4 md:px-8 py-4 space-y-5">
          <DrawerHeader className="p-0 text-left">
            <DrawerTitle className="text-lg font-bold text-foreground">
              Califica tu experiencia en {pension.title}
            </DrawerTitle>
            <DrawerDescription className="text-xs text-muted-foreground mt-1">
              Tu opinión sincera orienta a otros universitarios y fomenta una comunidad
              transparente.
            </DrawerDescription>
          </DrawerHeader>

          {successBanner && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 flex items-center gap-3 text-emerald-600 animate-in fade-in">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <p className="text-xs font-semibold">
                ¡Reseña publicada con éxito! Gracias por colaborar con la comunidad.
              </p>
            </div>
          )}

          {errorMessage && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 flex items-start gap-2.5 text-rose-600 animate-in fade-in">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <p className="text-xs">{errorMessage}</p>
            </div>
          )}

          <section className="rounded-2xl border border-border bg-muted/20 p-4 text-center">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
              Calificación General Obligatoria
            </h4>
            <div className="flex items-center justify-center gap-2 mb-2">
              {[1, 2, 3, 4, 5].map((starVal) => (
                <button
                  key={`star-${starVal}`}
                  type="button"
                  onClick={() => setOverallRating(starVal)}
                  onMouseEnter={() => setHoverRating(starVal)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform active:scale-90 hover:scale-110 cursor-pointer"
                  aria-label={`${starVal} estrellas`}
                >
                  <Star
                    className={`h-8 w-8 ${
                      starVal <= currentRatingValue
                        ? 'fill-amber-500 text-amber-500'
                        : 'fill-muted text-muted-foreground/40'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-xs font-semibold text-amber-600 h-4">
              {RATING_LABELS[currentRatingValue] || 'Selecciona tu calificación'}
            </p>
          </section>

          <section className="rounded-2xl border border-border bg-card p-3.5">
            <button
              type="button"
              onClick={() => setShowSubRatings(!showSubRatings)}
              className="flex items-center justify-between w-full text-xs font-bold text-foreground cursor-pointer"
            >
              <span>Calificaciones por aspectos específicos (Opcional)</span>
              {showSubRatings ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </button>

            {showSubRatings && (
              <div className="mt-4 space-y-3.5 border-t border-border/60 pt-3 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    <span>Limpieza e Higiene</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((starVal) => (
                        <button
                          key={`clean-${starVal}`}
                          type="button"
                          onClick={() =>
                            setCleanlinessRating(cleanlinessRating === starVal ? null : starVal)
                          }
                          className="p-0.5 transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                          aria-label={`Limpieza ${starVal} estrellas`}
                        >
                          <Star
                            className={`h-4 w-4 ${
                              cleanlinessRating !== null && starVal <= cleanlinessRating
                                ? 'fill-amber-500 text-amber-500'
                                : 'fill-muted text-muted-foreground/30'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    <span className="w-16 text-[10px] text-right font-medium text-muted-foreground">
                      {cleanlinessRating !== null ? (
                        `${cleanlinessRating}/5`
                      ) : (
                        <span className="text-muted-foreground/50">Opcional</span>
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Zap className="h-3.5 w-3.5 text-primary" />
                    <span>Trato y Convivencia con el Dueño</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((starVal) => (
                        <button
                          key={`landlord-${starVal}`}
                          type="button"
                          onClick={() =>
                            setLandlordRating(landlordRating === starVal ? null : starVal)
                          }
                          className="p-0.5 transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                          aria-label={`Trato del dueño ${starVal} estrellas`}
                        >
                          <Star
                            className={`h-4 w-4 ${
                              landlordRating !== null && starVal <= landlordRating
                                ? 'fill-amber-500 text-amber-500'
                                : 'fill-muted text-muted-foreground/30'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    <span className="w-16 text-[10px] text-right font-medium text-muted-foreground">
                      {landlordRating !== null ? (
                        `${landlordRating}/5`
                      ) : (
                        <span className="text-muted-foreground/50">Opcional</span>
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Wind className="h-3.5 w-3.5 text-primary" />
                    <span>Tranquilidad y Silencio para Estudiar</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((starVal) => (
                        <button
                          key={`quiet-${starVal}`}
                          type="button"
                          onClick={() =>
                            setQuietnessRating(quietnessRating === starVal ? null : starVal)
                          }
                          className="p-0.5 transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                          aria-label={`Tranquilidad ${starVal} estrellas`}
                        >
                          <Star
                            className={`h-4 w-4 ${
                              quietnessRating !== null && starVal <= quietnessRating
                                ? 'fill-amber-500 text-amber-500'
                                : 'fill-muted text-muted-foreground/30'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    <span className="w-16 text-[10px] text-right font-medium text-muted-foreground">
                      {quietnessRating !== null ? (
                        `${quietnessRating}/5`
                      ) : (
                        <span className="text-muted-foreground/50">Opcional</span>
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Wifi className="h-3.5 w-3.5 text-primary" />
                    <span>Calidad del Internet y Wi-Fi</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((starVal) => (
                        <button
                          key={`wifi-${starVal}`}
                          type="button"
                          onClick={() => setWifiRating(wifiRating === starVal ? null : starVal)}
                          className="p-0.5 transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                          aria-label={`Internet ${starVal} estrellas`}
                        >
                          <Star
                            className={`h-4 w-4 ${
                              wifiRating !== null && starVal <= wifiRating
                                ? 'fill-amber-500 text-amber-500'
                                : 'fill-muted text-muted-foreground/30'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    <span className="w-16 text-[10px] text-right font-medium text-muted-foreground">
                      {wifiRating !== null ? (
                        `${wifiRating}/5`
                      ) : (
                        <span className="text-muted-foreground/50">Opcional</span>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </section>

          <section>
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
              ¿Cuánto tiempo viviste aquí?
            </h4>
            <div className="flex flex-wrap gap-2">
              {STAY_DURATIONS.map((dur) => (
                <button
                  key={dur.id}
                  type="button"
                  onClick={() => setStayDuration(dur.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition cursor-pointer ${
                    stayDuration === dur.id
                      ? 'border-primary bg-primary text-primary-foreground font-semibold shadow-xs'
                      : 'border-border bg-card text-muted-foreground hover:bg-muted/60'
                  }`}
                >
                  {dur.label}
                </button>
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Tu opinión detallada
              </h4>
              <span
                className={`text-[11px] ${
                  comment.length < 15 ? 'text-amber-500' : 'text-muted-foreground'
                }`}
              >
                {comment.length} / 1000 (mín. 15 caracteres)
              </span>
            </div>
            <textarea
              id="review-comment-textarea"
              value={comment}
              onChange={(e) => setComment(e.target.value.slice(0, 1000))}
              placeholder="Ej. Viví aquí durante mi primer año de universidad. Las piezas son amplias, la cocina siempre limpia y el ambiente es silencioso para estudiar. El internet funciona muy bien en épocas de certámenes..."
              rows={4}
              className="w-full rounded-xl border border-border bg-card p-3 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-hidden focus:ring-2 focus:ring-primary/40 leading-relaxed resize-none"
            />
          </section>

          <section>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Fotos reales del lugar (Máx. 3)
              </h4>
              <span className="text-[11px] text-muted-foreground">
                {selectedFiles.length} de 3 seleccionadas
              </span>
            </div>

            <div className="flex items-center gap-2">
              {selectedFiles.map((photo, idx) => (
                <div
                  key={`upload-thumb-${photo.previewUrl}`}
                  className="relative h-20 w-20 rounded-xl overflow-hidden border border-border bg-muted shrink-0"
                >
                  <Image
                    src={photo.previewUrl}
                    alt={`Preview ${idx + 1}`}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(idx)}
                    className="absolute top-1 right-1 h-5 w-5 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black transition"
                    aria-label="Quitar foto"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}

              {selectedFiles.length < 3 && (
                <label className="flex flex-col items-center justify-center h-20 w-20 rounded-xl border-2 border-dashed border-border hover:border-primary/50 bg-muted/20 text-muted-foreground hover:text-primary transition cursor-pointer">
                  <Camera className="h-5 w-5 mb-1" />
                  <span className="text-[10px] font-medium">Subir foto</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoSelect}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </section>
        </div>

        <div className="border-t border-border/80 bg-card p-4 md:px-8">
          <Button
            id="btn-submit-review"
            onClick={handleSubmit}
            disabled={!isMinLength || isSubmitting}
            className="w-full h-12 bg-primary hover:opacity-90 text-primary-foreground font-bold text-sm rounded-xl shadow-md active:scale-[0.98] transition disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Publicando reseña...
              </>
            ) : (
              <>
                <PenLine className="mr-2 h-4 w-4" /> Publicar mi reseña
              </>
            )}
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
