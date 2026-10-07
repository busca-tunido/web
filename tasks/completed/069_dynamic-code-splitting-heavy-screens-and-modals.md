# Task: Dynamic Code Splitting for Heavy Screens and Modals

## Execution Profile

- **Wave / Batch**: Wave 2 (Performance & Bundle Splitting)
- **Execution Mode**: `PARALLEL`
- **Assigned Role**: `Worker Agent (Performance & Next.js Optimization)`
- **Dependencies (`depends_on`)**: None
- **Collision Risk**: `LOW (Isolated to app shells and dynamic boundaries)`

## Target Files

- **Exclusive**:
  - `src/components/shells/student-app-shell.tsx`
  - `src/components/shells/landlord-app-shell.tsx`
- **Shared / Integration Points**:
  - None

## Objective

Dramatically reduce the initial client JavaScript bundle size on the landing page and landlord views by converting heavy, conditionally-rendered screens and overlay modals to lazy-loaded chunks using `next/dynamic`.

Users visiting the homepage will no longer synchronously download the Leaflet map bundle (~180 KB), heavy review/amenity breakdown modals, authentication forms, or secondary screens until they actively trigger them.

## Technical Specifications

### 1. Lazy-Loading Map and Secondary Tabs in `student-app-shell.tsx`
Replace synchronous imports of non-initial tab screens with `next/dynamic`:
- **`MapScreen`**:
  ```tsx
  import dynamic from 'next/dynamic';
  import { MapDrawerSkeleton } from '@/components/ui/skeletons/map-drawer-skeleton';

  const MapScreen = dynamic(
    () => import('@/components/map/map-screen').then((mod) => mod.MapScreen),
    {
      ssr: false,
      loading: () => <MapDrawerSkeleton />,
    },
  );
  ```
- **`FavoritesScreen`**, **`HistoryScreen`**, **`StudentAccountScreen`**:
  ```tsx
  const FavoritesScreen = dynamic(
    () => import('@/components/favorites/favorites-screen').then((mod) => mod.FavoritesScreen),
    { ssr: false },
  );

  const HistoryScreen = dynamic(
    () => import('@/components/history/history-screen').then((mod) => mod.HistoryScreen),
    { ssr: false },
  );

  const StudentAccountScreen = dynamic(
    () => import('@/components/account/student-account-screen').then((mod) => mod.StudentAccountScreen),
    { ssr: false },
  );
  ```

### 2. Lazy-Loading Heavy Overlay Modals in `student-app-shell.tsx`
Modals only open on user action. Lazy-load them so their dependencies (forms, review previews, Turnstile) are not bundled in the critical path:
- **`PensionDetailModal`**:
  ```tsx
  const PensionDetailModal = dynamic(
    () => import('@/components/pensions/pension-detail-modal').then((mod) => mod.PensionDetailModal),
    { ssr: false },
  );
  ```
- **`FilterDrawer`**:
  ```tsx
  const FilterDrawer = dynamic(
    () => import('@/components/layout/filter-drawer').then((mod) => mod.FilterDrawer),
    { ssr: false },
  );
  ```
- **`AuthModal`**:
  ```tsx
  const AuthModal = dynamic(
    () => import('@/components/auth/auth-modal').then((mod) => mod.AuthModal),
    { ssr: false },
  );
  ```

### 3. Lazy-Loading Secondary Views in `landlord-app-shell.tsx`
In `landlord-app-shell.tsx`, convert secondary tab views and drawers to dynamic imports:
- `PensionEditorDrawer`
- `LandlordProposalsScreen`
- `LandlordReviewsScreen`
- `LandlordRoomsScreen`
- `LandlordAccountScreen`

### 4. Preservation of Initial Fast Feed Paint
- `ExploreScreen`, `TopSearchBar`, `DesktopNavbar`, and `BottomNav` remain directly rendered to guarantee instant First Contentful Paint (FCP) and SEO SSR fidelity for the primary feed.

## Checklist

- [ ] Implement `next/dynamic` for `MapScreen` with `MapDrawerSkeleton` fallback in `src/components/shells/student-app-shell.tsx`.
- [ ] Implement `next/dynamic` for `PensionDetailModal`, `FilterDrawer`, and `AuthModal` in `src/components/shells/student-app-shell.tsx`.
- [ ] Implement `next/dynamic` for `FavoritesScreen`, `HistoryScreen`, and `StudentAccountScreen` in `src/components/shells/student-app-shell.tsx`.
- [ ] Implement `next/dynamic` for secondary screens and editor drawer in `src/components/shells/landlord-app-shell.tsx`.
- [ ] Verify tab switching and modal opening maintain responsive zero-lag UX.
- [ ] Run global Biome quality gate (`pnpm run check && pnpm run review`).
- [ ] Run TypeScript incremental typecheck (`pnpm exec tsc --noEmit`).
- [ ] Run Vitest unit tests (`pnpm exec vitest run`).
- [ ] Stage and commit with conventional commit message (`perf(web): split heavy screens and modals into dynamic chunks via next/dynamic`).

## Verification

- Code Quality (Biome): `pnpm run check && pnpm run review`
- Typecheck: `pnpm exec tsc --noEmit`
- Tests: `pnpm exec vitest run`
