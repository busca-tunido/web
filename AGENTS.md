# Context & Architectural Guidelines for AI Coding Assistants

This document provides essential architectural context, domain patterns, and development guidelines for AI coding assistants contributing to **BuscaTuNido Web**.

---

## 1. Project Overview & Architecture

BuscaTuNido Web is a mobile-first web application built with [Next.js](https://nextjs.org/) (App Router), [Tailwind CSS](https://tailwindcss.com/), and [shadcn/ui](https://ui.shadcn.com/).

### Core Components Structure (Provisional Baseline):

> [!NOTE]
> Specific folder, component, and page hierarchies listed below are initial architectural baselines and will be iteratively finalized as application specifications evolve.

- `src/app/layout.tsx`: Root shell, viewport configuration, typography, and global providers.
- `src/app/page.tsx`: Landing page with hero search and nearby university selector.
- `src/app/pensions/`: Directory and search:
  - `page.tsx`: Search results with list and map toggling.
  - `[id]/page.tsx`: Pension detail view (photo gallery, services, rules, and review feed).
- `src/app/compare/page.tsx`: Side-by-side comparison (swipeable card deck on mobile, multi-column grid on desktop).
- `src/app/publish/page.tsx`: Multi-step collaborative pension submission wizard.
- `src/components/ui/`: Accessible UI primitives (Button, Drawer, Dialog, Card, Badge, Input, Tabs).
- `src/components/common/`: Shared navigation layout (`Header`, `MobileBottomBar`, `Footer`).
- `src/components/pensions/`: Domain components (`PensionCard`, `PensionFilterDrawer`, `AmenityBadge`).
- `src/hooks/`: Custom state and device hooks (`useMediaQuery`, `useGeolocation`, `useFavorites`).
- `src/lib/`: API client, query string builders, and formatting utilities.
- `src/types/`: Strict TypeScript domain types and API contract models.
- `tasks/TODO.md`: Active task specification being executed.
- `tasks/completed/`: Historical record of finished task specifications.

---

## 2. Critical Domain Rules & Patterns

1. **No Code Comments**:
   - Comments inside code are strictly prohibited unless explicitly requested by the user. Code must be self-explanatory through naming and structure.
2. **Mobile-First Responsive Design**:
   - Always style for small screens first (unprefixed Tailwind utilities). Use `sm:`, `md:`, `lg:` solely for layout adaptations on larger viewports.
   - Interactive elements must maintain a minimum touch target size of 48px by 48px.
   - Complex filter panels and modal actions must use bottom drawers (`Drawer` component) on mobile viewports.
3. **No Direct Config File Edits for Dependencies**:
   - Never edit `package.json` manually to add packages. Use terminal CLI commands (`pnpm add <pkg>`, `pnpm add -D <pkg>`, `pnpm dlx shadcn@latest add <component>`).
4. **Strict Typing (Types over Interfaces)**:
   - Use TypeScript `type` aliases exclusively; `interface` declarations are strictly forbidden.
   - Forbid `any` (prefer `unknown` or generics). Explicitly type props, API responses, and custom handlers; rely on types for simple state.
5. **Conventional Commits (Concise, Single-Line Only)**:
   - All git commit messages must strictly follow the Conventional Commits specification (e.g., `feat`, `fix`, `chore`, `refactor`, `test`, `docs`).
   - Commit messages must be concise, single-line only, and omit any extended body description.
6. **Brand Identity & Logo Component**:
   - Official brand vector asset: `/logo.svg`.
   - The brand logo must always be rendered using the reusable `<BrandLogo />` component (`src/components/ui/brand-logo.tsx`).
   - The logo places the nest vector directly beside the `BuscaTuNido` typography in a clean horizontal alignment without card containers, borders, or background boxes.
   - The brand name must always be written as a single PascalCase token: `BuscaTuNido` (never separated as `Busca Tu Nido`).

---

## 3. Task-Driven Lifecycle (TODO Workflow)

Every frontend UI enhancement, page, or bug fix must strictly follow the repository-specific task file generated inside the `tasks/` directory (`tasks/TODO.md`).

### Execution Cycle:

1. **Read Scope**: Inspect `tasks/TODO.md` before altering code. Confine all implementation strictly to the active task checklist.
2. **Track Progress**: Implement items step-by-step, checking off boxes (`- [x]`) as each phase is completed.
3. **Verify**: Execute verification commands declared in the task (e.g., `pnpm build`, type-checks, responsive viewport validation). All checks must pass before completing the task.
4. **User Verification**: Present the completed checklist, responsive viewports, and verification results to the user for review and explicit approval before archiving.
5. **Archive as Documentation**: Upon user approval, move/rename the completed `tasks/TODO.md` into `tasks/completed/[index]-[task-name].md` (e.g., `tasks/completed/001-setup-nextjs-app.md`). This creates an immutable history of frontend milestones.
6. **Handoff**: Generate a new, clean `tasks/TODO.md` inside `tasks/` for the next discrete task.

### Standard `TODO.md` Template:

```markdown
# Task: [Index] - [Descriptive Title]

## Objective

[1-2 sentences describing frontend goal and viewport focus]

## Checklist

- [ ] [Step 1]
- [ ] [Step 2]

## Target Files

- `src/app/...`

## Verification

- Command: `[e.g., pnpm build]`
```

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
