# Task: 003 - Mobile-First Layout Shell & Bottom Navigation Bar

## Objective
Implement the persistent mobile-first layout shell with a fixed bottom navigation bar, safe-area padding, responsive header, and view transitions for Busca TuNido web.

## Checklist
- [ ] Create Bottom Navigation Bar component with touch targets (>= 44px)
- [ ] Integrate safe area utilities (`env(safe-area-inset-bottom)`)
- [ ] Implement responsive top bar with branding and search trigger
- [ ] Configure root layout wrapper with bottom-bar offset
- [ ] Verify responsive behavior and build (`pnpm run check && pnpm build`)

## Target Files
- `src/components/layout/bottom-nav.tsx`
- `src/components/layout/header.tsx`
- `src/app/layout.tsx`

## Verification
- Command: `pnpm run check && pnpm build`
