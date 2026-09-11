# Task: Sync Gate - Wave 2 Role Shells, URL State & Hydration Integration (`web/tasks/task-sync-wave-2.md`)

## Execution Profile

- **Wave / Batch**: Wave 2 - Sync Gate
- **Execution Mode**: `SEQUENTIAL`
- **Assigned Role**: `Integrator Agent`
- **Dependencies (`depends_on`)**: `[role-based-ui-separation-student-vs-landlord.md, url-browser-history-navigation-state.md, progressive-hydration-suspense-skeletons.md]`
- **Collision Risk**: `HIGH (Shared root page & layouts)`

## Target Files

- **Exclusive**:
  - None
- **Shared / Integration Points**:
  - `src/app/page.tsx`
  - `src/components/shells/student-app-shell.tsx`

## Objective

Integrate Wave 2 deliverables into the main page entrypoint (`src/app/page.tsx`): activate `<RoleRouter />` to conditionally mount `<StudentAppShell />` vs `<LandlordAppShell />`, bind the URL history tracking hook across student panels, verify suspense skeletons, and ensure full TypeScript compilation with zero linting warnings.

## Checklist

- [ ] Verify all checklists in Wave 2 tasks are marked completed (`- [x]`).
- [ ] Merge worker branches/worktrees into base integration branch.
- [ ] Refactor `src/app/page.tsx` to delegate rendering to `<RoleRouter />`.
- [ ] Connect `useUrlNavigationState` inside `<StudentAppShell />` to handle tab transitions and modal overlays.
- [ ] Run full Biome validation (`pnpm run check && pnpm run review`).
- [ ] Execute build check (`pnpm build`).
- [ ] Teardown temporary worktrees.

## Verification

- Code Quality (Biome): `pnpm run check && pnpm run review`
- Next.js Build: `pnpm build`
