# Task: Default Authentication Flow & Complete Removal of Guest Mode (`tasks/default-auth-no-guest.md`)

## Objective

Eliminate all artificial client-side "Acceso de Prueba e Invitado" drawers, guest bypasses, and demo role switchers, replacing them with a realistic, production-aligned authentication experience featuring permanent default demo accounts (one Student and one Landlord) seeded deterministically in `prisma/seed-test.ts` and prefilled in the login UI for friction-free developer testing.

---

## Detailed Specifications & Visual References

### 1. Visual References Analysis

#### Elements to Eliminate (`referencias/no-invitados/eliminar.png`):
1. **Acceso de Prueba e Invitado Drawer**:
   - Modal drawer triggered from login screen offering "Continuar como Invitado", "Estudiante Universitario Demo", and "Propietario / Dueño Demo".
   - Completely remove the `<Drawer>` component and its triggers from `src/components/auth/auth-screen.tsx`.
2. **"Explorar alojamientos como invitado" Link**:
   - Text link at the bottom of the login container.
   - Completely remove the button and `onContinueAsGuest` callbacks.
3. **"Cambiar Rol Activo (Modo Prueba)" Card**:
   - Test card in `src/components/account/account-screen.tsx` allowing arbitrary client-side role toggling between `Estudiante`, `Propietario`, and `Admin`.
   - Completely remove this card so the account screen reflects authentic backend user state.

#### New Two-Step Default Login Flow (`referencias/no-invitados/nuevos_pasos.png`):
1. **Paso 1 - Selección de Perfil & Correo por Defecto**:
   - Tabs or selector between **"Soy estudiante"** and **"Soy propietario / Dueño"**.
   - Input pre-filled with the corresponding default test email:
     - Estudiante: `estudiante.demo@uchile.cl`
     - Propietario: `propietario.demo@buscatunido.cl`
   - Primary action button: **"Continuar →"**.
2. **Paso 2 - Contraseña por Defecto & Autenticación Real**:
   - Displays selected email.
   - Input for password pre-filled with `Password123!`.
   - Primary action button: **"Acceder →"**.
   - Executes authentic `POST /auth/login` request against the API, receiving a real JWT token and loading the true database user profile.

---

## Technical Scope

### 1. Backend Seed Refactor (`api/prisma/seed-test.ts`)
- Seed a permanent, deterministic student user before random student loop:
  - `email`: `estudiante.demo@uchile.cl`
  - `passwordHash`: bcrypt hash for `Password123!`
  - `firstName`: `'Estudiante'`
  - `lastName`: `'Demo'`
  - `phone`: `'+56912345678'`
  - `role`: `'STUDENT'`
  - `isEmailVerified`: `true`
  - `universityId`: assigned to the primary university (Universidad de Chile).
- Seed a permanent, deterministic landlord user before random landlord loop:
  - `email`: `propietario.demo@buscatunido.cl`
  - `passwordHash`: bcrypt hash for `Password123!`
  - `firstName`: `'Propietario'`
  - `lastName`: `'Demo'`
  - `phone`: `'+56987654321'`
  - `role`: `'LANDLORD'`
  - `isEmailVerified`: `true`
  - Assigned as owner of the first 3 pensions seeded in primary cities.
- Add strict runtime assertion verifying both permanent test accounts exist with matching roles.

### 2. Frontend Auth Screen Refactor (`web/src/components/auth/auth-screen.tsx`)
- Remove the "Acceso de Prueba e Invitado" drawer and trigger button.
- Remove the "Explorar alojamientos como invitado" link and `onContinueAsGuest` prop.
- Implement profile switcher:
  - Tab / segmented control: **Estudiante** vs **Propietario**.
  - Default email updates reactively when switching tabs.
- Multi-step flow:
  - Step 1 (Email): Pre-filled with active role email, validated with institutional badge for students.
  - Step 2 (Password): Pre-filled with `Password123!`, "Acceder" button triggers real `loginWithEmail(email, password)`.

### 3. Frontend Account Screen Cleanup (`web/src/components/account/account-screen.tsx`)
- Remove the `Cambiar Rol Activo (Modo Prueba)` card entirely.
- Display verified student/landlord badges based solely on authentic backend user data (`user.role`, `user.universityName`, `user.isEmailVerified`).

### 4. Auth Context Streamlining (`web/src/lib/auth-context.tsx`)
- Remove `isGuest` and `continueAsGuest()`.
- Remove `DEMO_USERS` mock dictionary and `loginAsDemo()` client-side state bypass.
- Provide clean `login(email, password)`, `logout()`, `user`, `token`, and `isAuthenticated`.

---

## Checklist

### Backend (`api`)
- [ ] Add permanent student user (`estudiante.demo@uchile.cl`) to `api/prisma/seed-test.ts`.
- [ ] Add permanent landlord user (`propietario.demo@buscatunido.cl`) to `api/prisma/seed-test.ts` with assigned pensions.
- [ ] Add runtime assertions validating presence of both default test users.
- [ ] Execute `pnpm db:seed` in `api` to populate the database with the permanent test accounts.
- [ ] Verify `api` code formatting and build (`pnpm run check && pnpm run review`).

### Frontend (`web`)
- [ ] Remove "Acceso de Prueba e Invitado" drawer from `src/components/auth/auth-screen.tsx`.
- [ ] Remove "Explorar alojamientos como invitado" link and prop from `src/components/auth/auth-screen.tsx`.
- [ ] Implement Estudiante vs Propietario profile toggle with pre-filled default emails.
- [ ] Pre-fill `Password123!` on Step 2 and wire "Acceder" to real `loginWithEmail(email, password)`.
- [ ] Remove "Cambiar Rol Activo (Modo Prueba)" card from `src/components/account/account-screen.tsx`.
- [ ] Remove `isGuest`, `continueAsGuest`, and `DEMO_USERS` bypass from `src/lib/auth-context.tsx`.
- [ ] Validate `web` code quality and formatting with Biome (`pnpm run check && pnpm run review`).
- [ ] Verify `web` production build with `pnpm run build`.

---

## Target Files

- `api/prisma/seed-test.ts`
- `web/src/components/auth/auth-screen.tsx`
- `web/src/components/account/account-screen.tsx`
- `web/src/lib/auth-context.tsx`
- `web/src/lib/api-client.ts`

---

## Verification

- Backend Seed: `pnpm db:seed` in `api`
- Code Quality (Biome): `pnpm run check && pnpm run review` in both `api` and `web`
- Production Build: `pnpm run build` in `web` and `pnpm exec nest build` in `api`
