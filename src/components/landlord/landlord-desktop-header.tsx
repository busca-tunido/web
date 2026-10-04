'use client';

import { ChevronRight, Home } from 'lucide-react';
import { type LandlordTab, useLandlord } from '@/contexts/landlord-context';
import { cn } from '@/lib/utils';

export type LandlordDesktopHeaderProps = {
  activeTab?: LandlordTab;
  onTabChange?: (tab: LandlordTab) => void;
  className?: string;
};

const TAB_LABELS: Record<LandlordTab, string> = {
  pension: 'Ficha de Pensión',
  rooms: 'Gestión de Habitaciones',
  reviews: 'Reseñas y Sugerencias',
  pensions: 'Mis Pensiones',
  account: 'Mi Cuenta',
};

export function LandlordDesktopHeader({
  activeTab: propActiveTab,
  className,
}: LandlordDesktopHeaderProps) {
  const landlordContext = useLandlord();

  const activeTab = propActiveTab ?? landlordContext.activeTab;
  const selectedPension = landlordContext.selectedPension;
  const togglePensionActive = landlordContext.togglePensionActive;

  const isActive = selectedPension?.isActive ?? true;

  return (
    <header
      id="landlord-desktop-header"
      className={cn(
        'sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-border/60 bg-background/95 backdrop-blur-lg px-6 lg:px-8 pr-8 lg:pr-12 transition-colors gap-4',
        className,
      )}
    >
      <nav
        aria-label="Ruta de navegación"
        className="flex items-center gap-2 text-xs min-w-0 flex-1 mr-2"
      >
        <div className="flex items-center gap-1.5 text-muted-foreground font-medium shrink-0">
          <Home className="h-3.5 w-3.5 text-primary" />
          <span>Panel</span>
        </div>

        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />

        <span className="truncate font-medium text-muted-foreground max-w-[140px] lg:max-w-[220px]">
          {selectedPension?.title ?? 'Mi Pensión'}
        </span>

        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />

        <span className="truncate font-bold text-foreground">
          {TAB_LABELS[activeTab] ?? 'Panel'}
        </span>
      </nav>

      <div className="flex items-center gap-4 shrink-0 pr-2 lg:pr-4">
        {selectedPension && (
          <button
            type="button"
            role="switch"
            aria-checked={isActive}
            onClick={() => togglePensionActive(selectedPension.id, !isActive)}
            className="flex min-h-[40px] items-center gap-2.5 rounded-full border border-border/70 bg-card px-4 py-1.5 text-xs font-medium transition hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer shadow-2xs"
            aria-label={
              isActive
                ? 'Pensión activa para estudiantes. Clic para pausar.'
                : 'Pensión pausada. Clic para activar.'
            }
          >
            <span className="flex items-center gap-1.5">
              <span
                className={cn(
                  'h-2 w-2 rounded-full transition-colors',
                  isActive
                    ? 'bg-emerald-500 ring-2 ring-emerald-500/20 animate-pulse'
                    : 'bg-amber-500',
                )}
              />
              <span
                className={cn(
                  'text-[11px] font-semibold leading-none',
                  isActive
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-amber-600 dark:text-amber-400',
                )}
              >
                {isActive ? 'Publicación Activa' : 'Publicación Pausada'}
              </span>
            </span>

            <span
              className={cn(
                'relative inline-flex h-4.5 w-8 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out',
                isActive ? 'bg-emerald-500' : 'bg-muted-foreground/30',
              )}
            >
              <span
                className={cn(
                  'pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out',
                  isActive ? 'translate-x-3.5' : 'translate-x-0',
                )}
              />
            </span>
          </button>
        )}
      </div>
    </header>
  );
}
