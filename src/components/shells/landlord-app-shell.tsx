'use client';

import { useMemo } from 'react';
import { AccountScreen } from '@/components/account/account-screen';
import { LandlordDesktopHeader } from '@/components/landlord/landlord-desktop-header';
import { LandlordDesktopSidebar } from '@/components/landlord/landlord-desktop-sidebar';
import { LandlordPensionScreen } from '@/components/landlord/landlord-pension-screen';
import { LandlordReviewsScreen } from '@/components/landlord/landlord-reviews-screen';
import { LandlordRoomsScreen } from '@/components/landlord/landlord-rooms-screen';
import { LandlordBottomNav } from '@/components/layout/landlord-bottom-nav';
import {
  LandlordMobileHeader,
  type LandlordPropertySummary,
} from '@/components/layout/landlord-mobile-header';
import { LandlordProvider, type LandlordTab, useLandlord } from '@/contexts/landlord-context';

export type LandlordAppShellProps = {
  initialTab?: LandlordTab;
};

const LandlordAccountSection = AccountScreen;

function LandlordAppShellContent() {
  const {
    pensions,
    selectedPension,
    setSelectedPension,
    activeTab,
    setActiveTab,
    togglePensionActive,
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
    <div className="min-h-screen bg-background flex flex-col md:flex-row text-foreground">
      <LandlordDesktopSidebar className="hidden md:flex" />
      <div className="flex-1 flex flex-col min-w-0">
        <LandlordMobileHeader
          className="md:hidden"
          properties={propertySummaries}
          selectedPropertyId={selectedPension?.id}
          selectedPropertyName={selectedPension?.title}
          onSelectProperty={handleSelectProperty}
          isActive={selectedPension?.isActive ?? true}
          onToggleActive={handleToggleActive}
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
          {activeTab === 'account' && <LandlordAccountSection />}
        </main>
        <LandlordBottomNav activeTab={activeTab} onTabChange={setActiveTab} className="md:hidden" />
      </div>
    </div>
  );
}

export function LandlordAppShell({ initialTab = 'rooms' }: LandlordAppShellProps) {
  return (
    <LandlordProvider initialTab={initialTab}>
      <LandlordAppShellContent />
    </LandlordProvider>
  );
}
