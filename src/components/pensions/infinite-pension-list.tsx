'use client';

import { CheckCircle2, Loader2, SearchX } from 'lucide-react';
import { memo, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import type { PensionItem } from '@/lib/types';
import { PensionCard } from './pension-card';

type InfinitePensionListProps = {
  items: PensionItem[];
  hasMore: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
  onSelectPension: (pension: PensionItem) => void;
  onResetFilters?: () => void;
};

type VirtualizedPensionCardProps = {
  pension: PensionItem;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onSelectPension: (pension: PensionItem) => void;
  initialVisible?: boolean;
};

function areVirtualPropsEqual(
  prev: VirtualizedPensionCardProps,
  next: VirtualizedPensionCardProps,
): boolean {
  return (
    prev.pension.id === next.pension.id &&
    prev.isFavorite === next.isFavorite &&
    prev.pension.ratingAverage === next.pension.ratingAverage &&
    prev.pension.priceMonthlyClp === next.pension.priceMonthlyClp
  );
}

function VirtualizedPensionCardComponent({
  pension,
  isFavorite,
  onToggleFavorite,
  onSelectPension,
  initialVisible = false,
}: VirtualizedPensionCardProps) {
  const [isVisible, setIsVisible] = useState(initialVisible);
  const [height, setHeight] = useState<number | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        rootMargin: '600px 0px 600px 0px',
        threshold: 0,
      },
    );

    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (isVisible && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      if (rect.height > 0) {
        setHeight(rect.height);
      }
    }
  }, [isVisible]);

  return (
    <div
      ref={containerRef}
      style={height ? { minHeight: `${height}px` } : { minHeight: '300px' }}
      className="w-full"
    >
      {isVisible ? (
        <PensionCard
          pension={pension}
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
          onSelectPension={onSelectPension}
        />
      ) : null}
    </div>
  );
}

const VirtualizedPensionCard = memo(VirtualizedPensionCardComponent, areVirtualPropsEqual);

export function InfinitePensionList({
  items,
  hasMore,
  isLoading,
  isLoadingMore,
  onLoadMore,
  onSelectPension,
  onResetFilters,
}: InfinitePensionListProps) {
  const { isFavorite, toggleFavorite } = useAuth();
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasMore && !isLoading && !isLoadingMore) {
          onLoadMore();
        }
      },
      {
        rootMargin: '400px',
        threshold: 0.1,
      },
    );

    observer.observe(sentinel);
    return () => {
      observer.disconnect();
    };
  }, [hasMore, isLoading, isLoadingMore, onLoadMore]);

  if (isLoading && items.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-5 md:px-0">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex flex-col gap-2.5 animate-pulse">
            <div className="aspect-[16/10] w-full rounded-2xl bg-muted" />
            <div className="h-5 w-3/4 rounded-md bg-muted" />
            <div className="h-4 w-1/2 rounded-md bg-muted" />
            <div className="h-5 w-1/3 rounded-md bg-muted" />
          </div>
        ))}
      </div>
    );
  }

  if (!isLoading && items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground mb-3">
          <SearchX className="h-7 w-7" />
        </div>
        <h4 className="text-base font-bold text-foreground">No encontramos alojamientos</h4>
        <p className="mt-1 text-xs text-muted-foreground max-w-xs">
          Intenta ampliar el radio de búsqueda o limpiar los filtros seleccionados.
        </p>
        {onResetFilters && (
          <Button
            type="button"
            variant="outline"
            onClick={onResetFilters}
            className="mt-4 rounded-xl text-xs font-semibold"
          >
            Limpiar filtros
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-5 md:px-0">
      {items.map((pension, index) => (
        <VirtualizedPensionCard
          key={pension.id}
          pension={pension}
          isFavorite={isFavorite(pension.id)}
          onToggleFavorite={toggleFavorite}
          onSelectPension={onSelectPension}
          initialVisible={index < 8}
        />
      ))}

      <div ref={sentinelRef} className="col-span-full h-4 w-full" />

      {isLoadingMore && (
        <div className="col-span-full flex items-center justify-center py-4 gap-2 text-xs font-medium text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span>Cargando más alojamientos...</span>
        </div>
      )}

      {!hasMore && items.length > 0 && (
        <div className="col-span-full flex items-center justify-center gap-1.5 py-6 text-xs text-muted-foreground">
          <CheckCircle2 className="h-4 w-4 text-primary/70" />
          <span>Has explorado todas las pensiones disponibles</span>
        </div>
      )}
    </div>
  );
}
