import type { Metadata } from 'next';
import { StudentRouteSync } from '@/components/shells/student-route-sync';

export const metadata: Metadata = {
  title: 'Mis Favoritos | BuscaTuNido',
  description: 'Tus pensiones y habitaciones universitarias guardadas en BuscaTuNido.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function FavoritesPage() {
  return <StudentRouteSync tab="favorites" />;
}
