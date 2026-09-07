'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useMemo, useState } from 'react';
import { AccountScreen } from '@/components/account/account-screen';
import { AuthScreen } from '@/components/auth/auth-screen';
import { ExploreScreen } from '@/components/explore/explore-screen';
import { FavoritesScreen } from '@/components/favorites/favorites-screen';
import { HistoryScreen } from '@/components/history/history-screen';
import { BottomNav } from '@/components/layout/bottom-nav';
import { FilterDrawer } from '@/components/layout/filter-drawer';
import { SplashScreen } from '@/components/layout/splash-screen';
import { TopSearchBar } from '@/components/layout/top-search-bar';
import { MapScreen } from '@/components/map/map-screen';
import { PensionDetailModal } from '@/components/pensions/pension-detail-modal';
import { useInfinitePensions } from '@/hooks/use-infinite-pensions';
import { fetchCities, fetchUniversities } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { MOCK_CITIES, MOCK_UNIVERSITIES } from '@/lib/mock-data';
import type { CityInfo, NavTab, PensionItem, SearchFilters, UniversityInfo } from '@/lib/types';
import { sortCitiesWithCurrentFirst, useUserLocation } from '@/lib/use-user-location';

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<NavTab>('explore');
  const [filters, setFilters] = useState<SearchFilters>({ query: '' });
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedUniversity, setSelectedUniversity] = useState<UniversityInfo | null>(null);

  const [cities, setCities] = useState<CityInfo[]>(MOCK_CITIES);
  const [universities, setUniversities] = useState<UniversityInfo[]>(MOCK_UNIVERSITIES);

  const { userLocation, currentCity, requestLocation } = useUserLocation(cities);

  const sortedCities = useMemo(() => {
    return sortCitiesWithCurrentFirst(cities, currentCity);
  }, [cities, currentCity]);

  const [selectedPension, setSelectedPension] = useState<PensionItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const effectiveFilters = useMemo(
    () => ({
      ...filters,
      city: selectedCity ?? undefined,
      universityId: selectedUniversity?.id,
    }),
    [filters, selectedCity, selectedUniversity],
  );

  const {
    items: pensions,
    hasMore,
    isLoading: isLoadingPensions,
    isLoadingMore,
    loadMore: loadMorePensions,
    nearbyCityCounts,
    total: totalPensions,
  } = useInfinitePensions({
    filters: effectiveFilters,
    latitude: userLocation?.latitude,
    longitude: userLocation?.longitude,
    radiusKm: 30,
    sortBy: 'relevance',
  });

  useEffect(() => {
    async function loadMetadata() {
      const [c, u] = await Promise.all([
        fetchCities(),
        fetchUniversities(selectedCity ?? undefined),
      ]);
      setCities(c);
      setUniversities(u);
    }
    loadMetadata();
  }, [selectedCity]);

  const handleSelectCity = (cityName: string) => {
    setSelectedCity(cityName);
    setSelectedUniversity(null);
    setActiveTab('map');
  };

  const handleSelectUniversity = (uni: UniversityInfo) => {
    setSelectedCity(uni.city);
    setSelectedUniversity(uni);
    setFilters((prev) => ({ ...prev, query: uni.acronym }));
    setActiveTab('map');
  };

  const handleOpenDetail = (pension: PensionItem) => {
    setSelectedPension(pension);
    setIsDetailOpen(true);
  };

  const handleResetFilters = () => {
    setSelectedCity(null);
    setSelectedUniversity(null);
    setFilters({ query: '' });
  };

  if (isLoading) {
    return <SplashScreen />;
  }

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  return (
    <main
      className={`relative ${
        activeTab === 'map' ? 'h-dvh overflow-hidden' : 'min-h-screen'
      } bg-background text-foreground flex flex-col justify-between transition-colors`}
    >
      <div
        className={`mx-auto w-full max-w-lg flex-1 flex flex-col ${
          activeTab === 'map' ? 'h-full overflow-hidden pb-[68px]' : 'pb-20'
        }`}
      >
        <TopSearchBar
          filters={filters}
          onFilterChange={setFilters}
          onOpenFilterDrawer={() => setIsFilterOpen(true)}
          selectedCityName={selectedCity ?? undefined}
          onClearCity={() => {
            setSelectedCity(null);
            setSelectedUniversity(null);
          }}
        />

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
                  cities={sortedCities}
                  universities={universities}
                  featuredPensions={pensions}
                  selectedCity={selectedCity}
                  onSelectCity={(city) => {
                    if (city === null) {
                      setSelectedCity(null);
                      setSelectedUniversity(null);
                    } else {
                      handleSelectCity(city);
                    }
                  }}
                  onSelectUniversity={handleSelectUniversity}
                  onSelectPension={handleOpenDetail}
                  onNavigateToMap={() => setActiveTab('map')}
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
                  cities={sortedCities}
                  selectedPension={selectedPension}
                  selectedCity={selectedCity}
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
                  onExplore={() => setActiveTab('explore')}
                />
              )}

              {activeTab === 'history' && (
                <HistoryScreen onExplore={() => setActiveTab('explore')} />
              )}

              {activeTab === 'account' && <AccountScreen />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      <PensionDetailModal
        pension={selectedPension}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      />

      <FilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        onApply={setFilters}
      />
    </main>
  );
}
