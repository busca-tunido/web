import type { Metadata } from 'next';
import { LandlordAppShell } from '@/components/shells/landlord-app-shell';

export const metadata: Metadata = {
  title: 'Reseñas de Estudiantes | BuscaTuNido',
  description: 'Opiniones y valoraciones recibidas de estudiantes universitarios.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function LandlordReviewsPage() {
  return <LandlordAppShell initialTab="reviews" />;
}
