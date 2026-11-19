import type { Metadata } from 'next';
import { LandlordRouteSync } from '@/components/shells/landlord-route-sync';

export const metadata: Metadata = {
  title: 'Mi Cuenta de Propietario | BuscaTuNido',
  description: 'Información y configuración del perfil de arrendador.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function LandlordAccountPage() {
  return <LandlordRouteSync tab="account" />;
}
