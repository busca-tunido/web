# Context & Architectural Guidelines for AI Coding Assistants

This document provides general project context, domain rules, and development workflows for AI coding assistants contributing to **BuscaTuNido Web**.

---

## 1. Project Overview & Architecture

BuscaTuNido Web is a mobile-first web application built with [Next.js](https://nextjs.org/) (App Router), [Tailwind CSS](https://tailwindcss.com/), and [shadcn/ui](https://ui.shadcn.com/), consuming backend contracts generated from OpenAPI.

### High-Level Structure:

- `src/app/`: App Router pages, layouts, and public SEO routes.
- `src/components/`: Reusable UI primitives, role-aware application shells, navigation/layout bars, and domain components.
- `src/services/`: Typed API client services consuming the OpenAPI contract.
- `src/contexts/` & `src/reducers/`: Shared React contexts and state machines for UI flows.
- `src/hooks/`: Custom data-fetching, caching, and UI/viewport hooks.
- `src/lib/`: API client wrapper, OpenAPI generated schema/types (`openapi.json`, `api-schema.d.ts`, `types.ts`), shared providers, validation schemas, and utilities.
- `src/types/`: UI-specific TypeScript types.
- `tests/`: Vitest suites and dedicated test fixtures.

---

## 2. Critical Domain Rules & Patterns

1. **No Code Comments**:
   - Comments inside code are strictly prohibited unless explicitly requested by the user. Code must be self-explanatory through naming and structure.
2. **Mobile-First Responsive Design**:
   - Always style for small screens first (unprefixed Tailwind utilities). Use `sm:`, `md:`, `lg:` solely for layout adaptations on larger viewports.
   - Interactive elements must maintain a minimum touch target size of 48px by 48px.
   - Complex filter panels and modal actions must use bottom drawers on mobile viewports.
3. **No Direct Config File Edits for Dependencies**:
   - Never edit `package.json` manually to add packages. Use terminal CLI commands (`pnpm add <pkg>`, `pnpm add -D <pkg>`, `pnpm dlx shadcn@latest add <component>`).
4. **Strict Typing (Types over Interfaces)**:
   - Use TypeScript `type` aliases exclusively; `interface` declarations are strictly forbidden.
   - Forbid `any` (prefer `unknown` or generics). Explicitly type props, API responses, and custom handlers.
5. **Public Exploration & Comparison vs. Authenticated Account Actions**:
   - Read-only exploration (browsing listings, map exploration, viewing details/reviews, and pension comparison) must work for anonymous visitors and registered users without gating on authentication or role.
   - Maintain authentication and role requirements for private account actions, favorites, stay history, publishing reviews, submitting proposals, and landlord management.
   - Anonymous exploration and comparison use public API data and local state; never invent a guest user, token, or synthetic authenticated session.
6. **Conventional Commits (Concise, Single-Line Only)**:
   - All git commit messages must strictly follow the Conventional Commits specification (`feat`, `fix`, `chore`, `refactor`, `test`, `docs`).
   - Commit messages must be concise, single-line only, and omit any extended body description.
7. **Feature Branching & Integration to Main**:
   - Every significant change, new feature, or non-trivial bug fix must be developed within a dedicated branch (e.g., `feat/<name>`, `fix/<name>`), verified, and merged cleanly into `main`. Direct uncoordinated work on `main` is prohibited for major tasks.
8. **Strict Prohibition of Hardcoded Values & Real Data Integration**:
   - Hardcoded values, dummy/mock items, synthetic card fallbacks, and hardcoded external storage URLs are strictly prohibited across components, hooks, services, and reducers unless explicitly requested by the user.
   - Sample or testing data must live in backend seeds (`api/scripts/seeds/`) or dedicated test fixture files (`tests/fixtures/`).
   - UI views must always consume real backend API responses, handle loading and error states gracefully, and render clean empty states when no data is returned.
9. **100% OpenAPI-Generated Types & Backend-First Feature Flow**:
   - The frontend must exclusively consume types generated from OpenAPI (`src/lib/types.ts` derived from `src/lib/api-schema.d.ts`).
   - Inventing, duplicating, or reimplementing backend domain types or DTO contracts in frontend code is strictly prohibited.
   - Backend-First Requirement: If a new UI feature requires data, fields, or operations that do not yet exist, implement and expose them in the backend API first, synchronize OpenAPI types via `just openapi` (or `pnpm run api:generate`), and only then integrate them in the frontend.

---

## 3. Execution Workflow

```bash
# PHASE 1: CONTRACT SYNC (Only if backend endpoints or DTOs changed)
# Run from monorepo root: just openapi (or pnpm run api:generate inside web/)

# PHASE 2: IMPLEMENT (Mobile-First UI & State)
# Do NOT run 'next build' or background watch tasks mid-implementation.

# PHASE 3: SANITIZE & FORMAT (Biome Autofix)
pnpm run check

# PHASE 4: TYPECHECK (Static Verification)
pnpm exec tsc --noEmit

# PHASE 5: TEST (Vitest Component, Hook & Service Suite)
pnpm exec vitest run

# PHASE 6: COMMIT (Targeted Conventional Staging)
git add <target-files>
git commit -m "feat(ui): descriptive single-line message"
```

> [!IMPORTANT]
> **Always Use Global `pnpm run <script>` (Do Not Target Individual Files)**:
> Always execute the predefined global Biome scripts (`pnpm run check`, `pnpm run review`, `pnpm run format`, `pnpm run lint`) targeting the whole repository (`.`) rather than individual files to avoid formatting or lint inconsistencies.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
