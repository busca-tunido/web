import type { Metadata } from 'next';
import { StudentRouteSync } from '@/components/shells/student-route-sync';

export const metadata: Metadata = {
  title: 'Mi Cuenta | BuscaTuNido',
  description: 'Configuración y perfil de usuario en BuscaTuNido.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AccountPage() {
  return <StudentRouteSync tab="account" />;
}
