# Task: Form Field Validation & Instant UX Feedback via Zod (`web/tasks/field-validation-ux-feedback.md`)

## Execution Profile

- **Wave / Batch**: Wave 1
- **Execution Mode**: `PARALLEL`
- **Assigned Role**: `Worker Agent`
- **Dependencies (`depends_on`)**: None
- **Collision Risk**: `LOW (Isolated files)`

## Target Files

- **Exclusive**:
  - `src/lib/validations/auth.schema.ts`
  - `src/lib/validations/reviews.schema.ts`
  - `src/lib/validations/pensions.schema.ts`
  - `src/hooks/use-form-validation.ts`
  - `src/components/ui/form-field.tsx`
  - `tests/validations/schemas.spec.ts`
- **Shared / Integration Points**:
  - `src/lib/validations/index.ts` (Requiere Merge Gate en Wave 1 Sync)

## Objective

Standardize client-side form validation across the web application using Zod without reinventing the wheel, providing friendly, real-time UX feedback (inline error badges, visual state cues, aria-invalid attributes, and automatic error dismissal).

## Technical Specifications

### 1. Zod Validation Schemas (`src/lib/validations/`)
- Avoid manual regex or ad-hoc validation loops:
  - **Auth**:
    - `emailCheckSchema`: Valid RFC 5322 email string.
    - `loginSchema`: Email and minimum 8-character password.
    - `studentRegisterSchema`: Email, password, firstName (min 2), lastName (min 2), phone (international or Chilean standard format), universityId (UUID), termsAccepted (`z.literal(true)`).
  - **Reviews**:
    - `createReviewSchema`: Rating (integer 1-5), comment (min 15 chars, max 1000), roomType (`enum`), images (array of strings, max 3 photos).
  - **Reports & Edit Proposals**:
    - `flagReportSchema`: Category (`enum`), reason (min 10 chars).
    - `editProposalSchema`: Suggested field changes with non-empty justification.

### 2. Lightweight Reusable Validation Hook (`src/hooks/use-form-validation.ts`)
- Implement `useFormValidation<T>` accepting a Zod schema:
  - Returns `values`, `errors` (mapped per field), `touched` state, `handleChange`, `handleBlur`, and `validateForm()`.
  - Debounced real-time validation on keystroke after field is first touched.
  - Returns clear, friendly error messages in Spanish (e.g., *"Ingresa un correo electrónico válido"*, *"La reseña debe tener al menos 15 caracteres"*, *"Máximo 3 imágenes permitidas"*).

### 3. Accessible Form Field Primitive (`src/components/ui/form-field.tsx`)
- Encapsulates input, label, optional/required badge, and animated error message (`motion/react` or CSS transition).
- Adds `aria-invalid={!!error}` and `aria-describedby` for screen reader accessibility.

## Checklist

- [ ] Define Zod schemas in `src/lib/validations/auth.schema.ts`, `reviews.schema.ts`, and `pensions.schema.ts`.
- [ ] Create `src/hooks/use-form-validation.ts` with real-time feedback and touched-state tracking.
- [ ] Create `src/components/ui/form-field.tsx` with accessible error tags and transition animations.
- [ ] Write unit tests in `tests/validations/schemas.spec.ts` verifying all schema constraints and error messages.
- [ ] Validate code quality with Biome (`pnpm run check && pnpm run review`).

## Verification

- Validation Tests: `pnpm exec vitest run tests/validations/schemas.spec.ts`
- Code Quality (Biome): `pnpm run check && pnpm run review`
