'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { isApiSuccess } from '@/lib/api-response';
import { cacheStore } from '@/lib/cache-store';
import type { FavoritePensionSummaryDto, PensionItem } from '@/lib/types';
import { pensionsService } from '@/services/pensions.service';

const PENSION_DETAIL_TTL_MS = 60_000;

function isFullPensionDetail(pension?: PensionItem | FavoritePensionSummaryDto | null): boolean {
  if (!pension) return false;
  if (!('description' in pension)) return false;
  if (!pension.description || pension.description.trim().length === 0) return false;
  const expectedRooms = pension._count?.rooms ?? 0;
  if (expectedRooms > 0 && (!pension.rooms || pension.rooms.length === 0)) {
    return false;
  }
  return true;
}

export function usePensionDetail(
  pensionId: string | null,
  initialPension?: PensionItem | FavoritePensionSummaryDto | null,
): {
  livePension: PensionItem | FavoritePensionSummaryDto | null;
  activePension: PensionItem | FavoritePensionSummaryDto | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
} {
  const cachedEntry = pensionId
    ? cacheStore.get<PensionItem | FavoritePensionSummaryDto>(`pension:detail:${pensionId}`)
    : undefined;

  const [livePension, setLivePension] = useState<PensionItem | FavoritePensionSummaryDto | null>(
    () => cachedEntry?.data ?? initialPension ?? null,
  );
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
    if (!pensionId) return;
    const cached = cacheStore.get<PensionItem | FavoritePensionSummaryDto>(
      `pension:detail:${pensionId}`,
    );
    if (cached && !cacheStore.isStale(`pension:detail:${pensionId}`, PENSION_DETAIL_TTL_MS)) {
      setLivePension(cached.data);
    } else if (initialPension) {
      setLivePension(initialPension);
    }
  }, [pensionId, initialPension]);

  const refetch = useCallback(async (): Promise<void> => {
    if (!pensionId) return;

    const requestId = ++activeRequestIdRef.current;
    setIsLoading(true);
    setError(null);

    try {
      const res = await cacheStore.dedupePromise(`pension:detail:${pensionId}`, () =>
        pensionsService.fetchPensionById(pensionId),
      );
      if (requestId !== activeRequestIdRef.current || !isMountedRef.current) return;

      if (isApiSuccess(res)) {
        cacheStore.set(`pension:detail:${pensionId}`, res.data);
        setLivePension(res.data);
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
    if (!pensionId) return;

    const cacheKey = `pension:detail:${pensionId}`;
    const hasFreshCache =
      cacheStore.has(cacheKey) && !cacheStore.isStale(cacheKey, PENSION_DETAIL_TTL_MS);

    if (hasFreshCache) {
      return;
    }

    if (isFullPensionDetail(initialPension)) {
      cacheStore.set(cacheKey, initialPension);
      return;
    }

    refetch();
  }, [pensionId, initialPension, refetch]);

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
