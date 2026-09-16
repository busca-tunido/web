# Task: Modal Reducers and State Machines (`web/tasks/041_modal-reducers-state-machines.md`)

## Execution Profile

- **Wave / Batch**: Wave 2
- **Execution Mode**: `PARALLEL`
- **Assigned Role**: `Worker Agent (Web State Machines)`
- **Dependencies (`depends_on`)**: `[]`
- **Collision Risk**: `LOW (Isolated form reducers and modal components)`

## Target Files

- **Exclusive**:
  - `src/reducers/suggest-edit-reducer.ts`
  - `src/reducers/publish-review-reducer.ts`
  - `src/components/pensions/suggest-edit-modal.tsx`
  - `src/components/reviews/publish-review-modal.tsx`

## Objective

Replace the anti-pattern of 10+ dispersed `useState` calls in `SuggestEditModal` and `PublishReviewModal` with clean, pure `useReducer` state machines. This makes form diffing, validation, error resets, and payload generation predictable, testable, and robust.

## Technical Specifications

### 1. `src/reducers/suggest-edit-reducer.ts`
- Pure reducer handling actions: `SET_FIELD`, `TOGGLE_AMENITY`, `RESET_TO_PENSION`, `SET_SUBMISSION_NOTES`.
- Pure function `calculateProposedDiff(original: PensionItem, current: EditDraftState): Record<string, unknown>`.

### 2. `src/reducers/publish-review-reducer.ts`
- Pure reducer handling actions: `SET_OVERALL_RATING`, `SET_SUB_RATING`, `SET_COMMENT`, `SET_DURATION`, `ADD_PHOTO`, `REMOVE_PHOTO`, `RESET`.

### 3. Components (`SuggestEditModal`, `PublishReviewModal`)
- Replace manual `useState` blocks with `const [state, dispatch] = useReducer(...)`.
- Dispatch clean typed actions on user interactions.

## Checklist

- [ ] Implement `src/reducers/suggest-edit-reducer.ts` and unit-testable diff calculation.
- [ ] Implement `src/reducers/publish-review-reducer.ts`.
- [ ] Refactor `SuggestEditModal` to consume `suggestEditReducer`.
- [ ] Refactor `PublishReviewModal` to consume `publishReviewReducer`.
- [ ] Do NOT execute slow commands (`pnpm build`, `tsc`, `biome`).
- [ ] Stage exclusively target files and commit with `refactor(modals): convert complex forms to useReducer state machines`.
