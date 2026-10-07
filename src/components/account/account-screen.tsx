'use client';

import { AuthScreen } from '@/components/auth/auth-screen';
import { useAuth } from '@/lib/auth-context';
import { LandlordAccountScreen } from './landlord-account-screen';
import { StudentAccountScreen } from './student-account-screen';

export * from './account-primitives';
export { LandlordAccountScreen } from './landlord-account-screen';
export { StudentAccountScreen } from './student-account-screen';

export function AccountScreen() {
  const { user } = useAuth();

  if (!user) {
    return <AuthScreen />;
  }

  if (user.role?.toUpperCase() === 'LANDLORD') {
    return <LandlordAccountScreen />;
  }

  return <StudentAccountScreen />;
}
