import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { RoleRouter } from '@/components/shells/role-router';
import { getStudentInitialData } from '@/lib/server-student-prefetch';
import { parseSearchParams } from '@/lib/url-navigation';

type HomePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function HomePage(props: HomePageProps) {
  const cookieStore = await cookies();
  const role = cookieStore.get('tunido_role')?.value;
  if (role?.toUpperCase() === 'LANDLORD') {
    redirect('/landlord');
  }

  const resolvedSearchParams = props.searchParams ? await props.searchParams : {};
  const initialNavState = parseSearchParams(resolvedSearchParams, 'explore');
  const initialData = await getStudentInitialData();

  return (
    <RoleRouter
      initialData={initialData}
      initialNavigationState={initialNavState}
      initialTab={initialNavState.tab}
    />
  );
}
