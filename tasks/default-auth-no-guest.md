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

#### New Default Login Flow (`referencias/no-invitados/nuevos_pasos.png`):
1. **Flujo de Acceso para Estudiantes ("Soy estudiante")**:
   - **Paso 1 (Email)**: Campo pre-rellenado con el usuario estudiante por defecto (`estudiante.demo@uchile.cl`). Botón **"Continuar →"**.
   - **Paso 2 (Contraseña)**: Campo pre-rellenado con la contraseña por defecto (`Password123!`). Botón **"Acceder →"**.
   - Ejecuta autenticación real `POST /auth/login`, obteniendo el token JWT del estudiante desde la base de datos.
2. **Acceso para Propietarios ("No soy estudiante")**:
   - Sección ubicada debajo del divisor "No soy estudiante".
   - Permite iniciar sesión como propietario con la cuenta por defecto (`propietario.demo@buscatunido.cl` / `Password123!`).
   - **Sin toggles de rol en caliente**: No existe ningún toggle o selector de perfiles para cambiar de rol dentro de la aplicación. Para pasar de Estudiante a Propietario, el usuario debe presionar **"Cerrar sesión"** en su cuenta e iniciar sesión desde la opción "No soy estudiante".

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
- Strictly no profile toggle or role switcher inside the screen.
- "Soy estudiante" flow:
  - Step 1 (Email): Pre-filled with default student email (`estudiante.demo@uchile.cl`), detected institutional domain badge.
  - Step 2 (Password): Pre-filled with `Password123!`, "Acceder" button triggers real `loginWithEmail(email, password)`.
- "No soy estudiante" section:
  - Action under the divider that authenticates as the default landlord (`propietario.demo@buscatunido.cl` / `Password123!`) via real API login.

### 3. Frontend Account Screen Cleanup (`web/src/components/account/account-screen.tsx`)
- Remove the `Cambiar Rol Activo (Modo Prueba)` card entirely.
- Display verified student/landlord badges based solely on authentic backend user data (`user.role`, `user.universityName`, `user.isEmailVerified`).
- To switch roles: the user must tap **"Cerrar Sesión"** and log in through the corresponding section on the login screen.

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
- [ ] Implement two-step default login for "Soy estudiante" (Step 1: pre-filled email, Step 2: pre-filled `Password123!`).
- [ ] Implement authentic landlord login under "No soy estudiante" section with pre-filled default credentials (`propietario.demo@buscatunido.cl`).
- [ ] Ensure strict role isolation without toggles: switching roles requires logging out ("Cerrar Sesión") from the account.
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
