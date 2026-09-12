'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { isApiSuccess } from '@/lib/api-response';
import type { StayHistoryItem } from '@/lib/types';
import { staysService } from '@/services/stays.service';

export function formatStayDateRange(
  startDateStr: string,
  endDateStr: string,
  locale = 'es-CL',
): string {
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStays = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await staysService.fetchStudentStays();
      if (isApiSuccess(res)) {
        setStays(res.data);
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
    error,
    pendingReviewStays,
    reviewedStays,
    formatDateRange: formatStayDateRange,
    formatDate: formatStayDate,
    refreshStays: loadStays,
  };
}
