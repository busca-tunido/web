'use client';

import { ArrowLeftRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { usePensionComparison } from '@/contexts/pension-comparison-context';

export function PensionComparison() {
  const comparison = usePensionComparison();
  if (!comparison?.selected.length) return null;
  return (
    <aside
      aria-label="Pensiones seleccionadas para comparar"
      className="fixed inset-x-3 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-40 mx-auto flex max-w-2xl flex-wrap items-center justify-between gap-2 rounded-2xl border border-border bg-card p-3 shadow-xl md:bottom-6"
    >
      <div className="min-w-0">
        <p className="text-sm font-semibold">{comparison.selected.length} de 2 seleccionadas</p>
        <p className="text-xs text-muted-foreground">Tu comparación sigue guardada en el mapa.</p>
      </div>
      <Link
        href="/map"
        className="flex min-h-12 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground"
      >
        <ArrowLeftRight className="size-4" />
        Ver comparación
      </Link>
      <Button variant="ghost" className="min-h-12" onClick={comparison.clear}>
        Limpiar comparación
      </Button>
    </aside>
  );
}
