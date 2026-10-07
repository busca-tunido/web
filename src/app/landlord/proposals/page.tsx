import type { Metadata } from 'next';
import { LandlordAppShell } from '@/components/shells/landlord-app-shell';

export const metadata: Metadata = {
  title: 'Sugerencias de la Comunidad | BuscaTuNido',
  description: 'Propuestas de actualización y corrección enviadas por estudiantes.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function LandlordProposalsPage() {
  return <LandlordAppShell initialTab="proposals" />;
}
