'use client';

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';
import { LandlordDesktopHeader } from '@/components/landlord/landlord-desktop-header';
import { LandlordDesktopSidebar } from '@/components/landlord/landlord-desktop-sidebar';
import { LandlordPensionScreen } from '@/components/landlord/landlord-pension-screen';
import { LandlordPensionsScreen } from '@/components/landlord/landlord-pensions-screen';
import { LandlordBottomNav } from '@/components/layout/landlord-bottom-nav';
import {
  LandlordMobileHeader,
  type LandlordPropertySummary,
} from '@/components/layout/landlord-mobile-header';
import { SplashScreen } from '@/components/layout/splash-screen';
import {
  LandlordAccountSkeleton,
  LandlordProposalsScreenSkeleton,
  LandlordReviewsScreenSkeleton,
  LandlordRoomsSkeleton,
} from '@/components/ui/skeletons/landlord-skeletons';
import { LandlordProvider, type LandlordTab, useLandlord } from '@/contexts/landlord-context';
import { useUserRole } from '@/hooks/use-user-role';
import { useAuth } from '@/lib/auth-context';
import {
  type LandlordInitialData,
  prefetchLandlordTabData,
  preloadLandlordTabChunk,
} from '@/lib/landlord-prefetch';
import { LANDLORD_TAB_TITLES } from '@/lib/landlord-routes';

const LandlordAccountScreen = dynamic(
  () =>
    import('@/components/account/landlord-account-screen').then((mod) => mod.LandlordAccountScreen),
  {
    ssr: true,
    loading: () => <LandlordAccountSkeleton />,
  },
);

const LandlordProposalsScreen = dynamic(
  () =>
    import('@/components/landlord/landlord-proposals-screen').then(
      (mod) => mod.LandlordProposalsScreen,
    ),
  {
    ssr: true,
    loading: () => <LandlordProposalsScreenSkeleton />,
  },
);

const LandlordReviewsScreen = dynamic(
  () =>
    import('@/components/landlord/landlord-reviews-screen').then(
      (mod) => mod.LandlordReviewsScreen,
    ),
  {
    ssr: true,
    loading: () => <LandlordReviewsScreenSkeleton />,
  },
);

const LandlordRoomsScreen = dynamic(
  () =>
    import('@/components/landlord/landlord-rooms-screen').then((mod) => mod.LandlordRoomsScreen),
  {
    ssr: true,
    loading: () => <LandlordRoomsSkeleton />,
  },
);

const PensionEditorDrawer = dynamic(
  () =>
    import('@/components/landlord/pension-editor-drawer').then((mod) => mod.PensionEditorDrawer),
  { ssr: false },
);

export type LandlordAppShellProps = {
  initialTab?: LandlordTab;
  hasServerLandlordSession?: boolean;
  initialData?: LandlordInitialData;
  children?: React.ReactNode;
};

