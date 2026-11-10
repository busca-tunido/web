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
  const isDiscardedRef = useRef<boolean>(false);
  const lastSubstantiveValuesRef = useRef<T | null>(null);
  const fullKey = `buscatunido_draft_${storageKey}`;
  const prevKeyRef = useRef<string>(fullKey);

  const checkIsSubstantive = useCallback(
    (values: T): boolean => {
      if (isSubstantive) {
        return isSubstantive(values, initialValues);
      }
      return Object.keys(values).some(
        (k) => values[k] !== initialValues[k] && values[k] !== '' && values[k] !== undefined,
      );
    },
    [initialValues, isSubstantive],
  );

  const flushDraft = useCallback(
    (values: T | null) => {
      if (!values || isDiscardedRef.current || typeof window === 'undefined') return;
      try {
        if (checkIsSubstantive(values)) {
          window.sessionStorage.setItem(fullKey, JSON.stringify(values));
        }
      } catch {}
    },
    [checkIsSubstantive, fullKey],
  );

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
        flushDraft(lastSubstantiveValuesRef.current);
      }
    };
  }, [flushDraft]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!isEnabled) {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
        flushDraft(lastSubstantiveValuesRef.current);
      }
      dispatch({ type: 'RESET' });
      return;
    }

    if (prevKeyRef.current !== fullKey) {
      prevKeyRef.current = fullKey;
      lastSubstantiveValuesRef.current = null;
      isDiscardedRef.current = false;
      dispatch({ type: 'RESET' });
    }

    try {
      const stored = window.sessionStorage.getItem(fullKey);
      if (stored) {
        const parsed = JSON.parse(stored) as T;
        if (checkIsSubstantive(parsed)) {
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
  }, [checkIsSubstantive, flushDraft, fullKey, isEnabled]);

  useEffect(() => {
    if (!isEnabled || typeof window === 'undefined') return;

    if (checkIsSubstantive(currentValues)) {
      lastSubstantiveValuesRef.current = currentValues;
      isDiscardedRef.current = false;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      flushDraft(lastSubstantiveValuesRef.current);
      debounceTimerRef.current = null;
    }, 600);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [checkIsSubstantive, currentValues, flushDraft, isEnabled]);

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
      isDiscardedRef.current = true;
      lastSubstantiveValuesRef.current = null;
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
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
