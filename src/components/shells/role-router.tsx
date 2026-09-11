'use client';

import { AuthScreen } from '@/components/auth/auth-screen';
import { UnimplementedRoleBanner } from '@/components/common/unimplemented-role-banner';
import { SplashScreen } from '@/components/layout/splash-screen';
import { LandlordAppShell } from '@/components/shells/landlord-app-shell';
import { StudentAppShell } from '@/components/shells/student-app-shell';
import { useUserRole } from '@/hooks/use-user-role';
import { useAuth } from '@/lib/auth-context';

export function RoleRouter() {
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

  return <StudentAppShell />;
}
