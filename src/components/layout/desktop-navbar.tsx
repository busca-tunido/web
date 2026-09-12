'use client';

import {
  Compass,
  Filter,
  Heart,
  History,
  LogOut,
  MapPin,
  Moon,
  Search,
  Sun,
  User as UserIcon,
  X,
} from 'lucide-react';
import { motion } from 'motion/react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { BrandLogo } from '@/components/ui/brand-logo';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { useTheme } from '@/lib/theme-context';
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
  const { setTheme, resolvedTheme } = useTheme();

  const activeFiltersCount =
    (filters.hasPrivateBathroom ? 1 : 0) +
    (filters.includesMeals ? 1 : 0) +
    (filters.maxPriceClp ? 1 : 0) +
    (selectedCityName ? 1 : 0);

  const navLinks: Array<{ id: NavTab; label: string; icon: typeof Compass; badge?: number }> = [
    { id: 'explore', label: 'Explorar', icon: Compass },
    { id: 'map', label: 'Ubicación', icon: MapPin },
    { id: 'favorites', label: 'Favoritos', icon: Heart, badge: favorites.length },
    { id: 'history', label: 'Mis Estadías', icon: History },
  ];

  const toggleThemeMode = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="sticky top-0 z-40 hidden w-full border-b border-border/70 bg-background/90 backdrop-blur-xl transition-colors md:block">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-6 lg:px-8">
        <div className="flex items-center gap-6 shrink-0">
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

          <nav className="flex items-center gap-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`desktop-nav-${item.id}`}
                  type="button"
                  onClick={() => onTabChange(item.id)}
                  className={`relative flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-primary' : ''}`} />
                  <span>{item.label}</span>
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
        </div>

        <div className="flex flex-1 max-w-md items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input
              id="desktop-search-input"
              type="text"
              value={filters.query}
              onChange={(e) => onFilterChange({ ...filters, query: e.target.value })}
              placeholder="Buscar pensión, ciudad, U..."
              className="h-9.5 w-full rounded-full border border-border bg-card/90 pl-10 pr-8 text-xs text-foreground placeholder:text-muted-foreground shadow-xs focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
            />
            {filters.query && (
              <button
                type="button"
                onClick={() => onFilterChange({ ...filters, query: '' })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                aria-label="Limpiar búsqueda"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
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
                  <X className="h-3 w-3" />
                </button>
              )}
            </Badge>
          )}

          <button
            id="desktop-filter-button"
            type="button"
            onClick={onOpenFilterModal}
            className={`relative flex h-9.5 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition-colors shrink-0 cursor-pointer ${
              activeFiltersCount > 0
                ? 'border-primary/50 bg-primary/10 text-primary'
                : 'border-border bg-card/90 text-foreground hover:bg-secondary'
            }`}
            aria-label="Filtros avanzados"
          >
            <Filter className="h-3.5 w-3.5" />
            <span className="hidden xl:inline">Filtros</span>
            {activeFiltersCount > 0 && (
              <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={toggleThemeMode}
            className="h-9 w-9 p-0 rounded-full text-muted-foreground hover:text-foreground cursor-pointer"
            aria-label={`Cambiar a modo ${resolvedTheme === 'dark' ? 'claro' : 'oscuro'}`}
            title={`Modo visual: ${resolvedTheme === 'dark' ? 'Oscuro' : 'Claro'}`}
          >
            {resolvedTheme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          {user && (
            <div className="flex items-center gap-2 pl-2 border-l border-border/80">
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
          )}
        </div>
      </div>
    </header>
  );
}
