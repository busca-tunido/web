# Task: Create Detail and Reviews Custom Hooks (`web/tasks/031_create-detail-and-reviews-hooks.md`)

## Execution Profile

- **Wave / Batch**: Wave 1
- **Execution Mode**: `PARALLEL`
- **Assigned Role**: `Worker Agent (Hooks Detail & Reviews)`
- **Dependencies (`depends_on`)**: `[]`
- **Collision Risk**: `LOW (Isolated custom hooks directory)`

## Target Files

- **Exclusive**:
  - `src/hooks/use-pension-detail.ts`
  - `src/hooks/use-pension-reviews.ts`

## Objective

Create `usePensionDetail` and enhance `usePensionReviews` to encapsulate all live pension fetching, review loading, rating calculations, review creation, and helpful voting outside of React components.

## Technical Specifications

1. **`src/hooks/use-pension-detail.ts`**:
   - Signature: `usePensionDetail(pensionId: string | null, initialPension?: PensionItem | null)`
   - State: `livePension: PensionItem | null`, `isLoading: boolean`, `error: string | null`.
   - `activePension`: memoized `livePension ?? initialPension ?? null`.
   - Automatically fetch fresh details from `pensionsService.fetchPensionById(targetId)` with mount safety.
   - Return `{ livePension, activePension, isLoading, error, refetch }`.

2. **`src/hooks/use-pension-reviews.ts`**:
   - Signature: `usePensionReviews(pensionId: string | null, fallbackRating?: { average: number; count: number })`
   - Map `reviewsService.fetchPensionReviews` into strongly typed `PensionReview[]`.
   - Compute `ratingStats: { average: number; count: number }` from fetched reviews. If no reviews exist, fall back to pension's initial stats.
   - Return `{ reviews, ratingStats, isLoading, error, refetch, publishReview, voteHelpful, userVotes }`.

## Checklist

- [ ] Create `src/hooks/use-pension-detail.ts`.
- [ ] Enhance `src/hooks/use-pension-reviews.ts` to expose `PensionReview[]` and `ratingStats`.
- [ ] Strict typing with standard TypeScript notations (no `any`).
- [ ] No console errors or unhandled promises.
- [ ] Stage exclusively target files and commit with `feat(hooks): implement usePensionDetail and enhance usePensionReviews`.
