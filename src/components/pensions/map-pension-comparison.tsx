'use client';

import {
  ArrowLeftRight,
  Building2,
  Check,
  ChevronLeft,
  ChevronRight,
  Heart,
  Loader2,
  MapPin,
  RefreshCw,
  X,
} from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FullScreenImageViewer } from '@/components/ui/fullscreen-image-viewer';
import {
  type ComparisonSelection,
  type ComparisonSlot,
  usePensionComparison,
} from '@/contexts/pension-comparison-context';
import { useFavoriteAction } from '@/hooks/use-favorite-action';
import { isApiSuccess } from '@/lib/api-response';
import {
  COMPARISON_ADVANTAGES,
  COMPARISON_ROWS,
  COMPARISON_SECTIONS,
  comparisonWinner,
} from '@/lib/pension-comparison';
import type { PensionItem } from '@/lib/types';
import { pensionsService } from '@/services/pensions.service';

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

function ComparisonGallery({ pension }: { pension: PensionItem }) {
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const image = pension.images[index];
  return (
    <div className="relative aspect-[16/9] overflow-hidden rounded-xl bg-muted">
      {image ? (
        <button
          type="button"
          className="absolute inset-0 size-full focus-visible:outline-2 focus-visible:outline-primary"
          onClick={() => setOpen(true)}
          aria-label={`Ver fotos de ${pension.title}`}
        >
          <Image
            src={image.url}
            alt={image.caption || pension.title}
            fill
            unoptimized
            sizes="(max-width: 1023px) 100vw, 420px"
            className="object-cover"
          />
        </button>
      ) : (
        <div className="flex size-full items-center justify-center gap-2 text-sm text-muted-foreground">
          <Building2 className="size-6" />
          Sin fotos publicadas
        </div>
      )}
      {pension.images.length > 1 && (
        <>
          <Button
            variant="secondary"
            className="absolute left-1 top-1/2 min-h-12 min-w-12 -translate-y-1/2 rounded-full shadow"
            aria-label={`Foto anterior de ${pension.title}`}
            onClick={() =>
              setIndex((value) => (value - 1 + pension.images.length) % pension.images.length)
            }
          >
            <ChevronLeft />
          </Button>
          <Button
            variant="secondary"
            className="absolute right-1 top-1/2 min-h-12 min-w-12 -translate-y-1/2 rounded-full shadow"
            aria-label={`Foto siguiente de ${pension.title}`}
            onClick={() => setIndex((value) => (value + 1) % pension.images.length)}
          >
            <ChevronRight />
          </Button>
          <span className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-2 py-1 text-xs text-white">
            {index + 1} / {pension.images.length}
          </span>
        </>
      )}
      {open && (
        <FullScreenImageViewer
          isOpen={open}
          onClose={() => setOpen(false)}
          images={pension.images.map((item) => item.url)}
          initialIndex={index}
          title={pension.title}
        />
      )}
    </div>
  );
}

function ComparisonHeading({
  slot,
  selected,
  pension,
  error,
  retry,
}: {
  slot: ComparisonSlot;
  selected: ComparisonSelection | null;
  pension: PensionItem | null;
  error: string | null;
  retry: () => void;
}) {
  const comparison = usePensionComparison();
  const { isFavorite, onFavoriteClick } = useFavoriteAction();
  const letter = slot === 0 ? 'A' : 'B';
  if (!comparison) return null;
  return (
    <div className="min-w-0 space-y-3 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Pensión {letter}
        </span>
        {selected && (
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            Comparando
          </Badge>
        )}
      </div>
      {selected ? (
        <>
          <div className="flex items-start justify-between gap-2">
            <h3 className="min-w-0 break-words text-base font-bold">
              {pension?.title ?? selected.title}
            </h3>
            <Button
              variant="ghost"
              className="min-h-12 min-w-12 shrink-0"
              aria-label={`Quitar Pensión ${letter}`}
              onClick={() => comparison.remove(slot)}
            >
              <X />
            </Button>
          </div>
          {pension && <ComparisonGallery key={pension.id} pension={pension} />}
          {error ? (
            <div role="alert" className="space-y-2 rounded-xl bg-muted p-3 text-sm">
              <p>{error}</p>
              <Button variant="outline" className="min-h-12" onClick={retry}>
                <RefreshCw />
                Reintentar Pensión {letter}
              </Button>
            </div>
          ) : (
            !pension && (
              <p role="status" className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Actualizando pensión…
              </p>
            )
          )}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={comparison.replacing === slot ? 'secondary' : 'outline'}
              className="min-h-12 flex-1"
              aria-pressed={comparison.replacing === slot}
              onClick={() => comparison.replace(slot)}
            >
              <ArrowLeftRight />
              Reemplazar {letter}
            </Button>
            <Button
              variant="outline"
              className="min-h-12 min-w-12"
              aria-label={`${isFavorite(selected.id) ? 'Quitar de' : 'Guardar en'} favoritos: ${selected.title}`}
              aria-pressed={isFavorite(selected.id)}
              onClick={(event) => onFavoriteClick(selected.id, event)}
            >
              <Heart className={isFavorite(selected.id) ? 'fill-primary text-primary' : ''} />
            </Button>
          </div>
        </>
      ) : (
        <div className="flex min-h-52 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border p-5 text-center text-sm text-muted-foreground">
          <MapPin className="size-7 text-primary" />
          <p>Selecciona otra pensión para comparar</p>
          <p className="text-xs">Abre un marcador del mapa para ocupar este espacio.</p>
        </div>
      )}
    </div>
  );
}

