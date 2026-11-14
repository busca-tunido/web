'use client';

import { ArrowLeftRight, Check, Loader2, MapPin, RefreshCw, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import {
  type ComparisonSelection,
  type ComparisonSlot,
  usePensionComparison,
} from '@/contexts/pension-comparison-context';
import { useMediaQuery } from '@/hooks/use-media-query';
import { isApiSuccess } from '@/lib/api-response';
import {
  COMPARISON_ADVANTAGES,
  type ComparisonMetric,
  comparisonWinner,
} from '@/lib/pension-comparison';
import type { PensionItem } from '@/lib/types';
import { pensionsService } from '@/services/pensions.service';
import { PensionDetailContent } from './pension-detail-content';

function useComparisonDetail(id: string | undefined) {
  const [result, setResult] = useState<{
    id: string;
    attempt: number;
    data: PensionItem | null;
    error: string | null;
  } | null>(null);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!id) return;
    let active = true;
    setResult(null);
    void pensionsService
      .fetchPensionDetail(id)
      .then((response) => {
        if (!active) return;
        if (!isApiSuccess(response)) {
          setResult({
            attempt,
            id,
            data: null,
            error: response.message || 'No pudimos cargar esta pensión.',
          });
        } else if (!response.data.isActive) {
          setResult({
            attempt,
            id,
            data: null,
            error: 'Esta publicación ya no está disponible. Reemplázala por otra.',
          });
        } else {
          setResult({ attempt, id, data: response.data, error: null });
        }
      })
      .catch(() => {
        if (active)
          setResult({ attempt, id, data: null, error: 'No pudimos conectar. Inténtalo de nuevo.' });
      });
    return () => {
      active = false;
    };
  }, [id, attempt]);
  return {
    data: result?.id === id && result?.attempt === attempt ? (result?.data ?? null) : null,
    error: result?.id === id && result?.attempt === attempt ? (result?.error ?? null) : null,
    retry: () => setAttempt((value) => value + 1),
  };
}

