# Task: Student API Integration: Explore, Map Discovery & Pension Detail (`web/tasks/student-api-explore-pensions-integration.md`)

## Execution Profile

- **Wave / Batch**: Wave 3
- **Execution Mode**: `PARALLEL`
- **Assigned Role**: `Worker Agent`
- **Dependencies (`depends_on`)**: `[task-sync-wave-2.md]`
- **Collision Risk**: `LOW (Isolated exploration components)`

## Target Files

- **Exclusive**:
  - `src/components/common/network-error-state.tsx`
  - `src/hooks/use-student-pensions-feed.ts`
  - `tests/hooks/use-student-pensions-feed.spec.ts`
- **Shared / Integration Points**:
  - `src/components/explore/explore-screen.tsx`
  - `src/components/map/map-screen.tsx`
  - `src/components/pensions/pension-detail-modal.tsx`
  - `src/hooks/use-infinite-pensions.ts`

## Objective

Connect real backend API endpoints to the student Explore and Map experiences: initialize metadata (cities, universities) concurrently using `Promise.allSettled()`, wire dynamic map bounds exploration and infinite scroll queries to `pensionsService`, display graceful connection failure states, and fetch authentic pension detail records.

## Technical Specifications

### 1. Concurrent Metadata Initialization via `Promise.allSettled()`
- In `useStudentPensionsFeed`:
  ```typescript
  const [citiesResult, universitiesResult] = await Promise.allSettled([
    locationsService.fetchCities(),
    locationsService.fetchUniversities()
  ]);
  ```
  - Safely extract data from fulfilled promises; if universities fail, keep cities available with a retry trigger.
  - Automatically place the user's detected GPS city at the start of the list.

### 2. Real Paginated Feed & Dynamic Bounds Synchronization
- Connect `useInfinitePensions` to `pensionsService.fetchPaginatedPensions`:
  - Pass active filters: `city`, `universityId`, `sortBy`, `minPrice`, `maxPrice`, `genderPreference`, `roomType`.
  - Pass map bounding box (`minLat`, `maxLat`, `minLng`, `maxLng`) when in map mode.
  - Compute nearby pensions via `pensionsService.fetchNearbyPensions` when user grants location permissions.
- Handle pagination cursors/page indexes cleanly.

### 3. Connection Error States & Retry Badges (`src/components/common/network-error-state.tsx`)
- If API calls fail due to offline network or server down:
  - Render non-blocking `<NetworkErrorBanner message="No pudimos conectar con el servidor" onRetry={refetch} />`.
  - Provide a clear *"Reintentar"* button with loading spinner.
  - Never throw unhandled exceptions or render blank white screens.

### 4. Pension Detail Integration (`src/components/pensions/pension-detail-modal.tsx`)
- Fetch live pension data on demand: `pensionsService.fetchPensionById(pensionId)`.
- Display verified landlord information, pricing, included amenities, house rules, and room types.

## Checklist

- [x] Implement concurrent metadata loading with `Promise.allSettled()` in `useStudentPensionsFeed`.
- [x] Connect `ExploreScreen` and `MapScreen` to real `pensionsService.fetchPaginatedPensions()` and `fetchNearbyPensions()`.
- [x] Implement `src/components/common/network-error-state.tsx` with user-friendly retry controls.
- [x] Connect `PensionDetailModal` to real `fetchPensionById()` backend endpoint.
- [x] Write unit tests in `tests/hooks/use-student-pensions-feed.spec.ts` mocking network success and failure states.
- [x] Validate code quality with Biome (`pnpm run check && pnpm run review`).

## Verification

- Unit Tests: `pnpm exec vitest run tests/hooks/use-student-pensions-feed.spec.ts`
- Code Quality (Biome): `pnpm run check && pnpm run review`
- Build & Typecheck: `pnpm build`
