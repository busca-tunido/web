# Task: Initial Screen Email Discovery & Student Registration Modal (`web/tasks/initial-auth-check-email-student-register-modal.md`)

## Execution Profile

- **Wave / Batch**: Wave 3
- **Execution Mode**: `PARALLEL`
- **Assigned Role**: `Worker Agent`
- **Dependencies (`depends_on`)**: `[task-sync-wave-2.md]`
- **Collision Risk**: `LOW (Isolated auth components)`

## Target Files

- **Exclusive**:
  - `src/components/auth/student-register-modal.tsx`
  - `src/components/auth/email-check-step.tsx`
  - `src/hooks/use-auth-flow.ts`
  - `tests/components/auth-flow.spec.tsx`
- **Shared / Integration Points**:
  - `src/components/auth/auth-screen.tsx`
  - `src/lib/auth-context.tsx`

## Objective

Implement an intuitive two-step authentication and registration pipeline on the initial landing screen: the user inputs their email address; the frontend queries `/auth/check-email`. If the email is unregistered, the password field is suppressed and an interactive `<StudentRegisterModal />` opens with the email prefilled, enabling instant student account creation, instant validation via Zod, and automatic post-registration login.

## Technical Specifications

### 1. Two-Step Email Discovery Flow (`src/components/auth/email-check-step.tsx`)
- **Paso Inicial (Entrada de Correo)**:
  - Input: *"Correo institucional universitario"* (`ejemplo@alumnos.uchile.cl`).
  - Detección de dominio institucional (`Dominio institucional detectado`).
  - Botón: *"Continuar ->"*.
  - Al presionar *"Continuar"*: Se valida el formato y se invoca la API `authService.checkEmailExists(email)`.

- **Camino A (Usuario ya registrado - Comportamiento visual actual de la app)**:
  - Si el email pertenece a un usuario registrado en la base de datos:
    - El campo de correo se bloquea/muestra en solo lectura.
    - Se muestra el enlace *"Cambiar correo"*.
    - Aparece el campo *"Contraseña"* (`••••••••••••`).
    - El botón principal pasa a ser *"Acceder ->"*.
    - Permanece en la misma tarjeta sin abrir modales.

- **Camino B (Usuario no registrado - Nuevo flujo)**:
  - Si el email NO pertenece a ningún usuario registrado:
    - **No se muestra el campo de contraseña en la tarjeta principal**.
    - Se dispara y abre el modal interactivo `<StudentRegisterModal />` (*"Abrir modal para registrarse como usuario estudiante"*).
    - El correo ingresado se pasa automáticamente precompletado y bloqueado dentro del formulario del modal.
    - El usuario completa sus datos de alumno y al finalizar el registro se autentica automáticamente.

### 2. Student Registration Modal (`src/components/auth/student-register-modal.tsx`)
- Form fields validated with Zod:
  - Email (readonly/prefilled).
  - Password (min 8 characters, visibility toggle).
  - First Name (`firstName`) & Last Name (`lastName`).
  - University selector (fetched dynamically from `locationsService.fetchUniversities()`).
  - Phone number (optional or Chilean mobile format).
  - Terms of Service checkbox (`termsAccepted`).
- Validation Feedback:
  - Real-time field validation errors (via `FormField` and `useFormValidation`).
  - Submit button disabled until required fields are valid.

### 3. Submission & Auto-Authentication (`src/hooks/use-auth-flow.ts`)
- On submitting student registration:
  - Call `authService.registerStudent(payload)`.
  - Handle backend responses:
    - On 201 Created: Store JWT in session, update `AuthContext`, close modal, show welcome animation, transition user straight into `<StudentAppShell />`.
    - On 409 Conflict: Display error banner *"Este correo ya ha sido registrado"*.
    - On Connection Error: Display *"Error de conexión con el servidor. Reintentar."* without losing entered form fields.

## Checklist

- [x] Implement `src/components/auth/email-check-step.tsx` verifying email existence via API: execute Camino A (existing UI password prompt with "Cambiar correo" and "Acceder ->") if registered, or Camino B (open `<StudentRegisterModal />`) if unregistered.
- [x] Implement `src/components/auth/student-register-modal.tsx` with student fields and dynamic university selection.
- [x] Wire registration submit with `authService.registerStudent()` and automatic session login in `useAuthFlow`.
- [x] Connect robust error handling for network timeouts and duplicate emails.
- [x] Write component tests in `tests/components/auth-flow.spec.tsx` verifying email check step and modal triggers.
- [x] Validate code quality with Biome (`pnpm run check && pnpm run review`).

## Verification

- Component Tests: `pnpm exec vitest run tests/components/auth-flow.spec.tsx`
- Code Quality (Biome): `pnpm run check && pnpm run review`
- Build & Typecheck: `pnpm build`
