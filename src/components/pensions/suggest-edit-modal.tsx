'use client';

import { AlertCircle, Check, CheckCircle2, ChevronDown, Loader2, Plus, Send } from 'lucide-react';
import { useEffect, useReducer, useRef } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalDescription,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from '@/components/ui/responsive-modal';
import { useFormValidation } from '@/hooks/use-form-validation';
import { useSuggestEdit } from '@/hooks/use-suggest-edit';
import { clampNumber } from '@/lib/format-utils';
import type { PensionItem } from '@/lib/types';
import {
  type SuggestEditFormInput,
  suggestEditFormSchema,
} from '@/lib/validations/pensions.schema';
import {
  calculateProposedDiff,
  createInitialSuggestEditState,
  suggestEditReducer,
} from '@/reducers/suggest-edit-reducer';

type SuggestEditModalProps = {
  isOpen: boolean;
  onClose: () => void;
  pension: PensionItem;
};

type AmenityCatalogItem = {
  slug: string;
  label: string;
};

const AMENITY_CATALOG: AmenityCatalogItem[] = [
  { slug: 'wifi-alta-velocidad', label: 'WiFi Alta Velocidad' },
  { slug: 'cocina-equipada', label: 'Cocina Equipada' },
  { slug: 'lavadora-secadora', label: 'Lavandería' },
  { slug: 'sala-estudio-cowork', label: 'Sala de Estudio y Cowork' },
  { slug: 'calefaccion', label: 'Calefacción' },
  { slug: 'agua-caliente', label: 'Agua Caliente' },
  { slug: 'camaras-seguridad', label: 'Cámaras de Seguridad' },
  { slug: 'conserjeria-24-7', label: 'Conserjería 24/7' },
  { slug: 'cerradura-digital', label: 'Cerradura Digital' },
];

