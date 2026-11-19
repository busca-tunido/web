'use client';

import { ArrowLeftRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckIcon } from '@/components/ui/check';
import { DeleteIcon } from '@/components/ui/delete';
import { RefreshCWIcon } from '@/components/ui/refresh-cw';
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalDescription,
  ResponsiveModalTitle,
} from '@/components/ui/responsive-modal';
import { PensionDetailSkeleton } from '@/components/ui/skeletons/pension-detail-skeleton';
import {
  type ComparisonSelection,
  type ComparisonSlot,
  usePensionComparison,
} from '@/contexts/pension-comparison-context';
import { useAnimatedIconTrigger } from '@/hooks/use-animated-icon';
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
            error: 'Esta publicación ya no está disponible.',
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
  onReplace,
}: {
  slot: ComparisonSlot;
  selected: ComparisonSelection;
  pension: PensionItem | null;
  error: string | null;
  retry: () => void;
  advantages: readonly ComparisonMetric[];
  onReplace: (slot: ComparisonSlot) => void;
}) {
  const {
    iconRef: replaceIconRef,
    start: startReplaceAnimation,
    triggerProps: replaceTriggerProps,
  } = useAnimatedIconTrigger();
  const {
    iconRef: retryIconRef,
    start: startRetryAnimation,
    triggerProps: retryTriggerProps,
  } = useAnimatedIconTrigger();

  return (
    <>
      <div className="shrink-0 border-b border-border bg-card px-4 py-2.5 lg:min-h-14 lg:px-6">
        <div className="flex items-start justify-between gap-2 min-w-0">
          <div className="flex min-w-0 min-h-8 flex-1 flex-wrap items-center gap-1.5">
            {advantages.map((metric) => (
              <Badge
                key={metric}
                variant="secondary"
                className="gap-1 bg-sage/15 text-sage-foreground"
              >
                <CheckIcon size={12} />
                {COMPARISON_ADVANTAGES[metric]}
              </Badge>
            ))}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            {...replaceTriggerProps}
            onClick={() => {
              startReplaceAnimation();
              onReplace(slot);
            }}
            aria-label={`Cambiar pensión: ${selected.title}`}
            className="h-8 shrink-0 gap-1.5 rounded-full px-2.5 text-xs font-semibold cursor-pointer"
          >
            <RefreshCWIcon ref={replaceIconRef} size={14} />
            <span>Cambiar</span>
          </Button>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 scrollbar-subtle pb-[calc(2rem+env(safe-area-inset-bottom))] lg:p-6">
        {pension ? (
          <PensionDetailContent key={pension.id} pension={pension} mode="comparison" />
        ) : error ? (
          <div className="space-y-3 py-6">
            <h3 className="font-bold">{selected.title}</h3>
            <div role="alert" className="space-y-3 rounded-xl bg-muted p-4">
              <p className="text-sm">{error}</p>
              <Button
                variant="outline"
                className="min-h-12"
                aria-label={`Reintentar carga de ${selected.title}`}
                {...retryTriggerProps}
                onClick={() => {
                  startRetryAnimation();
                  retry();
                }}
              >
                <RefreshCWIcon ref={retryIconRef} size={16} />
                Reintentar
              </Button>
            </div>
          </div>
        ) : (
          <PensionDetailSkeleton title={selected.title} />
        )}
      </div>
    </>
  );
}

