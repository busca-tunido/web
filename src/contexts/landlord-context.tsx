'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { isApiSuccess } from '@/lib/api-response';
import { useAuth } from '@/lib/auth-context';
import { cacheStore } from '@/lib/cache-store';
import {
  AMENITIES_CATALOG_KEY,
  AMENITIES_CATALOG_TTL_MS,
  LANDLORD_PENSIONS_MINE_KEY,
  LANDLORD_PENSIONS_TTL_MS,
  type LandlordInitialData,
  normalizeAmenitiesCatalog,
} from '@/lib/landlord-prefetch';
import {
  getLandlordTabFromPathname,
  getPathnameForLandlordTab,
  type LandlordTab,
} from '@/lib/landlord-routes';
import type { PensionAmenityCatalogItemDto, PensionDetailDto, PensionItem } from '@/lib/types';
import { pensionsService } from '@/services/pensions.service';
import { proposalsService } from '@/services/proposals.service';

export type { LandlordTab };

export type LandlordDefaultContact = {
  name: string;
  phone: string;
};

export type PensionCustomContact = {
  enabled: boolean;
  name: string;
  phone: string;
};

export type LandlordContextValue = {
  pensions: PensionItem[];
  selectedPension: PensionItem | null;
  setSelectedPension: (pension: PensionItem) => void;
  updatePensionInList: (updated: PensionItem | PensionDetailDto) => void;
  activeTab: LandlordTab;
  setActiveTab: (tab: LandlordTab) => void;
  syncTabFromRoute: (tab: LandlordTab) => void;
  isLoading: boolean;
  error: string | null;
  togglePensionActive: (pensionId: string, isActive: boolean) => Promise<void>;
  deletePension: (pensionId: string) => Promise<boolean>;
  refetchPensions: (selectPensionId?: string) => Promise<void>;
  isCreatePensionOpen: boolean;
  setIsCreatePensionOpen: (open: boolean) => void;
  openCreatePensionModal: () => void;
  closeCreatePensionModal: () => void;
  defaultContact: LandlordDefaultContact;
  updateDefaultContact: (contact: Partial<LandlordDefaultContact>) => void;
  getPensionContact: (pensionId: string) => { isCustom: boolean; name: string; phone: string };
  updatePensionCustomContact: (pensionId: string, custom: PensionCustomContact) => void;
  pendingProposalsCount: number;
  refetchProposals: () => Promise<void>;
  amenitiesCatalog: PensionAmenityCatalogItemDto[];
  isLoadingAmenities: boolean;
  refreshAmenities: () => Promise<void>;
};

export type LandlordProviderProps = {
  children: React.ReactNode;
  initialTab?: LandlordTab;
  initialData?: LandlordInitialData;
};

const LandlordContext = createContext<LandlordContextValue | null>(null);

function extractCustomContactsFromPensions(
  items: PensionItem[],
): Record<string, PensionCustomContact> {
  const contacts: Record<string, PensionCustomContact> = {};
  for (const p of items) {
    const raw = p as unknown as { contactName?: string | null; contactPhone?: string | null };
    const hasName = Boolean(raw.contactName && raw.contactName.trim().length > 0);
    const hasPhone = Boolean(raw.contactPhone && raw.contactPhone.trim().length > 0);
    if (hasName || hasPhone) {
      contacts[p.id] = {
        enabled: true,
        name: raw.contactName ?? '',
        phone: raw.contactPhone ?? '',
      };
    }
  }
  return contacts;
}