export function SuggestEditModal({ isOpen, onClose, pension }: SuggestEditModalProps) {
  const [state, dispatch] = useReducer(suggestEditReducer, pension, createInitialSuggestEditState);
  const { isSubmitting, errorMessage, successBanner, submitProposal, resetState } = useSuggestEdit(
    pension.id,
  );
  const formContainerRef = useRef<HTMLDivElement>(null);

  const {
    errors: suggestErrors,
    handleChange: handleSuggestFieldChange,
    handleBlur: handleSuggestFieldBlur,
    validateForm: validateSuggestForm,
    resetForm: resetSuggestValidation,
  } = useFormValidation<SuggestEditFormInput>({
    schema: suggestEditFormSchema,
    initialValues: {
      submissionNotes: '',
    },
    formRef: formContainerRef,
  });

  useEffect(() => {
    if (isOpen) {
      dispatch({ type: 'RESET_TO_PENSION', pension });
      resetState();
      resetSuggestValidation({ submissionNotes: '' });
    }
  }, [isOpen, pension, resetState, resetSuggestValidation]);

  if (!isOpen) return null;

  const toggleAmenity = (slug: string) => {
    dispatch({ type: 'TOGGLE_AMENITY', slug });
  };

  const handlePriceChange = (val: string) => {
    const digits = val.replace(/\D/g, '');
    const num = digits ? Number.parseInt(digits, 10) : 0;
    const clamped = clampNumber(num, 0, 2000000);
    if (clamped.wasClamped && num > 2000000) {
      toast.info('El precio mensual máximo sugerido es $2.000.000 CLP.');
    }
    dispatch({
      type: 'SET_FIELD',
      field: 'monthlyPrice',
      value: clamped.value,
    });
  };

  const handleDepositChange = (val: string) => {
    const digits = val.replace(/\D/g, '');
    const num = digits ? Number.parseInt(digits, 10) : 0;
    const clamped = clampNumber(num, 0, 1500000);
    if (clamped.wasClamped && num > 1500000) {
      toast.info('El mes de garantía máximo sugerido es $1.500.000 CLP.');
    }
    dispatch({
      type: 'SET_FIELD',
      field: 'deposit',
      value: clamped.value,
    });
  };

  const handleSubmit = async () => {
    const validation = validateSuggestForm();
    if (!validation.isValid) {
      return;
    }

    const proposedChanges = calculateProposedDiff(pension, state);
    const ok = await submitProposal(state.submissionNotes, proposedChanges);
    if (ok) {
      setTimeout(() => {
        onClose();
      }, 1800);
    }
  };

  return (
    <ResponsiveModal open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <ResponsiveModalContent
        id="suggest-edit-drawer"
        showClose={false}
        className="max-w-lg md:max-w-2xl md:max-h-[82vh] mx-auto md:rounded-3xl bg-card border-border text-foreground flex flex-col overflow-hidden"
      >
        <ResponsiveModalHeader className="px-5 py-4 border-b border-border/60 shrink-0 text-left">
          <ResponsiveModalTitle className="text-lg font-bold text-foreground">
            Sugerir corrección
          </ResponsiveModalTitle>
          <ResponsiveModalDescription className="text-xs text-muted-foreground mt-0.5 truncate">
            {pension.title}
          </ResponsiveModalDescription>
        </ResponsiveModalHeader>

        <div
          ref={formContainerRef}
          className="overflow-y-auto scrollbar-subtle flex-1 min-h-0 px-5 py-4 pb-6 space-y-6"
        >
          {successBanner && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 flex items-center gap-3 text-emerald-600 animate-in fade-in">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <p className="text-xs font-semibold">
                ¡Gracias por colaborar! Tu propuesta de cambio fue enviada a los moderadores para su
                revisión.
              </p>
            </div>
          )}

          {errorMessage && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 flex items-start gap-2.5 text-rose-600 animate-in fade-in">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <p className="text-xs">{errorMessage}</p>
            </div>
          )}

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Comodidades y Servicios (Toca para agregar o quitar)
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {AMENITY_CATALOG.map((item) => {
                const isSelected = state.activeAmenities.includes(item.slug);
                return (
                  <button
                    key={item.slug}
                    type="button"
                    onClick={() => toggleAmenity(item.slug)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition cursor-pointer ${
                      isSelected
                        ? 'border-primary bg-primary/10 text-primary font-semibold'
                        : 'border-border bg-muted/30 text-muted-foreground hover:bg-muted/60'
                    }`}
                  >
                    {isSelected ? (
                      <Check className="h-3.5 w-3.5 text-primary" />
                    ) : (
                      <Plus className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-4 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Valores e Inclusiones Básicas
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="suggest-price-input"
                  className="block text-[11px] font-medium text-muted-foreground mb-1"
                >
                  Precio mensual arriendo (CLP)
                </label>
                <input
                  id="suggest-price-input"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={
                    state.monthlyPrice ? Number(state.monthlyPrice).toLocaleString('es-CL') : ''
                  }
                  onChange={(e) => handlePriceChange(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div>
                <label
                  htmlFor="suggest-deposit-input"
                  className="block text-[11px] font-medium text-muted-foreground mb-1"
                >
                  Garantía requerida (CLP)
                </label>
                <input
                  id="suggest-deposit-input"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={state.deposit ? Number(state.deposit).toLocaleString('es-CL') : ''}
                  onChange={(e) => handleDepositChange(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/40"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-border/60">
              <span className="block text-[11px] font-medium text-muted-foreground mb-2">
                ¿Qué servicios están incluidos en ese valor?
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() =>
                    dispatch({
                      type: 'SET_FIELD',
                      field: 'waterIncluded',
                      value: !state.waterIncluded,
                    })
                  }
                  className={`flex items-center justify-between p-2.5 rounded-xl border transition ${
                    state.waterIncluded
                      ? 'border-primary/40 bg-primary/5 text-foreground font-semibold'
                      : 'border-border bg-muted/20 text-muted-foreground'
                  }`}
                >
                  <span>Agua Potable</span>
                  <input
                    type="checkbox"
                    checked={state.waterIncluded}
                    readOnly
                    className="accent-primary"
                  />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    dispatch({
                      type: 'SET_FIELD',
                      field: 'electricityIncluded',
                      value: !state.electricityIncluded,
                    })
                  }
                  className={`flex items-center justify-between p-2.5 rounded-xl border transition ${
                    state.electricityIncluded
                      ? 'border-primary/40 bg-primary/5 text-foreground font-semibold'
                      : 'border-border bg-muted/20 text-muted-foreground'
                  }`}
                >
                  <span>Electricidad</span>
                  <input
                    type="checkbox"
                    checked={state.electricityIncluded}
                    readOnly
                    className="accent-primary"
                  />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    dispatch({
                      type: 'SET_FIELD',
                      field: 'gasIncluded',
                      value: !state.gasIncluded,
                    })
                  }
                  className={`flex items-center justify-between p-2.5 rounded-xl border transition ${
                    state.gasIncluded
                      ? 'border-primary/40 bg-primary/5 text-foreground font-semibold'
                      : 'border-border bg-muted/20 text-muted-foreground'
                  }`}
                >
                  <span>Gas Calefont</span>
                  <input
                    type="checkbox"
                    checked={state.gasIncluded}
                    readOnly
                    className="accent-primary"
                  />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    dispatch({
                      type: 'SET_FIELD',
                      field: 'internetIncluded',
                      value: !state.internetIncluded,
                    })
                  }
                  className={`flex items-center justify-between p-2.5 rounded-xl border transition ${
                    state.internetIncluded
                      ? 'border-primary/40 bg-primary/5 text-foreground font-semibold'
                      : 'border-border bg-muted/20 text-muted-foreground'
                  }`}
                >
                  <span>Internet / Wi-Fi</span>
                  <input
                    type="checkbox"
                    checked={state.internetIncluded}
                    readOnly
                    className="accent-primary"
                  />
                </button>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Reglas de Convivencia Clave
            </h3>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() =>
                  dispatch({
                    type: 'SET_FIELD',
                    field: 'guestsAllowed',
                    value: !state.guestsAllowed,
                  })
                }
                className={`flex items-center justify-between p-2.5 rounded-xl border transition ${
                  state.guestsAllowed
                    ? 'border-primary/40 bg-primary/5 text-foreground font-semibold'
                    : 'border-border bg-muted/20 text-muted-foreground'
                }`}
              >
                <span>Visitas permitidas</span>
                <input
                  type="checkbox"
                  checked={state.guestsAllowed}
                  readOnly
                  className="accent-primary"
                />
              </button>

              <button
                type="button"
                onClick={() =>
                  dispatch({
                    type: 'SET_FIELD',
                    field: 'petsAllowed',
                    value: !state.petsAllowed,
                  })
                }
                className={`flex items-center justify-between p-2.5 rounded-xl border transition ${
                  state.petsAllowed
                    ? 'border-primary/40 bg-primary/5 text-foreground font-semibold'
                    : 'border-border bg-muted/20 text-muted-foreground'
                }`}
              >
                <span>Mascotas permitidas</span>
                <input
                  type="checkbox"
                  checked={state.petsAllowed}
                  readOnly
                  className="accent-primary"
                />
              </button>

              <button
                type="button"
                onClick={() =>
                  dispatch({
                    type: 'SET_FIELD',
                    field: 'smokingAllowed',
                    value: !state.smokingAllowed,
                  })
                }
                className={`flex items-center justify-between p-2.5 rounded-xl border transition ${
                  state.smokingAllowed
                    ? 'border-primary/40 bg-primary/5 text-foreground font-semibold'
                    : 'border-border bg-muted/20 text-muted-foreground'
                }`}
              >
                <span>Permite fumar</span>
                <input
                  type="checkbox"
                  checked={state.smokingAllowed}
                  readOnly
                  className="accent-primary"
                />
              </button>

              <div className="flex flex-col justify-center">
                <input
                  type="text"
                  placeholder="Horario llegada (ej: 23:00)"
                  value={state.curfewText}
                  onChange={(e) =>
                    dispatch({
                      type: 'SET_FIELD',
                      field: 'curfewText',
                      value: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-border bg-background px-2.5 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-hidden focus:ring-2 focus:ring-primary/40"
                />
              </div>
            </div>
          </section>

          <details className="rounded-2xl border border-border bg-muted/20 p-4 transition group">
            <summary className="flex items-center justify-between text-xs font-bold text-foreground cursor-pointer select-none">
              <span>▶ Edición avanzada (título, descripción y ubicación)</span>
              <ChevronDown className="h-4 w-4 text-muted-foreground group-open:rotate-180 transition-transform" />
            </summary>

            <div className="mt-4 space-y-3 pt-3 border-t border-border/60 text-xs">
              <div>
                <label
                  htmlFor="suggest-title-input"
                  className="block text-[11px] font-medium text-muted-foreground mb-1"
                >
                  Título de la pensión
                </label>
                <input
                  id="suggest-title-input"
                  type="text"
                  maxLength={100}
                  value={state.title}
                  onChange={(e) =>
                    dispatch({
                      type: 'SET_FIELD',
                      field: 'title',
                      value: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div>
                <label
                  htmlFor="suggest-description-textarea"
                  className="block text-[11px] font-medium text-muted-foreground mb-1"
                >
                  Descripción completa
                </label>
                <textarea
                  id="suggest-description-textarea"
                  rows={3}
                  maxLength={1500}
                  value={state.description}
                  onChange={(e) =>
                    dispatch({
                      type: 'SET_FIELD',
                      field: 'description',
                      value: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-border bg-background p-2.5 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/40 resize-none leading-relaxed"
                />
              </div>

              <div>
                <label
                  htmlFor="suggest-address-input"
                  className="block text-[11px] font-medium text-muted-foreground mb-1"
                >
                  Dirección
                </label>
                <input
                  id="suggest-address-input"
                  type="text"
                  maxLength={120}
                  value={state.address}
                  onChange={(e) =>
                    dispatch({
                      type: 'SET_FIELD',
                      field: 'address',
                      value: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div>
                <label
                  htmlFor="suggest-neighborhood-input"
                  className="block text-[11px] font-medium text-muted-foreground mb-1"
                >
                  Barrio / Comuna
                </label>
                <input
                  id="suggest-neighborhood-input"
                  type="text"
                  maxLength={60}
                  value={state.neighborhood}
                  onChange={(e) =>
                    dispatch({
                      type: 'SET_FIELD',
                      field: 'neighborhood',
                      value: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div>
                <label
                  htmlFor="suggest-city-input"
                  className="block text-[11px] font-medium text-muted-foreground mb-1"
                >
                  Ciudad
                </label>
                <input
                  id="suggest-city-input"
                  type="text"
                  maxLength={60}
                  value={state.city}
                  onChange={(e) =>
                    dispatch({
                      type: 'SET_FIELD',
                      field: 'city',
                      value: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/40"
                />
              </div>
            </div>
          </details>

          <FormField
            id="suggest-submission-notes"
            label="¿Por qué propones este cambio? (Para los moderadores)"
            labelClassName="text-xs font-bold uppercase tracking-wider text-muted-foreground"
            required
            hint="Mínimo 5 caracteres para explicar tu sugerencia"
            labelAction={
              <span
                className={`text-[11px] font-medium ${
                  state.submissionNotes.trim().length < 5
                    ? 'text-amber-500'
                    : 'text-muted-foreground'
                }`}
              >
                {state.submissionNotes.length} / 500
              </span>
            }
            error={suggestErrors.submissionNotes}
          >
            <textarea
              id="suggest-submission-notes"
              value={state.submissionNotes}
              maxLength={500}
              onChange={(e) => {
                dispatch({
                  type: 'SET_SUBMISSION_NOTES',
                  notes: e.target.value,
                });
                handleSuggestFieldChange('submissionNotes', e.target.value);
              }}
              onBlur={() => handleSuggestFieldBlur('submissionNotes')}
              placeholder="Ej. Viví aquí el último semestre: ahora cuentan con lavandería en el primer piso y el valor del arriendo subió a $250.000 con luz incluida..."
              rows={3}
              className="w-full rounded-xl border border-border bg-card p-3 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-hidden focus:ring-2 focus:ring-primary/40 leading-relaxed resize-none"
            />
          </FormField>
        </div>

        <div className="border-t border-border/60 bg-card/95 backdrop-blur-md p-4 md:px-5 shrink-0">
          <Button
            id="btn-submit-proposal"
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full h-12 bg-primary hover:opacity-90 text-primary-foreground font-bold text-sm rounded-xl shadow-md active:scale-[0.98] transition disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando propuesta...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" /> Enviar propuesta a moderación
              </>
            )}
          </Button>
        </div>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
