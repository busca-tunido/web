import type { Metadata } from 'next';
import { LandlordAppShell } from '@/components/shells/landlord-app-shell';

export const metadata: Metadata = {
  title: 'Mis Pensiones | BuscaTuNido',
  description: 'Catálogo y registro de todas tus propiedades en BuscaTuNido.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function LandlordPropertiesPage() {
  return <LandlordAppShell initialTab="pensions" />;
}
