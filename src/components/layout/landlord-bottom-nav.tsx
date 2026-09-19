'use client';

import { BedDouble, Home, Star, User } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

export type LandlordNavTab = 'rooms' | 'pension' | 'reviews' | 'account';

export type LandlordBottomNavProps = {
  activeTab: LandlordNavTab;
  onTabChange: (tab: LandlordNavTab) => void;
  pendingProposalsCount?: number;
  className?: string;
};

type LandlordNavItem = {
  id: LandlordNavTab;
  label: string;
  icon: typeof BedDouble;
  badge?: number;
};

export function LandlordBottomNav({
  activeTab,
  onTabChange,
  pendingProposalsCount = 0,
  className,
}: LandlordBottomNavProps) {
  const navItems: readonly LandlordNavItem[] = [
    { id: 'rooms', label: 'Habitaciones', icon: BedDouble },
    { id: 'pension', label: 'Mi Pensión', icon: Home },
    { id: 'reviews', label: 'Reseñas', icon: Star, badge: pendingProposalsCount },
    { id: 'account', label: 'Cuenta', icon: User },
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
                {item.badge !== undefined && item.badge > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1.5 -right-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground"
                  >
                    {item.badge > 99 ? '99+' : item.badge}
                  </motion.span>
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
