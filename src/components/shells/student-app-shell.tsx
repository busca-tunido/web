'use client';

import dynamic from 'next/dynamic';
import { type ReactNode, useEffect, useMemo, useReducer, useState } from 'react';
import { NetworkErrorBanner } from '@/components/common/network-error-state';
import { BottomNav } from '@/components/layout/bottom-nav';
import { DesktopNavbar } from '@/components/layout/desktop-navbar';
import { TopSearchBar } from '@/components/layout/top-search-bar';
import type { InitialPrefetchData } from '@/components/shells/role-router';
import { FavoritesSkeleton } from '@/components/ui/skeletons/favorites-skeleton';
import { HistorySkeleton } from '@/components/ui/skeletons/history-skeleton';
import { MapDrawerSkeleton } from '@/components/ui/skeletons/map-drawer-skeleton';
import { StudentAccountSkeleton } from '@/components/ui/skeletons/student-skeletons';
import { NavigationProvider, useNavigation } from '@/contexts/navigation-context';
import { usePensionComparison } from '@/contexts/pension-comparison-context';
import { SearchFiltersProvider, useSearchFilters } from '@/contexts/search-filters-context';
import { useStudentPensionsFeed } from '@/hooks/use-student-pensions-feed';
import type { UrlNavigationState } from '@/hooks/use-url-navigation-state';
import { useAuth } from '@/lib/auth-context';
import { preloadStudentModalChunk } from '@/lib/student-prefetch';
import {
  assertNever,
  createInitialStudentShellState,
  STUDENT_TAB_CONFIG,
  studentShellReducer,
} from '@/lib/student-view-state';
import type { CityInfo, NavTab, UniversityInfo } from '@/lib/types';
import { isValidTab } from '@/lib/url-navigation';
import { useUserLocation } from '@/lib/use-user-location';

const ExploreScreen = dynamic(
  () => import('@/components/explore/explore-screen').then((mod) => mod.ExploreScreen),
  { ssr: true },
);

const MapScreen = dynamic(
  () => import('@/components/map/map-screen').then((mod) => mod.MapScreen),
  {
    ssr: false,
    loading: () => <MapDrawerSkeleton />,
  },
);

const FavoritesScreen = dynamic(
  () => import('@/components/favorites/favorites-screen').then((mod) => mod.FavoritesScreen),
  {
    ssr: false,
    loading: () => <FavoritesSkeleton count={4} />,
  },
);

const HistoryScreen = dynamic(
  () => import('@/components/history/history-screen').then((mod) => mod.HistoryScreen),
  {
    ssr: false,
    loading: () => <HistorySkeleton count={3} />,
  },
);

const StudentAccountScreen = dynamic(
  () =>
    import('@/components/account/student-account-screen').then((mod) => mod.StudentAccountScreen),
  {
    ssr: false,
    loading: () => <StudentAccountSkeleton />,
  },
);

const PensionDetailModal = dynamic(
  () => import('@/components/pensions/pension-detail-modal').then((mod) => mod.PensionDetailModal),
  { ssr: false },
);

const FilterDrawer = dynamic(
  () => import('@/components/layout/filter-drawer').then((mod) => mod.FilterDrawer),
  { ssr: false },
);

const AuthModal = dynamic(
  () => import('@/components/auth/auth-modal').then((mod) => mod.AuthModal),
  { ssr: false },
);

export type StudentAppShellProps = {
  initialData?: InitialPrefetchData;
  initialTab?: NavTab;
  initialNavigationState?: Partial<UrlNavigationState>;
  children?: ReactNode;
};

function useHasEverOpened(isOpen: boolean): boolean {
  const [hasOpened, setHasOpened] = useState(isOpen);
  useEffect(() => {
    if (isOpen) {
      setHasOpened(true);
    }
  }, [isOpen]);
  return hasOpened || isOpen;
}

