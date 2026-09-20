'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { type UrlNavigationState, useUrlNavigationState } from '@/hooks/use-url-navigation-state';
import type { NavTab, PensionItem, UniversityInfo } from '@/lib/types';

export type NavigationContextType = {
  activeTab: NavTab;
  navigateTab: (tab: NavTab) => void;
  selectedPension: PensionItem | null;
  selectPension: (pension: PensionItem | null) => void;
  setSelectedPension: React.Dispatch<React.SetStateAction<PensionItem | null>>;
  mapTargetCity: string | null;
  setMapTargetCity: React.Dispatch<React.SetStateAction<string | null>>;
  selectedUniversity: UniversityInfo | null;
  setSelectedUniversity: React.Dispatch<React.SetStateAction<UniversityInfo | null>>;
  isPensionDetailOpen: boolean;
  openPensionDetail: (pension: PensionItem) => void;
  closePensionDetail: () => void;
  isFiltersOpen: boolean;
  openFilters: () => void;
  closeFilters: () => void;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  urlCity: string | null;
  urlUni: string | null;
  urlPensionId: string | null;
  setCityAndUni: (
    params: { city?: string | null; uni?: string | null },
    options?: { push?: boolean },
  ) => void;
  handleSelectCity: (cityName: string) => void;
};

export type NavigationProviderProps = {
  children: React.ReactNode;
  initialTab?: NavTab;
  initialNavigationState?: Partial<UrlNavigationState>;
};

const NavigationContext = createContext<NavigationContextType | null>(null);

export function NavigationProvider({
  children,
  initialTab = 'explore',
  initialNavigationState,
}: NavigationProviderProps) {
  const {
    tab: activeTab,
    navigateTab,
    city: urlCity,
    uni: urlUni,
    setCityAndUni,
    pensionId: urlPensionId,
    openPensionDetail: openDetailByUrl,
    closePensionDetail: closeDetailByUrl,
    isPensionDetailOpen,
    isFiltersOpen,
    openFilters,
    closeFilters,
  } = useUrlNavigationState({
    defaultTab: initialTab,
    initialState: initialNavigationState,
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const openAuthModal = useCallback(() => setIsAuthModalOpen(true), []);
  const closeAuthModal = useCallback(() => setIsAuthModalOpen(false), []);

  const [mapTargetCity, setMapTargetCity] = useState<string | null>(urlCity);
  const [selectedUniversity, setSelectedUniversity] = useState<UniversityInfo | null>(null);
  const [selectedPension, setSelectedPension] = useState<PensionItem | null>(null);

  const selectPension = useCallback((pension: PensionItem | null) => {
    setSelectedPension(pension);
  }, []);

  const openPensionDetail = useCallback(
    (pension: PensionItem) => {
      setSelectedPension(pension);
      openDetailByUrl(pension.id);
    },
    [openDetailByUrl],
  );

  const closePensionDetail = useCallback(() => {
    closeDetailByUrl();
    setSelectedPension(null);
  }, [closeDetailByUrl]);

  const handleSelectCity = useCallback(
    (cityName: string) => {
      setSelectedPension(null);
      setMapTargetCity(cityName);
      setSelectedUniversity(null);
      setCityAndUni({ city: cityName, uni: null });
      navigateTab('map');
    },
    [navigateTab, setCityAndUni],
  );

  const value = useMemo<NavigationContextType>(
    () => ({
      activeTab,
      navigateTab,
      selectedPension,
      selectPension,
      setSelectedPension,
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
      urlCity,
      urlUni,
      urlPensionId,
      setCityAndUni,
      handleSelectCity,
    }),
    [
      activeTab,
      navigateTab,
      selectedPension,
      selectPension,
      mapTargetCity,
      selectedUniversity,
      isPensionDetailOpen,
      openPensionDetail,
      closePensionDetail,
      isFiltersOpen,
      openFilters,
      closeFilters,
      isAuthModalOpen,
      openAuthModal,
      closeAuthModal,
      urlCity,
      urlUni,
      urlPensionId,
      setCityAndUni,
      handleSelectCity,
    ],
  );

  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>;
}

export function useOptionalNavigation(): NavigationContextType | null {
  return useContext(NavigationContext);
}

export function useNavigation(): NavigationContextType {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}
