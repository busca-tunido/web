'use client';

import { Bell, GraduationCap, MapPin, Shield } from 'lucide-react';
import { AuthScreen } from '@/components/auth/auth-screen';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth-context';
import {
  AccountActionRow,
  AccountBrandFooter,
  AccountLogoutButton,
  AccountProfileHeader,
  AccountShell,
  AccountThemeCard,
} from './account-primitives';

export function StudentAccountScreen() {
  const { user, logout } = useAuth();

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <AccountShell>
      <AccountProfileHeader user={user} roleLabel="Estudiante">
        {user.universityName && (
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-1">
            <GraduationCap className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="truncate">{user.universityName}</span>
          </div>
        )}
      </AccountProfileHeader>

      <AccountThemeCard />

      <div className="flex flex-col gap-2.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">
          Acreditación Universitaria
        </h3>

        <AccountActionRow
          icon={Shield}
          title="Validación de Matrícula Institucional"
          description="Verificación activa mediante correo institucional"
          trailing={
            <Badge className="bg-primary/20 text-primary border-0 text-[10px] font-semibold">
              Acreditado
            </Badge>
          }
        />

        <AccountActionRow
          icon={Bell}
          title="Notificaciones de Cupos y Disponibilidad"
          description="Alertas cuando se liberen habitaciones en tus guardados"
          trailing={<span className="text-muted-foreground text-[11px] font-medium">Activas</span>}
        />

        {user.universityName && (
          <AccountActionRow
            icon={MapPin}
            title="Sede y Campus de Referencia"
            description={user.universityName}
            trailing={
              <Badge variant="outline" className="border-border text-muted-foreground text-[10px]">
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
