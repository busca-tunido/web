# Task: Sync Gate - Wave 3 Student Full API Flow Integration (`web/tasks/task-sync-wave-3.md`)

## Execution Profile

- **Wave / Batch**: Wave 3 - Sync Gate
- **Execution Mode**: `SEQUENTIAL`
- **Assigned Role**: `Integrator Agent`
- **Dependencies (`depends_on`)**: `[initial-auth-check-email-student-register-modal.md, student-api-explore-pensions-integration.md, student-api-favorites-history-reviews-integration.md]`
- **Collision Risk**: `HIGH (Student application shell & flow coordination)`

## Target Files

- **Exclusive**:
  - None
- **Shared / Integration Points**:
  - `src/components/shells/student-app-shell.tsx`
  - `src/lib/auth-context.tsx`

## Objective

Integrate and reconcile all student API hooks and components from Wave 3 into `<StudentAppShell />`: ensure email discovery modal, explore map feed, reviews publishing, favorites toggle, and error states interact harmoniously without regressions, and confirm typecheck and lint passes cleanly.

## Checklist

- [ ] Verify all checklists in Wave 3 tasks are marked completed (`- [x]`).
- [ ] Merge worker branches/worktrees into base integration branch.
- [ ] Reconcile state handoffs between `AuthContext`, `StudentAppShell`, and child screens.
- [ ] Test end-to-end integration: login/register -> explore feed -> map bounds -> open pension -> toggle favorite -> publish review -> view stays.
- [ ] Run Biome checks and resolve any diagnostics (`pnpm run check && pnpm run review`).
- [ ] Execute build check (`pnpm build`).
- [ ] Teardown temporary worktrees.

## Verification

- Code Quality (Biome): `pnpm run check && pnpm run review`
- Next.js Build: `pnpm build`
