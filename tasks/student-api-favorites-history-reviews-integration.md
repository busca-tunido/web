# Task: Student API Integration: Favorites, Stays, Reviews, Proposals & Reports (`web/tasks/student-api-favorites-history-reviews-integration.md`)

## Execution Profile

- **Wave / Batch**: Wave 3
- **Execution Mode**: `PARALLEL`
- **Assigned Role**: `Worker Agent`
- **Dependencies (`depends_on`)**: `[task-sync-wave-2.md]`
- **Collision Risk**: `LOW (Isolated student community components)`

## Target Files

- **Exclusive**:
  - `src/hooks/use-student-favorites.ts`
  - `src/hooks/use-pension-reviews.ts`
  - `src/hooks/use-stay-history.ts`
  - `tests/hooks/use-student-community.spec.ts`
- **Shared / Integration Points**:
  - `src/components/favorites/favorites-screen.tsx`
  - `src/components/history/history-screen.tsx`
  - `src/components/reviews/reviews-modal.tsx`
  - `src/components/reviews/publish-review-modal.tsx`
  - `src/components/pensions/suggest-edit-proposal-modal.tsx`

## Objective

Wire authentic backend API endpoints for all student interactive features: user favorites persistence and optimistic toggling, verified stay history tracking, community review feeds, review publishing with 3-image ceiling and rating, helpful voting, edit proposals, and flag reports.

## Technical Specifications

### 1. Favorites Management (`src/hooks/use-student-favorites.ts`)
- Load saved favorites from backend via `favoritesService.fetchStudentFavorites()`.
- Optimistic toggle:
  - Immediately update UI state (heart filled/unfilled).
  - Fire `favoritesService.toggleFavorite(pensionId)`.
  - If request fails, revert state and display a floating error toast: *"No se pudo actualizar tu lista de favoritos. Reintentando..."*.

### 2. Verified Stay History (`src/hooks/use-stay-history.ts`)
- Fetch real student stay records from `staysService.fetchStudentStays()`.
- Display stay duration dates using standard browser `Intl.DateTimeFormat` (no external heavyweight date libraries).
- Provide quick shortcut to review the pension if no review has been published yet.

### 3. Reviews & Upvoting (`src/hooks/use-pension-reviews.ts`)
- Fetch reviews for selected pension from `reviewsService.fetchPensionReviews(pensionId)`.
- Publish review flow:
  - Validate with `createReviewSchema` (rating 1-5, comment min 15 chars, max 3 photos).
  - Call `reviewsService.createReview(pensionId, payload)`.
  - Append new review optimistically to feed upon success.
- Helpful voting:
  - Call `reviewsService.voteReviewHelpful(reviewId)`.
  - Update helpful count and highlight vote icon.

### 4. Edit Proposals & Flag Reports
- Connect `SuggestEditProposalModal` to `pensionsService.suggestPensionEdit()`.
- Connect report flags to `reportsService.submitFlagReport()`.

## Checklist

- [ ] Implement `src/hooks/use-student-favorites.ts` with optimistic updates and error reversion.
- [ ] Connect `FavoritesScreen` to live backend favorites API.
- [ ] Implement `src/hooks/use-stay-history.ts` and connect `HistoryScreen` using `Intl.DateTimeFormat`.
- [ ] Implement `src/hooks/use-pension-reviews.ts` for listing, publishing (max 3 images), and helpful voting.
- [ ] Connect `ReviewsModal` and `PublishReviewModal` to real review endpoints.
- [ ] Connect `SuggestEditProposalModal` to edit proposal API endpoint.
- [ ] Write unit tests in `tests/hooks/use-student-community.spec.ts` mocking responses and optimistic rollback.
- [ ] Validate code quality with Biome (`pnpm run check && pnpm run review`).

## Verification

- Unit Tests: `pnpm exec vitest run tests/hooks/use-student-community.spec.ts`
- Code Quality (Biome): `pnpm run check && pnpm run review`
- Build & Typecheck: `pnpm build`
