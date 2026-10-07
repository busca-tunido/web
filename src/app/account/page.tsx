import type { Metadata } from 'next';
import { UserAppShell } from '@/components/shells/student-app-shell';
import { getStudentInitialData } from '@/lib/server-student-prefetch';
import { parseSearchParams } from '@/lib/url-navigation';

export const metadata: Metadata = {
  title: 'Mi Cuenta | BuscaTuNido',
  description: 'Configuración y perfil de usuario en BuscaTuNido.',
  robots: {
    index: false,
    follow: false,
  },
};

type AccountPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AccountPage(props: AccountPageProps) {
  const resolvedSearchParams = props.searchParams ? await props.searchParams : {};
  const initialNavState = parseSearchParams(resolvedSearchParams, 'account');
  const initialData = await getStudentInitialData();

  return (
    <UserAppShell
      initialData={initialData}
      initialNavigationState={initialNavState}
      initialTab="account"
    />
  );
}
