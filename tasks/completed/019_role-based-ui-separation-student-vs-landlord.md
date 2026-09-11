# Task: Role-Based UI Architecture & Student vs Landlord Shell Separation (`web/tasks/role-based-ui-separation-student-vs-landlord.md`)

## Execution Profile

- **Wave / Batch**: Wave 2
- **Execution Mode**: `PARALLEL`
- **Assigned Role**: `Worker Agent`
- **Dependencies (`depends_on`)**: `[task-sync-wave-1.md]`
- **Collision Risk**: `LOW (Isolated files)`

## Target Files

- **Exclusive**:
  - `src/components/shells/student-app-shell.tsx`
  - `src/components/shells/landlord-app-shell.tsx`
  - `src/components/shells/role-router.tsx`
  - `src/components/common/unimplemented-role-banner.tsx`
  - `src/hooks/use-user-role.ts`
- **Shared / Integration Points**:
  - `src/app/page.tsx` (Requiere Merge Gate en Wave 2 Sync)

## Objective

Decouple the frontend into two completely distinct application shells: `<StudentAppShell />` and `<LandlordAppShell />`. Ensure the landlord interface contains ONLY the Profile/Account view (`AccountScreen`), completely omitting favorites, reviews, map exploration, and search drawers. All other sections and features for non-student roles are placed in an explicit "No implementado aún" state.

## Technical Specifications

### 1. Tagged Discriminant Union for User Roles (`src/hooks/use-user-role.ts`)
- Implement typed role states using tagged unions:
  ```typescript
  export type ActiveUserSession =
    | { status: 'authenticated'; role: 'student'; user: StudentProfile }
    | { status: 'authenticated'; role: 'landlord'; user: LandlordProfile }
    | { status: 'authenticated'; role: 'moderator' | 'admin'; user: AdminProfile }
    | { status: 'unauthenticated' };
  ```
- Hook `useUserRole()` exposes current role and permission helper flags (`isStudent`, `isLandlord`, `isAdmin`).

### 2. Landlord Application Shell (`src/components/shells/landlord-app-shell.tsx`)
- Minimalist layout containing:
  - Header with BuscaTuNido branding and role badge ("Dueño / Propietario").
  - **Exclusively renders the Profile / Account section (`AccountScreen`)**.
  - No bottom navigation bar with favorites, search, explore, or history tabs.
  - Informative banner indicating that property publishing and management tools are in development:
    *"Panel de gestión de alojamientos en preparación. Por ahora puedes gestionar tu perfil y credenciales."*
  - Dedicated sign out button.

### 3. Student Application Shell (`src/components/shells/student-app-shell.tsx`)
- Encapsulates the full student experience:
  - Hero search bar with city and university selectors.
  - Active tabs: `explore`, `map`, `favorites`, `history`, `account`.
  - Floating action buttons, pension detail drawers, and reviews feed.

### 4. Role Router (`src/components/shells/role-router.tsx`)
- Evaluates the user's role:
  - If `role === 'student'`: Renders `<StudentAppShell />`.
  - If `role === 'landlord'`: Renders `<LandlordAppShell />`.
  - If `role === 'moderator' | 'admin'`: Renders `<UnimplementedRoleBanner role={role} />` with logout button.

## Checklist

- [x] Create `src/hooks/use-user-role.ts` with discriminant tagged union typing.
- [x] Create `src/components/shells/landlord-app-shell.tsx` containing ONLY the Account/Profile screen and sign out action.
- [x] Extract full student experience into `src/components/shells/student-app-shell.tsx`.
- [x] Create `src/components/common/unimplemented-role-banner.tsx` for non-student unimplemented states.
- [x] Implement `src/components/shells/role-router.tsx` to switch cleanly between student and landlord layouts.
- [x] Validate code quality with Biome (`pnpm run check && pnpm run review`).

## Verification

- Code Quality (Biome): `pnpm run check && pnpm run review`
- Build & Typecheck: `pnpm build`
