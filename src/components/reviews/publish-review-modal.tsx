'use client';

import {
  AlertCircle,
  Camera,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Loader2,
  PenLine,
  Star,
  Wifi,
  Wind,
  X,
  Zap,
} from 'lucide-react';
import { AnimatePresence, m } from 'motion/react';
import Image from 'next/image';
import { type ChangeEvent, useEffect, useReducer, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { FullScreenImageViewer } from '@/components/ui/fullscreen-image-viewer';
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalDescription,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from '@/components/ui/responsive-modal';
import { useFormValidation } from '@/hooks/use-form-validation';
import { usePensionReviews } from '@/hooks/use-pension-reviews';
import { isApiSuccess } from '@/lib/api-response';
import { useAuth } from '@/lib/auth-context';
import { translateApiError } from '@/lib/error-translator';
import { prepareImageForUpload, validateImageFile } from '@/lib/image-utils';
import type { PensionItem, PensionReview, StayDurationCategory } from '@/lib/types';
import {
  type PublishReviewFormInput,
  publishReviewFormSchema,
} from '@/lib/validations/reviews.schema';
import {
  initialPublishReviewState,
  publishReviewReducer,
  type ReviewPhotoItem,
} from '@/reducers/publish-review-reducer';
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
  const [state, dispatch] = useReducer(publishReviewReducer, initialPublishReviewState);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const formContainerRef = useRef<HTMLDivElement>(null);
  const successBanner = state.successBanner;
  const errorMessage = state.errorMessage;

  const {
    errors: reviewErrors,
    handleChange: handleReviewFieldChange,
    handleBlur: handleReviewFieldBlur,
    validateForm: validateReviewForm,
    resetForm: resetReviewValidation,
  } = useFormValidation<PublishReviewFormInput>({
    schema: publishReviewFormSchema,
    initialValues: {
      overallRating: initialPublishReviewState.overallRating,
      stayDuration: initialPublishReviewState.stayDuration,
      comment: initialPublishReviewState.comment,
    },
    formRef: formContainerRef,
  });

  useEffect(() => {
    if (!isOpen) {
      dispatch({ type: 'RESET' });
      resetReviewValidation({
        overallRating: initialPublishReviewState.overallRating,
        stayDuration: initialPublishReviewState.stayDuration,
        comment: initialPublishReviewState.comment,
      });
    }
  }, [isOpen, resetReviewValidation]);

  if (!isOpen) return null;

  const handlePhotoSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const availableSlots = 3 - state.selectedFiles.length;
    const filesToAdd = Array.from(files).slice(0, availableSlots);

    const newEntries: ReviewPhotoItem[] = [];
    for (const file of filesToAdd) {
      const validation = validateImageFile(file);
      if (!validation.valid) {
        dispatch({
          type: 'SET_ERROR',
          error: validation.error || 'Formato de imagen no compatible',
        });
        continue;
      }
      try {
        const prepared = await prepareImageForUpload(file);
        newEntries.push({
          file: prepared,
          previewUrl: URL.createObjectURL(prepared),
        });
      } catch (err) {
        dispatch({
          type: 'SET_ERROR',
          error:
            err instanceof Error
              ? err.message
              : 'No se pudo procesar la imagen seleccionada. Por favor, intenta con otra.',
        });
      }
    }

    if (newEntries.length > 0) {
      dispatch({ type: 'ADD_PHOTO', photos: newEntries });
    }
    e.target.value = '';
  };

  const removePhoto = (index: number) => {
    const target = state.selectedFiles[index];
    if (target) {
      URL.revokeObjectURL(target.previewUrl);
    }
    dispatch({ type: 'REMOVE_PHOTO', index });
  };

  const handleSubmit = async () => {
    const validation = validateReviewForm();
    if (!validation.isValid) {
      return;
    }

    dispatch({ type: 'SET_SUBMITTING', isSubmitting: true });
    dispatch({ type: 'SET_ERROR', error: null });

    try {
      const uploadedUrls: string[] = [];
      for (const item of state.selectedFiles) {
        const res = await uploadSingleImage(item.file);
        if (isApiSuccess(res) && res.data.url) {
          uploadedUrls.push(res.data.url);
        } else {
          const failMsg = !isApiSuccess(res)
            ? res.message
            : 'No fue posible subir la imagen. Verifica tu conexión e intenta de nuevo.';
          dispatch({ type: 'SET_ERROR', error: failMsg });
          dispatch({ type: 'SET_SUBMITTING', isSubmitting: false });
          return;
        }
      }

      const result = await publishReview({
        overallRating: state.overallRating,
        rating: state.overallRating,
        comment: state.comment.trim(),
        cleanlinessRating: state.cleanlinessRating ?? undefined,
        landlordRating: state.landlordRating ?? undefined,
        quietnessRating: state.quietnessRating ?? undefined,
        locationRating: state.quietnessRating ?? undefined,
        wifiRating: state.wifiRating ?? undefined,
        stayDurationCategory: state.stayDuration,
        stayDuration: state.stayDuration,
        images: uploadedUrls,
      });

      if (!result.success || !result.review) {
        dispatch({
          type: 'SET_ERROR',
          error: result.error || 'Ocurrió un error al enviar tu reseña.',
        });
        dispatch({ type: 'SET_SUBMITTING', isSubmitting: false });
        return;
      }

      const serverReview = result.review;
      const createdReview: PensionReview = {
        id: serverReview.id || `rev-${Date.now()}`,
        pensionId: pension.id,
        userId: user?.id || serverReview.userId || '',
        rating: serverReview.rating ?? state.overallRating,
        overallRating: serverReview.rating ?? state.overallRating,
        cleanlinessRating: serverReview.cleanlinessRating ?? state.cleanlinessRating ?? undefined,
        landlordRating: serverReview.landlordRating ?? state.landlordRating ?? undefined,
        quietnessRating: serverReview.locationRating ?? state.quietnessRating ?? undefined,
        wifiRating: state.wifiRating ?? undefined,
        comment: serverReview.comment ?? state.comment.trim(),
        stayDurationCategory: state.stayDuration,
        isVerifiedStay: serverReview.isVerifiedStay ?? true,
        isResidentVerified: true,
        isAnonymous: false,
        helpfulCount: serverReview.helpfulCount ?? 0,
        createdAt: serverReview.createdAt ?? new Date().toISOString(),
        images: uploadedUrls,
        user: {
          id: user?.id || '',
          firstName: user?.firstName || '',
          lastName: user?.lastName || '',
          avatarUrl: user?.avatarUrl || undefined,
          university: user?.universityName
            ? {
                name: user.universityName,
                shortName: user.universityName.slice(0, 4).toUpperCase(),
              }
            : undefined,
        },
      };

      dispatch({ type: 'SET_SUCCESS', success: true });
      toast.success('¡Reseña publicada exitosamente!');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('tunido_review_published'));
      }
      onReviewPublished(createdReview);

      setTimeout(() => {
        dispatch({ type: 'SET_SUCCESS', success: false });
        onClose();
      }, 1500);
    } catch (err: unknown) {
      const errStr = (err as Error)?.message || '';
      if (
        errStr.includes('409') ||
        errStr.toLowerCase().includes('already reviewed') ||
        errStr.toLowerCase().includes('ya has publicado')
      ) {
        const errorMsg =
          'Ya has publicado una reseña para esta pensión. Puedes editar tu opinión existente desde tu perfil.';
        dispatch({
          type: 'SET_ERROR',
          error: errorMsg,
        });
        toast.error(errorMsg);
      } else {
        const friendly = translateApiError(
          err,
          'Hubo un error al enviar tu reseña. Inténtalo nuevamente.',
        );
        dispatch({
          type: 'SET_ERROR',
          error: friendly,
        });
        toast.error(friendly);
      }
    } finally {
      dispatch({ type: 'SET_SUBMITTING', isSubmitting: false });
    }
  };

  const currentRatingValue = state.hoverRating || state.overallRating;

  return (
    <ResponsiveModal open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <ResponsiveModalContent
        id="publish-review-drawer"
        showClose={false}
        className="max-w-lg md:max-w-2xl md:max-h-[84vh] mx-auto bg-card border-border text-foreground flex flex-col overflow-hidden md:rounded-3xl"
      >
        <ResponsiveModalHeader className="px-5 py-4 border-b border-border/60 shrink-0 text-left">
          <ResponsiveModalTitle className="text-lg font-bold text-foreground">
            Publicar opinión
          </ResponsiveModalTitle>
          <ResponsiveModalDescription className="text-xs text-muted-foreground mt-0.5 truncate">
            {pension.title}
          </ResponsiveModalDescription>
        </ResponsiveModalHeader>

        <div
          ref={formContainerRef}
          className="overflow-y-auto scrollbar-subtle flex-1 min-h-0 px-5 md:px-6 py-4 pb-6 space-y-5"
        >
          <AnimatePresence>
            {successBanner && (
              <m.div
                initial={{ opacity: 0, scale: 0.94, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: 8 }}
                transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 flex items-center gap-3 text-emerald-600"
              >
                <CheckCircle2 className="h-5 w-5 shrink-0" />
                <p className="text-xs font-semibold">
                  ¡Reseña publicada con éxito! Gracias por colaborar con la comunidad.
                </p>
              </m.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {errorMessage && (
              <m.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: [0, -6, 6, -4, 4, 0] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 flex items-start gap-2.5 text-rose-600"
              >
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <p className="text-xs">{errorMessage}</p>
              </m.div>
            )}
          </AnimatePresence>

          <FormField
            id="review-overall-rating"
            label="Calificación General Obligatoria"
            labelClassName="text-[11px] font-bold uppercase tracking-wider text-muted-foreground"
            required
            error={reviewErrors.overallRating}
          >
            {(injected) => (
              <section
                id={injected.id}
                aria-invalid={injected['aria-invalid']}
                aria-describedby={injected['aria-describedby']}
                className="rounded-2xl border border-border/70 bg-muted/25 p-3.5 text-center"
              >
                <div className="flex items-center justify-center gap-1.5 mb-1.5">
                  {[1, 2, 3, 4, 5].map((starVal) => (
                    <button
                      key={`star-${starVal}`}
                      type="button"
                      onClick={() => {
                        dispatch({ type: 'SET_OVERALL_RATING', rating: starVal });
                        handleReviewFieldChange('overallRating', starVal);
                      }}
                      onMouseEnter={() => dispatch({ type: 'SET_HOVER_RATING', rating: starVal })}
                      onMouseLeave={() => dispatch({ type: 'SET_HOVER_RATING', rating: 0 })}
                      className="p-1 transition-transform active:scale-90 hover:scale-110 cursor-pointer"
                      aria-label={`${starVal} estrellas`}
                    >
                      <Star
                        className={`h-7 w-7 ${
                          starVal <= currentRatingValue
                            ? 'fill-amber-500 text-amber-500'
                            : 'fill-muted text-muted-foreground/40'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-xs font-semibold text-amber-500 h-4">
                  {RATING_LABELS[currentRatingValue] || 'Selecciona tu calificación'}
                </p>
              </section>
            )}
          </FormField>

          <section className="rounded-2xl border border-border bg-card p-3.5">
            <button
              type="button"
              onClick={() => dispatch({ type: 'TOGGLE_SUB_RATINGS' })}
              className="flex items-center justify-between w-full text-xs font-bold text-foreground cursor-pointer"
            >
              <span>Calificaciones por aspectos específicos (Opcional)</span>
              {state.showSubRatings ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </button>

            {state.showSubRatings && (
              <div className="mt-4 space-y-3.5 border-t border-border/60 pt-3 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                    <span>Limpieza e Higiene</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((starVal) => (
                        <button
                          key={`clean-${starVal}`}
                          type="button"
                          onClick={() =>
                            dispatch({
                              type: 'SET_SUB_RATING',
                              category: 'cleanliness',
                              rating: starVal,
                            })
                          }
                          className="p-0.5 transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                          aria-label={`Limpieza ${starVal} estrellas`}
                        >
                          <Star
                            className={`h-4 w-4 ${
                              state.cleanlinessRating !== null && starVal <= state.cleanlinessRating
                                ? 'fill-amber-500 text-amber-500'
                                : 'fill-muted text-muted-foreground/30'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    <span className="w-16 text-[10px] text-right font-medium text-muted-foreground">
                      {state.cleanlinessRating !== null ? (
                        `${state.cleanlinessRating}/5`
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
                            dispatch({
                              type: 'SET_SUB_RATING',
                              category: 'landlord',
                              rating: starVal,
                            })
                          }
                          className="p-0.5 transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                          aria-label={`Trato del dueño ${starVal} estrellas`}
                        >
                          <Star
                            className={`h-4 w-4 ${
                              state.landlordRating !== null && starVal <= state.landlordRating
                                ? 'fill-amber-500 text-amber-500'
                                : 'fill-muted text-muted-foreground/30'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    <span className="w-16 text-[10px] text-right font-medium text-muted-foreground">
                      {state.landlordRating !== null ? (
                        `${state.landlordRating}/5`
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
                            dispatch({
                              type: 'SET_SUB_RATING',
                              category: 'quietness',
                              rating: starVal,
                            })
                          }
                          className="p-0.5 transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                          aria-label={`Tranquilidad ${starVal} estrellas`}
                        >
                          <Star
                            className={`h-4 w-4 ${
                              state.quietnessRating !== null && starVal <= state.quietnessRating
                                ? 'fill-amber-500 text-amber-500'
                                : 'fill-muted text-muted-foreground/30'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    <span className="w-16 text-[10px] text-right font-medium text-muted-foreground">
                      {state.quietnessRating !== null ? (
                        `${state.quietnessRating}/5`
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
                          onClick={() =>
                            dispatch({
                              type: 'SET_SUB_RATING',
                              category: 'wifi',
                              rating: starVal,
                            })
                          }
                          className="p-0.5 transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                          aria-label={`Internet ${starVal} estrellas`}
                        >
                          <Star
                            className={`h-4 w-4 ${
                              state.wifiRating !== null && starVal <= state.wifiRating
                                ? 'fill-amber-500 text-amber-500'
                                : 'fill-muted text-muted-foreground/30'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    <span className="w-16 text-[10px] text-right font-medium text-muted-foreground">
                      {state.wifiRating !== null ? (
                        `${state.wifiRating}/5`
                      ) : (
                        <span className="text-muted-foreground/50">Opcional</span>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </section>

          <FormField
            id="review-stay-duration"
            label="¿Cuánto tiempo viviste aquí?"
            labelClassName="text-xs font-bold uppercase tracking-wider text-muted-foreground"
            required
            error={reviewErrors.stayDuration}
          >
            {(injected) => (
              <div
                id={injected.id}
                aria-invalid={injected['aria-invalid']}
                aria-describedby={injected['aria-describedby']}
                className="flex flex-wrap gap-2"
              >
                {STAY_DURATIONS.map((dur) => (
                  <button
                    key={dur.id}
                    type="button"
                    onClick={() => {
                      dispatch({ type: 'SET_DURATION', duration: dur.id });
                      handleReviewFieldChange('stayDuration', dur.id);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs border transition cursor-pointer ${
                      state.stayDuration === dur.id
                        ? 'border-primary/45 bg-primary/15 text-primary font-semibold'
                        : 'border-border bg-muted/20 font-medium text-muted-foreground hover:bg-muted/50'
                    }`}
                  >
                    {dur.label}
                  </button>
                ))}
              </div>
            )}
          </FormField>

          <FormField
            id="review-comment-textarea"
            label="Tu opinión detallada"
            labelClassName="text-xs font-bold uppercase tracking-wider text-muted-foreground"
            required
            hint="Mínimo 15 caracteres recomendados para describir tu experiencia"
            labelAction={
              <span
                className={`text-[11px] font-medium ${
                  state.comment.trim().length < 15 ? 'text-amber-500' : 'text-muted-foreground'
                }`}
              >
                {state.comment.length} / 1000
              </span>
            }
            error={reviewErrors.comment}
          >
            <textarea
              id="review-comment-textarea"
              value={state.comment}
              maxLength={1000}
              onChange={(e) => {
                dispatch({ type: 'SET_COMMENT', comment: e.target.value });
                handleReviewFieldChange('comment', e.target.value);
              }}
              onBlur={() => handleReviewFieldBlur('comment')}
              placeholder="Ej. Viví aquí durante mi primer año de universidad. Las piezas son amplias, la cocina siempre limpia y el ambiente es silencioso para estudiar. El internet funciona muy bien en épocas de certámenes..."
              rows={4}
              className="w-full rounded-xl border border-border bg-card p-3 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-hidden focus:ring-2 focus:ring-primary/40 leading-relaxed resize-none"
            />
          </FormField>

          <section>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Fotos reales del lugar (Máx. 3)
              </h4>
              <span className="text-[11px] text-muted-foreground">
                {state.selectedFiles.length} de 3 seleccionadas
              </span>
            </div>

            <div className="flex items-center gap-2">
              {state.selectedFiles.map((photo, idx) => (
                <div
                  key={`upload-thumb-${photo.previewUrl}`}
                  className="relative h-20 w-20 rounded-xl overflow-hidden border border-border bg-muted shrink-0 group"
                >
                  <button
                    type="button"
                    onClick={() => setViewerIndex(idx)}
                    className="relative h-full w-full cursor-pointer focus:outline-none"
                    aria-label={`Ver foto ${idx + 1} a pantalla completa`}
                  >
                    <Image
                      src={photo.previewUrl}
                      alt={`Preview ${idx + 1}`}
                      fill
                      unoptimized
                      className="object-cover transition group-hover:scale-105"
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => removePhoto(idx)}
                    className="absolute top-1 right-1 h-5 w-5 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black transition z-10 cursor-pointer"
                    aria-label="Quitar foto"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}

              {state.selectedFiles.length < 3 && (
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

        <div className="border-t border-border/60 bg-card/95 backdrop-blur-md p-4 md:px-6 shrink-0">
          <Button
            id="btn-submit-review"
            type="button"
            onClick={handleSubmit}
            disabled={state.isSubmitting}
            className="w-full h-12 bg-primary hover:opacity-90 text-primary-foreground font-bold text-sm rounded-xl shadow-md active:scale-[0.98] transition disabled:opacity-50"
          >
            {state.isSubmitting ? (
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

        {viewerIndex !== null && (
          <FullScreenImageViewer
            isOpen={viewerIndex !== null}
            onClose={() => setViewerIndex(null)}
            images={state.selectedFiles.map((f) => f.previewUrl)}
            initialIndex={viewerIndex}
            title={`Foto de reseña • ${pension.title}`}
          />
        )}
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
