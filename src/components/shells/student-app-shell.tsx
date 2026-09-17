'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AccountScreen } from '@/components/account/account-screen';
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
import type { CityInfo, NavTab, UniversityInfo } from '@/lib/types';
import { useUserLocation } from '@/lib/use-user-location';

export type StudentAppShellProps = {
  initialTab?: NavTab;
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
    urlPensionId,
    setCityAndUni,
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

  const handleSelectCity = useCallback(
    (cityName: string) => {
      setSelectedPension(null);
      setMapTargetCity(cityName);
      setSelectedUniversity(null);
      setFilters((prev) => ({ ...prev, city: cityName, query: '' }));
      setCityAndUni({ city: cityName, uni: null });
      navigateTab('map');
    },
    [
      navigateTab,
      setCityAndUni,
      setFilters,
      setMapTargetCity,
      setSelectedPension,
      setSelectedUniversity,
    ],
  );

  const handleSelectUniversity = useCallback(
    (uni: UniversityInfo) => {
      setSelectedPension(null);
      setMapTargetCity(uni.city);
      setSelectedUniversity(uni);
      setFilters((prev) => ({ ...prev, city: uni.city, query: uni.acronym }));
      setCityAndUni({ city: uni.city, uni: uni.acronym });
      navigateTab('map');
    },
    [
      navigateTab,
      setCityAndUni,
      setFilters,
      setMapTargetCity,
      setSelectedPension,
      setSelectedUniversity,
    ],
  );

  const handleClearCity = useCallback(() => {
    setSelectedPension(null);
    setMapTargetCity(null);
    setSelectedUniversity(null);
    clearCity();
    setCityAndUni({ city: null });
  }, [clearCity, setCityAndUni, setMapTargetCity, setSelectedPension, setSelectedUniversity]);

  const handleResetAll = useCallback(() => {
    setSelectedPension(null);
    setMapTargetCity(null);
    setSelectedUniversity(null);
    resetFilters();
    setCityAndUni({ city: null, uni: null });
  }, [resetFilters, setCityAndUni, setMapTargetCity, setSelectedPension, setSelectedUniversity]);

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
        selectedCityName={filters.city ?? mapTargetCity ?? undefined}
        onClearCity={handleClearCity}
        onResetFilters={handleResetAll}
      />

      <div
        className={`w-full flex-1 flex flex-col ${
          activeTab === 'map'
            ? 'h-full overflow-hidden pb-[68px] md:pb-0'
            : 'mx-auto max-w-lg md:max-w-7xl md:px-6 lg:px-8 pb-20 md:pb-12'
        }`}
      >
        <TopSearchBar
          filters={filters}
          onFilterChange={setFilters}
          onOpenFilterDrawer={openFilters}
          selectedCityName={filters.city ?? mapTargetCity ?? undefined}
          onClearCity={handleClearCity}
        />

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
                  selectedCity={filters.city ?? mapTargetCity ?? null}
                  onSelectCity={(city) => {
                    if (city === null) {
                      handleClearCity();
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
                  selectedCity={mapTargetCity ?? filters.city ?? null}
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

export function StudentAppShell({ initialTab = 'explore' }: StudentAppShellProps) {
  return (
    <NavigationProvider initialTab={initialTab}>
      <StudentAppShellWithProviders />
    </NavigationProvider>
  );
}
