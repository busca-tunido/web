'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export function useFormDraft<T extends Record<string, unknown>>(
  storageKey: string,
  currentValues: T,
  initialValues: T,
  isEnabled = true,
): {
  hasDraft: boolean;
  restoreDraft: () => T | null;
  clearDraft: () => void;
} {
  const [hasDraft, setHasDraft] = useState(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fullKey = `buscatunido_draft_${storageKey}`;

  useEffect(() => {
    if (!isEnabled || typeof window === 'undefined') return;
    try {
      const stored = window.sessionStorage.getItem(fullKey);
      if (stored) {
        const parsed = JSON.parse(stored) as Record<string, unknown>;
        const isDifferentFromInitial = Object.keys(parsed).some(
          (k) => parsed[k] !== initialValues[k] && parsed[k] !== '' && parsed[k] !== undefined,
        );
        setHasDraft(isDifferentFromInitial);
      }
    } catch {
      setHasDraft(false);
    }
  }, [fullKey, initialValues, isEnabled]);

  useEffect(() => {
    if (!isEnabled || typeof window === 'undefined') return;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      try {
        const isDifferent = Object.keys(currentValues).some(
          (k) =>
            currentValues[k] !== initialValues[k] &&
            currentValues[k] !== '' &&
            currentValues[k] !== undefined,
        );
        if (isDifferent) {
          window.sessionStorage.setItem(fullKey, JSON.stringify(currentValues));
          setHasDraft(true);
        }
      } catch {}
    }, 600);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [currentValues, fullKey, initialValues, isEnabled]);

  const restoreDraft = useCallback((): T | null => {
    if (typeof window === 'undefined') return null;
    try {
      const stored = window.sessionStorage.getItem(fullKey);
      if (stored) {
        return JSON.parse(stored) as T;
      }
    } catch {
      return null;
    }
    return null;
  }, [fullKey]);

  const clearDraft = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      window.sessionStorage.removeItem(fullKey);
      setHasDraft(false);
    } catch {}
  }, [fullKey]);

  return {
    hasDraft,
    restoreDraft,
    clearDraft,
  };
}
