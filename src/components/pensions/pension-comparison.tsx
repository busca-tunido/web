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
import { isApiSuccess } from '@/lib/api-response';
import { COMPARISON_ROWS, COMPARISON_SECTIONS } from '@/lib/pension-comparison';
import type { PensionItem } from '@/lib/types';
import { pensionsService } from '@/services/pensions.service';

type ComparisonProps = {
  selected: readonly PensionItem[];
  onRemove: (pension: PensionItem) => void;
  onClear: () => void;
};

function ComparisonDetails({ selected }: { selected: readonly PensionItem[] }) {
  const [details, setDetails] = useState<readonly PensionItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

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
    return () => { active = false; };
  }, [selected, attempt]);

  if (error) return (
    <div className="p-6 space-y-3" role="alert">
      <p>{error}</p>
      <button type="button" className="min-h-12 rounded-xl border px-4" onClick={() => setAttempt((value) => value + 1)}>Reintentar</button>
    </div>
  );
  if (!details) return <p role="status" className="flex items-center gap-2 p-6"><Loader2 className="size-5 animate-spin" />Actualizando pensiones…</p>;

  return (
    <div className="min-h-0 overflow-y-auto p-4 md:p-6">
      <table className="w-full table-fixed text-sm">
        <caption className="sr-only">Comparación de dos pensiones</caption>
        <thead>
          <tr>
            <th scope="col" className="w-1/4 text-left">Características</th>
            {details.map((pension) => <th key={pension.id} scope="col" className="p-3 text-left align-top break-words">
              <Link href={`/pensions/${pension.slug}`} className="flex min-h-12 items-center text-primary underline underline-offset-4">{pension.title}</Link>
            </th>)}
          </tr>
        </thead>
        <tbody>
          {COMPARISON_SECTIONS.map((section) => <ComparisonRows key={section} section={section} pensions={details} />)}
        </tbody>
      </table>
    </div>
  );
}

function ComparisonRows({ section, pensions }: { section: string; pensions: readonly PensionItem[] }) {
  return <>
    <tr><th colSpan={3} scope="colgroup" className="bg-muted p-3 text-left">{section}</th></tr>
    {COMPARISON_ROWS.filter((row) => row.section === section).map((row) => <tr key={row.label} className="border-b border-border">
      <th scope="row" className="p-3 text-left font-medium">{row.label}</th>
      {pensions.map((pension) => <td key={pension.id} className="break-words p-3 align-top">{row.value(pension)}</td>)}
    </tr>)}
  </>;
}

export function PensionComparison({ selected, onRemove, onClear }: ComparisonProps) {
  const [open, setOpen] = useState(false);
  if (selected.length === 0) return null;

  return <>
    <aside aria-label="Pensiones seleccionadas para comparar" className="fixed inset-x-4 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-40 mx-auto max-w-4xl rounded-2xl border border-border bg-card p-4 shadow-xl md:bottom-6">
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-sm font-semibold" role="status">Comparar {selected.length}/2</p>
        <div className="flex min-w-0 flex-1 flex-wrap gap-2">
          {selected.map((pension) => <button key={pension.id} type="button" onClick={() => onRemove(pension)} aria-label={`Quitar ${pension.title} de la comparación`} className="flex min-h-12 min-w-12 max-w-full items-center gap-2 rounded-xl bg-muted px-3 text-sm">
            <span className="truncate">{pension.title}</span><X aria-hidden="true" className="size-4 shrink-0" />
          </button>)}
        </div>
        <button type="button" className="min-h-12 rounded-xl px-3 text-sm underline" onClick={() => { setOpen(false); onClear(); }}>Limpiar</button>
        <button type="button" disabled={selected.length !== 2} onClick={() => setOpen(true)} className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50">
          <ArrowLeftRight aria-hidden="true" className="size-4" />Comparar pensiones
        </button>
      </div>
      {selected.length === 1 && <p className="mt-2 text-xs text-muted-foreground">Selecciona otra pensión desde su tarjeta.</p>}
    </aside>
    <ResponsiveModal open={open && selected.length === 2} onOpenChange={setOpen}>
      <ResponsiveModalContent className="md:max-w-4xl" showClose={false}>
        <ResponsiveModalHeader className="flex-row items-start justify-between gap-3 p-4 md:p-6">
          <div><ResponsiveModalTitle>Compara tus pensiones</ResponsiveModalTitle><ResponsiveModalDescription>Precios, servicios y reglas publicados por cada pensión.</ResponsiveModalDescription></div>
          <button type="button" aria-label="Cerrar comparación" onClick={() => setOpen(false)} className="flex size-12 shrink-0 items-center justify-center rounded-full hover:bg-muted"><X aria-hidden="true" className="size-5" /></button>
        </ResponsiveModalHeader>
        {open && selected.length === 2 && <ComparisonDetails selected={selected} />}
      </ResponsiveModalContent>
    </ResponsiveModal>
  </>;
}
