import type { Metadata } from 'next';
import { LandlordRouteSync } from '@/components/shells/landlord-route-sync';

export const metadata: Metadata = {
  title: 'Mis Pensiones | BuscaTuNido',
  description: 'Catálogo y registro de todas tus propiedades en BuscaTuNido.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function LandlordPropertiesPage() {
  return <LandlordRouteSync tab="pensions" />;
}
