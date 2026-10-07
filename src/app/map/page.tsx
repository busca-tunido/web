import type { Metadata } from 'next';
import { UserAppShell } from '@/components/shells/student-app-shell';
import { getStudentInitialData } from '@/lib/server-student-prefetch';
import { parseSearchParams } from '@/lib/url-navigation';

export const metadata: Metadata = {
  title: 'Mapa de Pensiones | BuscaTuNido',
  description: 'Ubica residencias estudiantiles cercanas a tu universidad en el mapa interactivo.',
  alternates: {
    canonical: '/map',
  },
};

type MapPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function MapPage(props: MapPageProps) {
  const resolvedSearchParams = props.searchParams ? await props.searchParams : {};
  const initialNavState = parseSearchParams(resolvedSearchParams, 'map');
  const initialData = await getStudentInitialData();

  return (
    <UserAppShell
      initialData={initialData}
      initialNavigationState={initialNavState}
      initialTab="map"
    />
  );
}
