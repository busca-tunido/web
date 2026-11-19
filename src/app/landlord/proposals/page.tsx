import type { Metadata } from 'next';
import { LandlordAppShell } from '@/components/shells/landlord-app-shell';
import { hasLandlordServerCookie } from '@/lib/server-role-guard';

export const metadata: Metadata = {
  title: 'Sugerencias de la Comunidad | BuscaTuNido',
  description: 'Propuestas de actualización y corrección enviadas por estudiantes.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function LandlordProposalsPage() {
  const hasServerLandlordSession = await hasLandlordServerCookie();
  return (
    <LandlordAppShell initialTab="proposals" hasServerLandlordSession={hasServerLandlordSession} />
  );
}
