'use client';

import { ArrowLeftRight } from 'lucide-react';
import { useOptionalNavigation } from '@/contexts/navigation-context';
import {
  COMPARISON_LIMIT,
  type ComparisonSelection,
  usePensionComparison,
} from '@/contexts/pension-comparison-context';

export function PensionCompareButton({
  pension,
  variant = 'card',
}: {
  pension: ComparisonSelection;
  variant?: 'card' | 'detail';
}) {
  const navigation = useOptionalNavigation();
  const comparison = usePensionComparison();
  if (!comparison) return null;
  const isCompared = comparison.selected.some((item) => item.id === pension.id);
  const comparisonFull = !isCompared && comparison.selected.length === COMPARISON_LIMIT;

  return (
    <button
      type="button"
      aria-pressed={isCompared}
      aria-label={`${isCompared ? (variant === 'detail' ? 'Ver comparación' : 'Quitar de comparación') : 'Comparar'}: ${pension.title}`}
      disabled={comparisonFull && variant === 'card' && comparison.replacing === null}
      onClick={(event) => {
        event.stopPropagation();
        if (variant === 'detail') {
          comparison.select(pension);
          navigation?.navigateTab('map');
        } else comparison.toggle(pension);
      }}
      className={
        variant === 'detail'
          ? 'flex min-h-12 items-center justify-center gap-2 rounded-full bg-black/60 px-3 text-sm font-semibold text-white backdrop-blur-md hover:bg-black/80 focus-visible:outline-2 focus-visible:outline-primary'
          : 'mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-border px-3 text-sm font-semibold transition hover:bg-muted focus-visible:outline-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50 aria-pressed:border-primary aria-pressed:bg-primary/10 aria-pressed:text-primary'
      }
    >
      <ArrowLeftRight aria-hidden="true" className="size-4" />
      {variant === 'detail'
        ? isCompared
          ? 'Comparando'
          : 'Comparar'
        : isCompared
          ? 'Comparando'
          : comparison.replacing !== null
            ? `Reemplazar Pensión ${comparison.replacing === 0 ? 'A' : 'B'}`
            : comparisonFull
              ? 'Máximo dos pensiones'
              : 'Comparar pensión'}
    </button>
  );
}
