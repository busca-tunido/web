'use client';

import { Bell, Building2, Phone, ShieldCheck } from 'lucide-react';
import { AuthScreen } from '@/components/auth/auth-screen';
import { Badge } from '@/components/ui/badge';
import { useOptionalLandlord } from '@/contexts/landlord-context';
import { useAuth } from '@/lib/auth-context';
import {
  AccountActionRow,
  AccountBrandFooter,
  AccountLogoutButton,
  AccountProfileHeader,
  AccountShell,
  AccountThemeCard,
} from './account-primitives';

export function LandlordAccountScreen() {
  const { user, logout } = useAuth();
  const landlord = useOptionalLandlord();
  const pensions = landlord?.pensions ?? [];
  const setActiveTab = landlord?.setActiveTab;

  const handleLogout = () => {
    logout();
    if (typeof window !== 'undefined') {
      window.location.replace('/');
    }
  };

  if (!user) {
    return <AuthScreen />;
  }

  const activePensionsCount = pensions.filter((p) => p.isActive).length;
  const pensionSubtitle =
    pensions.length > 0
      ? `${pensions.length} ${pensions.length === 1 ? 'pensión registrada' : 'pensiones registradas'} • ${activePensionsCount} activas`
      : 'Sin pensiones registradas aún';

  return (
    <AccountShell>
      <AccountProfileHeader user={user} roleLabel="Propietario Anfitrión">
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-1">
          <Building2 className="h-3.5 w-3.5 text-primary shrink-0" />
          <span className="truncate">{pensionSubtitle}</span>
        </div>
      </AccountProfileHeader>

      <AccountThemeCard />

      <div className="flex flex-col gap-2.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">
          Seguridad y Verificación
        </h3>

        <AccountActionRow
          icon={ShieldCheck}
          title="Verificación de Identidad del Anfitrión"
          description="Acreditación legal de propietario y titularidad"
          trailing={
            <Badge className="bg-primary/20 text-primary border-0 text-[10px] font-semibold">
              Verificado
            </Badge>
          }
        />

        <AccountActionRow
          icon={Phone}
          title="Canal de Contacto Directo (WhatsApp)"
          description={
            user.phone
              ? `Número vinculado: ${user.phone}`
              : 'Canal habilitado para consultas de estudiantes'
          }
          trailing={
            <Badge variant="outline" className="border-border text-muted-foreground text-[10px]">
              {user.phone ? 'Vinculado' : 'Disponible'}
            </Badge>
          }
          onClick={setActiveTab ? () => setActiveTab('pension') : undefined}
        />

        <AccountActionRow
          icon={Bell}
          title="Notificaciones de Consultas y Reseñas"
          description="Alertas inmediatas ante solicitudes y nuevas opiniones universitarias"
          trailing={<span className="text-muted-foreground text-[11px] font-medium">Activas</span>}
        />

        <AccountActionRow
          icon={Building2}
          title="Resumen de Mis Alojamientos"
          description={`Gestionas ${pensions.length} alojamientos universitarios en BuscaTuNido`}
          trailing={
            <span className="text-xs font-bold text-foreground">
              {pensions.length} {pensions.length === 1 ? 'pensión' : 'pensiones'}
            </span>
          }
          onClick={setActiveTab ? () => setActiveTab('pension') : undefined}
        />
      </div>

      <AccountLogoutButton onLogout={handleLogout} />

      <AccountBrandFooter tagline="Comunidad de anfitriones BuscaTuNido" />
    </AccountShell>
  );
}
