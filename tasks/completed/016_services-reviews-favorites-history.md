# Task: 100% Reviews, Favorites, Proposals, Reports & Uploads API Services Implementation (`web/tasks/services-reviews-favorites-history.md`)

## Execution Profile

- **Wave / Batch**: Wave 1
- **Execution Mode**: `PARALLEL`
- **Assigned Role**: `Worker Agent`
- **Dependencies (`depends_on`)**: `[services-contracts-and-client-foundation.md]`
- **Collision Risk**: `LOW (Isolated files)`

## Target Files

- **Exclusive**:
  - `src/services/reviews.service.ts`
  - `src/services/favorites.service.ts`
  - `src/services/proposals.service.ts`
  - `src/services/reports.service.ts`
  - `src/services/uploads.service.ts`
- **Shared / Integration Points**:
  - `src/services/index.ts` (Requiere Merge Gate en Wave 1 Sync)

## Objective

Implement 100% of the backend API endpoints for community interaction, favorites, edit proposals, reports, and file uploads directly consuming the OpenAPI schema models (`api-schema.d.ts`), returning strictly typed `ApiResponse<T>` discriminant unions with zero mock fallbacks and zero manual unit testing overhead.

## Technical Specifications

### 1. Reviews Service (`src/services/reviews.service.ts`)
- 100% OpenAPI endpoints coverage:
  - `GET /pensions/:pensionId/reviews`: `fetchPensionReviews(pensionId: string, query?: PaginationQuery): Promise<ApiResponse<PaginatedReviewsResponse>>`
  - `POST /pensions/:pensionId/reviews`: `createPensionReview(pensionId: string, payload: CreateReviewDto): Promise<ApiResponse<ReviewItemDto>>`
  - `PATCH /reviews/:id`: `updateReview(reviewId: string, payload: UpdateReviewDto): Promise<ApiResponse<ReviewItemDto>>`
  - `DELETE /reviews/:id`: `deleteReview(reviewId: string): Promise<ApiResponse<{ success: boolean }>>`

### 2. Favorites Service (`src/services/favorites.service.ts`)
- 100% OpenAPI endpoints coverage:
  - `GET /favorites`: `fetchStudentFavorites(): Promise<ApiResponse<PensionItemDto[]>>`
  - `POST /favorites/:pensionId`: `addFavorite(pensionId: string): Promise<ApiResponse<{ success: boolean }>>`
  - `DELETE /favorites/:pensionId`: `removeFavorite(pensionId: string): Promise<ApiResponse<{ success: boolean }>>`
  - Client convenience helper: `toggleFavorite(pensionId: string, isCurrentlyFav: boolean): Promise<ApiResponse<{ isFavorite: boolean }>>`

### 3. Proposals Service (`src/services/proposals.service.ts`)
- 100% OpenAPI endpoints coverage:
  - `POST /pensions/:id/proposals`: `submitPensionProposal(pensionId: string, payload: CreateProposalDto): Promise<ApiResponse<ProposalDto>>`
  - `GET /pensions/:id/proposals`: `fetchPensionProposals(pensionId: string): Promise<ApiResponse<ProposalDto[]>>`
  - `GET /moderation/proposals`: `fetchAllModerationProposals(): Promise<ApiResponse<ProposalDto[]>>`
  - `GET /moderation/proposals/:id`: `fetchModerationProposalDetail(id: string): Promise<ApiResponse<ProposalDto>>`
  - `PATCH /moderation/proposals/:id/review`: `reviewProposal(id: string, payload: ReviewProposalDto): Promise<ApiResponse<ProposalDto>>`

### 4. Reports Service (`src/services/reports.service.ts`)
- 100% OpenAPI endpoints coverage:
  - `GET /reports`: `fetchReports(): Promise<ApiResponse<ReportDto[]>>`
  - `POST /reports`: `submitReport(payload: CreateReportDto): Promise<ApiResponse<ReportDto>>`
  - `PATCH /reports/:id`: `updateReportStatus(id: string, payload: UpdateReportDto): Promise<ApiResponse<ReportDto>>`

### 5. Uploads Service (`src/services/uploads.service.ts`)
- 100% OpenAPI endpoints coverage:
  - `POST /uploads/images`: `uploadImages(formData: FormData): Promise<ApiResponse<{ urls: string[] }>>` (Handles multi-part image uploads for reviews and pension profiles)

## Checklist

- [x] Implement `src/services/reviews.service.ts` covering 100% of reviews API endpoints (`GET`, `POST`, `PATCH`, `DELETE`).
- [x] Implement `src/services/favorites.service.ts` covering 100% of favorites API endpoints (`GET`, `POST`, `DELETE`).
- [x] Implement `src/services/proposals.service.ts` covering 100% of edit proposal API endpoints.
- [x] Implement `src/services/reports.service.ts` covering 100% of user report API endpoints.
- [x] Implement `src/services/uploads.service.ts` covering multipart image upload API endpoint (`POST /uploads/images`).
- [x] Ensure all service functions use generated OpenAPI types from `api-schema.d.ts` without any `any`.
- [x] Validate code quality with Biome (`pnpm run check && pnpm run review`).

## Verification

- TypeScript Typecheck: `pnpm exec tsc --noEmit`
- Code Quality (Biome): `pnpm run check && pnpm run review`