function StudentAppShellContent({
  initialData,
  initialCity,
  resolvedInitialTab,
}: {
  initialData?: InitialPrefetchData;
  initialCity?: string | null;
  resolvedInitialTab: NavTab;
}) {
  const { isAuthenticated } = useAuth();
  const comparison = usePensionComparison();
  const {
    activeTab,
    navigateTab,
    selectedPension,
    setSelectedPension,
    selectPension,
    mapTargetCity,
    setMapTargetCity,
    selectedUniversity,
    setSelectedUniversity,
    isPensionDetailOpen,
    openPensionDetail,
    closePensionDetail,
    isFiltersOpen,
    openFilters,
    closeFilters,
    isAuthModalOpen,
    openAuthModal,
    closeAuthModal,
    urlPensionId,
    setCityAndUni,
    handleSelectCity,
  } = useNavigation();

  const [shellState, dispatchShell] = useReducer(
    studentShellReducer,
    resolvedInitialTab,
    createInitialStudentShellState,
  );

  useEffect(() => {
    dispatchShell({ type: 'SYNC_ROUTE_TAB', tab: activeTab });
  }, [activeTab]);

  const { filters, setFilters, resetFilters, clearCity } = useSearchFilters();

  const [tentativeCities, setTentativeCities] = useState<CityInfo[]>(initialData?.cities ?? []);
  const {
    userLocation,
    browserLocation,
    locationStatus,
    locationSource,
    locationError,
    currentCity,
    requestLocation,
    rememberPreferredCity,
  } = useUserLocation(tentativeCities, initialData?.serverGeo);

  const explicitCityTarget = mapTargetCity ?? filters.city ?? selectedUniversity?.city ?? null;
  useEffect(() => {
    if (explicitCityTarget) {
      rememberPreferredCity(explicitCityTarget);
    }
  }, [explicitCityTarget, rememberPreferredCity]);

  const effectiveFilters = useMemo(
    () => ({
      ...filters,
      universityId: selectedUniversity?.id,
    }),
    [filters, selectedUniversity],
  );

  const {
    cities,
    universities,
    isLoadingMetadata,
    pensions,
    total: totalPensions,
    hasMore,
    isLoadingPensions,
    isLoadingMore,
    loadMore: loadMorePensions,
    nearbyCityCounts,
    error: pensionsError,
    refetch: refetchPensions,
  } = useStudentPensionsFeed({
    filters: effectiveFilters,
    userLocation,
    currentCity: currentCity?.name ?? null,
    radiusKm: 30,
    initialCities: initialData?.cities,
    initialUniversities: initialData?.universities,
    initialPensions: initialData?.pensions,
    initialTotal: initialData?.totalPensions,
    initialCity: initialCity ?? null,
    initialGeo: initialData?.serverGeo ?? null,
  });

  const activeTabConfig = STUDENT_TAB_CONFIG[activeTab];
  const isViewportLayout = activeTabConfig.layoutMode === 'viewport';

  useEffect(() => {
    if (isPensionDetailOpen && selectedPension) {
      document.title = `${selectedPension.title} | BuscaTuNido`;
      return;
    }

    document.title = activeTabConfig.title ?? 'BuscaTuNido';
  }, [activeTabConfig.title, isPensionDetailOpen, selectedPension]);

  useEffect(() => {
    if (cities.length > 0) {
      setTentativeCities(cities);
    }
  }, [cities]);

  useEffect(() => {
    if (urlPensionId && selectedPension?.id !== urlPensionId) {
      const found = pensions.find((p) => p.id === urlPensionId);
      if (found) {
        setSelectedPension(found);
      }
    }
  }, [urlPensionId, pensions, selectedPension?.id, setSelectedPension]);

  // Idle preload of secondary tabs and modal chunks so first click feels instant
  useEffect(() => {
    if (typeof window === 'undefined' || process.env.NODE_ENV === 'test') return;

    const runIdlePreload = () => {
      preloadStudentModalChunk('detail');
      preloadStudentModalChunk('filters');
      for (const tab of ['map', 'favorites', 'history', 'account'] as const) {
        if (tab !== activeTab) {
          STUDENT_TAB_CONFIG[tab].preload({
            isAuthenticated,
            city: filters.city ?? mapTargetCity,
          });
        }
      }
    };

    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(runIdlePreload, { timeout: 1500 });
      return () => window.cancelIdleCallback(id);
    }

    const timer = globalThis.setTimeout(runIdlePreload, 900);
    return () => globalThis.clearTimeout(timer);
  }, [activeTab, filters.city, isAuthenticated, mapTargetCity]);

  const handleSelectUniversity = (uni: UniversityInfo) => {
    setSelectedPension(null);
    setMapTargetCity(uni.city);
    setSelectedUniversity(uni);
    setCityAndUni({ city: uni.city, uni: uni.acronym });
    navigateTab('map');
  };

  const handleResetAll = () => {
    setSelectedPension(null);
    setMapTargetCity(null);
    setSelectedUniversity(null);
    resetFilters();
    setCityAndUni({ city: null, uni: null });
  };

  const isDetailActive = isPensionDetailOpen && !comparison?.isDrawerOpen;
  const shouldMountDetailModal = useHasEverOpened(isDetailActive);
  const shouldMountFilterDrawer = useHasEverOpened(isFiltersOpen);
  const shouldMountAuthModal = useHasEverOpened(isAuthModalOpen);

  const renderTabScreen = (tab: NavTab) => {
    switch (tab) {
      case 'explore':
        return (
          <ExploreScreen
            cities={cities}
            universities={universities}
            isLoadingMetadata={isLoadingMetadata}
            featuredPensions={pensions}
            selectedCity={null}
            onSelectCity={(city) => {
              if (city === null) {
                setSelectedPension(null);
                setMapTargetCity(null);
                setSelectedUniversity(null);
              } else {
                handleSelectCity(city);
              }
            }}
            onSelectUniversity={handleSelectUniversity}
            onSelectPension={openPensionDetail}
            onNavigateToMap={() => navigateTab('map')}
            hasMore={hasMore}
            isLoadingMore={isLoadingMore}
            isLoadingPensions={isLoadingPensions}
            onLoadMorePensions={loadMorePensions}
            nearbyCityCounts={nearbyCityCounts}
            totalPensions={totalPensions}
            onResetFilters={handleResetAll}
          />
        );
      case 'map':
        return (
          <MapScreen
            isVisible={activeTab === 'map'}
            pensions={pensions}
            cities={cities}
            selectedPension={selectedPension}
            selectedCity={mapTargetCity}
            selectedUniversity={selectedUniversity}
            userLocation={userLocation}
            browserLocation={browserLocation}
            locationStatus={locationStatus}
            locationSource={locationSource}
            locationError={locationError}
            onRequestLocation={requestLocation}
            onSelectPension={selectPension}
            onOpenPensionDetail={openPensionDetail}
            filters={effectiveFilters}
          />
        );
      case 'favorites':
        return (
          <FavoritesScreen
            allPensions={pensions}
            onSelectPension={openPensionDetail}
            onExplore={() => navigateTab('explore')}
          />
        );
      case 'history':
        return <HistoryScreen onExplore={() => navigateTab('explore')} />;
      case 'account':
        return <StudentAccountScreen />;
      default:
        return assertNever(tab);
    }
  };

  return (
    <main
      className={`relative ${
        isViewportLayout ? 'h-dvh overflow-hidden' : 'min-h-screen'
      } bg-background text-foreground flex flex-col justify-between transition-colors`}
    >
      <DesktopNavbar
        activeTab={activeTab}
        onTabChange={navigateTab}
        filters={filters}
        onFilterChange={setFilters}
        onOpenFilterModal={openFilters}
        selectedCityName={filters.city}
        onClearCity={clearCity}
        onResetFilters={handleResetAll}
        onOpenAuthModal={openAuthModal}
      />

      <div
        className={`w-full flex-1 flex flex-col ${
          isViewportLayout
            ? 'h-full overflow-hidden pb-[68px] md:pb-0'
            : 'mx-auto max-w-lg md:max-w-7xl md:px-6 lg:px-8 pb-20 md:pb-12'
        }`}
      >
        {activeTabConfig.showSearchBar && (
          <TopSearchBar
            filters={filters}
            onFilterChange={setFilters}
            onOpenFilterDrawer={openFilters}
            selectedCityName={filters.city}
            onClearCity={clearCity}
            onResetFilters={handleResetAll}
          />
        )}

        {pensionsError && (
          <div className="px-4 pt-2">
            <NetworkErrorBanner message={pensionsError} onRetry={refetchPensions} />
          </div>
        )}

        <div className={isViewportLayout ? 'flex-1 relative overflow-hidden h-full' : 'flex-1'}>
          {shellState.visitedTabs.map((tab) => {
            const isCurrent = activeTab === tab;
            const isTabViewport = STUDENT_TAB_CONFIG[tab].layoutMode === 'viewport';
            return (
              <section
                key={tab}
                hidden={!isCurrent}
                aria-hidden={!isCurrent}
                className={isTabViewport ? 'h-full w-full' : 'w-full'}
              >
                {renderTabScreen(tab)}
              </section>
            );
          })}
        </div>
      </div>

      <BottomNav activeTab={activeTab} onTabChange={navigateTab} onOpenAuthModal={openAuthModal} />

      {shouldMountDetailModal && (
        <PensionDetailModal
          pension={selectedPension}
          isOpen={isDetailActive}
          onClose={closePensionDetail}
        />
      )}

      {shouldMountFilterDrawer && (
        <FilterDrawer
          isOpen={isFiltersOpen}
          onClose={closeFilters}
          filters={filters}
          onApply={setFilters}
          cities={cities}
          userLocation={userLocation}
        />
      )}

      {shouldMountAuthModal && <AuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} />}
    </main>
  );
}

