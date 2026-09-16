# Task: Advanced Frontend Quality Gate (`web/tasks/046_advanced-frontend-quality-gate.md`)

## Execution Profile

- **Wave / Batch**: Wave 5
- **Execution Mode**: `SEQUENTIAL`
- **Assigned Role**: `CrewAI Orchestrator / Integrator`
- **Dependencies (`depends_on`)**: `[api/tasks/021_http-caching-headers.md, api/tasks/022_reviews-pagination-backend.md, web/tasks/038_shared-swr-cache-foundation.md, web/tasks/039_reviews-pagination-client-sync.md, web/tasks/040_adopt-cache-in-hooks.md, web/tasks/041_modal-reducers-state-machines.md, web/tasks/042_context-slicing-navigation-and-filters.md, web/tasks/043_rsc-initial-prefetch-and-seo.md, web/tasks/044_pension-card-memo-and-virtual-list.md, web/tasks/045_map-marker-clustering-and-canvas.md]`
- **Collision Risk**: `NONE (Central verification gate)`

## Objective

Run centralized quality verification across all merged optimization branches:
1. Formatting and linting: `pnpm run check && pnpm run review` in `api` and `web`.
2. Static typecheck and build: `pnpm exec tsc --noEmit` and `pnpm exec nest build`.
3. Unit test suite: `pnpm vitest run`.

## Verification Steps

- [ ] API Biome check passes cleanly.
- [ ] API Nest build passes cleanly.
- [ ] Web Biome check passes cleanly.
- [ ] Web TypeScript compilation passes cleanly (`tsc --noEmit`).
- [ ] All Vitest tests pass cleanly.
