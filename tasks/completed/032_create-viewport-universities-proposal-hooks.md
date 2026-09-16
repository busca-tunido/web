# Task: Create Viewport, Universities and Proposal Hooks (`web/tasks/032_create-viewport-universities-proposal-hooks.md`)

## Execution Profile

- **Wave / Batch**: Wave 1
- **Execution Mode**: `PARALLEL`
- **Assigned Role**: `Worker Agent (Hooks Locations & Modals)`
- **Dependencies (`depends_on`)**: `[]`
- **Collision Risk**: `LOW (Isolated custom hooks directory)`

## Target Files

- **Exclusive**:
  - `src/hooks/use-universities.ts`
  - `src/hooks/use-map-viewport-pensions.ts`
  - `src/hooks/use-suggest-edit.ts`

## Objective

Create clean custom hooks to encapsulate:
1. Universities loading and fallback caching (`useUniversities`).
2. Map bounding box area fetching and pin retention (`useMapViewportPensions`).
3. Suggest edit proposals diff calculation and submission (`useSuggestEdit`).

## Technical Specifications

1. **`src/hooks/use-universities.ts`**:
   - Fetch universities via `fetchUniversities()` from `universities.service`.
   - Maintain fallback universities if request fails.
   - Return `{ universities, isLoading, error, refetch }`.

2. **`src/hooks/use-map-viewport-pensions.ts`**:
   - Signature: `useMapViewportPensions({ initialPensions, activePensionId })`.
   - State: `mapPensions: PensionItem[]`, `isAreaLoading: boolean`.
   - Sync `mapPensions` when `initialPensions` change, preserving `activePension` in the list if not present.
   - Method `fetchAreaPensions(bounds)` debounced at 400ms: calls `pensionsService.fetchPaginatedPensions` with `minLat`, `maxLat`, `minLng`, `maxLng`.
   - Return `{ mapPensions, setMapPensions, isAreaLoading, fetchAreaPensions }`.

3. **`src/hooks/use-suggest-edit.ts`**:
   - Signature: `useSuggestEdit(pension: PensionItem)`.
   - Methods: `calculateDiff(draft)`, `submitProposal(submissionNotes, draft)`.
   - State: `isSubmitting: boolean`, `errorMessage: string | null`, `successBanner: boolean`.
   - Calls `submitPensionProposal(pension.id, payload)`.

## Checklist

- [ ] Implement `src/hooks/use-universities.ts`.
- [ ] Implement `src/hooks/use-map-viewport-pensions.ts`.
- [ ] Implement `src/hooks/use-suggest-edit.ts`.
- [ ] Strictly typed with no `any`.
- [ ] Stage exclusively target files and commit with `feat(hooks): create useUniversities, useMapViewportPensions and useSuggestEdit`.
