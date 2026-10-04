'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { isApiSuccess } from '@/lib/api-response';
import type { PensionItem } from '@/lib/types';
import { pensionsService } from '@/services/pensions.service';

export type LandlordTab = 'pension' | 'rooms' | 'reviews' | 'pensions' | 'account';

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
  activeTab: LandlordTab;
  setActiveTab: (tab: LandlordTab) => void;
  isLoading: boolean;
  error: string | null;
  togglePensionActive: (pensionId: string, isActive: boolean) => Promise<void>;
  refetchPensions: (selectPensionId?: string) => Promise<void>;
  isCreatePensionOpen: boolean;
  setIsCreatePensionOpen: (open: boolean) => void;
  openCreatePensionModal: () => void;
  closeCreatePensionModal: () => void;
  defaultContact: LandlordDefaultContact;
  updateDefaultContact: (contact: Partial<LandlordDefaultContact>) => void;
  getPensionContact: (pensionId: string) => { isCustom: boolean; name: string; phone: string };
  updatePensionCustomContact: (pensionId: string, custom: PensionCustomContact) => void;
};

export type LandlordProviderProps = {
  children: React.ReactNode;
  initialTab?: LandlordTab;
};

const LandlordContext = createContext<LandlordContextValue | null>(null);

export function LandlordProvider({ children, initialTab = 'pension' }: LandlordProviderProps) {
  const [pensions, setPensions] = useState<PensionItem[]>([]);
  const [selectedPension, setSelectedPension] = useState<PensionItem | null>(null);
  const [activeTab, setActiveTab] = useState<LandlordTab>(initialTab);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreatePensionOpen, setIsCreatePensionOpen] = useState(false);
  const [defaultContact, setDefaultContactState] = useState<LandlordDefaultContact>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('buscatunido_landlord_default_contact');
        if (saved) return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return {
      name: 'Propietario Demo',
      phone: '+56 9 8765 4321',
    };
  });
  const [customContacts, setCustomContacts] = useState<Record<string, PensionCustomContact>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('buscatunido_landlord_pension_custom_contacts');
        if (saved) return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return {};
  });

  const updateDefaultContact = useCallback((partial: Partial<LandlordDefaultContact>) => {
    setDefaultContactState((prev) => {
      const updated = { ...prev, ...partial };
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('buscatunido_landlord_default_contact', JSON.stringify(updated));
        } catch {
          // ignore
        }
      }
      return updated;
    });
  }, []);

  const updatePensionCustomContact = useCallback(
    (pensionId: string, custom: PensionCustomContact) => {
      setCustomContacts((prev) => {
        const updated = { ...prev, [pensionId]: custom };
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(
              'buscatunido_landlord_pension_custom_contacts',
              JSON.stringify(updated),
            );
          } catch {
            // ignore
          }
        }
        return updated;
      });
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

  const refetchPensions = useCallback(async (selectPensionId?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await pensionsService.fetchMinePensions();
      if (isApiSuccess(response)) {
        const items = response.data;
        setPensions(items);
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
      } else {
        setError(response.message || 'Error al cargar las pensiones');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar las pensiones');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadInitialPensions = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await pensionsService.fetchMinePensions();
        if (!isMounted) return;
        if (isApiSuccess(response)) {
          const items = response.data;
          setPensions(items);
          setSelectedPension(items[0] ?? null);
        } else {
          setError(response.message || 'Error al cargar las pensiones');
        }
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : 'Error al cargar las pensiones');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadInitialPensions();

    return () => {
      isMounted = false;
    };
  }, []);

  const togglePensionActive = useCallback(
    async (pensionId: string, isActive: boolean) => {
      const previousPensions = pensions;
      const previousSelected = selectedPension;

      setPensions((prev) => prev.map((p) => (p.id === pensionId ? { ...p, isActive } : p)));

      setSelectedPension((prev) => (prev && prev.id === pensionId ? { ...prev, isActive } : prev));

      try {
        const response = await pensionsService.update(pensionId, { isActive });
        if (!isApiSuccess(response)) {
          setPensions(previousPensions);
          setSelectedPension(previousSelected);
          setError(response.message || 'Error al actualizar el estado de la pensión');
        }
      } catch (err) {
        setPensions(previousPensions);
        setSelectedPension(previousSelected);
        setError(
          err instanceof Error ? err.message : 'Error al actualizar el estado de la pensión',
        );
      }
    },
    [pensions, selectedPension],
  );

  const value = useMemo<LandlordContextValue>(
    () => ({
      pensions,
      selectedPension,
      setSelectedPension,
      activeTab,
      setActiveTab,
      isLoading,
      error,
      togglePensionActive,
      refetchPensions,
      isCreatePensionOpen,
      setIsCreatePensionOpen,
      openCreatePensionModal,
      closeCreatePensionModal,
      defaultContact,
      updateDefaultContact,
      getPensionContact,
      updatePensionCustomContact,
    }),
    [
      pensions,
      selectedPension,
      activeTab,
      isLoading,
      error,
      togglePensionActive,
      refetchPensions,
      isCreatePensionOpen,
      openCreatePensionModal,
      closeCreatePensionModal,
      defaultContact,
      updateDefaultContact,
      getPensionContact,
      updatePensionCustomContact,
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
