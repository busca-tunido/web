# Task: Desktop-Adaptive Drawers and Dialog Architecture

## Execution Profile

- **Wave / Batch**: Wave 5 (Responsive Shell & Desktop Adaptations)
- **Execution Mode**: `SEQUENTIAL`
- **Assigned Role**: `Worker Agent (UI Architecture & Components)`
- **Dependencies (`depends_on`)**: None
- **Collision Risk**: `MEDIUM (Creates shared UI primitive and updates layout drawers)`

## Target Files

- **Exclusive**:
  - `src/hooks/use-media-query.ts`
  - `src/components/ui/responsive-modal.tsx`
  - `src/components/layout/filter-drawer.tsx`
- **Shared / Integration Points**:
  - `src/components/pensions/amenities-breakdown-modal.tsx` (Future Migration Candidate)
  - `src/components/reviews/publish-review-modal.tsx` (Future Migration Candidate)
  - `src/components/pensions/suggest-edit-modal.tsx` (Future Migration Candidate)

## Objective

Design and implement a unified, responsive modal architecture that adapts between mobile bottom-sheet drawers (`Drawer`) and desktop-oriented centered dialogs (`Dialog`). 

On mobile devices, modals must retain touch-friendly bottom sheets with swipe-to-dismiss gestures. On Windows and desktop viewports, they must render as centered, accessible dialog windows with desktop ergonomics (no mobile grab handles, no unwanted swipe gesture listeners, fixed max-width, keyboard navigation, and centered backdrop blur).

## Architectural Strategy: Media Queries vs. Distinct Components vs. Composition

### 1. The Core Problem with Pure CSS on Drawers
Attempting to transform `@base-ui/react/drawer` (or Vaul) into a desktop dialog purely using CSS media queries (`md:fixed md:top-1/2 md:left-1/2 md:-translate-x-1/2`) is problematic:
- **Gesture Conflict**: Drawer primitives attach touch and mouse drag listeners. Clicking and scrolling inside a desktop panel can trigger gesture calculations and accidentally dismiss the panel.
- **Dynamic Transform Collisions**: Drawer primitives apply inline CSS transforms (`translate3d(0, var(--translate-y), 0)`) during swipe animations, which directly override CSS centering rules.
- **Irrelevant Mobile Affordances**: Swipe handles (`DrawerSwipeHandle`) and bottom bleed spacers (`--drawer-bleed-background`) remain in the DOM on desktop where they serve no purpose.
- **Accessibility & Semantics**: Mobile bottom drawers and desktop dialogs have different ARIA behaviors, snap point expectations, and focus management.

