'use client';

import { MapPin } from 'lucide-react';
import type { NearbyCityCount } from '@/lib/types';

type NearbyCitiesBarProps = {
  cities: NearbyCityCount[];
  selectedCity?: string | null;
  onSelectCity: (city: string | null) => void;
};

export function NearbyCitiesBar({ cities, selectedCity, onSelectCity }: NearbyCitiesBarProps) {
  if (!cities || cities.length === 0) return null;

  return (
    <div className="flex flex-col gap-1.5 px-5">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
        <MapPin className="h-3.5 w-3.5 text-primary" />
        <span>Pensiones en ciudades cercanas</span>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 pt-1 scrollbar-none snap-x">
        <button
          type="button"
          onClick={() => onSelectCity(null)}
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition cursor-pointer border ${
            !selectedCity
              ? 'border-primary bg-primary text-primary-foreground shadow-sm'
              : 'border-border/70 bg-card text-foreground hover:border-primary/50'
          }`}
        >
          Todas
        </button>

        {cities.map((c) => {
          const isSelected = selectedCity?.toLowerCase() === c.city.toLowerCase();
          return (
            <button
              key={c.city}
              type="button"
              onClick={() => onSelectCity(isSelected ? null : c.city)}
              className={`shrink-0 flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition cursor-pointer border ${
                isSelected
                  ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                  : 'border-border/70 bg-card text-foreground hover:border-primary/50'
              }`}
            >
              <span>{c.city}</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                  isSelected
                    ? 'bg-primary-foreground/20 text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {c.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