export function MapPensionComparison({
  universityId,
  universityName,
  mapOnly,
  onToggleMap,
}: {
  universityId?: string;
  universityName?: string;
  mapOnly: boolean;
  onToggleMap: () => void;
}) {
  const comparison = usePensionComparison();
  const first = useComparisonDetail(comparison?.slots[0]?.id);
  const second = useComparisonDetail(comparison?.slots[1]?.id);
  const [activeSlot, setActiveSlot] = useState<ComparisonSlot>(0);
  const [onlyDifferences, setOnlyDifferences] = useState(false);
  const aId = comparison?.slots[0]?.id;
  const bId = comparison?.slots[1]?.id;
  useEffect(() => {
    setActiveSlot(bId ? 1 : aId ? 0 : 1);
  }, [aId, bId]);
  if (!comparison?.selected.length) return null;
  const details = [first, second] as const;
  const pensions = details.map((item) => item.data);
  const target = comparison.replacing ?? (comparison.slots[0] === null ? 0 : 1);
  const columns = (slot: number) => `min-w-0 ${activeSlot !== slot ? 'hidden lg:block' : ''}`;
  const hasPair = pensions.every(Boolean);

  return (
    <section
      aria-label="Comparación de pensiones en el mapa"
      className="flex h-full min-h-0 flex-col bg-card"
    >
      <header className="shrink-0 space-y-2 border-b border-border px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 font-bold">
            <ArrowLeftRight className="size-5 text-primary" />
            Comparación
          </h2>
          <Badge variant="secondary" role="status">
            {comparison.selected.length} de 2 seleccionadas
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground" aria-live="polite">
          {comparison.selected.length === 1
            ? 'Selecciona otra pensión para comparar'
            : `La siguiente pensión reemplazará Pensión ${target === 0 ? 'A' : 'B'}.`}
        </p>
        {comparison.replacing !== null && (
          <div className="flex flex-wrap items-center gap-2 text-xs text-primary">
            <span>Elige en el mapa la nueva Pensión {comparison.replacing === 0 ? 'A' : 'B'}.</span>
            <Button variant="ghost" className="min-h-12" onClick={() => comparison.replace(null)}>
              Cancelar reemplazo
            </Button>
          </div>
        )}
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" className="min-h-12 flex-1 lg:hidden" onClick={onToggleMap}>
            <MapPin />
            {mapOnly ? 'Ver comparación' : 'Elegir en el mapa'}
          </Button>
          <Button variant="ghost" className="min-h-12 text-xs" onClick={comparison.clear}>
            Limpiar comparación
          </Button>
          <Button variant="ghost" className="min-h-12 text-xs" onClick={comparison.clear}>
            Volver al modo normal
          </Button>
        </div>
      </header>
      <div
        className={`min-h-0 flex-1 overflow-y-auto overscroll-contain scrollbar-subtle ${mapOnly ? 'hidden lg:block' : ''}`}
      >
        <div
          role="tablist"
          aria-label="Pensión visible"
          className="sticky top-0 z-10 grid grid-cols-2 gap-2 border-b border-border bg-card p-3 lg:hidden"
        >
          {comparison.slots.map((item, index) => (
            <button
              type="button"
              role="tab"
              id={`comparison-tab-${index}`}
              aria-controls={`comparison-panel-${index}`}
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
              <span className="block truncate text-xs font-normal">
                {item?.title ?? 'Por seleccionar'}
              </span>
            </button>
          ))}
        </div>
        <div
          className={`grid grid-cols-1 divide-border ${comparison.selected.length === 2 ? 'lg:grid-cols-2 lg:divide-x' : ''}`}
        >
          {comparison.slots.map((item, index) => (
            <div
              key={index === 0 ? 'A' : 'B'}
              id={`comparison-panel-${index}`}
              role="tabpanel"
              aria-labelledby={`comparison-tab-${index}`}
              className={`${columns(index)} ${!item ? 'lg:hidden' : ''}`}
            >
              <ComparisonHeading
                slot={index as ComparisonSlot}
                selected={item}
                pension={details[index].data}
                error={details[index].error}
                retry={details[index].retry}
              />
            </div>
          ))}
        </div>
        <div className="border-y border-border bg-muted/40 px-4 py-2 text-xs text-muted-foreground">
          <p>
            {universityName
              ? `Distancias a ${universityName}.`
              : 'Distancias a la universidad más cercana de cada pensión.'}{' '}
            Los precios son valores publicados «desde».
          </p>
          <p>Más equipada: cantidad de comodidades y suministros publicados. No mide su calidad.</p>
          <label className="flex min-h-12 items-center gap-2 text-foreground">
            <input
              type="checkbox"
              checked={onlyDifferences}
              disabled={!hasPair}
              onChange={(event) => setOnlyDifferences(event.target.checked)}
              className="size-5 accent-primary"
            />
            Solo diferencias
          </label>
        </div>
        {COMPARISON_SECTIONS.map((section) => {
          const rows = COMPARISON_ROWS.filter(
            (row) =>
              row.section === section &&
              (!onlyDifferences ||
                !hasPair ||
                row.value(pensions[0] as PensionItem, universityId) !==
                  row.value(pensions[1] as PensionItem, universityId)),
          );
          return (
            <section key={section} aria-label={section}>
              <h3 className="border-b border-border bg-muted px-4 py-3 text-xs font-bold uppercase tracking-wider">
                {section}
              </h3>
              {rows.length === 0 && (
                <p className="p-4 text-sm text-muted-foreground">
                  Sin diferencias en esta sección.
                </p>
              )}
              {rows.map((row) => {
                const winner = row.metric
                  ? comparisonWinner(row.metric, pensions, universityId)
                  : null;
                return (
                  <div
                    key={row.label}
                    className={`grid grid-cols-1 border-b border-border lg:divide-border ${comparison.selected.length === 2 ? 'lg:grid-cols-2 lg:divide-x' : ''}`}
                  >
                    {details.map((detail, index) => (
                      <div
                        key={index === 0 ? 'A' : 'B'}
                        className={`${columns(index)} ${!comparison.slots[index] ? 'lg:hidden' : ''} p-4 ${detail.data && winner === detail.data.id ? 'bg-primary/5' : ''}`}
                      >
                        <p className="mb-1 text-xs font-semibold text-muted-foreground">
                          {row.label === 'Universidad más cercana' && universityId
                            ? 'Universidad seleccionada'
                            : row.label}
                        </p>
                        <p
                          className={`whitespace-pre-line break-words text-sm ${row.label === 'Descripción resumida' ? 'line-clamp-4' : ''}`}
                        >
                          {detail.data
                            ? row.value(detail.data, universityId)
                            : comparison.slots[index]
                              ? 'Pendiente de actualizar'
                              : '—'}
                        </p>
                        {row.metric && detail.data && winner === detail.data.id && (
                          <Badge
                            variant="secondary"
                            className="mt-2 max-w-full gap-1 whitespace-normal bg-primary/10 text-primary"
                          >
                            <Check className="size-3 shrink-0" />
                            {COMPARISON_ADVANTAGES[row.metric]}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })}
            </section>
          );
        })}
      </div>
    </section>
  );
}
