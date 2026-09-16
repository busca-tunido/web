'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { cacheStore } from '@/lib/cache-store';

export type UseCachedQueryOptions = {
  ttlMs?: number;
  enabled?: boolean;
};

export type UseCachedQueryResult<T> = {
  data: T | undefined;
  isLoading: boolean;
  isValidating: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export function useCachedQuery<T>(
  key: string | null,
  fetcher: () => Promise<T>,
  options?: UseCachedQueryOptions,
): UseCachedQueryResult<T> {
  const enabled = options?.enabled ?? true;
  const ttlMs = options?.ttlMs ?? 0;

  const initialEntry = key ? cacheStore.get<T>(key) : undefined;
  const isInitialStale = initialEntry ? Date.now() - initialEntry.timestamp > ttlMs : false;

  const [data, setData] = useState<T | undefined>(() => initialEntry?.data);
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    if (!key || !enabled) {
      return false;
    }
    return !initialEntry;
  });
  const [isValidating, setIsValidating] = useState<boolean>(() => {
    if (!key || !enabled) {
      return false;
    }
    return !initialEntry || isInitialStale || initialEntry.isValidating;
  });
  const [error, setError] = useState<string | null>(null);

  const [prevKey, setPrevKey] = useState<string | null>(key);
  if (key !== prevKey) {
    setPrevKey(key);
    if (!key || !enabled) {
      setData(undefined);
      setIsLoading(false);
      setIsValidating(false);
      setError(null);
    } else {
      const entry = cacheStore.get<T>(key);
      if (entry) {
        const isStale = Date.now() - entry.timestamp > ttlMs;
        setData(entry.data);
        setIsLoading(false);
        setIsValidating(isStale || entry.isValidating);
        setError(null);
      } else {
        setData(undefined);
        setIsLoading(true);
        setIsValidating(true);
        setError(null);
      }
    }
  }

  const isMountedRef = useRef<boolean>(true);
  const activeRequestIdRef = useRef<number>(0);
  const fetcherRef = useRef<() => Promise<T>>(fetcher);
  fetcherRef.current = fetcher;

  const dataRef = useRef<T | undefined>(data);
  dataRef.current = data;

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const runFetch = useCallback(
    async (isBackground: boolean): Promise<void> => {
      if (!key || !enabled) {
        return;
      }
      const targetKey = key;
      const requestId = ++activeRequestIdRef.current;
      if (!isBackground) {
        setIsLoading(true);
      }
      setIsValidating(true);
      cacheStore.setValidating(targetKey, true);
      setError(null);

      try {
        const result = await cacheStore.dedupePromise(targetKey, () => fetcherRef.current());
        cacheStore.set(targetKey, result);
        if (requestId !== activeRequestIdRef.current || !isMountedRef.current) {
          return;
        }
        setData(result);
        setError(null);
      } catch (err) {
        if (requestId !== activeRequestIdRef.current || !isMountedRef.current) {
          return;
        }
        const message = err instanceof Error ? err.message : 'Error al cargar datos';
        setError(message);
      } finally {
        if (requestId === activeRequestIdRef.current && isMountedRef.current) {
          setIsLoading(false);
          setIsValidating(false);
          cacheStore.setValidating(targetKey, false);
        }
      }
    },
    [key, enabled],
  );

  useEffect(() => {
    if (!key || !enabled) {
      return;
    }

    const unsubscribe = cacheStore.subscribe(key, () => {
      if (!isMountedRef.current) {
        return;
      }
      const entry = cacheStore.get<T>(key);
      if (entry) {
        setData(entry.data);
        setIsValidating(entry.isValidating);
      } else {
        void runFetch(dataRef.current !== undefined);
      }
    });

    const currentEntry = cacheStore.get<T>(key);
    if (!currentEntry) {
      void runFetch(false);
    } else if (Date.now() - currentEntry.timestamp > ttlMs) {
      void runFetch(true);
    }

    return () => {
      unsubscribe();
    };
  }, [key, enabled, ttlMs, runFetch]);

  const refetch = useCallback(async (): Promise<void> => {
    if (!key || !enabled) {
      return;
    }
    await runFetch(dataRef.current !== undefined);
  }, [key, enabled, runFetch]);

  return {
    data,
    isLoading,
    isValidating,
    error,
    refetch,
  };
}
