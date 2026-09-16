# Task: Refactor Map Screen to Hooks (`web/tasks/035_refactor-map-screen-to-hooks.md`)

## Execution Profile

- **Wave / Batch**: Wave 2
- **Execution Mode**: `PARALLEL`
- **Assigned Role**: `Worker Agent (Web Map & Cards)`
- **Dependencies (`depends_on`)**: `[030_fix-pension-rating-and-contract-mappers.md, 032_create-viewport-universities-proposal-hooks.md]`
- **Collision Risk**: `LOW (Map screen and pension card components)`

## Target Files

- **Exclusive**:
  - `src/components/map/map-screen.tsx`
  - `src/components/pensions/pension-card.tsx`

## Objective

Clean `MapScreen` from direct API calls by adopting `useMapViewportPensions`, and ensure that both the map markers, bottom drawer, and `PensionCard` properly display numeric rating averages (e.g. `4.3`) instead of `"Nuevo"`.

## Technical Specifications

1. **`src/components/map/map-screen.tsx`**:
   - Replace raw `moveEndTimeoutRef` with `useMapViewportPensions({ initialPensions: pensions, activePensionId: selectedPension?.id ?? null })`.
   - Remove unused import of `pensionsService`.
   - Ensure `pension.ratingAverage > 0 ? pension.ratingAverage.toFixed(1) : 'Nuevo'` correctly displays formatted numbers.

2. **`src/components/pensions/pension-card.tsx`**:
   - Verify rating rendering logic displays formatted float when `ratingAverage > 0`.

## Checklist

- [ ] Connect `useMapViewportPensions` in `MapScreen`.
- [ ] Remove direct API calls and unused imports in `MapScreen`.
- [ ] Verify rating display on `PensionCard`.
- [ ] Stage exclusively target files and commit with `refactor(map): adopt useMapViewportPensions and verify ratings`.