type StudentAppShellWithProvidersProps = {
  initialData?: InitialPrefetchData;
  initialCity?: string | null;
  resolvedInitialTab: NavTab;
};

function StudentAppShellWithProviders({
  initialData,
  initialCity,
  resolvedInitialTab,
}: StudentAppShellWithProvidersProps) {
  const { urlCity, urlUni } = useNavigation();
  const initialFilters = useMemo(
    () => ({
      query: urlUni || '',
      city: urlCity || undefined,
    }),
    [urlCity, urlUni],
  );

  return (
    <SearchFiltersProvider initialFilters={initialFilters}>
      <StudentAppShellContent
        initialData={initialData}
        initialCity={initialCity}
        resolvedInitialTab={resolvedInitialTab}
      />
    </SearchFiltersProvider>
  );
}

export function StudentAppShell({
  initialData,
  initialTab = 'explore',
  initialNavigationState,
  children,
}: StudentAppShellProps) {
  const resolvedInitialTab: NavTab =
    initialNavigationState?.tab && isValidTab(initialNavigationState.tab)
      ? initialNavigationState.tab
      : initialTab;

  return (
    <NavigationProvider initialTab={initialTab} initialNavigationState={initialNavigationState}>
      {children}
      <StudentAppShellWithProviders
        initialData={initialData}
        initialCity={initialNavigationState?.city ?? null}
        resolvedInitialTab={resolvedInitialTab}
      />
    </NavigationProvider>
  );
}

export { StudentAppShell as UserAppShell };
