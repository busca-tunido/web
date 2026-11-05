'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { isApiSuccess } from '@/lib/api-response';
import type { StayHistoryItem } from '@/lib/types';
import { staysService } from '@/services/stays.service';

const SESSION_STAYS_COUNT_KEY = 'tunido_stays_count';

function getInitialExpectedCount(): number {
  if (typeof window === 'undefined') return 3;
  try {
    const raw = sessionStorage.getItem(SESSION_STAYS_COUNT_KEY);
    if (raw !== null) {
      const parsed = Number.parseInt(raw, 10);
      if (!Number.isNaN(parsed) && parsed > 0) {
        return parsed;
      }
    }
  } catch {}
  return 3;
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
  const formatter = new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  const startFormatted = Number.isNaN(start.getTime()) ? startDateStr : formatter.format(start);
  const endFormatted = Number.isNaN(end.getTime()) ? endDateStr : formatter.format(end);
  return `${startFormatted} hasta ${endFormatted}`;
}

export function formatStayDate(dateStr: string, locale = 'es-CL'): string {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) {
    return dateStr;
  }
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function useStayHistory() {
  const [stays, setStays] = useState<StayHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [expectedCount, setExpectedCount] = useState<number>(getInitialExpectedCount);
  const [error, setError] = useState<string | null>(null);

  const loadStays = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await staysService.fetchStudentStays();
      if (isApiSuccess(res)) {
        setStays(res.data);
        const count = res.data.length;
        if (count > 0) {
          setExpectedCount(count);
          try {
            sessionStorage.setItem(SESSION_STAYS_COUNT_KEY, String(count));
          } catch {}
        }
      } else {
        setError(res.message);
      }
    } catch {
      setError('Error al cargar historial de estadías');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStays();
    const handleRefresh = () => {
      loadStays();
    };
    window.addEventListener('tunido_review_published', handleRefresh);
    return () => {
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
    refreshStays: loadStays,
  };
}
