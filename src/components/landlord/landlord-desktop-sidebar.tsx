'use client';

import {
  BedDouble,
  Building2,
  Check,
  ChevronDown,
  ChevronUp,
  DoorOpen,
  Eye,
  Home,
  LogOut,
  Star,
  User,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import Image from 'next/image';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { PensionDetailModal } from '@/components/pensions/pension-detail-modal';
import { Badge } from '@/components/ui/badge';
import { BrandLogo } from '@/components/ui/brand-logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { type LandlordTab, useLandlord } from '@/contexts/landlord-context';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';

export type LandlordDesktopSidebarProps = {
  activeTab?: LandlordTab;
  onTabChange?: (tab: LandlordTab) => void;
  pendingProposalsCount?: number;
  className?: string;
};

type NavItemConfig = {
  id: LandlordTab;
  label: string;
  icon: typeof BedDouble;
  badge?: number;
};

export function LandlordDesktopSidebar({
  activeTab: propActiveTab,
  onTabChange,
  pendingProposalsCount = 0,
  className,
}: LandlordDesktopSidebarProps) {
  const landlordContext = useLandlord();
  const { user, logout } = useAuth();

  const activeTab = propActiveTab ?? landlordContext.activeTab;
  const setActiveTab = onTabChange ?? landlordContext.setActiveTab;
  const pensions = landlordContext.pensions;
  const selectedPension = landlordContext.selectedPension;
  const setSelectedPension = landlordContext.setSelectedPension;

  const [isPropertyMenuOpen, setIsPropertyMenuOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const propertyDropdownRef = useRef<HTMLDivElement>(null);
  const propertyListboxId = useId();

  const navItems: readonly NavItemConfig[] = useMemo(
    () => [
      { id: 'rooms', label: 'Habitaciones', icon: BedDouble },
      { id: 'pension', label: 'Mi Pensión', icon: Home },
      { id: 'reviews', label: 'Reseñas', icon: Star, badge: pendingProposalsCount },
      { id: 'account', label: 'Cuenta', icon: User },
    ],
    [pendingProposalsCount],
  );

  const rooms = selectedPension?.rooms ?? [];
  const totalRooms = rooms.length;
  const availableRooms = rooms.filter((r) => r.isAvailable).length;
  const occupiedRooms = Math.max(0, totalRooms - availableRooms);
  const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (
        propertyDropdownRef.current &&
        !propertyDropdownRef.current.contains(event.target as Node)
      ) {
        setIsPropertyMenuOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsPropertyMenuOpen(false);
      }
    }

    if (isPropertyMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPropertyMenuOpen]);

  return (
    <>
      <aside
        id="landlord-desktop-sidebar"
        className={cn(
          'hidden md:flex flex-col w-64 lg:w-72 shrink-0 border-r border-border/60 bg-card/60 backdrop-blur min-h-screen sticky top-0 h-screen overflow-y-auto transition-colors z-30',
          className,
        )}
      >
        <div className="flex flex-col gap-2 p-5 border-b border-border/60">
          <div className="flex items-center justify-between gap-2">
            <BrandLogo size="sm" priority={false} />
            <Badge
              variant="outline"
              className="border-primary/40 bg-primary/10 text-primary text-[10px] font-semibold shrink-0"
            >
              Panel Propietario
            </Badge>
          </div>
        </div>

        <div ref={propertyDropdownRef} className="relative px-4 pt-4 pb-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-1 mb-1.5 block">
            Pensión Activa
          </span>
          <button
            type="button"
            onClick={() => setIsPropertyMenuOpen((prev) => !prev)}
            aria-expanded={isPropertyMenuOpen}
            aria-haspopup="listbox"
            aria-controls={propertyListboxId}
            className="flex w-full min-h-[48px] items-center justify-between gap-2 rounded-xl border border-border/80 bg-background/80 p-2.5 text-left transition hover:border-primary/40 hover:bg-secondary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer shadow-2xs"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Building2 className="h-4.5 w-4.5" />
              </div>
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-xs font-bold text-foreground">
                  {selectedPension?.title ?? 'Mi Pensión'}
                </span>
                <span className="truncate text-[10px] text-muted-foreground">
                  {selectedPension?.city ?? 'Alojamiento'}
                </span>
              </div>
            </div>
            <div className="shrink-0 text-muted-foreground">
              {isPropertyMenuOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </div>
          </button>

          <AnimatePresence>
            {isPropertyMenuOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-40"
                  onClick={() => setIsPropertyMenuOpen(false)}
                />
                <motion.div
                  id={propertyListboxId}
                  role="listbox"
                  initial={{ opacity: 0, y: -6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-4 right-4 top-full z-50 mt-1.5 rounded-xl border border-border bg-popover p-1.5 text-popover-foreground shadow-xl"
                >
                  <div className="max-h-56 overflow-y-auto space-y-1">
                    {pensions.length > 0 ? (
                      pensions.map((prop) => {
                        const isSelected = prop.id === selectedPension?.id;
                        return (
                          <button
                            key={prop.id}
                            type="button"
                            role="option"
                            aria-selected={isSelected}
                            onClick={() => {
                              setSelectedPension(prop);
                              setIsPropertyMenuOpen(false);
                            }}
                            className={cn(
                              'flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-xs transition cursor-pointer',
                              isSelected
                                ? 'bg-primary/10 text-primary font-semibold'
                                : 'text-foreground hover:bg-secondary',
                            )}
                          >
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-xs font-medium">{prop.title}</p>
                              <p className="truncate text-[10px] text-muted-foreground">
                                {prop.city}
                              </p>
                            </div>
                            {isSelected && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                          </button>
                        );
                      })
                    ) : (
                      <div className="p-2 text-center text-xs text-muted-foreground">
                        {selectedPension?.title ?? '1 pensión'}
                      </div>
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        <nav
          aria-label="Navegación principal de escritorio"
          className="flex flex-col gap-1 px-3 py-2"
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 mb-1">
            Menú Principal
          </span>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  'group relative flex min-h-[44px] w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium transition cursor-pointer',
                  isActive
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                )}
              >
                <Icon
                  className={cn(
                    'h-4.5 w-4.5 shrink-0 transition-transform duration-200',
                    isActive ? 'text-primary stroke-[2.2]' : 'stroke-[1.75]',
                  )}
                />
                <span className="flex-1 text-left">{item.label}</span>

                {item.badge !== undefined && item.badge > 0 && (
                  <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}

                {isActive && (
                  <motion.div
                    layoutId="active-landlord-desktop-sidebar-indicator"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                    className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-primary"
                  />
                )}
              </button>
            );
          })}
        </nav>

        <div className="px-3 py-2">
          <Card className="border-border/70 bg-secondary/30 shadow-2xs">
            <CardContent className="p-3.5 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                  <DoorOpen className="h-4 w-4 text-primary" />
                  <span>Ocupación</span>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    'text-[10px] font-bold px-1.5 py-0 border-0',
                    occupancyRate >= 80
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : occupancyRate >= 40
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        : 'bg-muted text-muted-foreground',
                  )}
                >
                  {occupancyRate}%
                </Badge>
              </div>

              <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${occupancyRate}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span>
                  {occupiedRooms} {occupiedRooms === 1 ? 'ocupada' : 'ocupadas'}
                </span>
                <span>
                  {availableRooms} {availableRooms === 1 ? 'libre' : 'libres'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="px-3 py-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsPreviewOpen(true)}
            disabled={!selectedPension}
            className="w-full min-h-[44px] justify-start gap-2.5 rounded-xl border-dashed border-border hover:border-primary/50 hover:bg-primary/5 text-xs font-medium cursor-pointer"
          >
            <Eye className="h-4 w-4 text-primary shrink-0" />
            <span className="truncate">Vista de Estudiante</span>
          </Button>
        </div>

        <div className="mt-auto p-4 border-t border-border/60">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-xl border border-border bg-card">
                {user?.avatarUrl ? (
                  <Image
                    src={user.avatarUrl}
                    alt={user.firstName}
                    fill
                    unoptimized
                    sizes="36px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
              <div className="flex min-w-0 flex-col text-left">
                <span className="truncate text-xs font-semibold text-foreground leading-tight">
                  {user ? `${user.firstName} ${user.lastName}` : 'Propietario'}
                </span>
                <span className="truncate text-[10px] text-muted-foreground">
                  {user?.email ?? 'Sesión activa'}
                </span>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={logout}
              className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive cursor-pointer shrink-0"
              title="Cerrar sesión"
              aria-label="Cerrar sesión"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {selectedPension && (
        <PensionDetailModal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          pension={selectedPension}
          pensionId={selectedPension.id}
        />
      )}
    </>
  );
}
