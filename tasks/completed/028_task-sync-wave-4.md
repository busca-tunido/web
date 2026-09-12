# Task: Sync Gate - Wave 4 Final Project Certification & Mock-Free Audit (`web/tasks/task-sync-wave-4.md`)

## Execution Profile

- **Wave / Batch**: Wave 4 - Sync Gate
- **Execution Mode**: `SEQUENTIAL`
- **Assigned Role**: `Integrator Agent`
- **Dependencies (`depends_on`)**: `[eliminate-all-mocks.md]`
- **Collision Risk**: `LOW (Final verification)`

## Target Files

- **Exclusive**:
  - None
- **Shared / Integration Points**:
  - Entire repository audit

## Objective

Perform final project certification across the entire `web` codebase: ensure zero mock remnants remain, verify 100% of backend API endpoints are implemented in client services, run global Biome checks with zero errors, and validate a full production build (`pnpm build`).

## Checklist

- [x] Confirm `src/lib/mock-data.ts` is deleted and unreferenced.
- [x] Confirm 100% of backend API endpoints are available in `src/services/`.
- [x] Run Biome strict check and review (`pnpm run check && pnpm run review`) with zero warnings or errors.
- [x] Execute production build (`pnpm build`).
- [x] Teardown any remaining temporary git worktrees.
- [x] Present completion summary to user for final review and approval.

## Verification

- Endpoint Completeness Audit: Ripgrep (`rg`) audit against `api-schema.d.ts` paths
- Code Quality (Biome): `pnpm run check && pnpm run review`
- Production Build: `pnpm build`
