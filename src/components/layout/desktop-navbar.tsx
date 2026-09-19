'use client';

import {
  Compass,
  Filter,
  Heart,
  History,
  LogOut,
  MapPin,
  Search,
  User as UserIcon,
  X,
} from 'lucide-react';
import { motion } from 'motion/react';
import Image from 'next/image';
import { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { BrandLogo } from '@/components/ui/brand-logo';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import type { NavTab, SearchFilters } from '@/lib/types';

type DesktopNavbarProps = {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  filters: SearchFilters;
  onFilterChange: (filters: SearchFilters) => void;
  onOpenFilterModal: () => void;
  selectedCityName?: string;
  onClearCity?: () => void;
  onResetFilters?: () => void;
};

type FilterChipItem = {
  id: string;
  label: string;
  priority: number;
  isActive: (filters: SearchFilters) => boolean;
  toggle: (filters: SearchFilters) => SearchFilters;
};

const RECOMMENDED_FILTER_CHIPS: readonly FilterChipItem[] = [
  {
    id: 'bathroom',
    label: 'Baño privado',
    priority: 1,
    isActive: (f) => Boolean(f.hasPrivateBathroom),
    toggle: (f) => ({ ...f, hasPrivateBathroom: !f.hasPrivateBathroom }),
  },
  {
    id: 'meals',
    label: 'Comida incluida',
    priority: 2,
    isActive: (f) => Boolean(f.includesMeals),
    toggle: (f) => ({ ...f, includesMeals: !f.includesMeals }),
  },
  {
    id: 'single',
    label: 'Pieza individual',
    priority: 3,
    isActive: (f) => f.roomType === 'SINGLE',
    toggle: (f) => ({ ...f, roomType: f.roomType === 'SINGLE' ? undefined : 'SINGLE' }),
  },
  {
    id: 'female_only',
    label: 'Solo mujeres',
    priority: 4,
    isActive: (f) => f.genderPreference === 'FEMALE_ONLY',
    toggle: (f) => ({
      ...f,
      genderPreference: f.genderPreference === 'FEMALE_ONLY' ? undefined : 'FEMALE_ONLY',
    }),
  },
  {
    id: 'max_price',
    label: 'Hasta $250k',
    priority: 5,
    isActive: (f) => f.maxPriceClp === 250000,
    toggle: (f) => ({ ...f, maxPriceClp: f.maxPriceClp === 250000 ? undefined : 250000 }),
  },
  {
    id: 'top_rated',
    label: 'Mejor evaluadas',
    priority: 6,
    isActive: (f) => f.sortBy === 'rating',
    toggle: (f) => ({ ...f, sortBy: f.sortBy === 'rating' ? undefined : 'rating' }),
  },
  {
    id: 'price_asc',
    label: 'Menor precio',
    priority: 7,
    isActive: (f) => f.sortBy === 'price_asc',
    toggle: (f) => ({ ...f, sortBy: f.sortBy === 'price_asc' ? undefined : 'price_asc' }),
  },
  {
    id: 'shared',
    label: 'Pieza compartida',
    priority: 8,
    isActive: (f) => f.roomType === 'SHARED',
    toggle: (f) => ({ ...f, roomType: f.roomType === 'SHARED' ? undefined : 'SHARED' }),
  },
  {
    id: 'mixed',
    label: 'Residencia mixta',
    priority: 9,
    isActive: (f) => f.genderPreference === 'MIXED',
    toggle: (f) => ({
      ...f,
      genderPreference: f.genderPreference === 'MIXED' ? undefined : 'MIXED',
    }),
  },
];

export function DesktopNavbar({
  activeTab,
  onTabChange,
  filters,
  onFilterChange,
  onOpenFilterModal,
  selectedCityName,
  onClearCity,
  onResetFilters,
}: DesktopNavbarProps) {
  const { user, favorites, logout } = useAuth();

  const activeFiltersCount = useMemo(() => {
    return (
      (filters.hasPrivateBathroom ? 1 : 0) +
      (filters.includesMeals ? 1 : 0) +
      (filters.maxPriceClp ? 1 : 0) +
      (filters.roomType ? 1 : 0) +
      (filters.genderPreference && filters.genderPreference !== 'ALL' ? 1 : 0) +
      (filters.sortBy && filters.sortBy !== 'relevance' ? 1 : 0) +
      (selectedCityName ? 1 : 0)
    );
  }, [filters, selectedCityName]);

  const sortedChips = useMemo(() => {
    return [...RECOMMENDED_FILTER_CHIPS].sort((a, b) => {
      const aActive = a.isActive(filters);
      const bActive = b.isActive(filters);
      if (aActive && !bActive) return -1;
      if (!aActive && bActive) return 1;
      return a.priority - b.priority;
    });
  }, [filters]);

  const navLinks: Array<{ id: NavTab; label: string; icon: typeof Compass; badge?: number }> = [
    { id: 'explore', label: 'Explorar', icon: Compass },
    { id: 'map', label: 'Ubicación', icon: MapPin },
    { id: 'favorites', label: 'Favoritos', icon: Heart, badge: favorites.length },
    { id: 'history', label: 'Mis Estadías', icon: History },
  ];

  return (
    <header className="sticky top-0 z-40 hidden w-full border-b border-border/70 bg-background/95 backdrop-blur-xl transition-colors md:block">
      <div className="flex h-16 w-full items-center justify-between gap-4 px-6 lg:px-8 xl:px-10">
        <div className="flex items-center shrink-0 w-[180px] lg:w-[220px]">
          <button
            type="button"
            onClick={() => {
              onResetFilters?.();
              onTabChange('explore');
            }}
            className="flex items-center gap-2 hover:opacity-90 transition cursor-pointer select-none"
            aria-label="Ir a inicio BuscaTuNido"
          >
            <BrandLogo size="sm" priority={false} />
          </button>
        </div>

        <div className="flex flex-1 items-center justify-center gap-2 lg:gap-3 mx-2 min-w-0">
          <nav className="flex items-center gap-1 shrink-0">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`desktop-nav-${item.id}`}
                  type="button"
                  onClick={() => onTabChange(item.id)}
                  title={item.label}
                  aria-label={item.label}
                  className={`relative flex items-center gap-2 rounded-xl px-2.5 xl:px-3 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-primary' : ''}`} />
                  <span className="hidden xl:inline">{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <motion.span
                      layoutId="active-desktop-nav-indicator"
                      transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                      className="absolute inset-0 rounded-xl border border-primary/30"
                    />
                  )}
                </button>
              );
            })}
          </nav>

          <div className="relative w-full max-w-xs lg:max-w-sm xl:max-w-md">
            <input
              id="desktop-search-input"
              type="text"
              value={filters.query}
              onChange={(e) => onFilterChange({ ...filters, query: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  onTabChange('map');
                }
              }}
              placeholder="Buscar pensión, ciudad, U..."
              className="h-10 w-full rounded-full border border-border/90 bg-card/90 pl-4 pr-16 text-xs text-foreground placeholder:text-muted-foreground shadow-xs focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
            />
            <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {filters.query && (
                <button
                  type="button"
                  onClick={() => onFilterChange({ ...filters, query: '' })}
                  className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary cursor-pointer transition-colors"
                  aria-label="Limpiar búsqueda"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => onTabChange('map')}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 hover:border-primary/50 transition-colors cursor-pointer shadow-xs"
                title="Buscar en ubicación"
                aria-label="Buscar en ubicación"
              >
                <Search className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {selectedCityName && (
            <Badge
              variant="secondary"
              className="flex items-center gap-1 border border-primary/30 bg-primary/10 text-primary px-2.5 py-1 rounded-full text-[11px] font-medium shrink-0"
            >
              <MapPin className="h-3 w-3" />
              <span>{selectedCityName}</span>
              {onClearCity && (
                <button
                  type="button"
                  onClick={onClearCity}
                  className="ml-0.5 hover:opacity-75 cursor-pointer"
                  aria-label="Quitar ciudad"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 shrink-0 w-[180px] lg:w-[220px]">
          {user ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onTabChange('account')}
                className={`flex items-center gap-2.5 rounded-full border border-border/80 bg-card p-1 pr-3 hover:bg-secondary transition cursor-pointer ${
                  activeTab === 'account' ? 'ring-2 ring-primary/40' : ''
                }`}
                title="Ver mi cuenta"
              >
                <div className="relative h-7 w-7 overflow-hidden rounded-full border border-primary/40 bg-muted">
                  {user.avatarUrl ? (
                    <Image
                      src={user.avatarUrl}
                      alt={user.firstName}
                      fill
                      unoptimized
                      sizes="28px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                      <UserIcon className="h-3.5 w-3.5" />
                    </div>
                  )}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-semibold leading-none text-foreground">
                    {user.firstName}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-medium capitalize mt-0.5">
                    {user.role.toLowerCase()}
                  </span>
                </div>
              </button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={logout}
                className="h-8 w-8 p-0 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                title="Cerrar sesión"
                aria-label="Cerrar sesión"
              >
                <LogOut className="h-3.5 w-3.5" />
              </Button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onTabChange('account')}
              className="flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-semibold text-foreground hover:bg-secondary transition cursor-pointer"
            >
              <UserIcon className="h-3.5 w-3.5" />
              <span>Ingresar</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex h-12 w-full items-center justify-center px-4 sm:px-6 lg:px-8 xl:px-10">
        <div className="flex items-center justify-center gap-3 max-w-full min-w-0">
          <button
            id="desktop-filter-button"
            type="button"
            onClick={onOpenFilterModal}
            className="relative flex h-8 items-center gap-1.5 rounded-full border border-border/80 bg-card px-3 text-xs font-medium text-foreground hover:bg-secondary transition-colors shrink-0 cursor-pointer"
            aria-label="Filtros avanzados"
          >
            <Filter className="h-3.5 w-3.5" />
            <span>Filtros</span>
            {activeFiltersCount > 0 && (
              <span className="text-xs font-semibold text-white">{activeFiltersCount}</span>
            )}
          </button>

          <div className="h-4 w-px bg-border/80 shrink-0" />

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 min-w-0">
            {sortedChips.map((chip) => {
              const active = chip.isActive(filters);
              return (
                <motion.button
                  layout
                  key={chip.id}
                  type="button"
                  onClick={() => onFilterChange(chip.toggle(filters))}
                  transition={{
                    type: 'spring',
                    stiffness: 450,
                    damping: 32,
                    mass: 0.8,
                  }}
                  className={`flex h-7.5 items-center gap-1 rounded-full border px-3 text-xs font-medium shrink-0 cursor-pointer select-none transition-colors ${
                    active
                      ? 'border-border/90 bg-secondary/80 text-foreground font-medium'
                      : 'border-border/60 bg-transparent text-muted-foreground hover:text-foreground hover:border-border hover:bg-card/50'
                  }`}
                  aria-pressed={active}
                >
                  <span>{chip.label}</span>
                </motion.button>
              );
            })}
          </div>

          {activeFiltersCount > 0 && onResetFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors shrink-0 cursor-pointer underline underline-offset-2 ml-1 whitespace-nowrap"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
