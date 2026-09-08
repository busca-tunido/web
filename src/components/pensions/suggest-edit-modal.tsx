'use client';

import {
  AlertCircle,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  Loader2,
  Plus,
  Send,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { submitPensionProposal } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import type { PensionItem } from '@/lib/types';

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
  { slug: 'comida-incluida', label: 'Comida Incluida' },
  { slug: 'lavanderia', label: 'Lavandería' },
  { slug: 'sala-estudio', label: 'Sala de Estudio' },
  { slug: 'bano-privado', label: 'Baño Privado' },
  { slug: 'cocina-equipada', label: 'Cocina Equipada' },
  { slug: 'calefaccion', label: 'Calefacción' },
  { slug: 'estacionamiento', label: 'Estacionamiento' },
  { slug: 'limpieza-incluida', label: 'Aseo / Limpieza' },
];

export function SuggestEditModal({ isOpen, onClose, pension }: SuggestEditModalProps) {
  const { token } = useAuth();

  const [activeAmenities, setActiveAmenities] = useState<string[]>(() => {
    const initial: string[] = [];
    if (pension.includesWifi) initial.push('wifi-alta-velocidad');
    if (pension.includesMeals) initial.push('comida-incluida');
    if (pension.includesLaundry) initial.push('lavanderia');
    if (pension.includesStudyRoom) initial.push('sala-estudio');
    return initial;
  });

  const [monthlyPrice, setMonthlyPrice] = useState<number>(pension.priceMonthlyClp);
  const [deposit, setDeposit] = useState<number>(pension.depositClp);

  const [waterIncluded, setWaterIncluded] = useState(true);
  const [electricityIncluded, setElectricityIncluded] = useState(true);
  const [gasIncluded, setGasIncluded] = useState(true);
  const [internetIncluded, setInternetIncluded] = useState(pension.includesWifi);

  const [curfewText, setCurfewText] = useState(pension.curfewDescription || '');
  const [guestsAllowed, setGuestsAllowed] = useState(
    pension.visitsPolicy?.toLowerCase().includes('permitidas') ?? false,
  );
  const [petsAllowed, setPetsAllowed] = useState(false);
  const [smokingAllowed, setSmokingAllowed] = useState(false);

  const [title, setTitle] = useState(pension.title);
  const [description, setDescription] = useState(pension.description);
  const [address, setAddress] = useState(pension.address);
  const [neighborhood, setNeighborhood] = useState(pension.neighborhood);
  const [city, setCity] = useState(pension.city);

  const [submissionNotes, setSubmissionNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState(false);

  const toggleAmenity = (slug: string) => {
    setActiveAmenities((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );
  };

  const calculateProposedChanges = () => {
    const changes: Record<string, unknown> = {};

    if (title !== pension.title) changes.title = title.trim();
    if (description !== pension.description) changes.description = description.trim();
    if (address !== pension.address) changes.address = address.trim();
    if (neighborhood !== pension.neighborhood) changes.neighborhood = neighborhood.trim();
    if (city !== pension.city) changes.city = city.trim();
    if (monthlyPrice !== pension.priceMonthlyClp) changes.baseMonthlyPrice = monthlyPrice;
    if (deposit !== pension.depositClp) changes.deposit = deposit;

    changes.waterIncluded = waterIncluded;
    changes.electricityIncluded = electricityIncluded;
    changes.gasIncluded = gasIncluded;
    changes.internetIncluded = internetIncluded;
    changes.guestsAllowed = guestsAllowed;
    changes.petsAllowed = petsAllowed;
    changes.smokingAllowed = smokingAllowed;
    if (curfewText.trim()) changes.curfewTime = curfewText.trim();

    const originalAmenities: string[] = [];
    if (pension.includesWifi) originalAmenities.push('wifi-alta-velocidad');
    if (pension.includesMeals) originalAmenities.push('comida-incluida');
    if (pension.includesLaundry) originalAmenities.push('lavanderia');
    if (pension.includesStudyRoom) originalAmenities.push('sala-estudio');

    const amenitiesToAdd = activeAmenities.filter((a) => !originalAmenities.includes(a));
    const amenitiesToRemove = originalAmenities.filter((a) => !activeAmenities.includes(a));

    if (amenitiesToAdd.length > 0) changes.amenitiesToAdd = amenitiesToAdd;
    if (amenitiesToRemove.length > 0) changes.amenitiesToRemove = amenitiesToRemove;

    return changes;
  };

  const handleSubmit = async () => {
    if (submissionNotes.trim().length < 5) {
      setErrorMessage('Por favor incluye una breve explicación para el equipo de moderación.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const proposedChanges = calculateProposedChanges();
      await submitPensionProposal(
        pension.id,
        {
          type: 'FULL_UPDATE',
          proposedChanges: proposedChanges as Record<string, never>,
          submissionNotes: submissionNotes.trim(),
        },
        token ?? undefined,
      );

      setSuccessBanner(true);
      setTimeout(() => {
        setSuccessBanner(false);
        onClose();
      }, 1800);
    } catch (err: unknown) {
      const errStr = (err as Error)?.message || '';
      setErrorMessage(errStr || 'No se pudo enviar la propuesta. Inténtalo más tarde.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent
        id="suggest-edit-drawer"
        className="max-h-[92vh] max-w-lg mx-auto bg-card border-border text-foreground flex flex-col overflow-hidden"
      >
        <div className="mx-auto mt-2.5 mb-1 h-1.5 w-12 rounded-full bg-muted-foreground/30 shrink-0" />

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
            Sugerir Corrección
          </span>
          <div className="w-8" />
        </div>

        <div className="overflow-y-auto flex-1 px-4 py-4 space-y-6">
          <DrawerHeader className="p-0 text-left">
            <DrawerTitle className="text-lg font-bold text-foreground">
              Ayúdanos a mantener la información al día
            </DrawerTitle>
            <DrawerDescription className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Si vives aquí o conoces esta pensión, cuéntanos qué cambió o qué datos faltan para que
              otros estudiantes tengan información confiable.
            </DrawerDescription>
          </DrawerHeader>

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
                const isSelected = activeAmenities.includes(item.slug);
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
                  type="number"
                  value={monthlyPrice}
                  onChange={(e) => setMonthlyPrice(Number(e.target.value) || 0)}
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
                  type="number"
                  value={deposit}
                  onChange={(e) => setDeposit(Number(e.target.value) || 0)}
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
                  onClick={() => setWaterIncluded(!waterIncluded)}
                  className={`flex items-center justify-between p-2.5 rounded-xl border transition ${
                    waterIncluded
                      ? 'border-primary/40 bg-primary/5 text-foreground font-semibold'
                      : 'border-border bg-muted/20 text-muted-foreground'
                  }`}
                >
                  <span>Agua Potable</span>
                  <input
                    type="checkbox"
                    checked={waterIncluded}
                    readOnly
                    className="accent-primary"
                  />
                </button>

                <button
                  type="button"
                  onClick={() => setElectricityIncluded(!electricityIncluded)}
                  className={`flex items-center justify-between p-2.5 rounded-xl border transition ${
                    electricityIncluded
                      ? 'border-primary/40 bg-primary/5 text-foreground font-semibold'
                      : 'border-border bg-muted/20 text-muted-foreground'
                  }`}
                >
                  <span>Electricidad</span>
                  <input
                    type="checkbox"
                    checked={electricityIncluded}
                    readOnly
                    className="accent-primary"
                  />
                </button>

                <button
                  type="button"
                  onClick={() => setGasIncluded(!gasIncluded)}
                  className={`flex items-center justify-between p-2.5 rounded-xl border transition ${
                    gasIncluded
                      ? 'border-primary/40 bg-primary/5 text-foreground font-semibold'
                      : 'border-border bg-muted/20 text-muted-foreground'
                  }`}
                >
                  <span>Gas Calefont</span>
                  <input
                    type="checkbox"
                    checked={gasIncluded}
                    readOnly
                    className="accent-primary"
                  />
                </button>

                <button
                  type="button"
                  onClick={() => setInternetIncluded(!internetIncluded)}
                  className={`flex items-center justify-between p-2.5 rounded-xl border transition ${
                    internetIncluded
                      ? 'border-primary/40 bg-primary/5 text-foreground font-semibold'
                      : 'border-border bg-muted/20 text-muted-foreground'
                  }`}
                >
                  <span>Internet / Wi-Fi</span>
                  <input
                    type="checkbox"
                    checked={internetIncluded}
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
                onClick={() => setGuestsAllowed(!guestsAllowed)}
                className={`flex items-center justify-between p-2.5 rounded-xl border transition ${
                  guestsAllowed
                    ? 'border-primary/40 bg-primary/5 text-foreground font-semibold'
                    : 'border-border bg-muted/20 text-muted-foreground'
                }`}
              >
                <span>Visitas permitidas</span>
                <input
                  type="checkbox"
                  checked={guestsAllowed}
                  readOnly
                  className="accent-primary"
                />
              </button>

              <button
                type="button"
                onClick={() => setPetsAllowed(!petsAllowed)}
                className={`flex items-center justify-between p-2.5 rounded-xl border transition ${
                  petsAllowed
                    ? 'border-primary/40 bg-primary/5 text-foreground font-semibold'
                    : 'border-border bg-muted/20 text-muted-foreground'
                }`}
              >
                <span>Mascotas permitidas</span>
                <input type="checkbox" checked={petsAllowed} readOnly className="accent-primary" />
              </button>

              <button
                type="button"
                onClick={() => setSmokingAllowed(!smokingAllowed)}
                className={`flex items-center justify-between p-2.5 rounded-xl border transition ${
                  smokingAllowed
                    ? 'border-primary/40 bg-primary/5 text-foreground font-semibold'
                    : 'border-border bg-muted/20 text-muted-foreground'
                }`}
              >
                <span>Permite fumar</span>
                <input
                  type="checkbox"
                  checked={smokingAllowed}
                  readOnly
                  className="accent-primary"
                />
              </button>

              <div className="flex flex-col justify-center">
                <input
                  type="text"
                  placeholder="Horario llegada (ej: 23:00)"
                  value={curfewText}
                  onChange={(e) => setCurfewText(e.target.value)}
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
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
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
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-2.5 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/40 resize-none leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
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
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-2.5 py-2 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/40"
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
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-2.5 py-2 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/40"
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
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-2.5 py-2 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              </div>
            </div>
          </details>

          <section>
            <label
              htmlFor="suggest-submission-notes"
              className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5"
            >
              ¿Por qué propones este cambio? (Para los moderadores)
            </label>
            <textarea
              id="suggest-submission-notes"
              value={submissionNotes}
              onChange={(e) => setSubmissionNotes(e.target.value)}
              placeholder="Ej. Viví aquí el último semestre: ahora cuentan con lavandería en el primer piso y el valor del arriendo subió a $250.000 con luz incluida..."
              rows={3}
              className="w-full rounded-xl border border-border bg-card p-3 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-hidden focus:ring-2 focus:ring-primary/40 leading-relaxed resize-none"
            />
          </section>
        </div>

        <div className="border-t border-border/80 bg-card p-4">
          <Button
            id="btn-submit-proposal"
            onClick={handleSubmit}
            disabled={submissionNotes.trim().length < 5 || isSubmitting}
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
      </DrawerContent>
    </Drawer>
  );
}
