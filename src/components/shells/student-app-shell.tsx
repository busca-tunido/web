'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useMemo, useState } from 'react';
import { AccountScreen } from '@/components/account/account-screen';
import { AuthModal } from '@/components/auth/auth-modal';
import { NetworkErrorBanner } from '@/components/common/network-error-state';
import { ExploreScreen } from '@/components/explore/explore-screen';
import { FavoritesScreen } from '@/components/favorites/favorites-screen';
import { HistoryScreen } from '@/components/history/history-screen';
import { BottomNav } from '@/components/layout/bottom-nav';
import { DesktopNavbar } from '@/components/layout/desktop-navbar';
import { FilterDrawer } from '@/components/layout/filter-drawer';
import { TopSearchBar } from '@/components/layout/top-search-bar';
import { MapScreen } from '@/components/map/map-screen';
import { PensionDetailModal } from '@/components/pensions/pension-detail-modal';
import { NavigationProvider, useNavigation } from '@/contexts/navigation-context';
import { SearchFiltersProvider, useSearchFilters } from '@/contexts/search-filters-context';
import { useStudentPensionsFeed } from '@/hooks/use-student-pensions-feed';
import type { UrlNavigationState } from '@/hooks/use-url-navigation-state';
import type { CityInfo, NavTab, UniversityInfo } from '@/lib/types';
import { useUserLocation } from '@/lib/use-user-location';

export type StudentAppShellProps = {
  initialTab?: NavTab;
  initialNavigationState?: Partial<UrlNavigationState>;
};

function StudentAppShellContent() {
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

  const { filters, setFilters, resetFilters, clearCity } = useSearchFilters();

  const [tentativeCities, setTentativeCities] = useState<CityInfo[]>([]);
  const { userLocation, currentCity, requestLocation } = useUserLocation(tentativeCities);

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
    sortBy: 'relevance',
    radiusKm: 30,
  });

  useEffect(() => {
    if (isPensionDetailOpen && selectedPension) {
      document.title = `${selectedPension.title} | BuscaTuNido`;
      return;
    }

    const tabTitleMap: Record<NavTab, string> = {
      explore: 'Explorar | BuscaTuNido',
      map: 'Mapa | BuscaTuNido',
      favorites: 'Favoritos | BuscaTuNido',
      history: 'Estadías | BuscaTuNido',
      account: 'Cuenta | BuscaTuNido',
    };

    document.title = tabTitleMap[activeTab] ?? 'BuscaTuNido';
  }, [activeTab, isPensionDetailOpen, selectedPension]);

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

  return (
    <main
      className={`relative ${
        activeTab === 'map' ? 'h-dvh overflow-hidden' : 'min-h-screen'
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
          activeTab === 'map'
            ? 'h-full overflow-hidden pb-[68px] md:pb-0'
            : 'mx-auto max-w-lg md:max-w-7xl md:px-6 lg:px-8 pb-20 md:pb-12'
        }`}
      >
        {activeTab !== 'account' && (
          <TopSearchBar
            filters={filters}
            onFilterChange={setFilters}
            onOpenFilterDrawer={openFilters}
            selectedCityName={filters.city}
            onClearCity={clearCity}
          />
        )}

        {pensionsError && (
          <div className="px-4 pt-2">
            <NetworkErrorBanner message={pensionsError} onRetry={refetchPensions} />
          </div>
        )}

        <div className={activeTab === 'map' ? 'flex-1 relative overflow-hidden h-full' : 'flex-1'}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className={activeTab === 'map' ? 'h-full w-full' : 'w-full'}
            >
              {activeTab === 'explore' && (
                <ExploreScreen
                  cities={cities}
                  universities={universities}
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
              )}

              {activeTab === 'map' && (
                <MapScreen
                  pensions={pensions}
                  cities={cities}
                  selectedPension={selectedPension}
                  selectedCity={mapTargetCity}
                  selectedUniversity={selectedUniversity}
                  userLocation={userLocation}
                  onRequestLocation={requestLocation}
                  onSelectPension={selectPension}
                  onOpenPensionDetail={openPensionDetail}
                />
              )}

              {activeTab === 'favorites' && (
                <FavoritesScreen
                  allPensions={pensions}
                  onSelectPension={openPensionDetail}
                  onExplore={() => navigateTab('explore')}
                />
              )}

              {activeTab === 'history' && (
                <HistoryScreen onExplore={() => navigateTab('explore')} />
              )}

              {activeTab === 'account' && <AccountScreen />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <BottomNav activeTab={activeTab} onTabChange={navigateTab} />

      <PensionDetailModal
        pension={selectedPension}
        isOpen={isPensionDetailOpen}
        onClose={closePensionDetail}
      />

      <FilterDrawer
        isOpen={isFiltersOpen}
        onClose={closeFilters}
        filters={filters}
        onApply={setFilters}
      />

      <AuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} />
    </main>
  );
}

function StudentAppShellWithProviders() {
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
      <StudentAppShellContent />
    </SearchFiltersProvider>
  );
}

export function StudentAppShell({
  initialTab = 'explore',
  initialNavigationState,
}: StudentAppShellProps) {
  return (
    <NavigationProvider initialTab={initialTab} initialNavigationState={initialNavigationState}>
      <StudentAppShellWithProviders />
    </NavigationProvider>
  );
}
