'use client';

import { useEffect, useState } from 'react';
import { AccountScreen } from '@/components/account/account-screen';
import { AuthScreen } from '@/components/auth/auth-screen';
import { ExploreScreen } from '@/components/explore/explore-screen';
import { FavoritesScreen } from '@/components/favorites/favorites-screen';
import { HistoryScreen } from '@/components/history/history-screen';
import { BottomNav } from '@/components/layout/bottom-nav';
import { FilterDrawer } from '@/components/layout/filter-drawer';
import { TopSearchBar } from '@/components/layout/top-search-bar';
import { MapScreen } from '@/components/map/map-screen';
import { PensionDetailModal } from '@/components/pensions/pension-detail-modal';
import { fetchCities, fetchPensions, fetchUniversities } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { MOCK_CITIES, MOCK_PENSIONS, MOCK_UNIVERSITIES } from '@/lib/mock-data';
import type { CityInfo, NavTab, PensionItem, SearchFilters, UniversityInfo } from '@/lib/types';

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const [isGuest, setIsGuest] = useState(false);
  const [activeTab, setActiveTab] = useState<NavTab>('explore');
  const [filters, setFilters] = useState<SearchFilters>({ query: '' });
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  const [cities, setCities] = useState<CityInfo[]>(MOCK_CITIES);
  const [universities, setUniversities] = useState<UniversityInfo[]>(MOCK_UNIVERSITIES);
  const [pensions, setPensions] = useState<PensionItem[]>(MOCK_PENSIONS);

  const [selectedPension, setSelectedPension] = useState<PensionItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      const [c, u, p] = await Promise.all([
        fetchCities(),
        fetchUniversities(selectedCity ?? undefined),
        fetchPensions({ ...filters, city: selectedCity ?? undefined }),
      ]);
      setCities(c);
      setUniversities(u);
      setPensions(p);
    }
    loadData();
  }, [filters, selectedCity]);

  const handleSelectCity = (cityName: string) => {
    setSelectedCity(cityName);
    setActiveTab('map');
  };

  const handleSelectUniversity = (uni: UniversityInfo) => {
    setSelectedCity(uni.city);
    setFilters((prev) => ({ ...prev, query: uni.acronym }));
    setActiveTab('map');
  };

  const handleOpenDetail = (pension: PensionItem) => {
    setSelectedPension(pension);
    setIsDetailOpen(true);
  };

  if (!isAuthenticated && !isGuest) {
    return <AuthScreen onContinueAsGuest={() => setIsGuest(true)} />;
  }

  return (
    <main className="relative min-h-screen bg-background text-foreground flex flex-col justify-between transition-colors">
      <div className="mx-auto w-full max-w-lg flex-1 flex flex-col">
        <TopSearchBar
          filters={filters}
          onFilterChange={setFilters}
          onOpenFilterDrawer={() => setIsFilterOpen(true)}
          selectedCityName={selectedCity ?? undefined}
          onClearCity={() => setSelectedCity(null)}
        />

        <div className="flex-1">
          {activeTab === 'explore' && (
            <ExploreScreen
              cities={cities}
              universities={universities}
              featuredPensions={pensions}
              selectedCity={selectedCity}
              onSelectCity={handleSelectCity}
              onSelectUniversity={handleSelectUniversity}
              onSelectPension={handleOpenDetail}
              onNavigateToMap={() => setActiveTab('map')}
            />
          )}

          {activeTab === 'map' && (
            <MapScreen
              pensions={pensions}
              selectedPension={selectedPension}
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

          {activeTab === 'history' && <HistoryScreen onExplore={() => setActiveTab('explore')} />}

          {activeTab === 'account' && <AccountScreen />}
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
