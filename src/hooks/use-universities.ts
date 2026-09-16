'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { isApiSuccess } from '@/lib/api-response';
import { fetchUniversities } from '@/services/universities.service';
import type { UniversityDto } from '@/types/api-contracts';

export const FALLBACK_UNIVERSITIES: UniversityDto[] = [
  {
    id: '00000000-0000-4000-8000-000000000001',
    name: 'Universidad de Chile',
    acronym: 'UCHILE',
    city: 'Santiago',
    latitude: -33.4442,
    longitude: -70.6517,
  },
  {
    id: '00000000-0000-4000-8000-000000000002',
    name: 'Pontificia Universidad Católica de Chile',
    acronym: 'UC',
    city: 'Santiago',
    latitude: -33.4975,
    longitude: -70.6128,
  },
  {
    id: '00000000-0000-4000-8000-000000000003',
    name: 'Universidad de Concepción',
    acronym: 'UdeC',
    city: 'Concepción',
    latitude: -36.8299,
    longitude: -73.0371,
  },
  {
    id: '00000000-0000-4000-8000-000000000004',
    name: 'Universidad Austral de Chile',
    acronym: 'UACh',
    city: 'Valdivia',
    latitude: -39.8166,
    longitude: -73.2425,
  },
];

export function useUniversities(): {
  universities: UniversityDto[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
} {
  const [universities, setUniversities] = useState<UniversityDto[]>(FALLBACK_UNIVERSITIES);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const isMountedRef = useRef<boolean>(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const loadUniversities = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchUniversities();
      if (!isMountedRef.current) return;

      if (isApiSuccess(response) && response.data.length > 0) {
        setUniversities(response.data);
      } else if (!isApiSuccess(response)) {
        setError(response.message);
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err instanceof Error ? err.message : 'Error al cargar universidades');
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadUniversities();
  }, [loadUniversities]);

  return {
    universities,
    isLoading,
    error,
    refetch: loadUniversities,
  };
}
