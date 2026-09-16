export type CacheEntry<T> = {
  data: T;
  timestamp: number;
  isValidating: boolean;
};

export class CacheStore {
  private store = new Map<string, CacheEntry<unknown>>();
  private inFlightPromises = new Map<string, Promise<unknown>>();
  private subscribers = new Map<string, Set<() => void>>();

  get<T>(key: string): CacheEntry<T> | undefined {
    return this.store.get(key) as CacheEntry<T> | undefined;
  }

  set<T>(key: string, data: T, isValidating = false): void {
    this.store.set(key, {
      data,
      timestamp: Date.now(),
      isValidating,
    });
    this.notify(key);
  }

  setValidating(key: string, isValidating: boolean): void {
    const entry = this.store.get(key);
    if (entry) {
      entry.isValidating = isValidating;
      this.notify(key);
    }
  }

  isStale(key: string, ttlMs: number): boolean {
    const entry = this.store.get(key);
    if (!entry) {
      return true;
    }
    return Date.now() - entry.timestamp > ttlMs;
  }

  invalidate(key: string | RegExp): void {
    if (typeof key === 'string') {
      this.store.delete(key);
      this.notify(key);
      return;
    }

    const matchedKeys: string[] = [];
    for (const storedKey of this.store.keys()) {
      if (key.test(storedKey)) {
        matchedKeys.push(storedKey);
      }
    }
    for (const subKey of this.subscribers.keys()) {
      if (key.test(subKey) && !matchedKeys.includes(subKey)) {
        matchedKeys.push(subKey);
      }
    }
    for (const matchedKey of matchedKeys) {
      this.store.delete(matchedKey);
      this.notify(matchedKey);
    }
  }

  subscribe(key: string, listener: () => void): () => void {
    let listeners = this.subscribers.get(key);
    if (!listeners) {
      listeners = new Set();
      this.subscribers.set(key, listeners);
    }
    listeners.add(listener);

    return () => {
      const currentListeners = this.subscribers.get(key);
      if (currentListeners) {
        currentListeners.delete(listener);
        if (currentListeners.size === 0) {
          this.subscribers.delete(key);
        }
      }
    };
  }

  dedupePromise<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    const existing = this.inFlightPromises.get(key);
    if (existing) {
      return existing as Promise<T>;
    }

    const promise = (async () => {
      try {
        return await fetcher();
      } finally {
        this.inFlightPromises.delete(key);
      }
    })();

    this.inFlightPromises.set(key, promise);
    return promise;
  }

  has(key: string): boolean {
    return this.store.has(key);
  }

  clear(): void {
    const keys: string[] = [];
    for (const key of this.store.keys()) {
      keys.push(key);
    }
    for (const subKey of this.subscribers.keys()) {
      if (!keys.includes(subKey)) {
        keys.push(subKey);
      }
    }
    this.store.clear();
    this.inFlightPromises.clear();
    for (const key of keys) {
      this.notify(key);
    }
  }

  private notify(key: string): void {
    const listeners = this.subscribers.get(key);
    if (listeners) {
      for (const listener of Array.from(listeners)) {
        listener();
      }
    }
  }
}

export const cacheStore = new CacheStore();
