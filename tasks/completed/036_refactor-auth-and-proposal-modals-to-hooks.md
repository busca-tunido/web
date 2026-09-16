# Task: Refactor Auth and Proposal Modals to Hooks (`web/tasks/036_refactor-auth-and-proposal-modals-to-hooks.md`)

## Execution Profile

- **Wave / Batch**: Wave 2
- **Execution Mode**: `PARALLEL`
- **Assigned Role**: `Worker Agent (Web Auth & Edit Modals)`
- **Dependencies (`depends_on`)**: `[032_create-viewport-universities-proposal-hooks.md]`
- **Collision Risk**: `LOW (Isolated student register and suggest edit modals)`

## Target Files

- **Exclusive**:
  - `src/components/auth/student-register-modal.tsx`
  - `src/components/pensions/suggest-edit-modal.tsx`

## Objective

Eliminate raw `useEffect` and direct API calls in `StudentRegisterModal` and `SuggestEditModal` by adopting `useUniversities` and `useSuggestEdit`.

## Technical Specifications

1. **`src/components/auth/student-register-modal.tsx`**:
   - Replace `useEffect` calling `fetchUniversities()` with `const { universities } = useUniversities();`.

2. **`src/components/pensions/suggest-edit-modal.tsx`**:
   - Adopt `useSuggestEdit(pension.id, pension)`.
   - Delegate diff computation and proposal submission to the hook.

## Checklist

- [ ] Adopt `useUniversities` in `StudentRegisterModal`.
- [ ] Adopt `useSuggestEdit` in `SuggestEditModal`.
- [ ] Strictly typed with no `any`.
- [ ] Stage exclusively target files and commit with `refactor(modals): adopt useUniversities and useSuggestEdit hooks`.
