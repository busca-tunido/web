import type { Metadata } from 'next';
import { RoleRouter } from '@/components/shells/role-router';
import { getStudentInitialData } from '@/lib/server-student-prefetch';
import { parseSearchParams } from '@/lib/url-navigation';

export const metadata: Metadata = {
  title: 'Mis Favoritos | BuscaTuNido',
  description: 'Tus pensiones y habitaciones universitarias guardadas en BuscaTuNido.',
  robots: {
    index: false,
    follow: false,
  },
};

type FavoritesPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function FavoritesPage(props: FavoritesPageProps) {
  const resolvedSearchParams = props.searchParams ? await props.searchParams : {};
  const initialNavState = parseSearchParams(resolvedSearchParams, 'favorites');
  const initialData = await getStudentInitialData();

  return (
    <RoleRouter
      initialData={initialData}
      initialNavigationState={initialNavState}
      initialTab="favorites"
    />
  );
}
