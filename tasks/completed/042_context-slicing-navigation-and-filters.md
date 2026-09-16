# Task: Context Slicing for Navigation and Search Filters (`web/tasks/042_context-slicing-navigation-and-filters.md`)

## Execution Profile

- **Wave / Batch**: Wave 3
- **Execution Mode**: `PARALLEL`
- **Assigned Role**: `Worker Agent (Web Context Architecture)`
- **Dependencies (`depends_on`)**: `[]`
- **Collision Risk**: `LOW (Context providers and shell integration)`

## Target Files

- **Exclusive**:
  - `src/contexts/navigation-context.tsx`
  - `src/contexts/search-filters-context.tsx`
  - `src/components/shells/student-app-shell.tsx`

## Objective

Decompose the monolithic state in `StudentAppShell` by splitting it into two fine-grained, sliced React contexts:
1. `NavigationContext`: tab navigation, target city, selected pension ID (infrequent updates).
2. `SearchFiltersContext`: active search query, price ranges, amenities, gender preferences (frequent user-input updates).

This stops app-wide re-render cascades: components like `DesktopNavbar` or `FilterDrawer` only re-render when their relevant sliced slice updates, leaving heavy leaf components (like the Leaflet map) undisturbed.

## Technical Specifications

### 1. `src/contexts/navigation-context.tsx`
- Manages: `activeTab`, `navigateTab`, `selectedPension`, `selectPension`, `mapTargetCity`, `setMapTargetCity`.
- Exposes hook: `useNavigation()`.

### 2. `src/contexts/search-filters-context.tsx`
- Manages: `filters`, `setFilters`, `resetFilters`, `activeFilterCount`.
- Exposes hook: `useSearchFilters()`.

### 3. `src/components/shells/student-app-shell.tsx`
- Wrap tree in `<NavigationProvider>` and `<SearchFiltersProvider>`.
- Delegate prop drilling to context hooks.

## Checklist

- [ ] Implement `src/contexts/navigation-context.tsx`.
- [ ] Implement `src/contexts/search-filters-context.tsx`.
- [ ] Refactor `StudentAppShell` to consume sliced contexts.
- [ ] Verify tab switching and filter modifications trigger zero unnecessary map re-renders.
- [ ] Do NOT execute slow commands (`pnpm build`, `tsc`, `biome`).
- [ ] Stage exclusively target files and commit with `refactor(shell): slice state into navigation and filters contexts`.
