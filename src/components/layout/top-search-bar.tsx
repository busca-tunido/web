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
    <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-zinc-950/85 px-4 py-3 backdrop-blur-xl">
      <div className="mx-auto flex max-w-lg flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              id="top-search-input"
              type="text"
              value={filters.query}
              onChange={(e) => onFilterChange({ ...filters, query: e.target.value })}
              placeholder="Buscar pensión, universidad o barrio..."
              className="h-11 w-full rounded-2xl border border-zinc-800 bg-zinc-900/90 pl-10 pr-9 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-emerald-500/70 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
            {filters.query && (
              <button
                type="button"
                onClick={() => onFilterChange({ ...filters, query: '' })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <button
            id="open-filter-drawer-button"
            type="button"
            onClick={onOpenFilterDrawer}
            className={`relative flex h-11 min-w-[44px] items-center justify-center rounded-2xl border px-3 transition-colors ${
              activeFiltersCount > 0
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                : 'border-zinc-800 bg-zinc-900/90 text-zinc-300 hover:bg-zinc-800'
            }`}
          >
            <Filter className="h-4 w-4" />
            {activeFiltersCount > 0 && (
              <span className="ml-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-bold text-zinc-950">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {selectedCityName && (
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className="flex items-center gap-1.5 border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 px-2.5 py-0.5 text-xs font-medium"
            >
              <MapPin className="h-3 w-3" />
              <span>{selectedCityName}</span>
              {onClearCity && (
                <button
                  type="button"
                  onClick={onClearCity}
                  className="ml-1 hover:text-white"
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
