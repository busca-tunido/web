# Task: Custom Minimalist Scrollbars Across BuscaTuNido Web

## Execution Profile

- **Wave / Batch**: Wave 1
- **Execution Mode**: `SEQUENTIAL`
- **Assigned Role**: `Worker Agent`
- **Dependencies (`depends_on`)**: None
- **Collision Risk**: `LOW (Isolated styling and UI components)`

## Target Files

- **Exclusive**:
  - `src/app/globals.css`
  - `src/components/auth/university-search-select.tsx`
  - `src/components/map/map-screen.tsx`
  - `src/components/layout/filter-drawer.tsx`
  - `src/components/landlord/landlord-desktop-sidebar.tsx`
  - `src/components/pensions/pension-detail-modal.tsx`
  - `src/components/reviews/pension-reviews-modal.tsx`
  - `src/components/shells/landlord-app-shell.tsx`
- **Shared / Integration Points**:
  - None

## Objective

Design and implement a unified, minimalist, theme-aligned custom scrollbar system for BuscaTuNido Web. Apply base scrollbars matching the brand's warm earthy palette (sage green and subtle terracotta tones), identify all scroll containers, and implement specialized lightweight variants for compact dropdowns and desktop panes.

## Technical Specifications

1. Base Scrollbar (`globals.css`):
   - Track: transparent.
   - Thumb: `color-mix(in srgb, var(--foreground) 20%, transparent)` in light mode, `color-mix(in srgb, var(--foreground) 24%, transparent)` in dark mode.
   - Thumb hover: `color-mix(in srgb, var(--sage) 70%, transparent)` in light mode, `color-mix(in srgb, var(--sage) 85%, transparent)` in dark mode.
   - Dimensions: 6px width/height, `rounded-full` / `9999px` border radius.
   - Standard cross-browser support: `scrollbar-width: thin; scrollbar-color: ...` and WebKit pseudo-elements (`::-webkit-scrollbar*`).
2. Compact Variant (`scrollbar-thin`):
   - Dimensions: 4px width/height.
   - Used for compact dropdown lists like `university-search-select` and sidebar pension selectors.
3. Sage Accent Variant (`scrollbar-sage`):
   - Dimensions: 6px width.
   - Thumb with sage tint matching desktop landlord dashboards and map listing panels.
4. Subtle Variant (`scrollbar-subtle`):
   - Dimensions: 5px width/height with softer opacity for detail and review modals.
5. Preserve `.no-scrollbar` / `.scrollbar-none` for horizontal touch swipe areas (navbar chips, nearby cities bar).

## Checklist

- [x] Add base, thin, and sage scrollbar styles in `globals.css`
- [x] Apply `scrollbar-thin` to compact dropdowns (`university-search-select.tsx`)
- [x] Apply `scrollbar-sage` to desktop map list and landlord sidebar
- [x] Apply refined scrollbar classes to detail and filter drawers
- [x] Verify code quality with Biome (`pnpm run check && pnpm run review`)
- [x] Verify TypeScript types (`pnpm exec tsc --noEmit`)
- [x] Verify unit tests (`pnpm exec vitest run`)

## Verification

- Code Quality (Biome): `pnpm run check && pnpm run review`
- Typecheck: `pnpm exec tsc --noEmit`
- Tests: `pnpm exec vitest run`
