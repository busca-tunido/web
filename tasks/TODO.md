# Task: 003 - Mobile-First Layout Shell & Bottom Navigation Bar

## Objective

Implement the persistent mobile-first layout shell with a fixed bottom navigation bar, safe-area padding, responsive header, and view transitions for BuscaTuNido web.

## Checklist

- [x] Create Bottom Navigation Bar component with touch targets (>= 44px)
- [x] Integrate safe area utilities (`env(safe-area-inset-bottom)`)
- [x] Implement responsive top bar with branding and search trigger
- [x] Configure root layout wrapper with bottom-bar offset
- [x] Verify responsive behavior and build (`pnpm run check && pnpm build`)

## Target Files

- `src/components/layout/bottom-nav.tsx`
- `src/components/layout/header.tsx`
- `src/app/layout.tsx`

## Verification

- Command: `pnpm run check && pnpm build`
