import type { Metadata } from 'next';
import { LandlordAppShell } from '@/components/shells/landlord-app-shell';
import { hasLandlordServerCookie } from '@/lib/server-role-guard';

export const metadata: Metadata = {
  title: 'Gestión de Habitaciones | BuscaTuNido',
  description: 'Control de disponibilidad y estado de habitaciones universitarias.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function LandlordRoomsPage() {
  const hasServerLandlordSession = await hasLandlordServerCookie();
  return (
    <LandlordAppShell initialTab="rooms" hasServerLandlordSession={hasServerLandlordSession} />
  );
}
