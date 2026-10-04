'use client';

import { BedDouble, Building2, Home, Star, User } from 'lucide-react';
import { motion } from 'motion/react';
import { type LandlordTab, useLandlord } from '@/contexts/landlord-context';
import { cn } from '@/lib/utils';

export type LandlordNavTab = LandlordTab;

export type LandlordBottomNavProps = {
  activeTab: LandlordTab;
  onTabChange: (tab: LandlordTab) => void;
  pendingProposalsCount?: number;
  totalRooms?: number;
  reviewsCount?: number;
  pensionsCount?: number;
  className?: string;
};

type LandlordNavItem = {
  id: LandlordTab;
  label: string;
  icon: typeof BedDouble;
  badge?: number;
};

export function LandlordBottomNav({
  activeTab,
  onTabChange,
  pendingProposalsCount: propPendingProposalsCount,
  totalRooms: propTotalRooms,
  reviewsCount: propReviewsCount,
  pensionsCount: propPensionsCount,
  className,
}: LandlordBottomNavProps) {
  const landlordContext = useLandlord();
  const selectedPension = landlordContext.selectedPension;
  const pensions = landlordContext.pensions;

  const totalRooms = propTotalRooms ?? selectedPension?.rooms?.length ?? 0;
  const reviewsCount = propReviewsCount ?? selectedPension?.reviewsCount ?? 0;
  const pensionsCount = propPensionsCount ?? pensions.length;
  const pendingCount = propPendingProposalsCount ?? landlordContext.pendingProposalsCount;

  const navItems: readonly LandlordNavItem[] = [
    {
      id: 'pension',
      label: 'Mi Pensión',
      icon: Home,
      badge: pendingCount > 0 ? pendingCount : undefined,
    },
    {
      id: 'rooms',
      label: 'Habitaciones',
      icon: BedDouble,
      badge: totalRooms,
    },
    {
      id: 'pensions',
      label: 'Pensiones',
      icon: Building2,
      badge: pensionsCount,
    },
    {
      id: 'reviews',
      label: 'Reseñas',
      icon: Star,
      badge: reviewsCount,
    },
    {
      id: 'account',
      label: 'Cuenta',
      icon: User,
    },
  ];

  return (
    <nav
      id="landlord-bottom-navigation"
      aria-label="Navegación del propietario"
      className={cn(
        'fixed bottom-0 left-0 right-0 z-40 border-t border-border/60 bg-background/95 backdrop-blur-lg pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-1.5 transition-colors md:hidden',
        className,
      )}
    >
      <div className="mx-auto flex max-w-lg items-center justify-around px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <motion.button
              key={item.id}
              id={`landlord-nav-tab-${item.id}`}
              type="button"
              whileTap={{ scale: 0.9 }}
              onClick={() => onTabChange(item.id)}
              className={cn(
                'group relative flex min-h-[48px] min-w-[56px] flex-1 flex-col items-center justify-center rounded-xl py-1 text-xs font-medium transition-colors cursor-pointer',
                isActive
                  ? 'text-primary font-semibold'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <div className="relative">
                <Icon
                  className={cn(
                    'h-5 w-5 transition-transform duration-200',
                    isActive ? 'scale-110 text-primary stroke-[2.2]' : 'stroke-[1.75]',
                  )}
                />
                {item.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-secondary px-1 text-[9px] font-medium text-muted-foreground border border-border/60 tabular-nums shadow-2xs">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <span className="mt-1 text-[11px] tracking-tight">{item.label}</span>
              {isActive && (
                <motion.span
                  layoutId="active-landlord-bottom-nav-indicator"
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  className="absolute bottom-0 h-1 w-6 rounded-full bg-primary"
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
