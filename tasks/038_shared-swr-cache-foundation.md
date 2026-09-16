# Task: Shared SWR Cache Foundation (`web/tasks/038_shared-swr-cache-foundation.md`)

## Execution Profile

- **Wave / Batch**: Wave 1
- **Execution Mode**: `PARALLEL`
- **Assigned Role**: `Worker Agent (Web Cache Architecture)`
- **Dependencies (`depends_on`)**: `[]`
- **Collision Risk**: `LOW (Isolated cache library and query hook)`

## Target Files

- **Exclusive**:
  - `src/lib/cache-store.ts`
  - `src/hooks/use-cached-query.ts`

## Objective

Build a lightweight, zero-dependency in-memory stale-while-revalidate (SWR) cache and query deduplication store for the frontend. This prevents duplicate network requests across concurrently mounted components, provides instant data from cache on tab/modal switches, and background revalidates seamlessly.

## Technical Specifications

1. **`src/lib/cache-store.ts`**:
   - Generic in-memory key-value store with timestamp and TTL support:
     ```typescript
     export type CacheEntry<T> = {
       data: T;
       timestamp: number;
       isValidating: boolean;
     };
     ```
   - Methods:
     - `get<T>(key: string): CacheEntry<T> | undefined`
     - `set<T>(key: string, data: T): void`
     - `invalidate(key: string | RegExp): void`
     - `subscribe(key: string, listener: () => void): () => void`
     - `dedupePromise<T>(key: string, fetcher: () => Promise<T>): Promise<T>`

2. **`src/hooks/use-cached-query.ts`**:
   - Signature: `useCachedQuery<T>(key: string | null, fetcher: () => Promise<T>, options?: { ttlMs?: number; enabled?: boolean })`
   - Returns `{ data: T | undefined, isLoading: boolean, isValidating: boolean, error: string | null, refetch: () => Promise<void> }`.
   - On initial mount with cached entry, immediately serves stale data with `isLoading: false`, while triggering a silent background revalidation if older than `ttlMs`.

## Checklist

- [ ] Implement `src/lib/cache-store.ts` with in-flight deduplication and pub/sub.
- [ ] Implement `src/hooks/use-cached-query.ts` supporting stale-while-revalidate.
- [ ] Strict TypeScript typing notation with generics (no `any`).
- [ ] Stage exclusively target files and commit with `feat(cache): implement shared in-memory swr cache store`.
