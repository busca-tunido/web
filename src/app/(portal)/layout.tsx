import { headers } from 'next/headers';
import type { ReactNode } from 'react';
import { UserAppShell } from '@/components/shells/student-app-shell';
import { redirectIfLandlordCookie } from '@/lib/server-role-guard';
import { getStudentInitialData } from '@/lib/server-student-prefetch';
import { getTabFromPathname, parseNavigationParams } from '@/lib/url-navigation';

type PortalLayoutProps = {
  children: ReactNode;
};

export default async function PortalLayout({ children }: PortalLayoutProps) {
  await redirectIfLandlordCookie();

  const requestHeaders = await headers();
  const pathname = requestHeaders.get('x-pathname') ?? '/explore';
  const search = requestHeaders.get('x-search') ?? '';
  const defaultTab = getTabFromPathname(pathname) ?? 'explore';
  const initialNavState = parseNavigationParams(search, defaultTab, pathname);

  const initialData = await getStudentInitialData({
    city: initialNavState.city ?? undefined,
  });

  return (
    <UserAppShell
      initialData={initialData}
      initialNavigationState={initialNavState}
      initialTab={initialNavState.tab}
    >
      {children}
    </UserAppShell>
  );
}
