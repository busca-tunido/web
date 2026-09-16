# Task: Refactor Pension Detail and Preview to Hooks (`web/tasks/033_refactor-pension-detail-and-preview-to-hooks.md`)

## Execution Profile

- **Wave / Batch**: Wave 2
- **Execution Mode**: `PARALLEL`
- **Assigned Role**: `Worker Agent (Web Detail & Preview)`
- **Dependencies (`depends_on`)**: `[030_fix-pension-rating-and-contract-mappers.md, 031_create-detail-and-reviews-hooks.md]`
- **Collision Risk**: `LOW (Isolated pension detail and preview components)`

## Target Files

- **Exclusive**:
  - `src/components/pensions/pension-detail-modal.tsx`
  - `src/components/reviews/pension-reviews-preview.tsx`

## Objective

Completely eliminate raw `useEffect` data fetching in `PensionDetailModal` by replacing them with `usePensionDetail` and `usePensionReviews`, and wire `PensionReviewsPreview` to display real student reviews and rating badges.

## Technical Specifications

1. **`src/components/pensions/pension-detail-modal.tsx`**:
   - Remove `loadLivePension` and its `useEffect`.
   - Remove `loadReviews` and its `useEffect`.
   - Consume `const { livePension, activePension, isLoading: isLoadingDetail, error: detailError } = usePensionDetail(targetId, initialPension);`
   - Consume `const { reviews, ratingStats, isLoading: isLoadingReviews } = usePensionReviews(targetId, { average: activePension?.ratingAverage ?? 0, count: activePension?.reviewsCount ?? 0 });`
   - Pass `reviews` to `PensionReviewsPreview` and `PensionReviewsModal`.

2. **`src/components/reviews/pension-reviews-preview.tsx`**:
   - Display `pension.ratingAverage > 0 ? pension.ratingAverage.toFixed(1) : 'Nuevo'`.
   - Handle review images correctly when elements are string URLs or `{ url: string }`.

## Checklist

- [ ] Remove data-fetching `useEffect` blocks from `PensionDetailModal`.
- [ ] Connect `usePensionDetail` and `usePensionReviews`.
- [ ] Verify `PensionReviewsPreview` renders real reviews with correct star ratings and names.
- [ ] Stage exclusively target files and commit with `refactor(pensions): use custom hooks in pension detail and preview`.
