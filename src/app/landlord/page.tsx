import type { Metadata } from 'next';
import { LandlordAppShell } from '@/components/shells/landlord-app-shell';
import { hasLandlordServerCookie } from '@/lib/server-role-guard';

export const metadata: Metadata = {
  title: 'Panel de Propietario | BuscaTuNido',
  description: 'Gestión y administración de residencias y pensiones universitarias.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function LandlordPage() {
  const hasServerLandlordSession = await hasLandlordServerCookie();
  return (
    <LandlordAppShell initialTab="pension" hasServerLandlordSession={hasServerLandlordSession} />
  );
}
