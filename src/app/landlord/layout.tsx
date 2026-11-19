import { headers } from 'next/headers';
import { LandlordAppShell } from '@/components/shells/landlord-app-shell';
import { getLandlordTabFromPathname } from '@/lib/landlord-routes';
import { getLandlordInitialData } from '@/lib/server-landlord-prefetch';
import { hasLandlordServerCookie } from '@/lib/server-role-guard';

type LandlordLayoutProps = {
  children: React.ReactNode;
};

export default async function LandlordLayout({ children }: LandlordLayoutProps) {
  const [requestHeaders, hasServerLandlordSession, initialData] = await Promise.all([
    headers(),
    hasLandlordServerCookie(),
    getLandlordInitialData(),
  ]);

  const pathname = requestHeaders.get('x-pathname') ?? '/landlord';
  const initialTab = getLandlordTabFromPathname(pathname) ?? 'pension';

  return (
    <LandlordAppShell
      initialTab={initialTab}
      hasServerLandlordSession={hasServerLandlordSession}
      initialData={initialData}
    >
      {children}
    </LandlordAppShell>
  );
}
