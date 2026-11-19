'use client';

import { GraduationCap, MapPin } from 'lucide-react';
import { AuthScreen } from '@/components/auth/auth-screen';
import { Badge } from '@/components/ui/badge';
import { BellIcon } from '@/components/ui/bell';
import { ShieldCheckIcon } from '@/components/ui/shield-check';
import { StudentAccountSkeleton } from '@/components/ui/skeletons/student-skeletons';
import { useAuth } from '@/lib/auth-context';
import { assertNever } from '@/lib/student-view-state';
import type { UserProfile } from '@/lib/types';
import {
  AccountActionRow,
  AccountBrandFooter,
  AccountLogoutButton,
  AccountProfileHeader,
  AccountShell,
  AccountThemeCard,
} from './account-primitives';

type StudentAccountState =
  | { status: 'resolving_auth' }
  | { status: 'guest' }
  | { status: 'ready'; user: UserProfile };

function deriveStudentAccountState(
  user: UserProfile | null,
  isLoading: boolean,
): StudentAccountState {
  if (user) {
    return { status: 'ready', user };
  }
  if (isLoading) {
    return { status: 'resolving_auth' };
  }
  return { status: 'guest' };
}

export function StudentAccountScreen() {
  const { user, isLoading, logout } = useAuth();
  const state = deriveStudentAccountState(user, isLoading);

  switch (state.status) {
    case 'resolving_auth':
      return <StudentAccountSkeleton />;
    case 'guest':
      return <AuthScreen />;
    case 'ready': {
      const currentUser = state.user;
      return (
        <AccountShell>
          <AccountProfileHeader user={currentUser} roleLabel="Estudiante">
            {currentUser.universityName && (
              <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-1">
                <GraduationCap className="h-3.5 w-3.5 text-primary shrink-0" />
                <span className="truncate">{currentUser.universityName}</span>
              </div>
            )}
          </AccountProfileHeader>

          <AccountThemeCard />

          <div className="flex flex-col gap-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">
              Acreditación Universitaria
            </h3>

            <AccountActionRow
              icon={ShieldCheckIcon}
              title="Validación de Matrícula Institucional"
              description="Verificación activa mediante correo institucional"
              trailing={
                <Badge className="bg-primary/20 text-primary border-0 text-[10px] font-semibold">
                  Acreditado
                </Badge>
              }
            />

            <AccountActionRow
              icon={BellIcon}
              title="Notificaciones de Cupos y Disponibilidad"
              description="Alertas cuando se liberen habitaciones en tus guardados"
              trailing={
                <span className="text-muted-foreground text-[11px] font-medium">Activas</span>
              }
            />

            {currentUser.universityName && (
              <AccountActionRow
                icon={MapPin}
                title="Sede y Campus de Referencia"
                description={currentUser.universityName}
                trailing={
                  <Badge
                    variant="outline"
                    className="border-border text-muted-foreground text-[10px]"
                  >
                    Preferencia
                  </Badge>
                }
              />
            )}
          </div>

          <AccountLogoutButton onLogout={logout} />

          <AccountBrandFooter tagline="Tu hogar universitario en Chile" />
        </AccountShell>
      );
    }
    default:
      return assertNever(state);
  }
}
