# Task: Progressive Hydration via Suspense Skeletons Across Panels (`web/tasks/progressive-hydration-suspense-skeletons.md`)

## Execution Profile

- **Wave / Batch**: Wave 2
- **Execution Mode**: `PARALLEL`
- **Assigned Role**: `Worker Agent`
- **Dependencies (`depends_on`)**: `[task-sync-wave-1.md]`
- **Collision Risk**: `LOW (Isolated files)`

## Target Files

- **Exclusive**:
  - `src/components/ui/skeletons/pension-card-skeleton.tsx`
  - `src/components/ui/skeletons/explore-skeleton.tsx`
  - `src/components/ui/skeletons/map-drawer-skeleton.tsx`
  - `src/components/ui/skeletons/favorites-skeleton.tsx`
  - `src/components/ui/skeletons/history-skeleton.tsx`
  - `src/components/ui/skeletons/reviews-skeleton.tsx`
- **Shared / Integration Points**:
  - `src/components/explore/explore-screen.tsx`
  - `src/components/favorites/favorites-screen.tsx`
  - `src/components/history/history-screen.tsx`
  - `src/components/reviews/reviews-modal.tsx`

## Objective

Implement modern progressive streaming and client-side hydration boundaries using React 19 / Next.js `<Suspense fallback={<Skeleton />} />` across all content-heavy panels (Explore screen, Map bottom drawer, Favorites, Stay History, and Reviews feed), eliminating layout shift (CLS) and delivering instant perceived loading.

## Technical Specifications

### 1. Skeleton Primitives (`src/components/ui/skeletons/`)
- Build pulse-animated, responsive skeleton components mirroring actual layouts:
  - **`PensionCardSkeleton`**: Card layout matching `PensionCard` with aspect-ratio photo placeholder, title bar, price badge, and tags.
  - **`ExploreSkeleton`**: Staggered feed of 4 pension card skeletons plus city chip carousels.
  - **`MapDrawerSkeleton`**: Compact list view items inside the bottom drawer.
  - **`FavoritesSkeleton`**: Grid of saved accommodation cards.
  - **`HistorySkeleton`**: Timeline stay card placeholders with date and rating badges.
  - **`ReviewsSkeleton`**: User avatar, rating stars row, and multiline text blocks.

### 2. Suspense Boundaries & Progressive Streaming
- Wrap async data-fetching subtrees in dedicated `<Suspense>` boundaries:
  - In `ExploreScreen`: Wrap `<PensionListSection>` in `<Suspense fallback={<ExploreSkeleton />} />`.
  - In `MapScreen`: Wrap `<MapDrawerPensionList>` in `<Suspense fallback={<MapDrawerSkeleton />} />`.
  - In `FavoritesScreen`: Wrap `<FavoritesGrid>` in `<Suspense fallback={<FavoritesSkeleton />} />`.
  - In `HistoryScreen`: Wrap `<HistoryList>` in `<Suspense fallback={<HistorySkeleton />} />`.
  - In `ReviewsModal`: Wrap `<ReviewFeedList>` in `<Suspense fallback={<ReviewsSkeleton />} />`.

### 3. Smooth Transitions
- Utilize CSS opacity transitions or `AnimatePresence` so replacing the skeleton with loaded content is fluid without abrupt flashing.

## Checklist

- [ ] Create reusable skeleton primitives in `src/components/ui/skeletons/` for pension cards, explore feed, map drawer, favorites, history, and reviews.
- [ ] Integrate `<Suspense>` boundaries into `ExploreScreen` with `ExploreSkeleton`.
- [ ] Integrate `<Suspense>` boundaries into `MapScreen` drawer with `MapDrawerSkeleton`.
- [ ] Integrate `<Suspense>` boundaries into `FavoritesScreen` with `FavoritesSkeleton`.
- [ ] Integrate `<Suspense>` boundaries into `HistoryScreen` with `HistorySkeleton`.
- [ ] Integrate `<Suspense>` boundaries into `ReviewsModal` with `ReviewsSkeleton`.
- [ ] Validate code quality with Biome (`pnpm run check && pnpm run review`).
- [ ] Verify build with `pnpm run build`.

## Verification

- Code Quality (Biome): `pnpm run check && pnpm run review`
- Build & Typecheck: `pnpm build`
