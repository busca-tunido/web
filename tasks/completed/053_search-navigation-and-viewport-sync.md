# Task: Global Search Navigation & Map Viewport Filter Synchronization

## Execution Profile

- **Wave / Batch**: Wave 2 (Backend Scope, SSR Unblock, Search Sync & Landlord Nav Atoms)
- **Execution Mode**: `PARALLEL`
- **Assigned Role**: `Worker Agent (Web Navigation & Map Sync)`
- **Dependencies (`depends_on`)**: `[]`
- **Collision Risk**: `LOW`

## Target Files

- **Exclusive**:
  - `src/components/layout/desktop-navbar.tsx`
  - `src/hooks/use-map-viewport-pensions.ts`

## Objective

Fix global search tab routing and synchronize map viewport bounding queries with active accommodation filters:
1. In `desktop-navbar.tsx`: Redirect search execution (`Enter` key or search button) to `'explore'` tab when triggered from other views (Favorites, History, Account), ensuring results appear immediately.
2. In `use-map-viewport-pensions.ts`: Pass active filter criteria (`query`, `minPriceClp`, `maxPriceClp`, `roomType`) into map viewport queries so pins accurately match the filtered catalog.

## Technical Specifications

1. **`desktop-navbar.tsx` (`src/components/layout/desktop-navbar.tsx`)**:
   - Update `handleExecuteSearch` triggered on `onKeyDown` (Enter) and search icon click.
   - If `activeTab !== 'explore'`, execute `onTabChange('explore')`.
   - Keep search query in `filters.query`.

2. **`use-map-viewport-pensions.ts` (`src/hooks/use-map-viewport-pensions.ts`)**:
   - Accept optional `filters?: SearchFilters` in hook signature.
   - Forward `search: filters?.query`, `minPrice: filters?.minPriceClp`, `maxPrice: filters?.maxPriceClp`, `roomType: filters?.roomType` in `fetchViewportPensions`.
   - Refetch when filters change.

## Checklist

- [ ] Route global navbar searches to `'explore'` tab in `src/components/layout/desktop-navbar.tsx`.
- [ ] Pass active filters into viewport queries in `src/hooks/use-map-viewport-pensions.ts`.
- [ ] Stage target files and commit with `fix(search): route global navbar searches to explore and sync map viewport filters`.
