'use client';

import type { ComponentType } from 'react';
import { UnimplementedRoleBanner } from '@/components/common/unimplemented-role-banner';
import { SplashScreen } from '@/components/layout/splash-screen';
import { LandlordAppShell } from '@/components/shells/landlord-app-shell';
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

export function RoleRouter({ initialData, initialTab, initialNavigationState }: RoleRouterProps) {
  const { isLoading } = useAuth();
  const { role } = useUserRole();

  if (isLoading && !initialData) {
    return <SplashScreen />;
  }

  if (role === 'landlord') {
    return <LandlordAppShell />;
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
