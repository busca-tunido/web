'use client';

import { useCallback, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export type PriceHistogramRangeSliderProps = {
  minBound: number;
  maxBound: number;
  minValue: number;
  maxValue: number;
  bins: Array<{ min: number; max: number; count: number }>;
  onChange: (range: { min: number; max: number }) => void;
  currency?: string;
  isLoading?: boolean;
};

export function PriceHistogramRangeSlider({
  minBound,
  maxBound,
  minValue,
  maxValue,
  bins,
  onChange,
  currency = '$',
  isLoading = false,
}: PriceHistogramRangeSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeThumb, setActiveThumb] = useState<'min' | 'max' | null>(null);

  const displayBins =
    bins.length > 0
      ? bins
      : Array.from({ length: 28 }, (_, i) => {
          const stepSize = (maxBound - minBound) / 28;
          return {
            min: minBound + i * stepSize,
            max: minBound + (i + 1) * stepSize,
            count: 0,
          };
        });

  const rawStep = (maxBound - minBound) / (bins.length > 0 ? bins.length : 28);
  const step = Math.max(1000, Math.round(rawStep / 1000) * 1000);
  const maxCount = Math.max(...displayBins.map((b) => b.count), 1);

  const totalSpan = maxBound - minBound || 1;
  const minPercent = Math.max(0, Math.min(100, ((minValue - minBound) / totalSpan) * 100));
  const maxPercent = Math.max(0, Math.min(100, ((maxValue - minBound) / totalSpan) * 100));

  const formatPrice = (val: number, isMax: boolean) => {
    const formatted = Math.round(val).toLocaleString('es-CL');
    const isAtMaxBound = isMax && val >= maxBound;
    return `${currency}${formatted}${isAtMaxBound ? '+' : ''}`;
  };

  const updateValueFromPointer = useCallback(
    (thumb: 'min' | 'max', clientX: number) => {
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      if (rect.width === 0) return;

      const percentage = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const rawValue = minBound + percentage * totalSpan;
      const steppedValue = Math.round(rawValue / step) * step;

      if (thumb === 'min') {
        const nextMin = Math.max(minBound, Math.min(steppedValue, maxValue - step));
        onChange({ min: nextMin, max: maxValue });
      } else {
        const nextMax = Math.min(maxBound, Math.max(steppedValue, minValue + step));
        onChange({ min: minValue, max: nextMax });
      }
    },
    [minBound, maxBound, minValue, maxValue, totalSpan, step, onChange],
  );

  const handlePointerDown = (thumb: 'min' | 'max', e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    setActiveThumb(thumb);
  };

  const handlePointerMove = (thumb: 'min' | 'max', e: React.PointerEvent<HTMLDivElement>) => {
    if (activeThumb !== thumb) return;
    updateValueFromPointer(thumb, e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    setActiveThumb(null);
  };

  const handleTrackPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    if (rect.width === 0) return;

    const percentage = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const rawValue = minBound + percentage * totalSpan;
    const steppedValue = Math.round(rawValue / step) * step;

    const distToMin = Math.abs(steppedValue - minValue);
    const distToMax = Math.abs(steppedValue - maxValue);

    if (distToMin <= distToMax) {
      const nextMin = Math.max(minBound, Math.min(steppedValue, maxValue - step));
      onChange({ min: nextMin, max: maxValue });
    } else {
      const nextMax = Math.min(maxBound, Math.max(steppedValue, minValue + step));
      onChange({ min: minValue, max: nextMax });
    }
  };

  const handleKeyDown = (thumb: 'min' | 'max', e: React.KeyboardEvent<HTMLDivElement>) => {
    let delta = 0;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      delta = step;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      delta = -step;
    } else if (e.key === 'PageUp') {
      delta = step * 5;
    } else if (e.key === 'PageDown') {
      delta = -step * 5;
    } else if (e.key === 'Home') {
      if (thumb === 'min') {
        onChange({ min: minBound, max: maxValue });
      } else {
        onChange({ min: minValue, max: minValue + step });
      }
      return;
    } else if (e.key === 'End') {
      if (thumb === 'min') {
        onChange({ min: maxValue - step, max: maxValue });
      } else {
        onChange({ min: minValue, max: maxBound });
      }
      return;
    } else {
      return;
    }

    e.preventDefault();

    if (thumb === 'min') {
      const nextMin = Math.max(minBound, Math.min(minValue + delta, maxValue - step));
      onChange({ min: nextMin, max: maxValue });
    } else {
      const nextMax = Math.min(maxBound, Math.max(maxValue + delta, minValue + step));
      onChange({ min: minValue, max: nextMax });
    }
  };

  return (
    <div className="w-full flex flex-col gap-3 select-none">
      <div className="relative w-full px-3">
        <div className="h-28 w-full flex items-end gap-[3px] pt-4">
          {displayBins.map((bin, index) => {
            const heightPercent =
              maxCount > 0 ? Math.max(4, Math.round((bin.count / maxCount) * 100)) : 4;
            const isActive = bin.max >= minValue && bin.min <= maxValue;

            return (
              <div
                key={`${bin.min}-${bin.max}-${index}`}
                className="flex-1 flex flex-col justify-end h-full"
              >
                <div
                  style={{ height: `${heightPercent}%`, minHeight: '4px' }}
                  className={cn(
                    'w-full rounded-t-xs transition-colors duration-150',
                    isLoading && 'animate-pulse',
                    isActive ? 'bg-primary' : 'bg-muted/30 dark:bg-muted/40',
                  )}
                />
              </div>
            );
          })}
        </div>

        <div
          ref={trackRef}
          onPointerDown={handleTrackPointerDown}
          className="relative w-full h-7 flex items-center cursor-pointer touch-none"
        >
          <div className="w-full h-1 bg-muted/40 rounded-full relative">
            <div
              className="absolute h-1 bg-primary rounded-full"
              style={{
                left: `${minPercent}%`,
                width: `${Math.max(0, maxPercent - minPercent)}%`,
              }}
            />
          </div>

          <div
            role="slider"
            tabIndex={0}
            aria-label="Precio mínimo"
            aria-valuemin={minBound}
            aria-valuemax={maxBound}
            aria-valuenow={minValue}
            onKeyDown={(e) => handleKeyDown('min', e)}
            onPointerDown={(e) => handlePointerDown('min', e)}
            onPointerMove={(e) => handlePointerMove('min', e)}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            style={{ left: `${minPercent}%` }}
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-6 w-6 rounded-full bg-background border-2 border-foreground shadow-md cursor-grab active:cursor-grabbing touch-none select-none z-10 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 after:content-[''] after:absolute after:-inset-3"
          />

          <div
            role="slider"
            tabIndex={0}
            aria-label="Precio máximo"
            aria-valuemin={minBound}
            aria-valuemax={maxBound}
            aria-valuenow={maxValue}
            onKeyDown={(e) => handleKeyDown('max', e)}
            onPointerDown={(e) => handlePointerDown('max', e)}
            onPointerMove={(e) => handlePointerMove('max', e)}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            style={{ left: `${maxPercent}%` }}
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-6 w-6 rounded-full bg-background border-2 border-foreground shadow-md cursor-grab active:cursor-grabbing touch-none select-none z-10 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 after:content-[''] after:absolute after:-inset-3"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-1">
        <div className="flex flex-col rounded-2xl border border-border bg-card p-3 shadow-2xs">
          <span className="text-[11px] font-medium text-muted-foreground">Mínimo</span>
          <span className="text-sm font-semibold text-foreground tracking-tight">
            {formatPrice(minValue, false)}
          </span>
        </div>
        <div className="flex flex-col rounded-2xl border border-border bg-card p-3 shadow-2xs">
          <span className="text-[11px] font-medium text-muted-foreground">Máximo</span>
          <span className="text-sm font-semibold text-foreground tracking-tight">
            {formatPrice(maxValue, true)}
          </span>
        </div>
      </div>
    </div>
  );
}