function LandlordAppShellContent({ children }: { children?: React.ReactNode }) {
  const { user } = useAuth();
  const {
    pensions,
    selectedPension,
    setSelectedPension,
    updatePensionInList,
    activeTab,
    setActiveTab,
    togglePensionActive,
    refetchPensions,
    isCreatePensionOpen,
    openCreatePensionModal,
    closeCreatePensionModal,
  } = useLandlord();

  const [visitedTabs, setVisitedTabs] = useState<Set<LandlordTab>>(() => new Set([activeTab]));
  const [hasOpenedCreatePension, setHasOpenedCreatePension] = useState(isCreatePensionOpen);

  useEffect(() => {
    if (isCreatePensionOpen) {
      setHasOpenedCreatePension(true);
    }
  }, [isCreatePensionOpen]);

  useEffect(() => {
    setVisitedTabs((prev) => {
      if (prev.has(activeTab)) {
        return prev;
      }
      const next = new Set(prev);
      next.add(activeTab);
      return next;
    });
  }, [activeTab]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.title = LANDLORD_TAB_TITLES[activeTab] ?? 'Panel de Propietario | BuscaTuNido';
  }, [activeTab]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const warmUpTabs = () => {
      const candidateTabs: LandlordTab[] = ['rooms', 'reviews', 'proposals', 'account'];
      for (const tab of candidateTabs) {
        if (tab !== activeTab) {
          preloadLandlordTabChunk(tab);
        }
      }

      if (selectedPension?.id) {
        const dataTabs: LandlordTab[] = ['pension', 'rooms', 'reviews', 'proposals'];
        for (const tab of dataTabs) {
          if (tab !== activeTab) {
            void prefetchLandlordTabData(tab, {
              pensionId: selectedPension.id,
              userId: user?.id,
            });
          }
        }
      }
    };

    const win = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };

    if (typeof win.requestIdleCallback === 'function') {
      const idleId = win.requestIdleCallback(warmUpTabs, { timeout: 1500 });
      return () => {
        win.cancelIdleCallback?.(idleId);
      };
    }

    const timerId = window.setTimeout(warmUpTabs, 1000);
    return () => {
      window.clearTimeout(timerId);
    };
  }, [activeTab, selectedPension?.id, user?.id]);

  const shouldRenderTab = (tab: LandlordTab) => activeTab === tab || visitedTabs.has(tab);

  const propertySummaries = useMemo<LandlordPropertySummary[]>(() => {
    return pensions.map((p) => ({
      id: p.id,
      title: p.title,
      address: p.address,
      city: p.city,
      isActive: p.isActive,
      totalRooms: p.rooms?.length ?? 0,
    }));
  }, [pensions]);

  const handleSelectProperty = (propertyId: string) => {
    const found = pensions.find((p) => p.id === propertyId);
    if (found) {
      setSelectedPension(found);
    }
  };

  const handleToggleActive = (active: boolean) => {
    if (selectedPension) {
      togglePensionActive(selectedPension.id, active);
    }
  };

  return (
    <div className="min-h-screen md:h-screen md:overflow-hidden bg-background flex flex-col md:flex-row text-foreground">
      {children}
      <LandlordDesktopSidebar className="hidden md:flex" />
      <div className="flex-1 flex flex-col min-w-0 md:h-screen md:overflow-y-auto overscroll-y-contain scrollbar-sage">
        <LandlordMobileHeader
          className="md:hidden"
          properties={propertySummaries}
          selectedPropertyId={selectedPension?.id}
          selectedPropertyName={selectedPension?.title}
          onSelectProperty={handleSelectProperty}
          isActive={selectedPension?.isActive ?? true}
          onToggleActive={handleToggleActive}
          onOpenCreatePension={openCreatePensionModal}
        />
        <LandlordDesktopHeader className="hidden md:flex" />
        <main className="flex-1 p-4 md:p-8 max-w-6xl w-full mx-auto pb-[calc(6.5rem+env(safe-area-inset-bottom))] md:pb-12">
          {shouldRenderTab('rooms') && (
            <section
              hidden={activeTab !== 'rooms'}
              aria-hidden={activeTab !== 'rooms'}
              className={activeTab === 'rooms' ? 'block' : 'hidden'}
            >
              <LandlordRoomsScreen
                selectedPension={selectedPension}
                pensionId={selectedPension?.id}
              />
            </section>
          )}
          {shouldRenderTab('pension') && (
            <section
              hidden={activeTab !== 'pension'}
              aria-hidden={activeTab !== 'pension'}
              className={activeTab === 'pension' ? 'block' : 'hidden'}
            >
              <LandlordPensionScreen
                pension={selectedPension}
                pensionId={selectedPension?.id}
                onPensionUpdated={updatePensionInList}
              />
            </section>
          )}
          {shouldRenderTab('reviews') && (
            <section
              hidden={activeTab !== 'reviews'}
              aria-hidden={activeTab !== 'reviews'}
              className={activeTab === 'reviews' ? 'block' : 'hidden'}
            >
              <LandlordReviewsScreen pension={selectedPension} pensionId={selectedPension?.id} />
            </section>
          )}
          {shouldRenderTab('proposals') && (
            <section
              hidden={activeTab !== 'proposals'}
              aria-hidden={activeTab !== 'proposals'}
              className={activeTab === 'proposals' ? 'block' : 'hidden'}
            >
              <LandlordProposalsScreen pension={selectedPension} pensionId={selectedPension?.id} />
            </section>
          )}
          {shouldRenderTab('pensions') && (
            <section
              hidden={activeTab !== 'pensions'}
              aria-hidden={activeTab !== 'pensions'}
              className={activeTab === 'pensions' ? 'block' : 'hidden'}
            >
              <LandlordPensionsScreen />
            </section>
          )}
          {shouldRenderTab('account') && (
            <section
              hidden={activeTab !== 'account'}
              aria-hidden={activeTab !== 'account'}
              className={activeTab === 'account' ? 'block' : 'hidden'}
            >
              <LandlordAccountScreen />
            </section>
          )}
        </main>
        <LandlordBottomNav activeTab={activeTab} onTabChange={setActiveTab} className="md:hidden" />
      </div>
      {(hasOpenedCreatePension || isCreatePensionOpen) && (
        <PensionEditorDrawer
          isOpen={isCreatePensionOpen}
          onClose={closeCreatePensionModal}
          onSuccess={async (created) => {
            await refetchPensions(created.id);
            setActiveTab('pension');
          }}
        />
      )}
    </div>
  );
}

export function LandlordAppShell({
  initialTab = 'pension',
  hasServerLandlordSession = false,
  initialData,
  children,
}: LandlordAppShellProps) {
  const { isLoading } = useAuth();
  const { isLandlord } = useUserRole();

  useEffect(() => {
    if (!isLoading && !isLandlord && typeof window !== 'undefined') {
      window.location.replace('/');
    }
  }, [isLoading, isLandlord]);

  const allowServerShellDuringHydration = Boolean(hasServerLandlordSession && isLoading);
  if (!allowServerShellDuringHydration && (isLoading || !isLandlord)) {
    return <SplashScreen />;
  }

  return (
    <LandlordProvider initialTab={initialTab} initialData={initialData}>
      <LandlordAppShellContent>{children}</LandlordAppShellContent>
    </LandlordProvider>
  );
}
