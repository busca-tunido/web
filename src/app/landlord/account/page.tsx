import type { Metadata } from 'next';
import { LandlordAppShell } from '@/components/shells/landlord-app-shell';
import { hasLandlordServerCookie } from '@/lib/server-role-guard';

export const metadata: Metadata = {
  title: 'Mi Cuenta de Propietario | BuscaTuNido',
  description: 'Información y configuración del perfil de arrendador.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function LandlordAccountPage() {
  const hasServerLandlordSession = await hasLandlordServerCookie();
  return (
    <LandlordAppShell initialTab="account" hasServerLandlordSession={hasServerLandlordSession} />
  );
}