export function LandlordProvider({
  children,
  initialTab = 'pension',
  initialData,
}: LandlordProviderProps) {
  const hasServerPensions = Array.isArray(initialData?.pensions);
  const hasServerAmenities = Array.isArray(initialData?.amenities);

  const [pensions, setPensions] = useState<PensionItem[]>(() => initialData?.pensions ?? []);
  const [selectedPension, setSelectedPension] = useState<PensionItem | null>(
    () => initialData?.pensions?.[0] ?? null,
  );
  const [activeTab, setActiveTabState] = useState<LandlordTab>(initialTab);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/landlord')) {
      const fromPath = getLandlordTabFromPathname(window.location.pathname);
      if (fromPath && fromPath !== initialTab) {
        setActiveTabState(fromPath);
      }
    }
  }, [initialTab]);

  const syncTabFromRoute = useCallback((tab: LandlordTab) => {
    setActiveTabState(tab);
  }, []);

  const setActiveTab = useCallback((tab: LandlordTab) => {
    setActiveTabState(tab);
    if (typeof window !== 'undefined') {
      const targetPath = getPathnameForLandlordTab(tab);
      if (window.location.pathname !== targetPath) {
        window.history.pushState(null, '', targetPath);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handlePopState = () => {
      if (window.location.pathname.startsWith('/landlord')) {
        const fromPath = getLandlordTabFromPathname(window.location.pathname);
        if (fromPath) {
          setActiveTabState(fromPath);
        }
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const [isLoading, setIsLoading] = useState(!hasServerPensions);
  const [error, setError] = useState<string | null>(null);
  const [isCreatePensionOpen, setIsCreatePensionOpen] = useState(false);
  const { user } = useAuth();
  const [defaultContact, setDefaultContactState] = useState<LandlordDefaultContact>(() => {
    if (!user) return { name: '', phone: '' };
    return {
      name: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim(),
      phone: user.phone ?? '',
    };
  });

  useEffect(() => {
    if (user) {
      setDefaultContactState((prev) => {
        const fallbackName = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
        const fallbackPhone = user.phone ?? '';
        return {
          name: prev.name || fallbackName,
          phone: prev.phone || fallbackPhone,
        };
      });
    }
  }, [user]);

  const [customContacts, setCustomContacts] = useState<Record<string, PensionCustomContact>>(() =>
    initialData?.pensions ? extractCustomContactsFromPensions(initialData.pensions) : {},
  );

  const [amenitiesCatalog, setAmenitiesCatalog] = useState<PensionAmenityCatalogItemDto[]>(
    () => initialData?.amenities ?? [],
  );
  const [isLoadingAmenities, setIsLoadingAmenities] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('buscatunido_landlord_default_contact');
        localStorage.removeItem('buscatunido_landlord_pension_custom_contacts');
      } catch {}
    }
  }, []);

  const [proposalCountOverrides, setProposalCountOverrides] = useState<Record<string, number>>({});

  const pendingProposalsCount = useMemo(() => {
    if (!selectedPension?.id) return 0;
    if (selectedPension.id in proposalCountOverrides) {
      return proposalCountOverrides[selectedPension.id];
    }
    return selectedPension.pendingProposalsCount ?? selectedPension._count?.proposals ?? 0;
  }, [selectedPension, proposalCountOverrides]);

  const refetchProposals = useCallback(async () => {
    if (!selectedPension?.id) {
      return;
    }
    try {
      const res = await proposalsService.fetchPensionProposals(selectedPension.id, 'PENDING');
      if (isApiSuccess(res)) {
        const pending = (res.data ?? []).length;
        setProposalCountOverrides((prev) => ({
          ...prev,
          [selectedPension.id]: pending,
        }));
      }
    } catch {
      // ignore
    }
  }, [selectedPension?.id]);

  const refreshAmenities = useCallback(async () => {
    const cached = cacheStore.get<PensionAmenityCatalogItemDto[]>(AMENITIES_CATALOG_KEY);
    if (
      cached &&
      cached.data.length > 0 &&
      !cacheStore.isStale(AMENITIES_CATALOG_KEY, AMENITIES_CATALOG_TTL_MS)
    ) {
      setAmenitiesCatalog(cached.data);
      return;
    }
    if (!cached) {
      setIsLoadingAmenities(true);
    }
    try {
      const res = await cacheStore.dedupePromise(AMENITIES_CATALOG_KEY, () =>
        pensionsService.fetchAmenitiesCatalog(),
      );
      if (isApiSuccess(res) && Array.isArray(res.data)) {
        const normalized = normalizeAmenitiesCatalog(res.data);
        setAmenitiesCatalog(normalized);
        if (normalized.length > 0) {
          cacheStore.set(AMENITIES_CATALOG_KEY, normalized);
        }
      }
    } catch {
      // ignore
    } finally {
      setIsLoadingAmenities(false);
    }
  }, []);

  const updateDefaultContact = useCallback((partial: Partial<LandlordDefaultContact>) => {
    setDefaultContactState((prev) => ({
      ...prev,
      ...partial,
    }));
  }, []);

  const updatePensionCustomContact = useCallback(
    (pensionId: string, custom: PensionCustomContact) => {
      setCustomContacts((prev) => ({
        ...prev,
        [pensionId]: custom,
      }));
    },
    [],
  );

  const getPensionContact = useCallback(
    (pensionId: string) => {
      const custom = customContacts[pensionId];
      if (custom?.enabled) {
        return {
          isCustom: true,
          name: custom.name,
          phone: custom.phone,
        };
      }
      return {
        isCustom: false,
        name: defaultContact.name,
        phone: defaultContact.phone,
      };
    },
    [customContacts, defaultContact],
  );

  const openCreatePensionModal = useCallback(() => {
    setIsCreatePensionOpen(true);
  }, []);

  const closeCreatePensionModal = useCallback(() => {
    setIsCreatePensionOpen(false);
  }, []);

  const applyPensionsList = useCallback((items: PensionItem[], selectPensionId?: string) => {
    setPensions(items);
    setCustomContacts(extractCustomContactsFromPensions(items));
    setSelectedPension((current) => {
      if (selectPensionId) {
        const target = items.find((p) => p.id === selectPensionId);
        if (target) return target;
      }
      if (!current) {
        return items[0] ?? null;
      }
      const matched = items.find((p) => p.id === current.id);
      return matched ?? items[0] ?? null;
    });
  }, []);

  const refetchPensions = useCallback(
    async (selectPensionId?: string) => {
      const hasExisting = pensions.length > 0;
      if (!hasExisting) {
        setIsLoading(true);
      }
      setError(null);
      try {
        const response = await pensionsService.fetchMinePensions();
        if (isApiSuccess(response)) {
          const items = response.data;
          cacheStore.set(LANDLORD_PENSIONS_MINE_KEY, items);
          applyPensionsList(items, selectPensionId);
        } else {
          setError(response.message || 'Error al cargar las pensiones');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar las pensiones');
      } finally {
        setIsLoading(false);
      }
    },
    [applyPensionsList, pensions.length],
  );

  const seededServerRef = useRef(false);
  useEffect(() => {
    if (seededServerRef.current) return;
    seededServerRef.current = true;
    if (hasServerAmenities && initialData?.amenities && initialData.amenities.length > 0) {
      cacheStore.set(AMENITIES_CATALOG_KEY, initialData.amenities);
    }
  }, [hasServerAmenities, initialData?.amenities]);

  useEffect(() => {
    if (hasServerPensions && initialData?.pensions) {
      cacheStore.set(LANDLORD_PENSIONS_MINE_KEY, initialData.pensions);
      return;
    }

    let isMounted = true;

    const loadInitialPensions = async () => {
      const cached = cacheStore.get<PensionItem[]>(LANDLORD_PENSIONS_MINE_KEY);
      if (cached) {
        applyPensionsList(cached.data);
        setIsLoading(false);
        if (!cacheStore.isStale(LANDLORD_PENSIONS_MINE_KEY, LANDLORD_PENSIONS_TTL_MS)) {
          return;
        }
      } else {
        setIsLoading(true);
      }
      setError(null);
      try {
        const response = await cacheStore.dedupePromise(LANDLORD_PENSIONS_MINE_KEY, () =>
          pensionsService.fetchMinePensions(),
        );
        if (!isMounted) return;
        if (isApiSuccess(response)) {
          const items = response.data;
          cacheStore.set(LANDLORD_PENSIONS_MINE_KEY, items);
          applyPensionsList(items);
        } else if (!cached) {
          setError(response.message || 'Error al cargar las pensiones');
        }
      } catch (err) {
        if (!isMounted) return;
        if (!cached) {
          setError(err instanceof Error ? err.message : 'Error al cargar las pensiones');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadInitialPensions();

    return () => {
      isMounted = false;
    };
  }, [hasServerPensions, initialData?.pensions, applyPensionsList]);

  const togglePensionActive = useCallback(
    async (pensionId: string, isActive: boolean) => {
      const previousPensions = pensions;
      const previousSelected = selectedPension;
      const nextPensions = pensions.map((p) => (p.id === pensionId ? { ...p, isActive } : p));

      setPensions(nextPensions);
      setSelectedPension((prev) => (prev && prev.id === pensionId ? { ...prev, isActive } : prev));
      cacheStore.set(LANDLORD_PENSIONS_MINE_KEY, nextPensions);

      try {
        const response = await pensionsService.update(pensionId, { isActive });
        if (!isApiSuccess(response)) {
          setPensions(previousPensions);
          setSelectedPension(previousSelected);
          cacheStore.set(LANDLORD_PENSIONS_MINE_KEY, previousPensions);
          setError(response.message || 'Error al actualizar el estado de la pensión');
        }
      } catch (err) {
        setPensions(previousPensions);
        setSelectedPension(previousSelected);
        cacheStore.set(LANDLORD_PENSIONS_MINE_KEY, previousPensions);
        setError(
          err instanceof Error ? err.message : 'Error al actualizar el estado de la pensión',
        );
      }
    },
    [pensions, selectedPension],
  );

  const updatePensionInList = useCallback((updated: PensionItem | PensionDetailDto) => {
    setPensions((prev) => {
      const next = prev.map((p) =>
        p.id === updated.id ? ({ ...p, ...updated } as PensionItem) : p,
      );
      cacheStore.set(LANDLORD_PENSIONS_MINE_KEY, next);
      return next;
    });
    setSelectedPension((prev) =>
      prev && prev.id === updated.id ? ({ ...prev, ...updated } as PensionItem) : prev,
    );
    const raw = updated as unknown as {
      contactName?: string | null;
      contactPhone?: string | null;
    };
    const hasName = Boolean(raw.contactName && raw.contactName.trim().length > 0);
    const hasPhone = Boolean(raw.contactPhone && raw.contactPhone.trim().length > 0);
    if (hasName || hasPhone) {
      setCustomContacts((prev) => ({
        ...prev,
        [updated.id]: {
          enabled: true,
          name: raw.contactName ?? '',
          phone: raw.contactPhone ?? '',
        },
      }));
    }
  }, []);

  const deletePension = useCallback(
    async (pensionId: string): Promise<boolean> => {
      try {
        const response = await pensionsService.deletePension(pensionId);
        if (isApiSuccess(response)) {
          const remaining = pensions.filter((p) => p.id !== pensionId);
          setPensions(remaining);
          cacheStore.set(LANDLORD_PENSIONS_MINE_KEY, remaining);
          setSelectedPension((current) => {
            if (current && current.id === pensionId) {
              return remaining[0] ?? null;
            }
            return current;
          });
          setCustomContacts((prev) => {
            const next = { ...prev };
            delete next[pensionId];
            return next;
          });
          void refetchProposals();
          return true;
        }
        setError(response.message || 'Error al eliminar la pensión');
        return false;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al eliminar la pensión');
        return false;
      }
    },
    [pensions, refetchProposals],
  );

  const value = useMemo<LandlordContextValue>(
    () => ({
      pensions,
      selectedPension,
      setSelectedPension,
      updatePensionInList,
      activeTab,
      setActiveTab,
      syncTabFromRoute,
      isLoading,
      error,
      togglePensionActive,
      deletePension,
      refetchPensions,
      isCreatePensionOpen,
      setIsCreatePensionOpen,
      openCreatePensionModal,
      closeCreatePensionModal,
      defaultContact,
      updateDefaultContact,
      getPensionContact,
      updatePensionCustomContact,
      pendingProposalsCount,
      refetchProposals,
      amenitiesCatalog,
      isLoadingAmenities,
      refreshAmenities,
    }),
    [
      pensions,
      selectedPension,
      updatePensionInList,
      activeTab,
      setActiveTab,
      syncTabFromRoute,
      isLoading,
      error,
      togglePensionActive,
      deletePension,
      refetchPensions,
      isCreatePensionOpen,
      openCreatePensionModal,
      closeCreatePensionModal,
      defaultContact,
      updateDefaultContact,
      getPensionContact,
      updatePensionCustomContact,
      pendingProposalsCount,
      refetchProposals,
      amenitiesCatalog,
      isLoadingAmenities,
      refreshAmenities,
    ],
  );

  return <LandlordContext.Provider value={value}>{children}</LandlordContext.Provider>;
}

export function useOptionalLandlord(): LandlordContextValue | null {
  return useContext(LandlordContext);
}

export function useLandlord(): LandlordContextValue {
  const context = useContext(LandlordContext);
  if (!context) {
    throw new Error('useLandlord must be used within a LandlordProvider');
  }
  return context;
}
