'use client';

import { ArrowLeftRight, Loader2, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalDescription,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from '@/components/ui/responsive-modal';
import type { ComparisonSelection } from '@/contexts/pension-comparison-context';
import { useMediaQuery } from '@/hooks/use-media-query';
import { isApiSuccess } from '@/lib/api-response';
import {
  COMPARISON_ROWS,
  COMPARISON_SECTIONS,
  type ComparisonSection,
} from '@/lib/pension-comparison';
import type { PensionItem } from '@/lib/types';
import { pensionsService } from '@/services/pensions.service';

type ComparisonProps = {
  selected: readonly ComparisonSelection[];
  onRemove: (pension: ComparisonSelection) => void;
  onClear: () => void;
};

function ComparisonDetails({
  selected,
  onRetry,
  onNavigate,
}: {
  selected: readonly ComparisonSelection[];
  onRetry: () => void;
  onNavigate: () => void;
}) {
  const [details, setDetails] = useState<readonly PensionItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [onlyDifferences, setOnlyDifferences] = useState(false);
  const [section, setSection] = useState<ComparisonSection>('Precio y ubicación');
  const isDesktop = useMediaQuery('(min-width: 768px)');

  useEffect(() => {
    let active = true;
    setDetails(null);
    setError(null);
    void Promise.all(selected.map((pension) => pensionsService.fetchPensionDetail(pension.id)))
      .then((responses) => {
        if (!active) return;
        const pensions: PensionItem[] = [];
        for (const response of responses) {
          if (!isApiSuccess(response)) {
            setError('No pudimos actualizar las dos pensiones. Inténtalo de nuevo.');
            return;
          }
          if (!response.data.isActive) {
            setError('Una de las publicaciones ya no está disponible. Cambia tu selección.');
            return;
          }
          pensions.push(response.data);
        }
        setDetails(pensions);
      })
      .catch(() => {
        if (active) setError('No pudimos conectar con las pensiones. Inténtalo de nuevo.');
      });
    return () => {
      active = false;
    };
  }, [selected]);

  if (error)
    return (
      <div className="p-6 space-y-3" role="alert">
        <p>{error}</p>
        <button type="button" onClick={onRetry} className="min-h-12 rounded-xl border px-4">
          Reintentar
        </button>
      </div>
    );
  if (!details)
    return (
      <p role="status" className="flex items-center gap-2 p-6">
        <Loader2 className="size-5 animate-spin" />
        Actualizando pensiones…
      </p>
    );

  return (
    <div className="min-h-0 overflow-y-auto p-4 md:p-6">
      <label className="mb-3 flex min-h-12 cursor-pointer items-center gap-3 text-sm">
        <input
          type="checkbox"
          checked={onlyDifferences}
          onChange={(event) => setOnlyDifferences(event.target.checked)}
          className="size-5 accent-primary"
        />
        Solo diferencias
      </label>
      {!isDesktop && (
        <fieldset className="mb-4 grid grid-cols-3 gap-1" aria-label="Sección de comparación">
          {COMPARISON_SECTIONS.map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={item === section}
              onClick={() => setSection(item)}
              className="min-h-12 rounded-xl border border-border px-2 text-xs font-semibold aria-pressed:bg-primary aria-pressed:text-primary-foreground"
            >
              {item}
            </button>
          ))}
        </fieldset>
      )}
      <table className="w-full table-fixed text-sm">
        <caption className="sr-only">Comparación de dos pensiones</caption>
        <thead>
          <tr>
            {isDesktop && (
              <th scope="col" className="w-1/4 text-left">
                Características
              </th>
            )}
            {details.map((pension) => (
              <th
                key={pension.id}
                scope="col"
                className="sticky top-0 z-10 bg-card p-3 text-left align-top break-words"
              >
                <Link
                  href={`/pensions/${pension.slug}`}
                  onClick={onNavigate}
                  className="flex min-h-12 items-center text-primary underline underline-offset-4"
                >
                  {pension.title}
                </Link>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(isDesktop ? COMPARISON_SECTIONS : [section]).map((item) => (
            <ComparisonRows
              key={item}
              section={item}
              pensions={details}
              isDesktop={isDesktop}
              onlyDifferences={onlyDifferences}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ComparisonRows({
  section,
  pensions,
  isDesktop,
  onlyDifferences,
}: {
  section: ComparisonSection;
  pensions: readonly PensionItem[];
  isDesktop: boolean;
  onlyDifferences: boolean;
}) {
  const rows = COMPARISON_ROWS.filter(
    (row) =>
      row.section === section && (!onlyDifferences || new Set(pensions.map(row.value)).size > 1),
  );
  return (
    <>
      {isDesktop && (
        <tr>
          <th colSpan={3} scope="colgroup" className="bg-muted p-3 text-left">
            {section}
          </th>
        </tr>
      )}
      {rows.length === 0 && (
        <tr>
          <td colSpan={isDesktop ? 3 : 2} className="p-4 text-muted-foreground">
            Sin diferencias en esta sección.
          </td>
        </tr>
      )}
      {rows.map((row) => (
        <tr key={row.label} className="border-b border-border">
          {isDesktop && (
            <th scope="row" className="p-3 text-left font-medium">
              {row.label}
            </th>
          )}
          {pensions.map((pension) => (
            <td key={pension.id} className="break-words p-3 align-top">
              {!isDesktop && (
                <span className="mb-1 block text-xs font-semibold text-muted-foreground">
                  {row.label}
                </span>
              )}
              {row.value(pension)}
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export function PensionComparison({ selected, onRemove, onClear }: ComparisonProps) {
  const [open, setOpen] = useState(false);
  const [attempt, setAttempt] = useState(0);
  if (selected.length === 0) return null;

  return (
    <>
      <aside
        aria-label="Pensiones seleccionadas para comparar"
        className="fixed inset-x-3 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-40 mx-auto max-w-4xl rounded-2xl border border-border bg-card p-3 shadow-xl md:bottom-6 md:p-4"
      >
        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          <p className="text-sm font-semibold" role="status">
            Comparar {selected.length}/2
          </p>
          <div className="order-first grid w-full min-w-0 grid-cols-2 gap-2 md:order-none md:flex md:w-auto md:flex-1">
            {selected.map((pension) => (
              <button
                key={pension.id}
                type="button"
                onClick={() => onRemove(pension)}
                aria-label={`Quitar ${pension.title} de la comparación`}
                className="flex min-h-12 min-w-12 max-w-full items-center gap-2 rounded-xl bg-muted px-3 text-sm"
              >
                <span className="truncate">{pension.title}</span>
                <X aria-hidden="true" className="size-4 shrink-0" />
              </button>
            ))}
          </div>
          <button
            type="button"
            className="min-h-12 rounded-xl px-3 text-sm underline"
            onClick={() => {
              setOpen(false);
              onClear();
            }}
          >
            Limpiar
          </button>
          <button
            type="button"
            disabled={selected.length !== 2}
            onClick={() => setOpen(true)}
            className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50"
          >
            <ArrowLeftRight aria-hidden="true" className="size-4" />
            Comparar pensiones
          </button>
        </div>
        {selected.length === 1 && (
          <p className="mt-2 text-xs text-muted-foreground">
            Selecciona otra pensión desde su tarjeta.
          </p>
        )}
      </aside>
      <ResponsiveModal open={open && selected.length === 2} onOpenChange={setOpen}>
        <ResponsiveModalContent className="md:max-w-4xl" showClose={false}>
          <ResponsiveModalHeader className="flex-row items-start justify-between gap-3 p-4 md:p-6">
            <div>
              <ResponsiveModalTitle>Compara tus pensiones</ResponsiveModalTitle>
              <ResponsiveModalDescription>
                Precios, servicios y reglas publicados por cada pensión.
              </ResponsiveModalDescription>
            </div>
            <button
              type="button"
              aria-label="Cerrar comparación"
              onClick={() => setOpen(false)}
              className="flex size-12 shrink-0 items-center justify-center rounded-full hover:bg-muted"
            >
              <X aria-hidden="true" className="size-5" />
            </button>
          </ResponsiveModalHeader>
          {open && selected.length === 2 && (
            <ComparisonDetails
              key={attempt}
              selected={selected}
              onRetry={() => setAttempt((value) => value + 1)}
              onNavigate={() => setOpen(false)}
            />
          )}
        </ResponsiveModalContent>
      </ResponsiveModal>
    </>
  );
}
