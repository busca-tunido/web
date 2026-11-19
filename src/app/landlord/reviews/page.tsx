import type { Metadata } from 'next';
import { LandlordRouteSync } from '@/components/shells/landlord-route-sync';

export const metadata: Metadata = {
  title: 'Reseñas de Estudiantes | BuscaTuNido',
  description: 'Opiniones y valoraciones recibidas de estudiantes universitarios.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function LandlordReviewsPage() {
  return <LandlordRouteSync tab="reviews" />;
}
