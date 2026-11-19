import type { Metadata } from 'next';
import { LandlordAppShell } from '@/components/shells/landlord-app-shell';
import { hasLandlordServerCookie } from '@/lib/server-role-guard';

export const metadata: Metadata = {
  title: 'Mis Pensiones | BuscaTuNido',
  description: 'Catálogo y registro de todas tus propiedades en BuscaTuNido.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function LandlordPropertiesPage() {
  const hasServerLandlordSession = await hasLandlordServerCookie();
  return (
    <LandlordAppShell initialTab="pensions" hasServerLandlordSession={hasServerLandlordSession} />
  );
}
