import type { Metadata } from 'next';
import { LandlordRouteSync } from '@/components/shells/landlord-route-sync';

export const metadata: Metadata = {
  title: 'Sugerencias de la Comunidad | BuscaTuNido',
  description: 'Propuestas de actualización y corrección enviadas por estudiantes.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function LandlordProposalsPage() {
  return <LandlordRouteSync tab="proposals" />;
}
