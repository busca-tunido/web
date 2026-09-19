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
- `tasks/[task-name].md`: Active task specification being executed.
- `tasks/completed/[index]_[task-name].md`: Historical record of finished task specifications with chronological index.

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
1. **Exclusive for Authenticated & Registered Users (No Guests Allowed)**:
   - The application is strictly and exclusively for registered users who have logged in.
   - Guest browsing, guest mode toggles, or unauthenticated interactions are strictly prohibited.
   - Any unauthenticated state must block interaction and prompt immediate login or registration.
1. **Conventional Commits (Concise, Single-Line Only)**:
   - All git commit messages must strictly follow the Conventional Commits specification (e.g., `feat`, `fix`, `chore`, `refactor`, `test`, `docs`).
   - Commit messages must be concise, single-line only, and omit any extended body description.

---

## 3. Task-Driven Lifecycle (`tasks/[task-name].md` Workflow)

Every frontend UI enhancement, page, or bug fix must strictly adhere to the following workflow:

### Code Quality & Biome Scripts Workflow:

- `pnpm run check`: Unified command combining formatting, import organization, and safe lint autofixes (`biome check --write .`). Agents must run this after modifying code.
- `pnpm run review`: Read-only verification check (`biome check .`) that returns an error exit code if any unresolved formatting or lint errors exist. Mandatory for validation.

> [!IMPORTANT]
> **Always Use Global `pnpm run <script>` (Do Not Target Individual Files)**:
> Due to Biome's extreme execution speed (processing the entire project in tens of milliseconds), agents must always execute the predefined global scripts (`pnpm run check`, `pnpm run review`, `pnpm run format`, `pnpm run lint`) targeting the whole repository (`.`) rather than targeting individual files. Running against specific files provides no measurable performance advantage and risks leaving formatting or lint inconsistencies across the project.

### Execution Cycle:

1. **Task Breakdown by Purpose & Topology**:
   - Read the user request(s) and decompose them into structured `tasks/[task-name].md` files (omitting any index prefix while active in `tasks/`).
   - Act as a **Directed Acyclic Graph (DAG) compiler**, assigning each task an explicit `Execution Profile` (Wave, Mode, Role, Dependencies, Collision Risk).
2. **Review & Clarification Gate**:
   - Once all task specifications are generated, notify the user to review the DAG and execution waves in `tasks/`.
   - Ask clarifying questions if any requirement or boundary is ambiguous, and STOP so the user can review and approve the plan.
3. **Parallel Decomposition & Dependency Rules for the Planner Agent**:
   When breaking down user requirements into task specifications, the planner agent must evaluate concurrency using the **Disjoint File Sets Rule**:
   - **Orthogonality Check (Collision Matrix)**:
     - Compare `Target Files` between all proposed tasks.
     - **Parallelizable (Disjoint)**: If $Files(Task\_A) \cap Files(Task\_B) = \emptyset$, both tasks must be assigned to the same `Wave` with `Execution Mode: PARALLEL`.
     - **Sequential (Intersection)**: If two tasks modify the same domain file or internal logic, the dependent task must be assigned to `Wave N+1` with `Execution Mode: SEQUENTIAL` and list its prerequisite in `depends_on`.
   - **Handling Critical Shared Hubs (`src/app/layout.tsx`, global providers, root routing, lockfiles)**:
     - Global entry points and root layout files are high-risk collision points.
     - **Contract-First / Wave 0 Rule**: If tasks require new shared API clients, global types, or base design system primitives, the planner must define a **Preparatory Task (Wave 0)** to establish contracts before dispatching parallel UI tasks.
     - Workers must NOT edit shared global root files directly during parallel waves. Shared integrations are deferred to the `Integrator Agent` in the Wave Sync Gate.
   - **Wave Structure (DAG Execution)**:
     - Organize work into chronological waves:
       - `Wave 0 (Setup / Contracts)`: Shared TypeScript domain contracts, base UI primitives, API client signatures (Sequential).
       - `Wave 1 (Workers)`: Page implementations, isolated components, custom hooks in parallel branches/worktrees (Isolated).
       - `Wave 1 - Sync Gate`: Merge, resolve shared hubs (`src/app/layout.tsx`, navigation bars), run full repository checks (Sequential).

