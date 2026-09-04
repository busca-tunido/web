'use client';

import { Compass, Heart, History, MapPin, User } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import type { NavTab } from '@/lib/types';

type BottomNavProps = {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
};

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const { favorites } = useAuth();

  const navItems: Array<{
    id: NavTab;
    label: string;
    icon: typeof Compass;
    badge?: number;
  }> = [
    { id: 'explore', label: 'Explorar', icon: Compass },
    { id: 'favorites', label: 'Favoritos', icon: Heart, badge: favorites.length },
    { id: 'map', label: 'Ubicación', icon: MapPin },
    { id: 'history', label: 'Mis Estadías', icon: History },
    { id: 'account', label: 'Mi Cuenta', icon: User },
  ];

  return (
    <nav
      id="main-bottom-navigation"
      aria-label="Navegación principal"
      className="fixed bottom-0 inset-x-0 z-50 border-t border-zinc-800/80 bg-zinc-950/90 backdrop-blur-xl pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-1 transition-all"
    >
      <div className="mx-auto flex max-w-lg items-center justify-around px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-tab-${item.id}`}
              type="button"
              onClick={() => onTabChange(item.id)}
              className={`group relative flex min-h-[48px] min-w-[56px] flex-1 flex-col items-center justify-center rounded-xl py-1 text-xs font-medium transition-all ${
                isActive
                  ? 'text-emerald-400 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200 active:scale-95'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`h-5 w-5 transition-transform duration-200 ${
                    isActive ? 'scale-110 text-emerald-400 stroke-[2.5]' : 'stroke-[1.75]'
                  }`}
                />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-emerald-500 px-1 text-[9px] font-bold text-zinc-950">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="mt-1 text-[11px] tracking-tight">{item.label}</span>
              {isActive && (
                <span className="absolute bottom-0 h-1 w-6 rounded-full bg-emerald-400" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
