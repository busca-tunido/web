# Task: Adopt SWR Cache and Pagination in Custom Hooks (`web/tasks/040_adopt-cache-in-hooks.md`)

## Execution Profile

- **Wave / Batch**: Wave 2
- **Execution Mode**: `PARALLEL`
- **Assigned Role**: `Worker Agent (Web Hooks)`
- **Dependencies (`depends_on`)**: `[038_shared-swr-cache-foundation.md, 039_reviews-pagination-client-sync.md]`
- **Collision Risk**: `LOW (Isolated custom hooks directory)`

## Target Files

- **Exclusive**:
  - `src/hooks/use-pension-detail.ts`
  - `src/hooks/use-pension-reviews.ts`
  - `src/hooks/use-universities.ts`

## Objective

Integrate the shared SWR cache and native server-side pagination into `usePensionDetail`, `usePensionReviews`, and `useUniversities`. This eliminates redundant requests when opening the same pension detail or reviews multiple times, synchronizes reviews across preview and full reviews modal, provides pagination controls, and invalidates cached reviews upon publishing.

## Technical Specifications

### 1. `src/hooks/use-pension-detail.ts`
- Cache key: `pension:detail:${pensionId}`.
- Serve cached pension instantly if available, background revalidating if older than 5 minutes.
- Deduplicate concurrent fetch requests during modal open animations.

### 2. `src/hooks/use-pension-reviews.ts`
- Cache key: `pension:reviews:${pensionId}:${page}`.
- Support pagination parameters: `page?: number`, `limit?: number`.
- Expose metadata: `totalReviews: number`, `currentPage: number`, `hasMore: boolean`, `fetchNextPage: () => Promise<void>`.
- When `publishReview` succeeds, invalidate or optimistically update the cache key so preview and full reviews modals update synchronously.
- When `voteHelpful` is triggered, optimistically update cached review vote counts.

### 3. `src/hooks/use-universities.ts`
- Cache key: `metadata:universities`.
- Global 1-hour cache TTL so universities are fetched at most once per session.

## Checklist

- [ ] Connect `usePensionDetail` to `cacheStore`.
- [ ] Connect `usePensionReviews` to `cacheStore` with cache invalidation on review creation.
- [ ] Expose pagination state (`totalReviews`, `currentPage`, `hasMore`, `fetchNextPage`) in `usePensionReviews`.
- [ ] Connect `useUniversities` to `cacheStore` with 1-hour TTL.
- [ ] Strict TypeScript typing with no `any`.
- [ ] Do NOT execute slow commands (`pnpm build`, `tsc`, `biome`).
- [ ] Stage exclusively target files and commit with `feat(hooks): integrate shared swr cache and pagination in data hooks`.
