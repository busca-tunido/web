'use client';

import { ArrowLeftRight } from 'lucide-react';
import {
  COMPARISON_LIMIT,
  type ComparisonSelection,
  usePensionComparison,
} from '@/contexts/pension-comparison-context';

export function PensionCompareButton({ pension }: { pension: ComparisonSelection }) {
  const comparison = usePensionComparison();
  if (!comparison) return null;
  const isCompared = comparison.selected.some((item) => item.id === pension.id);
  const comparisonFull = !isCompared && comparison.selected.length === COMPARISON_LIMIT;

  return (
    <button
      type="button"
      aria-pressed={isCompared}
      aria-label={`${isCompared ? 'Quitar de comparación' : 'Comparar'}: ${pension.title}`}
      disabled={comparisonFull}
      onClick={(event) => {
        event.stopPropagation();
        comparison.toggle(pension);
      }}
      className="mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-border px-3 text-sm font-semibold transition hover:bg-muted focus-visible:outline-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50 aria-pressed:border-primary aria-pressed:bg-primary/10 aria-pressed:text-primary"
    >
      <ArrowLeftRight aria-hidden="true" className="size-4" />
      {isCompared
        ? 'Seleccionada para comparar'
        : comparisonFull
          ? 'Máximo dos pensiones'
          : 'Comparar pensión'}
    </button>
  );
}
