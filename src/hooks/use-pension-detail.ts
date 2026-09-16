'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { mapRawPensionToItem } from '@/lib/api-client';
import { isApiSuccess } from '@/lib/api-response';
import type { PensionItem } from '@/lib/types';
import { pensionsService } from '@/services/pensions.service';

export function usePensionDetail(
  pensionId: string | null,
  initialPension?: PensionItem | null,
): {
  livePension: PensionItem | null;
  activePension: PensionItem | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
} {
  const [livePension, setLivePension] = useState<PensionItem | null>(initialPension ?? null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const isMountedRef = useRef<boolean>(true);
  const activeRequestIdRef = useRef<number>(0);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (initialPension) {
      setLivePension(initialPension);
    }
  }, [initialPension]);

  const refetch = useCallback(async (): Promise<void> => {
    if (!pensionId) return;

    const requestId = ++activeRequestIdRef.current;
    setIsLoading(true);
    setError(null);

    try {
      const res = await pensionsService.fetchPensionById(pensionId);
      if (requestId !== activeRequestIdRef.current || !isMountedRef.current) return;

      if (isApiSuccess(res)) {
        const mapped = mapRawPensionToItem(res.data as unknown as Record<string, unknown>);
        setLivePension(mapped);
      } else {
        setError(res.message || 'Error al cargar pensión');
      }
    } catch (err) {
      if (requestId === activeRequestIdRef.current && isMountedRef.current) {
        setError(err instanceof Error ? err.message : 'Error al cargar pensión');
      }
    } finally {
      if (requestId === activeRequestIdRef.current && isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [pensionId]);

  useEffect(() => {
    if (pensionId) {
      refetch();
    }
  }, [pensionId, refetch]);

  const activePension = useMemo(
    () => livePension ?? initialPension ?? null,
    [livePension, initialPension],
  );

  return {
    livePension,
    activePension,
    isLoading,
    error,
    refetch,
  };
}
