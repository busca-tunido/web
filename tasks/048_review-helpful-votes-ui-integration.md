# Task: Review Helpful Votes UI & Hook Integration (`web/tasks/048_review-helpful-votes-ui-integration.md`)

## Execution Profile

- **Wave / Batch**: Wave 4
- **Execution Mode**: `SEQUENTIAL`
- **Assigned Role**: `Worker Agent (Web UI & Hooks)`
- **Dependencies (`depends_on`)**: `[web/tasks/047_review-helpful-votes-service-contracts.md]`
- **Collision Risk**: `LOW (Isolated review hooks and components)`

## Target Files

- **Exclusive**:
  - `src/hooks/use-pension-reviews.ts`
  - `src/components/reviews/pension-reviews-modal.tsx`
  - `src/components/reviews/review-card.tsx`

## Objective

Integrate real persistent helpful votes into the review hooks and user interface. Authenticated users can upvote/unvote reviews with immediate optimistic feedback and server synchronization, while guest users are prompted to authenticate. Voted states and total counts survive page reloads and modal unmounts.

## Technical Specifications

1. **`src/hooks/use-pension-reviews.ts`**:
   - Access `useAuth()` to check authentication status.
   - When user is authenticated, fetch their voted review IDs via `reviewsService.fetchUserHelpfulVotes()` and populate `userVotes`.
   - In `voteHelpful(reviewId: string)`:
     - If user is not authenticated, do not proceed with vote and return `{ success: false, requireAuth: true }` or trigger login modal.
     - Perform optimistic update on `helpfulCount` and `userVotes[reviewId]`.
     - Call `reviewsService.voteReviewHelpful(reviewId)`.
     - On success, synchronize with server `helpfulCount` and `voted`.
     - On failure, roll back optimistic update.

2. **`src/components/reviews/pension-reviews-modal.tsx`**:
   - Connect `toggleHelpful` with the review hook.
   - Pass `isLiked` (based on `userVotes[review.id] ?? review.userVoted`) and `likesCount` (`review.helpfulCount`) to `ReviewCard`.
   - If user is not logged in, prompt student login/registration modal.

3. **`src/components/reviews/review-card.tsx`**:
   - Render the upvote button with active styling when `isLiked` is true.
   - Display `Útil (N)` with the real database vote count.
   - Support accessible keyboard interaction and disabled state during submission.

## Checklist

- [ ] Connect `fetchUserHelpfulVotes` and authenticated status in `src/hooks/use-pension-reviews.ts`.
- [ ] Connect vote toggle and authentication prompt in `src/components/reviews/pension-reviews-modal.tsx`.
- [ ] Verify `ReviewCard` renders real counts and active states.
- [ ] Stage exclusively target files and commit with `feat(reviews): integrate persistent review helpful votes UI and hooks`.
