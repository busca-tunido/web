import type { Metadata } from 'next';
import { LandlordAppShell } from '@/components/shells/landlord-app-shell';
import { hasLandlordServerCookie } from '@/lib/server-role-guard';

export const metadata: Metadata = {
  title: 'Reseñas de Estudiantes | BuscaTuNido',
  description: 'Opiniones y valoraciones recibidas de estudiantes universitarios.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function LandlordReviewsPage() {
  const hasServerLandlordSession = await hasLandlordServerCookie();
  return (
    <LandlordAppShell initialTab="reviews" hasServerLandlordSession={hasServerLandlordSession} />
  );
}
