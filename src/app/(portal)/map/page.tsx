import type { Metadata } from 'next';
import { StudentRouteSync } from '@/components/shells/student-route-sync';

export const metadata: Metadata = {
  title: 'Mapa de Pensiones | BuscaTuNido',
  description: 'Ubica residencias estudiantiles cercanas a tu universidad en el mapa interactivo.',
  alternates: {
    canonical: '/map',
  },
};

export default function MapPage() {
  return <StudentRouteSync tab="map" />;
}
