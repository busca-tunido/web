# Task: 100% Auth, User Profile & Moderation API Services Implementation (`web/tasks/services-auth-and-users.md`)

## Execution Profile

- **Wave / Batch**: Wave 1
- **Execution Mode**: `PARALLEL`
- **Assigned Role**: `Worker Agent`
- **Dependencies (`depends_on`)**: `[services-contracts-and-client-foundation.md]`
- **Collision Risk**: `LOW (Isolated files)`

## Target Files

- **Exclusive**:
  - `src/services/auth.service.ts`
  - `src/services/moderation.service.ts`
- **Shared / Integration Points**:
  - `src/services/index.ts` (Requiere Merge Gate en Wave 1 Sync)

## Objective

Implement 100% of the backend API endpoints for authentication, session verification, user identity, and moderation actions using auto-generated OpenAPI types (`api-schema.d.ts`), returning strictly typed `ApiResponse<T>` discriminant tagged unions with zero mock fallbacks and zero unit test overhead.

## Technical Specifications

### 1. Auth Service (`src/services/auth.service.ts`)
- 100% OpenAPI endpoints coverage:
  - `POST /auth/register`: `registerUser(payload: RegisterDto): Promise<ApiResponse<AuthSessionDto>>`
  - `POST /auth/login`: `loginWithCredentials(payload: LoginDto): Promise<ApiResponse<AuthSessionDto>>`
  - `GET /auth/me`: `getCurrentUserProfile(): Promise<ApiResponse<UserProfileDto>>`
  - Email discovery helper: `checkEmailExists(email: string): Promise<ApiResponse<{ exists: boolean; role?: string }>>`
  - Client session terminator: `logoutSession(): void` (Purges local storage tokens)

### 2. Moderation Service (`src/services/moderation.service.ts`)
- 100% OpenAPI endpoints coverage:
  - `PATCH /moderation/reviews/:id/visibility`: `toggleReviewVisibility(reviewId: string, payload: UpdateVisibilityDto): Promise<ApiResponse<{ success: boolean }>>`
  - `PATCH /moderation/pensions/:id/status`: `updatePensionStatus(pensionId: string, payload: UpdatePensionStatusDto): Promise<ApiResponse<{ success: boolean }>>`

## Checklist

- [ ] Implement `src/services/auth.service.ts` covering 100% of auth endpoints (`/auth/register`, `/auth/login`, `/auth/me`).
- [ ] Implement `src/services/moderation.service.ts` covering 100% of moderation endpoints (`/moderation/reviews/:id/visibility`, `/moderation/pensions/:id/status`).
- [ ] Strictly type all request bodies and return values with OpenAPI contracts (`paths` from `api-schema.d.ts`).
- [ ] Validate code quality with Biome (`pnpm run check && pnpm run review`).

## Verification

- TypeScript Typecheck: `pnpm exec tsc --noEmit`
- Code Quality (Biome): `pnpm run check && pnpm run review`
