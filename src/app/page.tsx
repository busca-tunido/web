import { RoleRouter } from '@/components/shells/role-router';
import { redirectIfLandlordCookie } from '@/lib/server-role-guard';
import { getStudentInitialData } from '@/lib/server-student-prefetch';
import { parseSearchParams } from '@/lib/url-navigation';

type HomePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function HomePage(props: HomePageProps) {
  await redirectIfLandlordCookie();

  const resolvedSearchParams = props.searchParams ? await props.searchParams : {};
  const initialNavState = parseSearchParams(resolvedSearchParams, 'explore');
  const initialData = await getStudentInitialData({
    city: initialNavState.city ?? undefined,
  });

  return (
    <RoleRouter
      initialData={initialData}
      initialNavigationState={initialNavState}
      initialTab={initialNavState.tab}
    />
  );
}
