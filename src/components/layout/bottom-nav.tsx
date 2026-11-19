'use client';

import type { ComponentType, Ref } from 'react';
import type { AnimatedIconHandle, AnimatedIconProps } from '@/components/ui/animated-icon.types';
import { CompassIcon } from '@/components/ui/compass';
import { HeartIcon } from '@/components/ui/heart';
import { HistoryIcon } from '@/components/ui/history';
import { MapPinIcon } from '@/components/ui/map-pin';
import { UserIcon } from '@/components/ui/user';
import { useAnimatedIconTrigger } from '@/hooks/use-animated-icon';
import { useAuth } from '@/lib/auth-context';
import type { NavTab } from '@/lib/types';

type BottomNavIcon = ComponentType<AnimatedIconProps & { ref?: Ref<AnimatedIconHandle> }>;

type BottomNavItem = {
  id: NavTab;
  label: string;
  icon: BottomNavIcon;
  badge?: number;
};

function BottomNavTabButton({
  item,
  isActive,
  onSelect,
}: {
  item: BottomNavItem;
  isActive: boolean;
  onSelect: () => void;
}) {
  const Icon = item.icon;
  const { iconRef, start, triggerProps } = useAnimatedIconTrigger();

  return (
    <button
      id={`nav-tab-${item.id}`}
      type="button"
      {...triggerProps}
      onClick={() => {
        start();
        onSelect();
      }}
      className={`group relative flex min-h-[48px] min-w-[56px] flex-1 flex-col items-center justify-center rounded-xl py-1 text-xs font-medium transition-all duration-150 active:scale-95 touch-manipulation ${
        isActive
          ? 'text-sage-foreground font-semibold bg-sage/10'
          : 'text-muted-foreground hover:text-foreground'
      }`}
    >
      <span className="relative inline-flex items-center justify-center">
        <Icon
          ref={iconRef}
          size={20}
          className={`transition-transform duration-200 ${
            isActive ? 'scale-110 text-sage-foreground' : ''
          }`}
        />
        {item.badge !== undefined && item.badge > 0 && (
          <span className="absolute -top-1.5 -right-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground tabular-nums animate-in zoom-in duration-150">
            {item.badge}
          </span>
        )}
      </span>
      <span className="mt-1 text-xs tracking-normal">{item.label}</span>
      {isActive && (
        <span className="absolute bottom-0 h-1 w-6 rounded-full bg-sage transition-all duration-200" />
      )}
    </button>
  );
}

type BottomNavProps = {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onOpenAuthModal?: () => void;
};

export function BottomNav({ activeTab, onTabChange, onOpenAuthModal }: BottomNavProps) {
  const { user, favorites } = useAuth();

  const navItems: BottomNavItem[] = [
    { id: 'explore', label: 'Explorar', icon: CompassIcon },
    { id: 'favorites', label: 'Favoritos', icon: HeartIcon, badge: user ? favorites.length : 0 },
    { id: 'map', label: 'Ubicación', icon: MapPinIcon },
    { id: 'history', label: 'Mis Estadías', icon: HistoryIcon },
    { id: 'account', label: 'Mi Cuenta', icon: UserIcon },
  ];

  return (
    <nav
      id="main-bottom-navigation"
      aria-label="Navegación principal"
      className="fixed bottom-0 inset-x-0 z-50 border-t border-border/60 bg-card/90 backdrop-blur-xl pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-1.5 transition-colors md:hidden"
    >
      <div className="mx-auto flex max-w-lg items-center justify-around px-2">
        {navItems.map((item) => (
          <BottomNavTabButton
            key={item.id}
            item={item}
            isActive={activeTab === item.id}
            onSelect={() => {
              if (item.id === 'account' && !user) {
                onOpenAuthModal?.();
                return;
              }
              onTabChange(item.id);
              if (!user && (item.id === 'favorites' || item.id === 'history')) {
                onOpenAuthModal?.();
              }
            }}
          />
        ))}
      </div>
    </nav>
  );
}
