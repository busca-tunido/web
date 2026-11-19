import type { Metadata } from 'next';
import { LandlordRouteSync } from '@/components/shells/landlord-route-sync';

export const metadata: Metadata = {
  title: 'Panel de Propietario | BuscaTuNido',
  description: 'Gestión y administración de residencias y pensiones universitarias.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function LandlordPage() {
  return <LandlordRouteSync tab="pension" />;
}
