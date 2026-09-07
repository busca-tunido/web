# Task: Frontend Async Pension Loading, Lazy Infinite Scroll & Geo-Radius (`web/tasks/pensions-async-infinite-scroll-geo.md`)

## Objective

Implement an asynchronous, progressive housing discovery experience in BuscaTuNido Web: load pensions dynamically filtered by user geo-radius (standard default of 30 km, expandable up to 100 km), sort by the backend relevance score, display live pension counts for nearby cities/communes, and load subsequent batches smoothly using a lazy infinite scroll sentinel with `IntersectionObserver`.

---

## Technical Specifications

### 1. Geolocation & Progressive Radius Handling
- Use the browser's Geolocation API (`navigator.geolocation.getCurrentPosition`) via a custom hook (`src/hooks/use-user-location.ts`).
- Sensible Fallback: Default to central metropolitan coordinates (Santiago: `-33.4489, -70.6693`) if user denies permissions or location is resolving.
- Pass `latitude`, `longitude`, `radiusKm=30`, and `sortBy=relevance` to the backend.

### 2. Async Pagination & Infinite Scroll Hook
- Create `src/hooks/use-infinite-pensions.ts`:
  - Maintains state: `items: PensionItem[]`, `page: number`, `hasMore: boolean`, `isLoadingMore: boolean`, `isRefreshing: boolean`, `nearbyCityCounts`.
  - Initial fetch: Requests `page=1&limit=12`.
  - Next page fetch: Appends new unique items to the active list without full re-render.
  - Reset behavior: Automatically resets to `page=1` and scrolls to top whenever user changes city, university, or search filters.
- Use `IntersectionObserver` on a sentinel element placed at the bottom of the pension feed to trigger `loadMore()` seamlessly before the user reaches the end.

### 3. Nearby Cities Pension Badges (`NearbyCitiesBar`)
- Render a horizontal scrollable strip of city badges above or beside the pension list:
  - Example: `📍 Santiago (142)` `Valparaíso (38)` `Viña del Mar (29)` `Concepción (54)`.
  - Clicking a nearby city chip updates the search filter to that specific city.

### 4. Relevance & Distance Display on Pension Cards
- Render the calculated distance badge on each pension card:
  - e.g. `📍 A 1.4 km de tu ubicación` or `📍 A 800m de Campus San Joaquín`.
- Visually distinguish highly relevant / verified listings with subtle badges (`Recomendada`, `Verificada`).

---

## Checklist

- [ ] Create `src/hooks/use-user-location.ts` with permission handling and Chilean metropolitan fallback.
- [ ] Update `src/lib/api-client.ts` `fetchPensions()` to support `page`, `limit=12`, `latitude`, `longitude`, `radiusKm`, and return `{ items, pagination, nearbyCityCounts }`.
- [ ] Create `src/hooks/use-infinite-pensions.ts` managing progressive state, infinite pagination, and deduplication.
- [ ] Implement `src/components/pensions/infinite-pension-list.tsx` with an `IntersectionObserver` sentinel, loading skeletons, and "fin de resultados" indicator.
- [ ] Implement `src/components/pensions/nearby-cities-bar.tsx` displaying interactive nearby city counts.
- [ ] Update `PensionCard` to display calculated proximity distance (`distanceKm`).
- [ ] Integrate the new infinite feed and nearby city bar into `src/app/page.tsx` and explore views.
- [ ] Validate code quality and formatting with Biome (`pnpm run check && pnpm run review`).
- [ ] Verify production compilation with `pnpm run build`.

---

## Target Files

- `src/hooks/use-user-location.ts`
- `src/hooks/use-infinite-pensions.ts`
- `src/components/pensions/infinite-pension-list.tsx`
- `src/components/pensions/nearby-cities-bar.tsx`
- `src/components/pensions/pension-card.tsx`
- `src/lib/api-client.ts`
- `src/app/page.tsx`

---

## Verification

- Code Quality (Biome): `pnpm run check && pnpm run review`
- Production Build: `pnpm run build`
