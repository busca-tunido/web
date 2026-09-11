# Task: Complete Elimination of Mock Data in Web Repository (`web/tasks/eliminate-all-mocks.md`)

## Execution Profile

- **Wave / Batch**: Wave 4
- **Execution Mode**: `SEQUENTIAL`
- **Assigned Role**: `Worker Agent`
- **Dependencies (`depends_on`)**: `[task-sync-wave-3.md]`
- **Collision Risk**: `HIGH (Global mock removal & cleanup)`

## Target Files

- **Exclusive**:
  - `src/lib/mock-data.ts` (DELETE)
- **Shared / Integration Points**:
  - `src/lib/api-client.ts`
  - `src/app/page.tsx`
  - `src/components/history/history-screen.tsx`

## Objective

Completely purge all hardcoded mock arrays, fake data objects, and fallback fixtures from the `web` repository, deleting `src/lib/mock-data.ts` and updating any residual imports to consume real backend endpoints or graceful empty/error states.

## Technical Specifications

### 1. Delete `src/lib/mock-data.ts`
- Remove the 18 KB file containing:
  - `MOCK_CITIES`
  - `MOCK_UNIVERSITIES`
  - `MOCK_PENSIONS`
  - `MOCK_STAY_HISTORY`

### 2. Remove Fallbacks in `src/lib/api-client.ts`
- In `fetchPaginatedPensions`: Delete `let results = [...MOCK_PENSIONS]` fallback. If the API request fails, return `{ status: 'error', message: 'Failed to fetch pensions' }` or throw, allowing UI error boundaries and retry banners to activate.
- In `fetchCities`: Delete `return MOCK_CITIES` fallback.
- In `fetchUniversities`: Delete `return MOCK_UNIVERSITIES` fallback.
- Remove all imports of `MOCK_*`.

### 3. Clean up Component Invocations
- In `src/app/page.tsx`:
  - Change initial state `useState<CityInfo[]>([])` and `useState<UniversityInfo[]>([])` (initialize with empty arrays instead of mock constants).
- In `src/components/history/history-screen.tsx`:
  - Remove `useState(MOCK_STAY_HISTORY)`; initialize with empty array or data hook from `useStayHistory()`.

### 4. Zero Tolerance Verification
- Audit entire `src/` directory using ripgrep (`rg`) for any remaining case-insensitive occurrences of `"mock"` or `"MOCK_"`. Zero occurrences must remain in production source files.

## Checklist

- [ ] Delete `src/lib/mock-data.ts`.
- [ ] Remove all fallback mock code and mock imports from `src/lib/api-client.ts`.
- [ ] Update `src/app/page.tsx` to initialize empty state without mock constants.
- [ ] Update `src/components/history/history-screen.tsx` to rely on real service calls.
- [ ] Execute ripgrep audit (`rg`) across `src/` confirming 0 occurrences of `MOCK_` remain.
- [ ] Validate code quality with Biome (`pnpm run check && pnpm run review`).
- [ ] Verify build with `pnpm run build`.

## Verification

- Mock Audit: `rg -i "mock-data" src/` (must return zero results)
- Code Quality (Biome): `pnpm run check && pnpm run review`
- Next.js Build: `pnpm build`
