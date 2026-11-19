import type { Metadata } from 'next';
import { StudentRouteSync } from '@/components/shells/student-route-sync';

export const metadata: Metadata = {
  title: 'Explorar Pensiones | BuscaTuNido',
  description: 'Encuentra las mejores pensiones y residencias universitarias en Chile.',
  alternates: {
    canonical: '/explore',
  },
};

export default function ExplorePage() {
  return <StudentRouteSync tab="explore" />;
}
