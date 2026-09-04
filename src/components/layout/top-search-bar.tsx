'use client';

import { Filter, MapPin, Search, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { SearchFilters } from '@/lib/types';

type TopSearchBarProps = {
  filters: SearchFilters;
  onFilterChange: (filters: SearchFilters) => void;
  onOpenFilterDrawer?: () => void;
  selectedCityName?: string;
  onClearCity?: () => void;
};

export function TopSearchBar({
  filters,
  onFilterChange,
  onOpenFilterDrawer,
  selectedCityName,
  onClearCity,
}: TopSearchBarProps) {
  const activeFiltersCount =
    (filters.hasPrivateBathroom ? 1 : 0) +
    (filters.includesMeals ? 1 : 0) +
    (filters.maxPriceClp ? 1 : 0) +
    (selectedCityName ? 1 : 0);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 px-4 py-3 backdrop-blur-xl transition-colors">
      <div className="mx-auto flex max-w-lg flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="top-search-input"
              type="text"
              value={filters.query}
              onChange={(e) => onFilterChange({ ...filters, query: e.target.value })}
              placeholder="Buscar pensión, universidad o barrio..."
              className="h-11 w-full rounded-full border border-border bg-card/90 pl-11 pr-9 text-sm text-foreground placeholder:text-muted-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
            />
            {filters.query && (
              <button
                type="button"
                onClick={() => onFilterChange({ ...filters, query: '' })}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <button
            id="open-filter-drawer-button"
            type="button"
            onClick={onOpenFilterDrawer}
            className={`relative flex h-11 min-w-[44px] items-center justify-center rounded-full border px-3 transition-colors ${
              activeFiltersCount > 0
                ? 'border-primary/50 bg-primary/10 text-primary font-medium'
                : 'border-border bg-card/90 text-foreground hover:bg-secondary'
            }`}
            aria-label="Abrir filtros"
          >
            <Filter className="h-4 w-4" />
            {activeFiltersCount > 0 && (
              <span className="ml-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {selectedCityName && (
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className="flex items-center gap-1.5 border border-primary/30 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium"
            >
              <MapPin className="h-3 w-3" />
              <span>{selectedCityName}</span>
              {onClearCity && (
                <button
                  type="button"
                  onClick={onClearCity}
                  className="ml-1 hover:opacity-75"
                  aria-label="Quitar filtro de ciudad"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </Badge>
          </div>
        )}
      </div>
    </header>
  );
}
