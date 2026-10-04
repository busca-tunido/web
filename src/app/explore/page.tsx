import type { Metadata } from 'next';
import { UserAppShell } from '@/components/shells/student-app-shell';
import { getStudentInitialData } from '@/lib/server-student-prefetch';
import { parseSearchParams } from '@/lib/url-navigation';

export const metadata: Metadata = {
  title: 'Explorar Pensiones | BuscaTuNido',
  description: 'Encuentra las mejores pensiones y residencias universitarias en Chile.',
  alternates: {
    canonical: '/explore',
  },
};

type ExplorePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ExplorePage(props: ExplorePageProps) {
  const resolvedSearchParams = props.searchParams ? await props.searchParams : {};
  const initialNavState = parseSearchParams(resolvedSearchParams, 'explore');
  const initialData = await getStudentInitialData();

  return (
    <UserAppShell
      initialData={initialData}
      initialNavigationState={initialNavState}
      initialTab="explore"
    />
  );
}
