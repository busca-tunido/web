'use client';

import dynamic from 'next/dynamic';
import { useEffect, useMemo } from 'react';
import { LandlordDesktopHeader } from '@/components/landlord/landlord-desktop-header';
import { LandlordDesktopSidebar } from '@/components/landlord/landlord-desktop-sidebar';
import { LandlordPensionScreen } from '@/components/landlord/landlord-pension-screen';
import { LandlordPensionsScreen } from '@/components/landlord/landlord-pensions-screen';

const LandlordAccountScreen = dynamic(
  () =>
    import('@/components/account/landlord-account-screen').then((mod) => mod.LandlordAccountScreen),
  { ssr: false },
);

const LandlordProposalsScreen = dynamic(
  () =>
    import('@/components/landlord/landlord-proposals-screen').then(
      (mod) => mod.LandlordProposalsScreen,
    ),
  { ssr: false },
);

const LandlordReviewsScreen = dynamic(
  () =>
    import('@/components/landlord/landlord-reviews-screen').then(
      (mod) => mod.LandlordReviewsScreen,
    ),
  { ssr: false },
);

const LandlordRoomsScreen = dynamic(
  () =>
    import('@/components/landlord/landlord-rooms-screen').then((mod) => mod.LandlordRoomsScreen),
  { ssr: false },
);

const PensionEditorDrawer = dynamic(
  () =>
    import('@/components/landlord/pension-editor-drawer').then((mod) => mod.PensionEditorDrawer),
  { ssr: false },
);

import { LandlordBottomNav } from '@/components/layout/landlord-bottom-nav';
import {
  LandlordMobileHeader,
  type LandlordPropertySummary,
} from '@/components/layout/landlord-mobile-header';
import { SplashScreen } from '@/components/layout/splash-screen';
import { LandlordProvider, type LandlordTab, useLandlord } from '@/contexts/landlord-context';
import { useUserRole } from '@/hooks/use-user-role';
import { useAuth } from '@/lib/auth-context';

export type LandlordAppShellProps = {
  initialTab?: LandlordTab;
};

function LandlordAppShellContent() {
  const {
    pensions,
    selectedPension,
    setSelectedPension,
    activeTab,
    setActiveTab,
    togglePensionActive,
    refetchPensions,
    isCreatePensionOpen,
    openCreatePensionModal,
    closeCreatePensionModal,
  } = useLandlord();

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
      <LandlordDesktopSidebar className="hidden md:flex" />
      <div className="flex-1 flex flex-col min-w-0 md:h-screen md:overflow-y-auto overscroll-y-contain">
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
        <main className="flex-1 p-4 md:p-8 max-w-6xl w-full mx-auto pb-24 md:pb-12">
          {activeTab === 'rooms' && (
            <LandlordRoomsScreen
              selectedPension={selectedPension}
              pensionId={selectedPension?.id}
            />
          )}
          {activeTab === 'pension' && (
            <LandlordPensionScreen pension={selectedPension} pensionId={selectedPension?.id} />
          )}
          {activeTab === 'reviews' && (
            <LandlordReviewsScreen pension={selectedPension} pensionId={selectedPension?.id} />
          )}
          {activeTab === 'proposals' && (
            <LandlordProposalsScreen pension={selectedPension} pensionId={selectedPension?.id} />
          )}
          {activeTab === 'pensions' && <LandlordPensionsScreen />}
          {activeTab === 'account' && <LandlordAccountScreen />}
        </main>
        <LandlordBottomNav activeTab={activeTab} onTabChange={setActiveTab} className="md:hidden" />
      </div>
      <PensionEditorDrawer
        isOpen={isCreatePensionOpen}
        onClose={closeCreatePensionModal}
        onSuccess={async (created) => {
          await refetchPensions(created.id);
          setActiveTab('pension');
        }}
      />
    </div>
  );
}

export function LandlordAppShell({ initialTab = 'pension' }: LandlordAppShellProps) {
  const { isLoading } = useAuth();
  const { isLandlord } = useUserRole();

  useEffect(() => {
    if (!isLoading && !isLandlord && typeof window !== 'undefined') {
      window.location.replace('/');
    }
  }, [isLoading, isLandlord]);

  if (isLoading || !isLandlord) {
    return <SplashScreen />;
  }

  return (
    <LandlordProvider initialTab={initialTab}>
      <LandlordAppShellContent />
    </LandlordProvider>
  );
}
