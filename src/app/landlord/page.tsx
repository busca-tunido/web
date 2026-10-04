import type { Metadata } from 'next';
import { LandlordAppShell } from '@/components/shells/landlord-app-shell';

export const metadata: Metadata = {
  title: 'Panel de Propietario | BuscaTuNido',
  description: 'Gestión y administración de residencias y pensiones universitarias.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function LandlordPage() {
  return <LandlordAppShell initialTab="pension" />;
}
