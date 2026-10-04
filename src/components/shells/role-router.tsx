'use client';

import { type ComponentType, useEffect, useState } from 'react';
import { UnimplementedRoleBanner } from '@/components/common/unimplemented-role-banner';
import { SplashScreen } from '@/components/layout/splash-screen';
import { StudentAppShell, type StudentAppShellProps } from '@/components/shells/student-app-shell';
import type { UrlNavigationState } from '@/hooks/use-url-navigation-state';
import { useUserRole } from '@/hooks/use-user-role';
import { useAuth } from '@/lib/auth-context';
import type { ServerGeoLocation } from '@/lib/server-geo';
import type { CityInfo, NavTab, PensionItem, UniversityInfo } from '@/lib/types';

export type InitialPrefetchData = {
  pensions?: PensionItem[];
  cities?: CityInfo[];
  universities?: UniversityInfo[];
  totalPensions?: number;
  serverGeo?: ServerGeoLocation;
};

export type RoleRouterProps = {
  initialData?: InitialPrefetchData;
  initialTab?: NavTab;
  initialNavigationState?: Partial<UrlNavigationState>;
};

type ForwardedStudentShellProps = StudentAppShellProps & {
  initialData?: InitialPrefetchData;
  initialNavigationState?: Partial<UrlNavigationState>;
};

const ForwardedStudentShell = StudentAppShell as ComponentType<ForwardedStudentShellProps>;

function checkIsStoredLandlord(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const savedUser = localStorage.getItem('tunido_user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      if (String(parsed?.role ?? '').toUpperCase() === 'LANDLORD') {
        return true;
      }
    }
  } catch {}
  return typeof document !== 'undefined' && document.cookie.includes('tunido_role=LANDLORD');
}

export function RoleRouter({ initialData, initialTab, initialNavigationState }: RoleRouterProps) {
  const { isLoading } = useAuth();
  const { role } = useUserRole();
  const [isClientLandlord, setIsClientLandlord] = useState(checkIsStoredLandlord);

  useEffect(() => {
    if (checkIsStoredLandlord()) {
      setIsClientLandlord(true);
    }
  }, []);

  useEffect(() => {
    if ((role === 'landlord' || isClientLandlord) && typeof window !== 'undefined') {
      window.location.replace('/landlord');
    }
  }, [role, isClientLandlord]);

  if (role === 'landlord' || isClientLandlord) {
    return <SplashScreen />;
  }

  if (isLoading && !initialData) {
    return <SplashScreen />;
  }

  if (role === 'moderator' || role === 'admin') {
    return <UnimplementedRoleBanner role={role} />;
  }

  return (
    <ForwardedStudentShell
      initialData={initialData}
      initialTab={initialTab ?? initialNavigationState?.tab}
      initialNavigationState={initialNavigationState}
    />
  );
}
