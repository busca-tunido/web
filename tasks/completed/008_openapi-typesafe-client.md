# Task: Type-Safe OpenAPI Client & Automated Typegen (`web/tasks/openapi-typesafe-client.md`)

## Objective

Replace manual, duplicated API types and untyped `fetch()` calls in the frontend with an automated, type-safe OpenAPI client using `openapi-typescript` and `openapi-fetch`. Ensure any changes in backend endpoints or DTOs immediately trigger compile-time validation in the frontend.

---

## Technical Specifications

### 1. Tooling & Dependencies
- Suggest terminal commands to install:
  - `openapi-typescript` (dev dependency)
  - `openapi-fetch` (runtime dependency)
- Add npm script in `web/package.json`:
  - `"api:generate": "openapi-typescript http://localhost:4000/api/docs-json -o src/lib/api-schema.d.ts"`

### 2. Client Refactoring (`src/lib/api-client.ts`)
- Initialize `createClient<paths>({ baseUrl: process.env.NEXT_PUBLIC_API_URL })`.
- Remove manual `BackendPension` interface.
- Replace manual query string concatenation with typed `client.GET('/pensions', { params: { query: ... } })`.
- Replace auth and review endpoints with typed calls.

---

## Checklist

- [ ] Suggest terminal command to install `openapi-fetch` and `openapi-typescript`.
- [ ] Add `"api:generate"` script to `web/package.json`.
- [ ] Generate initial `src/lib/api-schema.d.ts` from API Swagger definition.
- [ ] Refactor `src/lib/api-client.ts` to use typed `openapi-fetch` methods.
- [ ] Validate code quality with Biome (`pnpm run check && pnpm run review`).
- [ ] Verify build with `pnpm run build`.

---

## Target Files

- `package.json` (via terminal command suggestion)
- `src/lib/api-schema.d.ts`
- `src/lib/api-client.ts`
- `src/lib/types.ts`
