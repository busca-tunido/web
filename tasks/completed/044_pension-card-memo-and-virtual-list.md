# Task: PensionCard Memoization and Virtualized Infinite List (`web/tasks/044_pension-card-memo-and-virtual-list.md`)

## Execution Profile

- **Wave / Batch**: Wave 4
- **Execution Mode**: `PARALLEL`
- **Assigned Role**: `Worker Agent (Web Render Performance)`
- **Dependencies (`depends_on`)**: `[]`
- **Collision Risk**: `LOW (Isolated card and list components)`

## Target Files

- **Exclusive**:
  - `src/components/pensions/pension-card.tsx`
  - `src/components/pensions/infinite-pension-list.tsx`

## Objective

Optimize feed rendering performance during fast scrolling and state changes by wrapping `PensionCard` in `React.memo` with a selective comparator, and adding virtual windowing/viewport recycling to `InfinitePensionList` so that long lists (50+ to 200+ pensions) only keep visible DOM nodes mounted.

## Technical Specifications

### 1. `src/components/pensions/pension-card.tsx`
- Wrap in `React.memo(PensionCardComponent, areEqual)`.
- `areEqual`: compare `prev.pension.id === next.pension.id`, `prev.isFavorite === next.isFavorite`, `prev.pension.ratingAverage === next.pension.ratingAverage`, `prev.pension.priceMonthlyClp === next.pension.priceMonthlyClp`.

### 2. `src/components/pensions/infinite-pension-list.tsx`
- Keep DOM footprint minimal by utilizing virtual windowing or recycling items outside the viewport.
- Maintain intersection observer triggers for seamless next-page fetching.

## Checklist

- [ ] Wrap `PensionCard` in `React.memo` with specialized comparator.
- [ ] Optimize `InfinitePensionList` rendering efficiency for 100+ items.
- [ ] Verify 60 FPS smooth scrolling on mobile viewports.
- [ ] Do NOT execute slow commands (`pnpm build`, `tsc`, `biome`).
- [ ] Stage exclusively target files and commit with `perf(pensions): memoize PensionCard and optimize infinite list rendering`.
