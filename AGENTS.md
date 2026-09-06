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
- `tasks/[index]_[task-name].md`: Active task specification being executed.
- `tasks/completed/`: Historical record of finished task specifications.

---

## 2. Critical Domain Rules & Patterns

1. **No Code Comments**:
   - Comments inside code are strictly prohibited unless explicitly requested by the user. Code must be self-explanatory through naming and structure.
1. **Mobile-First Responsive Design**:
   - Always style for small screens first (unprefixed Tailwind utilities). Use `sm:`, `md:`, `lg:` solely for layout adaptations on larger viewports.
   - Interactive elements must maintain a minimum touch target size of 48px by 48px.
   - Complex filter panels and modal actions must use bottom drawers (`Drawer` component) on mobile viewports.
1. **No Direct Config File Edits for Dependencies**:
   - Never edit `package.json` manually to add packages. Use terminal CLI commands (`pnpm add <pkg>`, `pnpm add -D <pkg>`, `pnpm dlx shadcn@latest add <component>`).
1. **Strict Typing (Types over Interfaces)**:
   - Use TypeScript `type` aliases exclusively; `interface` declarations are strictly forbidden.
   - Forbid `any` (prefer `unknown` or generics). Explicitly type props, API responses, and custom handlers; rely on types for simple state.
1. **Conventional Commits (Concise, Single-Line Only)**:
   - All git commit messages must strictly follow the Conventional Commits specification (e.g., `feat`, `fix`, `chore`, `refactor`, `test`, `docs`).
   - Commit messages must be concise, single-line only, and omit any extended body description.

---

## 3. Task-Driven Lifecycle (`tasks/[index]_[task-name].md` Workflow)

Every frontend UI enhancement, page, or bug fix must strictly adhere to the following workflow:

### Code Quality & Biome Scripts Workflow:

The project utilizes [Biome](https://biomejs.dev/) as a unified, ultra-fast toolchain for formatting and linting. Agents must leverage these dedicated scripts throughout the development workflow:

- `pnpm run format`: Formats source files and enforces styling rules (`biome format --write .`).
- `pnpm run lint`: Scans for code issues and applies safe linter autofixes (`biome lint --write .`).
- `pnpm run check`: Unified command combining formatting, import organization, and safe lint autofixes (`biome check --write .`). Agents must run this after modifying code.
- `pnpm run review`: Read-only verification check (`biome check .`) that returns an error exit code if any unresolved formatting or lint errors exist. Mandatory for validation.

> [!IMPORTANT]
> **Always Use Global `pnpm run <script>` (Do Not Target Individual Files)**:
> Due to Biome's extreme execution speed (processing the entire project in tens of milliseconds), agents must always execute the predefined global scripts (`pnpm run check`, `pnpm run review`, `pnpm run format`, `pnpm run lint`) targeting the whole repository (`.`) rather than targeting individual files. Running against specific files provides no measurable performance advantage and risks leaving formatting or lint inconsistencies across the project.

### Execution Cycle:

1. **Task Breakdown by Purpose**:
   - Read the user request(s) and create a separate `tasks/[index]_[task-name].md` file for each request that serves a distinct purpose.
   - *Example*: Improving the touch gestures of a panel and adding a text label to that same panel belong in the same task specification. In contrast, updating a Next.js configuration belongs in a separate task specification.
2. **Review & Clarification Gate**:
   - Once all task files are generated, notify the user to review all task specifications in `tasks/`.
   - Ask clarifying questions if any requirement or detail is ambiguous, and STOP the process so the user can review and approve the tasks.
3. **Sequential Execution**:
   - Once the user approves the tasks, execute them one by one until all are completed.
   - For each task, strictly follow these steps:
     - **Read Scope**: Inspect `tasks/[index]_[task-name].md` before modifying code. Confine all implementation strictly to the active task checklist.
     - **Track Progress**: Implement checklist items step-by-step, checking off boxes (`- [x]`) as each phase is completed.
     - **Verify**:
       1. Run `pnpm run check` to automatically organize imports, fix linter warnings, and format code.
       2. Run `pnpm run review` to strictly verify that zero linting or formatting diagnostics remain.
       3. Run application build and type checks (`pnpm build`). All checks must pass with zero errors before completion.
     - **User Verification**: Present the completed checklist, responsive viewports, and verification results to the user for review and explicit approval before archiving.
     - **Archive as Documentation**: Upon user approval, move/rename the completed `tasks/[index]_[task-name].md` into `tasks/completed/[index]_[task-name].md` (e.g., `tasks/completed/001_setup-nextjs-app.md`). This preserves an immutable history of frontend milestones.
     - **Handoff**: Proceed to the next pending task in the sequence.

### Standard `[index]_[task-name].md` Template:

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

- Code Quality (Biome): `pnpm run check && pnpm run review`
- Build & Typecheck: `pnpm build`
```

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