function ComparisonPension({
  slot,
  selected,
  pension,
  error,
  retry,
  advantages,
}: {
  slot: ComparisonSlot;
  selected: ComparisonSelection;
  pension: PensionItem | null;
  error: string | null;
  retry: () => void;
  advantages: readonly ComparisonMetric[];
}) {
  return (
    <>
      <div className="shrink-0 border-b border-border bg-card px-4 py-3 lg:min-h-24">
        <p
          id={`comparison-label-${slot}`}
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground"
        >
          Pensión {slot === 0 ? 'A' : 'B'}
          {slot === 0 && (
            <Badge variant="secondary" className="bg-sage/10 text-sage-foreground">
              Fija
            </Badge>
          )}
        </p>
        {advantages.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {advantages.map((metric) => (
              <Badge
                key={metric}
                variant="secondary"
                className="gap-1 bg-sage/10 text-sage-foreground"
              >
                <Check className="size-3" />
                {COMPARISON_ADVANTAGES[metric]}
              </Badge>
            ))}
          </div>
        )}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 scrollbar-subtle lg:p-6">
        {pension ? (
          <PensionDetailContent key={pension.id} pension={pension} mode="comparison" />
        ) : (
          <div className="space-y-3 py-6">
            <h3 className="font-bold">{selected.title}</h3>
            {error ? (
              <div role="alert" className="space-y-3 rounded-xl bg-muted p-4">
                <p className="text-sm">{error}</p>
                <Button variant="outline" className="min-h-12" onClick={retry}>
                  <RefreshCw />
                  Reintentar Pensión {slot === 0 ? 'A' : 'B'}
                </Button>
              </div>
            ) : (
              <p role="status" className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Actualizando pensión…
              </p>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export function MapPensionComparison({
  universityId,
  universityName,
  mapOnly,
  onToggleMap,
  onChooseAnother,
}: {
  universityId?: string;
  universityName?: string;
  mapOnly: boolean;
  onToggleMap: () => void;
  onChooseAnother: () => void;
}) {
  const comparison = usePensionComparison();
  const first = useComparisonDetail(comparison?.slots[0]?.id);
  const second = useComparisonDetail(comparison?.slots[1]?.id);
  const [activeSlot, setActiveSlot] = useState<ComparisonSlot>(0);
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const aId = comparison?.slots[0]?.id;
  const bId = comparison?.slots[1]?.id;
  const previousIds = useRef([aId, bId]);
  useEffect(() => {
    const [previousA, previousB] = previousIds.current;
    if (aId && aId !== previousA) setActiveSlot(0);
    else if (bId && bId !== previousB) setActiveSlot(1);
    else if (!aId && bId) setActiveSlot(1);
    else if (!bId && aId) setActiveSlot(0);
    previousIds.current = [aId, bId];
  }, [aId, bId]);
  if (!comparison?.selected.length) return null;
  const fullscreen = Boolean(aId && bId);
  const details = [first, second] as const;
  const pensions = details.map((item) => item.data);
  const chooseAnother = () => {
    comparison.remove(1);
    onChooseAnother();
  };
  const metrics = Object.keys(COMPARISON_ADVANTAGES) as ComparisonMetric[];
  const content = (
    <section
      aria-label="Comparación de pensiones en el mapa"
      className="flex h-full min-h-0 flex-col bg-card"
    >
      <header className="shrink-0 space-y-2 border-b border-border px-4 py-3 lg:px-6">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="flex items-center gap-2 font-bold">
              <ArrowLeftRight className="size-5 shrink-0 text-primary" />
              Comparación
            </h2>
            <p role="status" className="mt-1 text-xs text-muted-foreground">
              {comparison.selected.length} de 2 seleccionadas
            </p>
          </div>
          {fullscreen && (
            <Button
              variant="ghost"
              className="min-h-12 min-w-12 shrink-0 gap-2"
              aria-label="Quitar Pensión B y volver al mapa"
              title="Quitar Pensión B y elegir otra"
              onClick={chooseAnother}
            >
              <span className="hidden text-xs sm:inline">Elegir otra pensión</span>
              <X />
            </Button>
          )}
        </div>
        {fullscreen ? (
          <p className="text-xs text-muted-foreground">
            La pensión A permanece fija hasta que pulses «Dejar de comparar». La X quita solo la
            pensión B.
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            {aId
              ? 'Selecciona otra pensión para comparar'
              : 'Selecciona la pensión que quieres fijar a la izquierda.'}
          </p>
        )}
        {fullscreen && (
          <p className="text-xs text-muted-foreground">
            {universityName
              ? `Distancias a ${universityName}.`
              : 'Distancias a la universidad más cercana de cada pensión.'}{' '}
            Las ventajas usan precios, calificaciones y servicios publicados.
          </p>
        )}
        {!fullscreen && (
          <Button variant="outline" className="min-h-12 w-full lg:hidden" onClick={onToggleMap}>
            <MapPin />
            {mapOnly ? 'Ver pensión fija' : 'Elegir en el mapa'}
          </Button>
        )}
      </header>
      {fullscreen && (
        <div
          role="tablist"
          aria-label="Pensión visible"
          className="grid shrink-0 grid-cols-2 gap-2 border-b border-border bg-card p-3 lg:hidden"
        >
          {comparison.slots.map((item, index) => (
            <button
              type="button"
              role="tab"
              id={`comparison-tab-${index}`}
              aria-controls={`comparison-pane-${index}`}
              aria-selected={activeSlot === index}
              tabIndex={activeSlot === index ? 0 : -1}
              key={index === 0 ? 'A' : 'B'}
              onClick={() => setActiveSlot(index as ComparisonSlot)}
              onKeyDown={(event) => {
                if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
                  event.preventDefault();
                  const next =
                    event.key === 'Home' ? 0 : event.key === 'End' ? 1 : activeSlot === 0 ? 1 : 0;
                  setActiveSlot(next);
                  document.getElementById(`comparison-tab-${next}`)?.focus();
                }
              }}
              className="min-h-12 min-w-0 rounded-xl border border-border px-2 text-sm font-semibold aria-selected:border-primary aria-selected:bg-primary/10 aria-selected:text-primary"
            >
              Pensión {index === 0 ? 'A' : 'B'}
              <span className="block truncate text-xs font-normal">{item?.title}</span>
            </button>
          ))}
        </div>
      )}
      <div
        className={`min-h-0 flex-1 ${fullscreen ? 'grid grid-cols-1 lg:grid-cols-2 lg:divide-x lg:divide-border' : mapOnly ? 'hidden lg:flex' : 'flex'}`}
      >
        {comparison.slots.map(
          (selected, index) =>
            selected && (
              <section
                key={index === 0 ? 'A' : 'B'}
                id={`comparison-pane-${index}`}
                role={fullscreen && !isDesktop ? 'tabpanel' : 'region'}
                aria-labelledby={
                  fullscreen && !isDesktop ? `comparison-tab-${index}` : `comparison-label-${index}`
                }
                className={`min-h-0 min-w-0 flex-1 flex-col ${!fullscreen || activeSlot === index ? 'flex' : 'hidden lg:flex'}`}
              >
                <ComparisonPension
                  slot={index as ComparisonSlot}
                  selected={selected}
                  pension={details[index].data}
                  error={details[index].error}
                  retry={details[index].retry}
                  advantages={metrics.filter(
                    (metric) => comparisonWinner(metric, pensions, universityId) === selected.id,
                  )}
                />
              </section>
            ),
        )}
      </div>
    </section>
  );

  return fullscreen ? (
    <Dialog
      open
      disablePointerDismissal
      onOpenChange={(open) => {
        if (!open) chooseAnother();
      }}
    >
      <DialogContent fullScreen showClose={false}>
        <DialogTitle className="sr-only">Comparación de dos pensiones</DialogTitle>
        <DialogDescription className="sr-only">
          La pensión A es fija. Cierra la pensión B para volver al mapa y elegir otra. Puedes
          consultar reseñas; para publicar una reseña o contactar debes salir de comparación.
        </DialogDescription>
        {content}
      </DialogContent>
    </Dialog>
  ) : (
    content
  );
}
