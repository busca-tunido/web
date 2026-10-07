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
  reviews: 'Reseñas y Calificaciones',
  proposals: 'Sugerencias de la Comunidad',
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

  return (
    <header
      id="landlord-desktop-header"
      className={cn(
        'sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-border/60 bg-background/95 backdrop-blur-lg px-6 lg:px-8 pr-8 lg:pr-12 transition-colors gap-4 py-2',
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
    </header>
  );
}
