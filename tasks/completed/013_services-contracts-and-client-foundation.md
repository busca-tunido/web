# Task: Base API Response Contracts & Typed Fetcher Foundation (`web/tasks/services-contracts-and-client-foundation.md`)

## Execution Profile

- **Wave / Batch**: Wave 0
- **Execution Mode**: `SEQUENTIAL`
- **Assigned Role**: `Worker Agent`
- **Dependencies (`depends_on`)**: None
- **Collision Risk**: `HIGH (Shared core foundation)`

## Target Files

- **Exclusive**:
  - `src/lib/api-response.ts`
  - `src/lib/api-client-base.ts`
  - `src/types/api-contracts.ts`
- **Shared / Integration Points**:
  - `src/lib/api-client.ts` (Requiere Merge Gate en Wave 0 Sync)

## Objective

Establish the foundational typed HTTP infrastructure and discriminant tagged union response models (`ApiResponse<T>`) generated from OpenAPI schemas, enabling robust network error handling, connection status detection, and `Promise.allSettled` batch helpers.

## Technical Specifications

### 1. Discriminant Tagged Union API Return Types (`src/lib/api-response.ts`)
- Define strict discriminant tagged union types for all API calls:
  ```typescript
  export type ApiSuccess<T> = {
    status: 'success';
    data: T;
    statusCode: number;
  };

  export type ApiError = {
    status: 'error';
    message: string;
    statusCode: number;
    errorType: 'NETWORK_ERROR' | 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'VALIDATION_ERROR' | 'SERVER_ERROR';
    details?: unknown;
  };

  export type ApiResponse<T> = ApiSuccess<T> | ApiError;
  ```
- Implement safe parsing and helper guards:
  - `isApiSuccess<T>(res: ApiResponse<T>): res is ApiSuccess<T>`
  - `isApiError(res: ApiResponse<unknown>): res is ApiError`

### 2. Base Typed Fetcher (`src/lib/api-client-base.ts`)
- Implement a reusable fetch wrapper that automatically:
  - Attaches `Authorization: Bearer <token>` from local session storage.
  - Enforces `NEXT_PUBLIC_API_URL` without default fallback values (throws if missing).
  - Handles timeout (default 8000ms via `AbortController`).
  - Distinguishes between offline network failure (`TypeError: Failed to fetch`) and HTTP status errors.
- Implement `settledBatch<T>()` utility wrapping `Promise.allSettled()` to safely process concurrent requests without letting one failure cancel the entire batch.

## Checklist

- [x] Define `ApiResponse<T>`, `ApiSuccess<T>`, and `ApiError` with discriminant tagged union typing in `src/lib/api-response.ts`.
- [x] Export OpenAPI schema mapped models (`paths` derived request/response types) in `src/types/api-contracts.ts`.
- [x] Create `src/lib/api-client-base.ts` with typed fetch wrapper, timeout abort, and automatic JWT bearer token injection.
- [x] Implement `settledBatch<T>()` utility with type guards for handling concurrent requests via `Promise.allSettled()`.
- [x] Validate code quality with Biome (`pnpm run check && pnpm run review`).
- [x] Verify build with `pnpm run build`.

## Verification

- Code Quality (Biome): `pnpm run check && pnpm run review`
- Build & Typecheck: `pnpm build`
