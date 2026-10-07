# Task: Route-Level Code Splitting for Student Shell Sub-Routes

## Execution Profile

- **Wave / Batch**: Wave 3 (App Router Architecture & Route Chunks)
- **Execution Mode**: `SEQUENTIAL`
- **Assigned Role**: `Worker Agent (App Router & Route Modularization)`
- **Dependencies (`depends_on`)**: `[web/tasks/dynamic-code-splitting-heavy-screens-and-modals.md]`
- **Collision Risk**: `MEDIUM (App Router route pages)`

## Target Files

- **Exclusive**:
  - `src/app/favorites/page.tsx`
  - `src/app/history/page.tsx`
  - `src/app/map/page.tsx`
  - `src/app/explore/page.tsx`
- **Shared / Integration Points**:
  - `src/components/shells/student-app-shell.tsx`

## Objective

Break the monolithic "SPA inside Next.js" pattern by refactoring dedicated student route pages (`/favorites`, `/history`, `/map`, `/explore`) to leverage native Next.js App Router code splitting.

Instead of each route page bootstrapping the entire `StudentAppShell` containing all 5 screens, route pages must mount only their corresponding screen within a lightweight shared navigation shell. This ensures that direct visits to `/favorites` or `/history` download only their dedicated screen code, eliminating catalog and map code from the payload.

## Technical Specifications

### 1. Route Page Decoupling
- **`src/app/favorites/page.tsx`**:
  - Directly load and render `FavoritesScreen` with the shared bottom/top navigation shell, rather than bootstrapping all Explore and Map components.
- **`src/app/history/page.tsx`**:
  - Directly load and render `HistoryScreen`.
- **`src/app/map/page.tsx`**:
  - Dedicated route for map-centric users loading `MapScreen` dynamically.
- **`src/app/explore/page.tsx`**:
  - Dedicated route for search & explore feed.

### 2. State & Deep-Link Synchronization
- Ensure URL query parameters (`?city=...`, `?uni=...`) and active tab state remain in sync when navigating between `/`, `/favorites`, `/history`, and `/map`.
- Use Next.js `<Link prefetch={false}>` or `router.push()` to trigger fast client-side transitions between routes while allowing Next.js to stream and cache individual route chunks independently.

### 3. Server-Side SEO & Metadata Isolation
- Each route maintains its tailored Server Component metadata (`title`, `description`, `canonical`, `robots`):
  - `/favorites`: `robots: { index: false, follow: false }`
  - `/history`: `robots: { index: false, follow: false }`
  - `/explore`: Indexed with rich OpenGraph tags.

## Checklist

- [ ] Refactor `src/app/favorites/page.tsx` to render focused favorites view without bundling unexplored tab code.
- [ ] Refactor `src/app/history/page.tsx` to render focused history view.
- [ ] Refactor `src/app/map/page.tsx` to render focused map view.
- [ ] Maintain seamless tab navigation and active URL states via `useNavigation()`.
- [ ] Verify Next.js build produces isolated, smaller client bundles per route.
- [ ] Run global Biome quality gate (`pnpm run check && pnpm run review`).
- [ ] Run TypeScript incremental typecheck (`pnpm exec tsc --noEmit`).
- [ ] Run Vitest unit tests (`pnpm exec vitest run`).
- [ ] Stage and commit with conventional commit message (`refactor(routes): modularize student app shell into dedicated app router page chunks`).

## Verification

- Code Quality (Biome): `pnpm run check && pnpm run review`
- Typecheck: `pnpm exec tsc --noEmit`
- Tests: `pnpm exec vitest run`
