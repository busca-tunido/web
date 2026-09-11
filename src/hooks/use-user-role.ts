'use client';

import { useMemo } from 'react';
import { useAuth } from '@/lib/auth-context';
import type { UserProfile } from '@/lib/types';

export type StudentRole = 'student';
export type LandlordRole = 'landlord';
export type ModeratorRole = 'moderator';
export type AdminRole = 'admin';

export type UserRoleName = StudentRole | LandlordRole | ModeratorRole | AdminRole;

export type StudentSession = {
  status: 'authenticated';
  role: 'student';
  user: UserProfile;
};

export type LandlordSession = {
  status: 'authenticated';
  role: 'landlord';
  user: UserProfile;
};

export type ModeratorSession = {
  status: 'authenticated';
  role: 'moderator';
  user: UserProfile;
};

export type AdminSession = {
  status: 'authenticated';
  role: 'admin';
  user: UserProfile;
};

export type UnauthenticatedSession = {
  status: 'unauthenticated';
  role: 'unauthenticated';
  user: null;
};

export type ActiveUserSession =
  | StudentSession
  | LandlordSession
  | ModeratorSession
  | AdminSession
  | UnauthenticatedSession;

export type UseUserRoleReturn = {
  session: ActiveUserSession;
  role: UserRoleName | 'unauthenticated';
  isStudent: boolean;
  isLandlord: boolean;
  isModerator: boolean;
  isAdmin: boolean;
  isAuthenticated: boolean;
  user: UserProfile | null;
};

export function useUserRole(): UseUserRoleReturn {
  const { user, isAuthenticated } = useAuth();

  const session = useMemo<ActiveUserSession>(() => {
    if (!isAuthenticated || !user) {
      return {
        status: 'unauthenticated',
        role: 'unauthenticated',
        user: null,
      };
    }

    const rawRole = (user.role ?? 'STUDENT').toUpperCase();

    if (rawRole === 'LANDLORD') {
      return {
        status: 'authenticated',
        role: 'landlord',
        user,
      };
    }

    if (rawRole === 'MODERATOR') {
      return {
        status: 'authenticated',
        role: 'moderator',
        user,
      };
    }

    if (rawRole === 'ADMIN') {
      return {
        status: 'authenticated',
        role: 'admin',
        user,
      };
    }

    return {
      status: 'authenticated',
      role: 'student',
      user,
    };
  }, [user, isAuthenticated]);

  return {
    session,
    role: session.role,
    isStudent: session.role === 'student',
    isLandlord: session.role === 'landlord',
    isModerator: session.role === 'moderator',
    isAdmin: session.role === 'admin',
    isAuthenticated: session.status === 'authenticated',
    user: session.user,
  };
}
