# Task: Hooks and Rating Centralized Quality Gate (`web/tasks/037_hooks-and-rating-quality-gate.md`)

## Execution Profile

- **Wave / Batch**: Wave 3
- **Execution Mode**: `SEQUENTIAL`
- **Assigned Role**: `CrewAI Orchestrator / Integrator`
- **Dependencies (`depends_on`)**: `[020_reviews-helpful-endpoint.md, 030_fix-pension-rating-and-contract-mappers.md, 031_create-detail-and-reviews-hooks.md, 032_create-viewport-universities-proposal-hooks.md, 033_refactor-pension-detail-and-preview-to-hooks.md, 034_refactor-review-cards-and-reviews-modal-to-hooks.md, 035_refactor-map-screen-to-hooks.md, 036_refactor-auth-and-proposal-modals-to-hooks.md]`
- **Collision Risk**: `NONE (Central quality gate)`

## Objective

Run centralized quality verification across the merged branches:
1. Formatting and linting: `pnpm run check && pnpm run review` in `api` and `web`.
2. Static typecheck and build: `pnpm exec tsc --noEmit` and `pnpm exec nest build`.
3. Unit test suite: `pnpm vitest run`.

## Verification Steps

- [ ] API Biome check passes cleanly.
- [ ] API Nest build passes cleanly.
- [ ] Web Biome check passes cleanly.
- [ ] Web TypeScript compilation passes cleanly (`tsc --noEmit`).
- [ ] All Vitest tests pass cleanly.