> [!IMPORTANT]
> **Task Naming & Lifecycle Convention (Strict Rule)**:
> - **Active tasks MUST NOT use numeric prefixes**: When defining or working on tasks in `tasks/`, name them descriptively using kebab-case without any numbers (e.g., `tasks/some-feature.md`). Numbering tasks in advance is forbidden because execution order and wave completion can vary.
> - **Sequential numbering is strictly reserved for `tasks/completed/`**: A three-digit sequential index (`001-`, `002-`, etc.) is assigned **only** when a task is fully implemented, verified, merged, and moved into `tasks/completed/` to preserve an immutable, chronological archive.

**Lifecycle Example**:

1. While the task is active / in progress:
```text
tasks/
├── completed/
│   ├── 001-some-old-task.md
│   └── 002-implement-x-feature.md
└── some-task.md                    # Active task (no numeric prefix)
```

2. Once `some-task.md` is fully implemented and verified:
```text
tasks/
├── completed/
│   ├── 001-some-old-task.md
│   ├── 002-implement-x-feature.md
│   └── 003-some-task.md             # Archived with next sequential index
```

4. **Agent Role Assignment: Worker Agent vs. Integrator Agent**:

| Rol de Agente                      | Ámbito de Trabajo                                                      | Reglas de Asignación                                                                                                                                                                                                          |
| ---------------------------------- | ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Worker Agent (N instancias)**    | Ramas/Worktrees independientes (`worktree-task-A`, `worktree-task-B`). | Se le asigna **1 sola tarea paralela**. Solo puede editar sus `Exclusive Target Files`. Verifica localmente (`pnpm run check && pnpm run review` y `pnpm build`). Al terminar, realiza su commit convencional y se detiene.   |
| **Integrator Agent (1 instancia)** | Rama base de integración (`main` o `staging`).                         | Se asigna a tareas con etiqueta `Assigned Role: Integrator Agent`. No programa lógica de negocio nueva. Realiza merges/rebases, modifica archivos compartidos (`Shared / Integration Points`) y valida la compilación global. |

5. **Wave Sync Gate (`task-sync-wave-N.md`)**:
   For every batch, the planner agent must automatically include a closing integration task named `task-sync-wave-N.md`. This task:
   - Unlocks strictly when all checklists for tasks in `Wave N` are marked completed (`- [x]`).
   - Is formally assigned to the **Integrator Agent**.
   - Follows the integration checklist:
     1. Merge or rebase worker branches/worktrees into the base branch.
     2. Update shared integration hubs (e.g., register routes in shared navigation, integrate providers in `layout.tsx`).
     3. Run global repository verification (`pnpm run check && pnpm run review` and `pnpm build`).
     4. Resolve any interoperability or type conflicts as the sole authorized agent.
     5. Teardown temporary worktrees (`git worktree remove`).

6. **Archive as Documentation**:
   - Upon user approval and successful Wave integration, move/rename completed `tasks/[task-name].md` into `tasks/completed/[index]_[task-name].md` (e.g., `tasks/completed/001_setup-nextjs-app.md`), assigning its chronological three-digit index only upon completion to preserve an immutable audit trail.

### Standard `[task-name].md` Template:

```markdown
# Task: [Descriptive Title]

## Execution Profile

- **Wave / Batch**: Wave 1 | Wave 2 | Wave 3
- **Execution Mode**: `PARALLEL` | `SEQUENTIAL`
- **Assigned Role**: `Worker Agent` | `Integrator Agent`
- **Dependencies (`depends_on`)**: None | `[task-name-a.md, task-name-b.md]`
- **Collision Risk**: `LOW (Isolated files)` | `HIGH (Shared core files)`

## Target Files

- **Exclusive**:
  - `src/components/pensions/custom-card.tsx`
  - `src/hooks/use-custom-filter.ts`
- **Shared / Integration Points**:
  - `src/app/layout.tsx` (Requiere Merge Gate)
  - `src/components/common/header.tsx`

## Objective

[1-2 sentences describing frontend goal and viewport focus]

## Technical Specifications

[Key technical details, component interfaces, state requirements]

## Checklist

- [ ] [Step 1]
- [ ] [Step 2]

## Verification

- Code Quality (Biome): `pnpm run check && pnpm run review`
- Build & Typecheck: `pnpm build`
```

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
