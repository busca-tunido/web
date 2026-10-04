import type { Metadata } from 'next';
import { RoleRouter } from '@/components/shells/role-router';
import { getStudentInitialData } from '@/lib/server-student-prefetch';
import { parseSearchParams } from '@/lib/url-navigation';

export const metadata: Metadata = {
  title: 'Mi Historial de Estadías | BuscaTuNido',
  description: 'Historial de alojamientos universitarios y estadías en BuscaTuNido.',
  robots: {
    index: false,
    follow: false,
  },
};

type HistoryPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function HistoryPage(props: HistoryPageProps) {
  const resolvedSearchParams = props.searchParams ? await props.searchParams : {};
  const initialNavState = parseSearchParams(resolvedSearchParams, 'history');
  const initialData = await getStudentInitialData();

  return (
    <RoleRouter
      initialData={initialData}
      initialNavigationState={initialNavState}
      initialTab="history"
    />
  );
}
