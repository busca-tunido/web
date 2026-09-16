'use client';

import type { ComponentType } from 'react';
import { AuthScreen } from '@/components/auth/auth-screen';
import { UnimplementedRoleBanner } from '@/components/common/unimplemented-role-banner';
import { SplashScreen } from '@/components/layout/splash-screen';
import { LandlordAppShell } from '@/components/shells/landlord-app-shell';
import { StudentAppShell, type StudentAppShellProps } from '@/components/shells/student-app-shell';
import { useUserRole } from '@/hooks/use-user-role';
import { useAuth } from '@/lib/auth-context';
import type { CityInfo, PensionItem, UniversityInfo } from '@/lib/types';

export type InitialPrefetchData = {
  pensions?: PensionItem[];
  cities?: CityInfo[];
  universities?: UniversityInfo[];
  totalPensions?: number;
};

export type RoleRouterProps = {
  initialData?: InitialPrefetchData;
};

type ForwardedStudentShellProps = StudentAppShellProps & {
  initialData?: InitialPrefetchData;
};

const ForwardedStudentShell = StudentAppShell as ComponentType<ForwardedStudentShellProps>;

export function RoleRouter({ initialData }: RoleRouterProps) {
  const { isLoading } = useAuth();
  const { role, isAuthenticated } = useUserRole();

  if (isLoading) {
    return <SplashScreen />;
  }

  if (!isAuthenticated || role === 'unauthenticated') {
    return <AuthScreen />;
  }

  if (role === 'landlord') {
    return <LandlordAppShell />;
  }

  if (role === 'moderator' || role === 'admin') {
    return <UnimplementedRoleBanner role={role} />;
  }

  return <ForwardedStudentShell initialData={initialData} />;
}
