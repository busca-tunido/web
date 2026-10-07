'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { isApiSuccess } from '@/lib/api-response';
import { fetchUniversities } from '@/services/universities.service';
import type { UniversityDto } from '@/types/api-contracts';

export function useUniversities(): {
  universities: UniversityDto[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
} {
  const [universities, setUniversities] = useState<UniversityDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
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

      if (isApiSuccess(response) && Array.isArray(response.data) && response.data.length > 0) {
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
