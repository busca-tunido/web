# Task: URL Deep Navigation Tracking & Browser History State (`web/tasks/url-browser-history-navigation-state.md`)

## Execution Profile

- **Wave / Batch**: Wave 2
- **Execution Mode**: `PARALLEL`
- **Assigned Role**: `Worker Agent`
- **Dependencies (`depends_on`)**: `[task-sync-wave-1.md]`
- **Collision Risk**: `LOW (Isolated files)`

## Target Files

- **Exclusive**:
  - `src/hooks/use-url-navigation-state.ts`
  - `tests/hooks/use-url-navigation-state.spec.ts`
- **Shared / Integration Points**:
  - `src/components/shells/student-app-shell.tsx` (Requiere Merge Gate en Wave 2 Sync)

## Objective

Synchronize all active panel transitions, opened modals, bottom sheets, and detail drawers with browser URL query parameters and HTML5 History API (`window.history.pushState` / `replaceState`). When the user clicks the browser Back button (`<`) or swipes back on mobile, the application restores the previous state (closes the modal/drawer or switches to the previous tab) instead of navigating away from the web app.

## Technical Specifications

### 1. State Mapping & Query Contract
- Synchronize the following state variables with URL search parameters:
  - **Tab**: `?tab=explore` | `?tab=map` | `?tab=favorites` | `?tab=history` | `?tab=account`
  - **Selected City / Uni**: `?city=valparaiso`, `?uni=uv`
  - **Pension Detail Drawer**: `?pension=<pension-id>`
  - **Filters Drawer**: `?filters=true`
  - **Reviews Modal**: `?reviews=<pension-id>`
  - **Publish Review Modal**: `?publish_review=<pension-id>`

### 2. Custom Navigation Hook (`src/hooks/use-url-navigation-state.ts`)
- Leverage Next.js `useSearchParams`, `useRouter`, and `usePathname`:
  - Provide helper actions: `navigateTab(tab)`, `openPensionDetail(id)`, `closePensionDetail()`, `openFilters()`, `closeFilters()`.
  - When opening an overlay (drawer/modal) or switching primary tabs, push a new state to `window.history` (`router.push` with shallow query update or `window.history.pushState`).
  - When closing an overlay via UI buttons (X, backdrop click), trigger `window.history.back()` or safely replace query params if no history entry exists.
  - Listen to `popstate` events to seamlessly react to browser forward and back buttons, updating React component states without page reload.

### 3. Edge Cases & Resilience
- On direct page load or bookmarking (e.g. `https://buscatunido.cl/?tab=favorites` or `?pension=uuid-123`), automatically parse URL params and initialize the application directly into that tab or open the requested pension drawer.
- Prevent duplicate consecutive history states when clicking the same tab twice.

## Checklist

- [x] Implement `src/hooks/use-url-navigation-state.ts` parsing and pushing URL query parameters.
- [x] Connect browser `popstate` event listener to gracefully sync active tab, modal, and drawer states.
- [x] Ensure pressing the browser back button `<` closes open drawers/modals first before switching tabs.
- [x] Ensure direct deep linking via URL initializes the corresponding tab or detail modal on initial page mount.
- [x] Write unit tests in `tests/hooks/use-url-navigation-state.spec.ts` covering parameter serialization, history push, and popstate handling.
- [x] Validate code quality with Biome (`pnpm run check && pnpm run review`).

## Verification

- Unit Tests: `pnpm exec vitest run tests/hooks/use-url-navigation-state.spec.ts`
- Code Quality (Biome): `pnpm run check && pnpm run review`
- Build & Typecheck: `pnpm build`