export function MapPensionComparison({ universityId }: { universityId?: string } = {}) {
  const comparison = usePensionComparison();
  const aSlot = comparison?.slots[0] ?? null;
  const bSlot = comparison?.slots[1] ?? null;
  const first = useComparisonDetail(aSlot?.id);
  const second = useComparisonDetail(bSlot?.id);
  const [activeSlot, setActiveSlot] = useState<ComparisonSlot>(0);
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const {
    iconRef: singleClearIconRef,
    start: startSingleClearAnimation,
    triggerProps: singleClearTriggerProps,
  } = useAnimatedIconTrigger();
  const {
    iconRef: pairClearIconRef,
    start: startPairClearAnimation,
    triggerProps: pairClearTriggerProps,
  } = useAnimatedIconTrigger();
  const {
    iconRef: singleRetryIconRef,
    start: startSingleRetryAnimation,
    triggerProps: singleRetryTriggerProps,
  } = useAnimatedIconTrigger();
  const aId = aSlot?.id;
  const bId = bSlot?.id;
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

  const isPair = Boolean(aId && bId);
  const details = [first, second] as const;
  const pensions = details.map((item) => item.data);
  const metrics = Object.keys(COMPARISON_ADVANTAGES) as ComparisonMetric[];

  const singleEntry: {
    slot: ComparisonSlot;
    item: ComparisonSelection;
    detail: typeof first;
  } | null = !isPair
    ? aSlot
      ? { slot: 0, item: aSlot, detail: first }
      : bSlot
        ? { slot: 1, item: bSlot, detail: second }
        : null
    : null;

  return (
    <ResponsiveModal
      open={comparison.isDrawerOpen}
      onOpenChange={(open) => {
        if (!open) comparison.closeDrawer();
      }}
    >
      <ResponsiveModalContent
        id="comparison-drawer"
        showClose={false}
        showDragHandle={false}
        className={
          isPair
            ? 'h-[90dvh] [--drawer-content-max-height:92dvh] max-h-[92vh] md:h-[88vh] md:max-h-[88vh] w-full max-w-lg md:max-w-6xl mx-auto bg-card border-border text-foreground overflow-hidden flex flex-col md:rounded-3xl'
            : 'max-h-[92vh] md:max-h-[88vh] w-full max-w-lg md:max-w-4xl mx-auto bg-card border-border text-foreground overflow-hidden flex flex-col md:rounded-3xl'
        }
      >
        <ResponsiveModalTitle className="sr-only">
          {isPair ? 'Comparación de dos pensiones' : 'Pensión seleccionada para comparar'}
        </ResponsiveModalTitle>
        <ResponsiveModalDescription className="sr-only">
          {isPair
            ? 'Compara ambas pensiones lado a lado o minimiza el panel deslizándolo hacia abajo.'
            : 'Visualiza los detalles de la pensión guardada o quítala de la comparación.'}
        </ResponsiveModalDescription>

        <button
          type="button"
          onClick={comparison.closeDrawer}
          aria-label="Minimizar comparación"
          className="mx-auto mt-2.5 mb-1 flex md:hidden w-28 justify-center py-1.5 cursor-pointer group shrink-0 rounded-full focus-visible:outline-2 focus-visible:outline-primary"
        >
          <span className="h-1.5 w-12 rounded-full bg-muted-foreground/30 group-hover:bg-muted-foreground/55 transition-colors" />
        </button>

        {singleEntry ? (
          <>
            <header className="shrink-0 flex items-center justify-between gap-3 border-b border-border/70 px-4 py-2.5 md:px-8">
              <div className="flex items-center gap-2 min-w-0">
                <ArrowLeftRight className="size-4 text-primary shrink-0" />
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground truncate">
                  Pensión en comparación
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                {...singleClearTriggerProps}
                onClick={() => {
                  startSingleClearAnimation();
                  comparison.remove(singleEntry.slot);
                }}
                aria-label={`Dejar de comparar: ${singleEntry.item.title}`}
                className="h-8 gap-1.5 rounded-full px-2.5 text-xs font-semibold text-muted-foreground hover:bg-destructive/10 hover:text-destructive cursor-pointer shrink-0"
              >
                <DeleteIcon ref={singleClearIconRef} size={14} />
                <span>Dejar de comparar</span>
              </Button>
            </header>

            <div className="overflow-y-auto scrollbar-subtle flex-1 px-4 md:px-8 pt-3 pb-[calc(2rem+env(safe-area-inset-bottom))] md:pb-6">
              {singleEntry.detail.data ? (
                <PensionDetailContent
                  key={singleEntry.detail.data.id}
                  pension={singleEntry.detail.data}
                  mode="detail"
                  hideCompareButton
                  onBack={comparison.closeDrawer}
                />
              ) : singleEntry.detail.error ? (
                <div className="space-y-3 py-8">
                  <h3 className="text-lg font-bold">{singleEntry.item.title}</h3>
                  <div role="alert" className="space-y-3 rounded-xl bg-muted p-4">
                    <p className="text-sm">{singleEntry.detail.error}</p>
                    <Button
                      variant="outline"
                      className="min-h-12"
                      {...singleRetryTriggerProps}
                      onClick={() => {
                        startSingleRetryAnimation();
                        singleEntry.detail.retry();
                      }}
                    >
                      <RefreshCWIcon ref={singleRetryIconRef} size={16} />
                      Reintentar
                    </Button>
                  </div>
                </div>
              ) : (
                <PensionDetailSkeleton title={singleEntry.item.title} />
              )}
            </div>
          </>
        ) : (
          <>
            <header className="shrink-0 flex items-center justify-between gap-3 border-b border-border/70 px-4 py-2.5 lg:px-6">
              <div className="flex items-center gap-2 min-w-0">
                <ArrowLeftRight className="size-4 text-primary shrink-0" />
                <h2 className="text-sm font-bold tracking-tight truncate">Comparación</h2>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                {...pairClearTriggerProps}
                onClick={() => {
                  startPairClearAnimation();
                  comparison.clear();
                }}
                aria-label="Dejar de comparar"
                className="h-8 gap-1.5 rounded-full px-2.5 text-xs font-semibold text-muted-foreground hover:bg-destructive/10 hover:text-destructive cursor-pointer shrink-0"
              >
                <DeleteIcon ref={pairClearIconRef} size={14} />
                <span>Dejar de comparar</span>
              </Button>
            </header>

            <div
              role="tablist"
              aria-label="Alojamientos comparados"
              className="grid shrink-0 grid-cols-2 gap-2 border-b border-border bg-card p-3 lg:hidden"
            >
              {comparison.slots.map((item, index) => {
                const detail = details[index].data;
                return (
                  <button
                    type="button"
                    role="tab"
                    id={`comparison-tab-${index}`}
                    aria-controls={`comparison-pane-${index}`}
                    aria-selected={activeSlot === index}
                    tabIndex={activeSlot === index ? 0 : -1}
                    key={item?.id ?? index}
                    onClick={() => setActiveSlot(index as ComparisonSlot)}
                    onKeyDown={(event) => {
                      if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
                        event.preventDefault();
                        const next =
                          event.key === 'Home'
                            ? 0
                            : event.key === 'End'
                              ? 1
                              : activeSlot === 0
                                ? 1
                                : 0;
                        setActiveSlot(next);
                        document.getElementById(`comparison-tab-${next}`)?.focus();
                      }
                    }}
                    className="min-h-12 min-w-0 rounded-xl border border-border px-2.5 py-1.5 text-left transition-colors aria-selected:border-primary aria-selected:bg-primary/10 aria-selected:text-primary cursor-pointer"
                  >
                    <span className="block truncate text-xs font-semibold">{item?.title}</span>
                    <span className="block truncate text-[11px] font-normal text-muted-foreground tabular-nums">
                      {detail
                        ? `$${detail.baseMonthlyPrice.toLocaleString('es-CL')}/mes`
                        : 'Cargando…'}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="min-h-0 flex-1 grid grid-cols-1 lg:grid-cols-2 lg:divide-x lg:divide-border">
              {comparison.slots.map(
                (selected, index) =>
                  selected && (
                    <section
                      key={selected.id}
                      id={`comparison-pane-${index}`}
                      role={!isDesktop ? 'tabpanel' : 'region'}
                      aria-label={!isDesktop ? undefined : selected.title}
                      aria-labelledby={!isDesktop ? `comparison-tab-${index}` : undefined}
                      className={`min-h-0 min-w-0 flex-1 flex-col ${activeSlot === index ? 'flex' : 'hidden lg:flex'}`}
                    >
                      <ComparisonPension
                        slot={index as ComparisonSlot}
                        selected={selected}
                        pension={details[index].data}
                        error={details[index].error}
                        retry={details[index].retry}
                        advantages={metrics.filter(
                          (metric) =>
                            comparisonWinner(metric, pensions, universityId) === selected.id,
                        )}
                        onReplace={(targetSlot) => {
                          comparison.remove(targetSlot);
                          comparison.closeDrawer();
                        }}
                      />
                    </section>
                  ),
              )}
            </div>
          </>
        )}
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
