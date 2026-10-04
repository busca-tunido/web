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
    (filters.ratingTier ? 1 : 0) +
    (selectedCityName ? 1 : 0);

  const ratingChips = [
    {
      id: 'high' as const,
      label: 'Alta',
      dotColor: '#2d5e49',
      activeClass:
        'border-[#2d5e49] bg-[#2d5e49]/15 text-[#204535] dark:text-[#aee0ca] dark:border-[#366e56] font-semibold',
    },
    {
      id: 'medium' as const,
      label: 'Media',
      dotColor: '#d37b5d',
      activeClass: 'border-primary bg-primary/15 text-primary font-semibold',
    },
    {
      id: 'low' as const,
      label: 'Baja',
      dotColor: '#78716c',
      activeClass:
        'border-stone-500 bg-stone-500/15 text-stone-800 dark:text-stone-300 dark:border-stone-400 font-semibold',
    },
  ] as const;

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 px-4 py-3 backdrop-blur-xl transition-colors md:hidden">
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

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 min-w-0">
          {ratingChips.map((chip) => {
            const isActive = filters.ratingTier === chip.id;
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() =>
                  onFilterChange({
                    ...filters,
                    ratingTier: isActive ? undefined : chip.id,
                  })
                }
                className={`flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-xs font-medium shrink-0 cursor-pointer select-none transition-colors ${
                  isActive
                    ? chip.activeClass
                    : 'border-border/70 bg-card/60 text-muted-foreground hover:text-foreground hover:border-border'
                }`}
                aria-pressed={isActive}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: chip.dotColor }}
                />
                <span>{chip.label}</span>
              </button>
            );
          })}

          <button
            type="button"
            onClick={() =>
              onFilterChange({
                ...filters,
                hasPrivateBathroom: !filters.hasPrivateBathroom ? true : undefined,
              })
            }
            className={`flex h-7 items-center gap-1 rounded-full border px-2.5 text-xs font-medium shrink-0 cursor-pointer select-none transition-colors ${
              filters.hasPrivateBathroom
                ? 'border-primary bg-primary/15 text-primary font-semibold'
                : 'border-border/70 bg-card/60 text-muted-foreground hover:text-foreground hover:border-border'
            }`}
            aria-pressed={Boolean(filters.hasPrivateBathroom)}
          >
            <span>Baño privado</span>
          </button>

          <button
            type="button"
            onClick={() =>
              onFilterChange({
                ...filters,
                includesMeals: !filters.includesMeals ? true : undefined,
              })
            }
            className={`flex h-7 items-center gap-1 rounded-full border px-2.5 text-xs font-medium shrink-0 cursor-pointer select-none transition-colors ${
              filters.includesMeals
                ? 'border-primary bg-primary/15 text-primary font-semibold'
                : 'border-border/70 bg-card/60 text-muted-foreground hover:text-foreground hover:border-border'
            }`}
            aria-pressed={Boolean(filters.includesMeals)}
          >
            <span>Comida</span>
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
