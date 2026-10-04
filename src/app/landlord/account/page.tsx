import type { Metadata } from 'next';
import { LandlordAppShell } from '@/components/shells/landlord-app-shell';

export const metadata: Metadata = {
  title: 'Mi Cuenta de Propietario | BuscaTuNido',
  description: 'Información y configuración del perfil de arrendador.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function LandlordAccountPage() {
  return <LandlordAppShell initialTab="account" />;
}
