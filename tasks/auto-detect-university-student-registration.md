# Task: Auto-Detect University from Email in Student Registration

## Execution Profile

- **Wave / Batch**: Wave 2 (Client Registration Flow & Verified Affiliation)
- **Execution Mode**: `SEQUENTIAL`
- **Assigned Role**: `Worker Agent (Web Auth Flow)`
- **Dependencies (`depends_on`)**: `[api/tasks/auto-detect-university-by-email-domain.md]`
- **Collision Risk**: `LOW (Isolated student registration components)`

## Target Files

- **Exclusive**:
  - `src/components/auth/student-register-modal.tsx`
  - `src/components/auth/email-check-step.tsx`
  - `src/components/auth/auth-screen.tsx`
  - `src/lib/validations/auth.schema.ts`
  - `src/types/api-contracts.ts`
  - `src/services/auth.service.ts`
  - `tests/components/auth/student-register-modal.spec.tsx`
- **Shared / Integration Points**:
  - None

## Objective

Modernize the student registration experience by removing manual university selection. 

The student's affiliated institution must be auto-detected by the backend from their institutional email address (`@alumnos.uchile.cl`, `@uc.cl`, etc.) during the initial email check step, and displayed as a read-only, verified institutional card in the registration modal.

## Technical Specifications

### 1. API Contract & Service Updates (`src/types/api-contracts.ts` & `src/services/auth.service.ts`)
- Update `CheckEmailResponseDto`:
  ```ts
  export type DetectedUniversityDto = {
    id: string;
    name: string;
    shortName: string | null;
    city: string;
  };

  export type CheckEmailResponseDto = {
    exists: boolean;
    detectedUniversity?: DetectedUniversityDto | null;
  };
  ```

### 2. State & Modal Props (`src/components/auth/email-check-step.tsx`)
- When `authService.checkEmail(email)` returns `{ exists: false, detectedUniversity }`:
  - Store `detectedUniversity` in component state.
  - Forward `detectedUniversity` to `<StudentRegisterModal detectedUniversity={detectedUniversity} />`.

### 3. Remove Manual Select & Render Verified Card (`src/components/auth/student-register-modal.tsx`)
- Remove `UniversitySearchSelect` from imports and JSX.
- Remove manual university change handlers.
- Bind `values.universityId` automatically to `detectedUniversity?.id ?? ''`.
- Display a verified institutional badge card:
  - **When a university is recognized**:
    ```tsx
    <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 p-3.5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/20 text-primary">
        <GraduationCap className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-xs font-bold text-foreground truncate">
            {detectedUniversity.name}
          </p>
          {detectedUniversity.shortName && (
            <Badge variant="secondary" className="text-[10px] py-0 px-1.5">
              {detectedUniversity.shortName}
            </Badge>
          )}
        </div>
        <p className="text-[11px] text-muted-foreground">
          Institución verificada automáticamente por tu correo
        </p>
      </div>
    </div>
    ```
  - **When NO university is recognized for the domain**:
    - Display an alert banner:
      ```tsx
      <div className="flex items-start gap-2.5 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold">Dominio institucional no reconocido</p>
          <p className="text-[11px] opacity-90 mt-0.5">
            El dominio del correo ingresado no coincide con ninguna universidad registrada. Por favor verifica tu correo oficial de estudiante.
          </p>
        </div>
      </div>
      ```
    - Disable the submit button (`disabled={!detectedUniversity}`).

### 4. Schema Validation Update (`src/lib/validations/auth.schema.ts`)
- Ensure `studentRegisterSchema` continues validating `universityId` as non-empty, satisfied by the auto-injected ID.

## Checklist

- [ ] Update `CheckEmailResponseDto` in `src/types/api-contracts.ts` to include `detectedUniversity`.
- [ ] Pass `detectedUniversity` from `email-check-step.tsx` to `student-register-modal.tsx`.
- [ ] Remove `UniversitySearchSelect` from `student-register-modal.tsx`.
- [ ] Implement read-only verified university card in `student-register-modal.tsx`.
- [ ] Show friendly rejection message and disable submit if domain has no associated university.
- [ ] Update unit tests in `tests/components/auth/student-register-modal.spec.tsx` verifying:
  - Form initializes with detected university.
  - Manual dropdown is absent.
  - Submit is blocked when no university is detected.
- [ ] Run global Biome quality gate (`pnpm run check && pnpm run review`).
- [ ] Run TypeScript typecheck (`pnpm exec tsc --noEmit`).
- [ ] Run Vitest unit tests (`pnpm exec vitest run`).
- [ ] Stage and commit with conventional commit message (`feat(auth): auto-detect and display university from email in registration modal`).

## Verification

- Code Quality (Biome): `pnpm run check && pnpm run review`
- Typecheck: `pnpm exec tsc --noEmit`
- Tests: `pnpm exec vitest run`
