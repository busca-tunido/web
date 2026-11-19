'use client';

import { useEffect } from 'react';
import { useNavigation } from '@/contexts/navigation-context';
import type { NavTab } from '@/lib/types';

export function StudentRouteSync({ tab }: { tab: NavTab }) {
  const { syncTabFromRoute } = useNavigation();

  useEffect(() => {
    syncTabFromRoute(tab);
  }, [tab, syncTabFromRoute]);

  return null;
}
