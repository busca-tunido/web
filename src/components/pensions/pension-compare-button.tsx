'use client';

import { ArrowLeftRight } from 'lucide-react';
import {
  COMPARISON_LIMIT,
  type ComparisonSelection,
  type FlyOriginRect,
  usePensionComparison,
} from '@/contexts/pension-comparison-context';
import { cn } from '@/lib/utils';

function extractRect(element: HTMLElement): FlyOriginRect | null {
  const rect = element.getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0) return null;
  return {
    left: rect.left,
    top: rect.top,
    width: rect.width,
    height: rect.height,
  };
}

export function PensionCompareButton({
  pension,
  variant = 'icon',
  size = 'sm',
  readOnly = false,
  className,
}: {
  pension: ComparisonSelection;
  variant?: 'icon' | 'card' | 'detail' | 'comparison';
  size?: 'sm' | 'lg';
  readOnly?: boolean;
  className?: string;
}) {
  const comparison = usePensionComparison();
  if (!comparison && !(readOnly && variant === 'detail')) return null;
  const isCompared =
    !readOnly && Boolean(comparison?.selected.some((item) => item.id === pension.id));
  const comparisonFull =
    !readOnly && !isCompared && comparison?.selected.length === COMPARISON_LIMIT;
  const isIconOnly = variant === 'icon' || variant === 'card';
  const label = isCompared
    ? `Dejar de comparar: ${pension.title}`
    : comparisonFull
      ? `Máximo dos pensiones en comparación`
      : `Comparar: ${pension.title}`;

  if (isIconOnly) {
    return (
      <button
        type="button"
        aria-pressed={isCompared}
        aria-label={label}
        aria-disabled={readOnly || undefined}
        title={
          isCompared
            ? 'Dejar de comparar'
            : comparisonFull
              ? 'Máximo dos pensiones'
              : 'Comparar pensión'
        }
        disabled={comparisonFull && comparison?.replacing === null}
        onClick={(event) => {
          event.stopPropagation();
          if (readOnly) {
            event.preventDefault();
            return;
          }
          comparison?.toggle(pension, extractRect(event.currentTarget));
        }}
        className={cn(
          'flex items-center justify-center rounded-full backdrop-blur-md transition shadow-sm border focus-visible:outline-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-45',
          readOnly ? 'cursor-default' : 'active:scale-90 cursor-pointer hover:text-primary',
          size === 'lg' ? 'h-11 w-11 min-h-[44px] min-w-[44px]' : 'h-9 w-9',
          isCompared
            ? 'bg-primary text-primary-foreground border-primary hover:bg-primary/90'
            : 'bg-background/70 text-foreground border-border/40',
          className,
        )}
      >
        <ArrowLeftRight aria-hidden="true" className={size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'} />
      </button>
    );
  }

  return (
    <button
      type="button"
      aria-pressed={isCompared}
      aria-label={label}
      aria-disabled={readOnly || undefined}
      disabled={comparisonFull && comparison?.replacing === null}
      onClick={(event) => {
        event.stopPropagation();
        if (readOnly) {
          event.preventDefault();
          return;
        }
        comparison?.toggle(pension, extractRect(event.currentTarget));
      }}
      className={cn(
        'flex min-h-12 items-center justify-center gap-2 rounded-full bg-black/60 px-3 text-sm font-semibold text-white backdrop-blur-md transition focus-visible:outline-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50',
        readOnly ? 'cursor-default' : 'hover:bg-black/80 active:scale-95 cursor-pointer',
        isCompared && 'bg-primary text-primary-foreground hover:bg-primary/90',
        className,
      )}
    >
      <ArrowLeftRight aria-hidden="true" className="size-4" />
      <span>{isCompared ? 'Dejar de comparar' : 'Comparar'}</span>
    </button>
  );
}
