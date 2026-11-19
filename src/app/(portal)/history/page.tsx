import type { Metadata } from 'next';
import { StudentRouteSync } from '@/components/shells/student-route-sync';

export const metadata: Metadata = {
  title: 'Mi Historial de Estadías | BuscaTuNido',
  description: 'Historial de alojamientos universitarios y estadías en BuscaTuNido.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function HistoryPage() {
  return <StudentRouteSync tab="history" />;
}
