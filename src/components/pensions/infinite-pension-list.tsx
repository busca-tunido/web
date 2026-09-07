'use client';

import { CheckCircle2, Loader2, SearchX } from 'lucide-react';
import { useEffect, useRef } from 'react';
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
        rootMargin: '200px',
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
      <div className="flex flex-col gap-6 px-5">
        {[1, 2, 3].map((i) => (
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
    <div className="flex flex-col gap-7 px-5">
      {items.map((pension) => (
        <PensionCard
          key={pension.id}
          pension={pension}
          isFavorite={isFavorite(pension.id)}
          onToggleFavorite={toggleFavorite}
          onSelectPension={onSelectPension}
        />
      ))}

      <div ref={sentinelRef} className="h-4 w-full" />

      {isLoadingMore && (
        <div className="flex items-center justify-center py-4 gap-2 text-xs font-medium text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span>Cargando más alojamientos...</span>
        </div>
      )}

      {!hasMore && items.length > 0 && (
        <div className="flex items-center justify-center gap-1.5 py-6 text-xs text-muted-foreground">
          <CheckCircle2 className="h-4 w-4 text-primary/70" />
          <span>Has explorado todas las pensiones disponibles</span>
        </div>
      )}
    </div>
  );
}
