'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { isApiSuccess } from '@/lib/api-response';
import { cacheStore } from '@/lib/cache-store';
import { formatChileDate } from '@/lib/format-utils';
import { STUDENT_CACHE_KEYS, STUDENT_CACHE_TTLS } from '@/lib/student-prefetch';
import type { StayHistoryItem } from '@/lib/types';
import { staysService } from '@/services/stays.service';

const SESSION_STAYS_COUNT_KEY = 'tunido_stays_count';
const DEFAULT_EXPECTED_STAYS_COUNT = 3;

function readSessionStaysCount(): number | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(SESSION_STAYS_COUNT_KEY);
    if (raw !== null) {
      const parsed = Number.parseInt(raw, 10);
      if (!Number.isNaN(parsed) && parsed > 0) {
        return parsed;
      }
    }
  } catch {}
  return null;
}

export function formatStayDateRange(
  startDateStr?: string | null,
  endDateStr?: string | null,
  durationCategory?: string | null,
  locale = 'es-CL',
): string {
  if (!startDateStr || !endDateStr) {
    if (durationCategory === 'ONE_SEMESTER') return 'Estadía de 1 semestre';
    if (durationCategory === 'ONE_YEAR') return 'Estadía de 1 año';
    if (durationCategory === 'MORE_THAN_A_YEAR') return 'Estadía de más de 1 año';
    if (durationCategory === 'FEW_WEEKS') return 'Estadía de algunas semanas';
    if (durationCategory === 'FEW_DAYS') return 'Estadía de pocos días';
    return 'Estadía registrada';
  }
  const startFormatted = formatChileDate(
    startDateStr,
    { year: 'numeric', month: 'short', day: 'numeric' },
    startDateStr,
    locale,
  );
  const endFormatted = formatChileDate(
    endDateStr,
    { year: 'numeric', month: 'short', day: 'numeric' },
    endDateStr,
    locale,
  );
  return `${startFormatted} hasta ${endFormatted}`;
}

export function formatStayDate(dateStr: string, locale = 'es-CL'): string {
  return formatChileDate(
    dateStr,
    { year: 'numeric', month: 'long', day: 'numeric' },
    dateStr,
    locale,
  );
}

export function useStayHistory() {
  const initialCached =
    typeof window !== 'undefined'
      ? cacheStore.get<StayHistoryItem[]>(STUDENT_CACHE_KEYS.staysList)
      : undefined;

  const [stays, setStays] = useState<StayHistoryItem[]>(() => initialCached?.data ?? []);
  const [isLoading, setIsLoading] = useState<boolean>(() => !initialCached);
  const [expectedCount, setExpectedCount] = useState<number>(DEFAULT_EXPECTED_STAYS_COUNT);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef<boolean>(true);

  const loadStays = useCallback(async (force = false) => {
    const cached = !force
      ? cacheStore.get<StayHistoryItem[]>(STUDENT_CACHE_KEYS.staysList)
      : undefined;

    if (cached) {
      setStays(cached.data);
      setIsLoading(false);
      if (!cacheStore.isStale(STUDENT_CACHE_KEYS.staysList, STUDENT_CACHE_TTLS.stays)) {
        return;
      }
    } else {
      setIsLoading(true);
    }

    setError(null);
    try {
      const res = await cacheStore.dedupePromise(STUDENT_CACHE_KEYS.staysList, () =>
        staysService.fetchStudentStays(),
      );
      if (!isMountedRef.current) return;

      if (isApiSuccess(res)) {
        const list = Array.isArray(res.data) ? res.data : [];
        cacheStore.set(STUDENT_CACHE_KEYS.staysList, list);
        setStays(list);
        const count = list.length;
        if (count > 0) {
          setExpectedCount(count);
          try {
            sessionStorage.setItem(SESSION_STAYS_COUNT_KEY, String(count));
          } catch {}
        }
      } else if (!cached) {
        setError(res.message);
      }
    } catch {
      if (isMountedRef.current && !cached) {
        setError('Error al cargar historial de estadías');
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    const storedCount = readSessionStaysCount();
    if (storedCount !== null) {
      setExpectedCount(storedCount);
    }
    void loadStays(false);
    const handleRefresh = () => {
      cacheStore.invalidate(STUDENT_CACHE_KEYS.staysList);
      void loadStays(true);
    };
    window.addEventListener('tunido_review_published', handleRefresh);
    return () => {
      isMountedRef.current = false;
      window.removeEventListener('tunido_review_published', handleRefresh);
    };
  }, [loadStays]);

  const pendingReviewStays = useMemo(() => {
    return stays.filter((s) => !s.hasReview);
  }, [stays]);

  const reviewedStays = useMemo(() => {
    return stays.filter((s) => s.hasReview);
  }, [stays]);

  return {
    stays,
    isLoading,
    expectedCount,
    error,
    pendingReviewStays,
    reviewedStays,
    formatDateRange: formatStayDateRange,
    formatDate: formatStayDate,
    refreshStays: () => loadStays(true),
  };
}
