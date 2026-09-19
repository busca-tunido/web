# Task: Review Helpful Votes Service Contracts & Mappers (`web/tasks/047_review-helpful-votes-service-contracts.md`)

## Execution Profile

- **Wave / Batch**: Wave 3
- **Execution Mode**: `SEQUENTIAL`
- **Assigned Role**: `Worker Agent (Web Services)`
- **Dependencies (`depends_on`)**: `[api/tasks/024_review-helpful-votes-endpoints.md]`
- **Collision Risk**: `LOW (Isolated services layer)`

## Target Files

- **Exclusive**:
  - `src/types/api-contracts.ts`
  - `src/services/reviews.service.ts`
  - `src/services/pensions.service.ts`

## Objective

Update the web services and DTO mappers to consume the persistent helpful votes endpoints and properties, ensuring `helpfulCount` is reliably extracted from API payloads and providing a service function to retrieve user-voted review IDs.

## Technical Specifications

1. **`src/types/api-contracts.ts`**:
   - Ensure `ReviewItemDto` defines `helpfulCount: number` and optional `userVoted?: boolean`.
   - Define type `UserHelpfulVotesResponse = { reviewIds: string[] }`.

2. **`src/services/reviews.service.ts`**:
   - **`voteReviewHelpful(reviewId: string)`**:
     - Ensure calls `POST /reviews/:id/helpful` via `apiFetch`, which automatically passes `Authorization: Bearer <token>` from local storage.
     - Return `ApiResponse<{ helpfulCount: number; voted: boolean }>`.
   - **`fetchUserHelpfulVotes()`**:
     - Add `async function fetchUserHelpfulVotes(): Promise<ApiResponse<{ reviewIds: string[] }>>`.
     - Request `GET /reviews/helpful/voted`.
     - Export function directly and in `reviewsService` object.

3. **`src/services/pensions.service.ts` (`mapReviewItemDto`)**:
   - Ensure `mapReviewItemDto` extracts `helpfulCount` correctly:
     ```typescript
     const rawCount = (raw._count as { helpfulVotes?: number } | undefined)?.helpfulVotes;
     const helpfulCount = typeof rawCount === 'number' ? rawCount : Number(raw.helpfulCount ?? 0);
     ```
   - Ensure `userVoted` is mapped if present on the raw payload.

## Checklist

- [x] Update `ReviewItemDto` contract in `src/types/api-contracts.ts`.
- [x] Implement `fetchUserHelpfulVotes()` in `src/services/reviews.service.ts`.
- [x] Update `mapReviewItemDto` in `src/services/pensions.service.ts`.
- [x] Follow strict typing with no `any`.
- [x] Stage exclusively target files and commit with `feat(reviews): add helpful votes service contracts and mappers`.
