# Task: Refactor Review Cards and Review Modals to Hooks (`web/tasks/034_refactor-review-cards-and-reviews-modal-to-hooks.md`)

## Execution Profile

- **Wave / Batch**: Wave 2
- **Execution Mode**: `PARALLEL`
- **Assigned Role**: `Worker Agent (Web Reviews Modals)`
- **Dependencies (`depends_on`)**: `[030_fix-pension-rating-and-contract-mappers.md, 031_create-detail-and-reviews-hooks.md]`
- **Collision Risk**: `LOW (Isolated review components)`

## Target Files

- **Exclusive**:
  - `src/components/reviews/review-card.tsx`
  - `src/components/reviews/pension-reviews-modal.tsx`
  - `src/components/reviews/publish-review-modal.tsx`

## Objective

Normalize photo extraction in `ReviewCard`, connect `PensionReviewsModal` with helpful voting from `usePensionReviews`, and refactor `PublishReviewModal` to use `usePensionReviews.publishReview`.

## Technical Specifications

1. **`src/components/reviews/review-card.tsx`**:
   - Safely extract photo URL:
     ```typescript
     const photoUrl = typeof img === 'string' ? img : img?.url || '';
     ```
   - Pass valid URL to `<Image src={photoUrl} />` and `onEnlargePhoto(photoUrl)`.
   - Prevent any `undefined` image source crashes.

2. **`src/components/reviews/pension-reviews-modal.tsx`**:
   - Use `voteHelpful` from `usePensionReviews(pension.id)` or props.
   - Calculate rating breakdown and category averages accurately.

3. **`src/components/reviews/publish-review-modal.tsx`**:
   - Use `publishReview` from `usePensionReviews(pension.id)` instead of raw service calls.

## Checklist

- [ ] Fix photo extraction in `ReviewCard`.
- [ ] Connect helpful voting in `PensionReviewsModal`.
- [ ] Adopt `usePensionReviews` in `PublishReviewModal`.
- [ ] Stage exclusively target files and commit with `refactor(reviews): adopt usePensionReviews in review modals and cards`.
