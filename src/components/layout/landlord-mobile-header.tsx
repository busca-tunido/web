'use client';

import { Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type LandlordPropertySummary = {
  id: string;
  title: string;
  address?: string;
  city?: string;
  isActive?: boolean;
  totalRooms?: number;
};

export type LandlordMobileHeaderProps = {
  properties?: LandlordPropertySummary[];
  selectedPropertyId?: string;
  selectedPropertyName?: string;
  onSelectProperty?: (propertyId: string) => void;
  isActive?: boolean;
  onToggleActive?: (active: boolean) => void;
  onOpenCreatePension?: () => void;
  className?: string;
};

export function LandlordMobileHeader({
  properties = [],
  selectedPropertyId,
  selectedPropertyName,
  isActive = true,
  className,
}: LandlordMobileHeaderProps) {
  const currentProperty = properties.find((p) => p.id === selectedPropertyId) ?? properties[0];
  const displayTitle = currentProperty?.title ?? selectedPropertyName ?? 'Mi Pensión';
  const displayCity = currentProperty?.city;

  return (
    <header
      id="landlord-mobile-header"
      className={cn(
        'sticky top-0 z-30 w-full border-b border-border/60 bg-background/95 backdrop-blur-lg px-4 py-2.5 transition-colors',
        className,
      )}
    >
      <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Building2 className="h-4 w-4" />
          </div>

          <div className="flex min-w-0 flex-col">
            <span className="truncate text-xs font-bold text-foreground max-w-[190px] sm:max-w-[260px]">
              {displayTitle}
            </span>
            {displayCity && (
              <span className="truncate text-[10px] font-medium text-muted-foreground">
                {displayCity}
              </span>
            )}
          </div>
        </div>

        <div className="shrink-0 flex items-center">
          <div className="flex items-center gap-1.5 rounded-full border border-border/60 bg-secondary/50 px-2.5 py-1 text-xs">
            <span
              className={cn(
                'h-2 w-2 rounded-full transition-colors',
                isActive
                  ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                  : 'bg-muted-foreground/40',
              )}
            />
            <span
              className={cn(
                'text-[10px] font-semibold leading-none',
                isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground',
              )}
            >
              {isActive ? 'Activa' : 'Pausada'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
