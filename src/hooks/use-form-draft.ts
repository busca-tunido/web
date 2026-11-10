'use client';

import { useCallback, useEffect, useReducer, useRef } from 'react';
import {
  type DraftStatus,
  draftLifecycleReducer,
  initialDraftLifecycleState,
} from '@/reducers/draft-lifecycle-reducer';

export type UseFormDraftOptions<T extends Record<string, unknown>> = {
  storageKey: string;
  currentValues: T;
  initialValues: T;
  isEnabled?: boolean;
  isSubstantive?: (values: T, initialValues: T) => boolean;
};

export type UseFormDraftReturn<T extends Record<string, unknown>> = {
  hasDraft: boolean;
  isBannerVisible: boolean;
  status: DraftStatus;
  restoreDraft: () => T | null;
  clearDraft: () => void;
  resetDraft: () => void;
};

export function useFormDraft<T extends Record<string, unknown>>({
  storageKey,
  currentValues,
  initialValues,
  isEnabled = true,
  isSubstantive,
}: UseFormDraftOptions<T>): UseFormDraftReturn<T> {
  const [state, dispatch] = useReducer(draftLifecycleReducer, initialDraftLifecycleState);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fullKey = `buscatunido_draft_${storageKey}`;

  useEffect(() => {
    if (!isEnabled || typeof window === 'undefined') return;

    try {
      const stored = window.sessionStorage.getItem(fullKey);
      if (stored) {
        const parsed = JSON.parse(stored) as T;
        const isMeaningful = isSubstantive
          ? isSubstantive(parsed, initialValues)
          : Object.keys(parsed).some(
              (k) => parsed[k] !== initialValues[k] && parsed[k] !== '' && parsed[k] !== undefined,
            );

        if (isMeaningful) {
          dispatch({ type: 'DRAFT_FOUND' });
        } else {
          window.sessionStorage.removeItem(fullKey);
          dispatch({ type: 'RESET' });
        }
      } else {
        dispatch({ type: 'RESET' });
      }
    } catch {
      dispatch({ type: 'RESET' });
    }
  }, [fullKey, initialValues, isEnabled, isSubstantive]);

  useEffect(() => {
    if (!isEnabled || typeof window === 'undefined') return;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      try {
        const isMeaningful = isSubstantive
          ? isSubstantive(currentValues, initialValues)
          : Object.keys(currentValues).some(
              (k) =>
                currentValues[k] !== initialValues[k] &&
                currentValues[k] !== '' &&
                currentValues[k] !== undefined,
            );

        if (isMeaningful) {
          window.sessionStorage.setItem(fullKey, JSON.stringify(currentValues));
        }
      } catch {}
    }, 600);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [currentValues, fullKey, initialValues, isEnabled, isSubstantive]);

  const restoreDraft = useCallback((): T | null => {
    if (typeof window === 'undefined') return null;
    try {
      const stored = window.sessionStorage.getItem(fullKey);
      if (stored) {
        const parsed = JSON.parse(stored) as T;
        dispatch({ type: 'RESTORE' });
        return parsed;
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
      dispatch({ type: 'DISCARD' });
    } catch {}
  }, [fullKey]);

  const resetDraft = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  return {
    hasDraft: state.isBannerVisible,
    isBannerVisible: state.isBannerVisible,
    status: state.status,
    restoreDraft,
    clearDraft,
    resetDraft,
  };
}
