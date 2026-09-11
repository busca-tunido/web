# Task: Sync Gate - Wave 1 API Services Completeness & Validation Integration (`web/tasks/task-sync-wave-1.md`)

## Execution Profile

- **Wave / Batch**: Wave 1 - Sync Gate
- **Execution Mode**: `SEQUENTIAL`
- **Assigned Role**: `Integrator Agent`
- **Dependencies (`depends_on`)**: `[services-auth-and-users.md, services-pensions-and-locations.md, services-reviews-favorites-history.md, field-validation-ux-feedback.md]`
- **Collision Risk**: `HIGH (Shared core files & exports)`

## Target Files

- **Exclusive**:
  - None
- **Shared / Integration Points**:
  - `src/services/index.ts`
  - `src/lib/validations/index.ts`

## Objective

Integrate and reconcile parallel worker outputs from Wave 1: consolidate all services and validation schemas into clean module exports, audit that 100% of the backend REST API endpoints from `openapi.json` / `api-schema.d.ts` are implemented, and certify code quality via Biome and Next.js typecheck build.

## Checklist

- [ ] Verify that all Wave 1 tasks have completed checklists (`- [x]`).
- [ ] Merge worker branches/worktrees into base integration branch.
- [ ] Wire up consolidated exports in `src/services/index.ts` and `src/lib/validations/index.ts`.
- [ ] Audit endpoint completeness: confirm 100% of backend API routes (Auth, Pensions, Rooms, Universities, Reviews, Favorites, Proposals, Reports, Moderation, Uploads) have corresponding functions in `src/services/`.
- [ ] Run Biome checks and resolve any import or formatting warnings (`pnpm run check && pnpm run review`).
- [ ] Run typecheck build (`pnpm build`).
- [ ] Clean up temporary worker worktrees.

## Verification

- Endpoint Audit: Ripgrep (`rg`) validation against `openapi.json` paths
- Code Quality (Biome): `pnpm run check && pnpm run review`
- Next.js Build: `pnpm build`
