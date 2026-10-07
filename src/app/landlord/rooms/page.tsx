import type { Metadata } from 'next';
import { LandlordAppShell } from '@/components/shells/landlord-app-shell';

export const metadata: Metadata = {
  title: 'Gestión de Habitaciones | BuscaTuNido',
  description: 'Control de disponibilidad y estado de habitaciones universitarias.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function LandlordRoomsPage() {
  return <LandlordAppShell initialTab="rooms" />;
}
