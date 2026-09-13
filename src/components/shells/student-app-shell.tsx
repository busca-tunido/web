'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useMemo, useState } from 'react';
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
import { useStudentPensionsFeed } from '@/hooks/use-student-pensions-feed';
import { useUrlNavigationState } from '@/hooks/use-url-navigation-state';
import type { CityInfo, NavTab, PensionItem, SearchFilters, UniversityInfo } from '@/lib/types';
import { useUserLocation } from '@/lib/use-user-location';

export type StudentAppShellProps = {
  initialTab?: NavTab;
};

export function StudentAppShell({ initialTab = 'explore' }: StudentAppShellProps) {
  const {
    tab: activeTab,
    navigateTab,
    city: urlCity,
    uni: urlUni,
    setCityAndUni,
    pensionId: urlPensionId,
    openPensionDetail,
    closePensionDetail,
    isPensionDetailOpen,
    isFiltersOpen,
    openFilters,
    closeFilters,
  } = useUrlNavigationState({ defaultTab: initialTab });

  const [filters, setFilters] = useState<SearchFilters>(() => ({
    query: urlUni || '',
    city: urlCity || undefined,
  }));
  const [mapTargetCity, setMapTargetCity] = useState<string | null>(urlCity);
  const [selectedUniversity, setSelectedUniversity] = useState<UniversityInfo | null>(null);

  const [tentativeCities, setTentativeCities] = useState<CityInfo[]>([]);
  const { userLocation, currentCity, requestLocation } = useUserLocation(tentativeCities);

  const [selectedPension, setSelectedPension] = useState<PensionItem | null>(null);

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
  }, [urlPensionId, pensions, selectedPension?.id]);

  const handleSelectCity = (cityName: string) => {
    setSelectedPension(null);
    setMapTargetCity(cityName);
    setSelectedUniversity(null);
    setCityAndUni({ city: cityName, uni: null });
    navigateTab('map');
  };

  const handleSelectUniversity = (uni: UniversityInfo) => {
    setSelectedPension(null);
    setMapTargetCity(uni.city);
    setSelectedUniversity(uni);
    setFilters((prev) => ({ ...prev, query: uni.acronym }));
    setCityAndUni({ city: uni.city, uni: uni.acronym });
    navigateTab('map');
  };

  const handleOpenDetail = (pension: PensionItem) => {
    setSelectedPension(pension);
    openPensionDetail(pension.id);
  };

  const handleCloseDetail = () => {
    closePensionDetail();
    setSelectedPension(null);
  };

  const handleResetFilters = () => {
    setSelectedPension(null);
    setMapTargetCity(null);
    setSelectedUniversity(null);
    setFilters({ query: '' });
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
        onClearCity={() => {
          setFilters((prev) => ({ ...prev, city: undefined }));
        }}
        onResetFilters={handleResetFilters}
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
          selectedCityName={filters.city}
          onClearCity={() => {
            setFilters((prev) => ({ ...prev, city: undefined }));
          }}
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
                  onSelectPension={handleOpenDetail}
                  onNavigateToMap={() => navigateTab('map')}
                  hasMore={hasMore}
                  isLoadingMore={isLoadingMore}
                  isLoadingPensions={isLoadingPensions}
                  onLoadMorePensions={loadMorePensions}
                  nearbyCityCounts={nearbyCityCounts}
                  totalPensions={totalPensions}
                  onResetFilters={handleResetFilters}
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
                  onSelectPension={setSelectedPension}
                  onOpenPensionDetail={handleOpenDetail}
                />
              )}

              {activeTab === 'favorites' && (
                <FavoritesScreen
                  allPensions={pensions}
                  onSelectPension={handleOpenDetail}
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
        onClose={handleCloseDetail}
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
