'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { isApiSuccess } from '@/lib/api-response';
import type { PensionItem } from '@/lib/types';
import { pensionsService } from '@/services/pensions.service';

export type LandlordTab = 'rooms' | 'pension' | 'reviews' | 'account';

export type LandlordContextValue = {
  pensions: PensionItem[];
  selectedPension: PensionItem | null;
  setSelectedPension: (pension: PensionItem) => void;
  activeTab: LandlordTab;
  setActiveTab: (tab: LandlordTab) => void;
  isLoading: boolean;
  error: string | null;
  togglePensionActive: (pensionId: string, isActive: boolean) => Promise<void>;
  refetchPensions: () => Promise<void>;
};

export type LandlordProviderProps = {
  children: React.ReactNode;
  initialTab?: LandlordTab;
};

const LandlordContext = createContext<LandlordContextValue | null>(null);

export function LandlordProvider({
  children,
  initialTab = 'rooms',
}: LandlordProviderProps) {
  const [pensions, setPensions] = useState<PensionItem[]>([]);
  const [selectedPension, setSelectedPension] = useState<PensionItem | null>(null);
  const [activeTab, setActiveTab] = useState<LandlordTab>(initialTab);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetchPensions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await pensionsService.fetchMinePensions();
      if (isApiSuccess(response)) {
        const items = response.data;
        setPensions(items);
        setSelectedPension((current) => {
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
      setError(
        err instanceof Error ? err.message : 'Error al cargar las pensiones',
      );
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
        setError(
          err instanceof Error ? err.message : 'Error al cargar las pensiones',
        );
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

      setPensions((prev) =>
        prev.map((p) => (p.id === pensionId ? { ...p, isActive } : p)),
      );

      setSelectedPension((prev) =>
        prev && prev.id === pensionId ? { ...prev, isActive } : prev,
      );

      try {
        const response = await pensionsService.update(pensionId, { isActive });
        if (!isApiSuccess(response)) {
          setPensions(previousPensions);
          setSelectedPension(previousSelected);
          setError(
            response.message || 'Error al actualizar el estado de la pensión',
          );
        }
      } catch (err) {
        setPensions(previousPensions);
        setSelectedPension(previousSelected);
        setError(
          err instanceof Error
            ? err.message
            : 'Error al actualizar el estado de la pensión',
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
    }),
    [
      pensions,
      selectedPension,
      activeTab,
      isLoading,
      error,
      togglePensionActive,
      refetchPensions,
    ],
  );

  return (
    <LandlordContext.Provider value={value}>
      {children}
    </LandlordContext.Provider>
  );
}

export function useLandlord(): LandlordContextValue {
  const context = useContext(LandlordContext);
  if (!context) {
    throw new Error('useLandlord must be used within a LandlordProvider');
  }
  return context;
}