### 2. The Problem with Separate Component Trees
Duplicating components (e.g., maintaining both `MobileFilterDrawer.tsx` and `DesktopFilterDialog.tsx`) results in:
- Duplication of 400+ lines of filter state, price histograms, amenity selectors, and synchronization logic.
- High divergence risk when new filters or features are introduced.
- Violates the DRY (Don't Repeat Yourself) principle.

### 3. The Recommended Architecture: Adaptive Container Primitive via Composition
The canonical solution is an **Adaptive Container Primitive (`ResponsiveModal`)** leveraging the **Compound Component Pattern**:

```
                   ┌─────────────────────────────────────────┐
                   │            ResponsiveModal              │
                   │    (Driven by useMediaQuery hook)       │
                   └───────────────────┬─────────────────────┘
                                       │
            ┌──────────────────────────┴──────────────────────────┐
            ▼                                                     ▼
   [isDesktop === true]                                 [isDesktop === false]
┌──────────────────────────┐                          ┌──────────────────────────┐
│  @/components/ui/dialog  │                          │  @/components/ui/drawer  │
│  - Centered floating card│                          │  - Bottom sheet panel    │
│  - Rounded-2xl & shadow  │                          │  - Touch swipe gestures  │
│  - Desktop close button  │                          │  - Swipe grab handle     │
│  - ESC key focus trap    │                          │  - Mobile snap points    │
└───────────┬──────────────┘                          └───────────┬──────────────┘
            │                                                     │
            └──────────────────────────┬──────────────────────────┘
                                       │
                                       ▼
                   ┌─────────────────────────────────────────┐
                   │       Shared Composable Content         │
                   │   (Written ONCE, zero duplicated logic) │
                   │  - Filter options & price histogram     │
                   │  - Form validation & input controls     │
                   │  - Apply & Reset action handlers        │
                   └─────────────────────────────────────────┘
```

- **Polymorphic Wrapper**: `ResponsiveModal` delegates dynamically to `Dialog` on desktop (`min-width: 768px`) and `Drawer` on mobile.
- **Shared API Contract**: Mirrors standard Dialog/Drawer slots:
  - `ResponsiveModal`
  - `ResponsiveModalTrigger`
  - `ResponsiveModalContent`
  - `ResponsiveModalHeader`
  - `ResponsiveModalTitle`
  - `ResponsiveModalDescription`
  - `ResponsiveModalFooter`
  - `ResponsiveModalClose`
- **100% Shared Body**: Domain components (such as `FilterDrawer`, `PublishReviewModal`, etc.) define their filter controls, inputs, and state once. The outer container handles responsive presentation automatically.

## Technical Specifications

### 1. SSR-Safe Device Query Hook (`src/hooks/use-media-query.ts`)
- Implement `useMediaQuery(query: string): boolean`.
- Use React 18/19 `useSyncExternalStore` for hydration safety and tear-free state synchronization:
  - Client snapshot: `() => window.matchMedia(query).matches`.
  - Server snapshot: `() => false` (mobile-first default as specified in `AGENTS.md`).
- Ensure listener teardown with `mql.removeEventListener('change', listener)`.

### 2. Adaptive Modal Primitive (`src/components/ui/responsive-modal.tsx`)
- Implement composite wrapper components:
  - `ResponsiveModal`: Evaluates `useMediaQuery('(min-width: 768px)')`.
  - `ResponsiveModalContent`:
    - Desktop: Delegates to `<DialogContent>` with `sm:max-w-xl md:max-w-2xl max-h-[85vh] p-0 flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl`.
    - Mobile: Delegates to `<DrawerContent>` with bottom-sheet transitions and snap points.
  - `ResponsiveModalHeader`, `ResponsiveModalTitle`, `ResponsiveModalDescription`, `ResponsiveModalFooter`, `ResponsiveModalClose`.
- Desktop specific styling:
  - Clean floating card centered in viewport with `DialogOverlay` (`bg-black/60 backdrop-blur-xs`).
  - No swipe handle pill rendered on desktop.
  - Standard top-right close icon (`X`) with accessible touch target ($48\times48\text{px}$).

### 3. Pilot Implementation: Refactor `FilterDrawer` (`src/components/layout/filter-drawer.tsx`)
- Replace direct `Drawer` imports with `ResponsiveModal` components.
- Maintain existing filter state machine (`localFilters`, `usePriceHistogram`, `matchingCount`, `activeFilterCount`).
- Adapt content layout for desktop:
  - Body container: `max-h-[70vh] overflow-y-auto px-6 py-4` with smooth desktop scroll.
  - Rating & Amenity pills: Render as a clean grid on desktop (`grid-cols-3` or `sm:grid-cols-4`) while retaining comfortable spacing on mobile.
  - Sticky header: Show centered or left-aligned title without drag handle on desktop.
  - Sticky footer: Two-column layout with "Limpiar todo" button and primary "Mostrar X alojamientos" button.

### 4. Migration Roadmap for Remaining Drawers
Once verified in `FilterDrawer`, sequentially migrate:
1. `src/components/pensions/amenities-breakdown-modal.tsx`
2. `src/components/reviews/publish-review-modal.tsx`
3. `src/components/pensions/suggest-edit-modal.tsx`
4. `src/components/reviews/pension-reviews-modal.tsx`
5. `src/components/auth/student-register-modal.tsx`

## Checklist

- [ ] Create SSR-safe `useMediaQuery` hook in `src/hooks/use-media-query.ts` using `useSyncExternalStore`.
- [ ] Create `ResponsiveModal` compound component in `src/components/ui/responsive-modal.tsx` wrapping `Dialog` and `Drawer`.
- [ ] Refactor `src/components/layout/filter-drawer.tsx` to use `ResponsiveModal`.
- [ ] Ensure desktop dialog displays centered, with no mobile drag handles and without gesture conflicts.
- [ ] Ensure mobile view continues to display bottom sheet with swipe gestures intact.
- [ ] Verify accessibility: keyboard navigation (ESC, Tab focus trap), ARIA dialog roles, and screen reader labels.
- [ ] Run global Biome quality gate (`pnpm run check && pnpm run review`).
- [ ] Run TypeScript typecheck (`pnpm exec tsc --noEmit`).
- [ ] Run Vitest unit tests (`pnpm exec vitest run`).
- [ ] Commit changes following Conventional Commits (`feat(ui): implement desktop-adaptive responsive modal primitive and update filter drawer`).

## Verification

- Code Quality (Biome): `pnpm run check && pnpm run review`
- Typecheck: `pnpm exec tsc --noEmit`
- Tests: `pnpm exec vitest run`
