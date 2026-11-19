'use client';

import { useEffect } from 'react';
import { type LandlordTab, useOptionalLandlord } from '@/contexts/landlord-context';

export type LandlordRouteSyncProps = {
  tab: LandlordTab;
};

export function LandlordRouteSync({ tab }: LandlordRouteSyncProps) {
  const landlord = useOptionalLandlord();
  const syncTabFromRoute = landlord?.syncTabFromRoute;

  useEffect(() => {
    syncTabFromRoute?.(tab);
  }, [tab, syncTabFromRoute]);

  return null;
}
