import type { Metadata } from 'next';
import { LandlordRouteSync } from '@/components/shells/landlord-route-sync';

export const metadata: Metadata = {
  title: 'Gestión de Habitaciones | BuscaTuNido',
  description: 'Control de disponibilidad y estado de habitaciones universitarias.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function LandlordRoomsPage() {
  return <LandlordRouteSync tab="rooms" />;
}
