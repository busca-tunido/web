# Task: Eliminate Unnecessary 'use client' Directives and Replace Motion with CSS

## Execution Profile

- **Wave / Batch**: Wave 2 (Client Boundary Cleanup & Runtime Pruning)
- **Execution Mode**: `PARALLEL`
- **Assigned Role**: `Worker Agent (UI Pruning & CSS Performance)`
- **Dependencies (`depends_on`)**: None
- **Collision Risk**: `LOW (Isolated leaf UI components)`

## Target Files

- **Exclusive**:
  - `src/components/ui/brand-logo.tsx`
  - `src/components/ui/form-field.tsx`
  - `src/components/layout/bottom-nav.tsx`
- **Shared / Integration Points**:
  - None

## Objective

Prune unnecessary `'use client'` boundaries from purely presentational components and eliminate the `motion/react` JavaScript runtime dependency from high-frequency leaf components, replacing JS animations with zero-bundle, GPU-accelerated Tailwind CSS transitions.

## Technical Specifications

### 1. Prune `'use client'` from `brand-logo.tsx` (`src/components/ui/brand-logo.tsx`)
- `BrandLogo` uses no React state, effects, context, or browser APIs.
- Remove `'use client';` directive.
- Convert `interface BrandLogoProps` to strict TypeScript `type BrandLogoProps` according to `AGENTS.md` guidelines.
- Allow `BrandLogo` to render on the server as pure static HTML in RSC pages and metadata headers.

### 2. Replace `motion/react` in `form-field.tsx` (`src/components/ui/form-field.tsx`)
- Currently: Imports `AnimatePresence` and `motion` from `motion/react` solely to animate a single-line error string. This forces every form to pull in the Motion library.
- **Fix**:
  - Remove `import { AnimatePresence, motion } from 'motion/react';`.
  - Replace `<AnimatePresence>` and `<motion.div>` with hardware-accelerated CSS animations:
    ```tsx
    {hasError && (
      <div
        id={errorId}
        role="alert"
        className="flex items-center gap-1.5 pt-1 text-xs font-medium text-destructive animate-in fade-in slide-in-from-top-1 duration-200"
      >
        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
        <span>{error}</span>
      </div>
    )}
    ```

### 3. Replace `motion/react` in `bottom-nav.tsx` (`src/components/layout/bottom-nav.tsx`)
- Currently: Uses `motion.button` and `whileTap={{ scale: 0.92 }}` for tab taps.
- **Fix**:
  - Replace `motion.button` with native `<button type="button">`.
  - Use Tailwind CSS micro-animations:
    `className="... transition-all duration-150 active:scale-95 touch-manipulation"`
  - Remove `motion` import from `bottom-nav.tsx`.

## Checklist

- [ ] Remove `'use client'` from `src/components/ui/brand-logo.tsx` and convert `interface` to `type`.
- [ ] Remove `motion/react` import and replace error animation with Tailwind CSS in `src/components/ui/form-field.tsx`.
- [ ] Remove `motion/react` import and replace tap scale with Tailwind CSS in `src/components/layout/bottom-nav.tsx`.
- [ ] Verify error states and navigation tabs continue to animate smoothly at 60fps.
- [ ] Run global Biome quality gate (`pnpm run check && pnpm run review`).
- [ ] Run TypeScript incremental typecheck (`pnpm exec tsc --noEmit`).
- [ ] Run Vitest unit tests (`pnpm exec vitest run`).
- [ ] Stage and commit with conventional commit message (`perf(ui): prune use-client boundaries and replace motion with tailwind transitions`).

## Verification

- Code Quality (Biome): `pnpm run check && pnpm run review`
- Typecheck: `pnpm exec tsc --noEmit`
- Tests: `pnpm exec vitest run`
