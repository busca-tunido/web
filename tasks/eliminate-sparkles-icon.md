# Task: Eliminate and Replace Sparkles Icon Across Frontend

## Execution Profile

- **Wave / Batch**: Wave 2 (Iconography Harmonization)
- **Execution Mode**: `SEQUENTIAL`
- **Assigned Role**: `Worker Agent (Iconography & UI Cleanup)`
- **Dependencies (`depends_on`)**: `[web/tasks/pension-detail-amenities-ux-remediation.md]`
- **Collision Risk**: `LOW (Isolated iconography replacements)`

## Target Files

- **Exclusive**:
  - `src/components/reviews/publish-review-modal.tsx`
  - `src/components/pensions/pension-card.tsx`
  - `src/components/landlord/room-item-card.tsx`
  - `src/components/landlord/room-editor-drawer.tsx`
  - `src/components/landlord/pension-editor-drawer.tsx`
  - `src/components/pensions/amenities-breakdown-modal.tsx`
- **Shared / Integration Points**:
  - None

## Objective

Locate, eliminate, or replace all usages of the `Sparkles` icon from `lucide-react` across the entire frontend application. The AI/sparkle visual metaphor is incongruous with the core real-estate directory experience and must be substituted with semantically appropriate domain icons or removed where decorative.

## Technical Specifications

### Occurrence Audit & Semantic Replacement Mapping

1. **`src/components/pensions/pension-card.tsx` (Line 70)**:
   - **Current**: `<Sparkles className="h-3 w-3" />` inside the "Destacada" or "Nuevo" card badge.
   - **Replacement**: Replace with `<Award className="h-3 w-3" />` (for featured pensions) or `<Star className="h-3 w-3 fill-amber-500" />`, or remove if purely ornamental next to text.

2. **`src/components/pensions/amenities-breakdown-modal.tsx` (Lines 14 & 87)**:
   - **Current**: `<Sparkles className="h-4 w-4 text-primary" />` preceding the "Servicios Básicos Incluidos en la Mensualidad" section heading.
   - **Replacement**: Replace with `<CheckCircle2 className="h-4 w-4 text-primary" />` or `<ShieldCheck className="h-4 w-4 text-primary" />`.

3. **`src/components/reviews/publish-review-modal.tsx` (Lines 12 & 353)**:
   - **Current**: `<Sparkles className="h-3.5 w-3.5 text-primary" />` in review guidance or suggestion prompt.
   - **Replacement**: Replace with `<PenTool className="h-3.5 w-3.5 text-primary" />` or `<MessageSquare className="h-3.5 w-3.5 text-primary" />`.

4. **`src/components/landlord/pension-editor-drawer.tsx` (Lines 17, 141, 907)**:
   - **Line 141**: `{ slug: 'area-estudio', name: 'Sala de estudio', icon: Sparkles }`.
     - **Replacement**: Replace `Sparkles` with `BookOpen` or `GraduationCap` for study areas.
   - **Line 907**: `<Sparkles className="h-4 w-4 text-primary" />` in custom amenity section heading.
     - **Replacement**: Replace with `<PlusCircle className="h-4 w-4 text-primary" />` or `<Layers className="h-4 w-4 text-primary" />`.

5. **`src/components/landlord/room-editor-drawer.tsx` (Lines 12 & 79)**:
   - **Line 79**: `icon: Sparkles` used in room feature preset list.
     - **Replacement**: Replace with `Check` or `Tag` or `BedDouble`.

6. **`src/components/landlord/room-item-card.tsx` (Lines 10 & 167)**:
   - **Line 167**: `<Sparkles className="h-3 w-3 text-muted-foreground" />` inside room perks list.
     - **Replacement**: Replace with `<Check className="h-3 w-3 text-muted-foreground" />`.

### Import Cleanup
- Remove `Sparkles` from `import { ... } from 'lucide-react'` in all 6 files.
- Ensure no unused icon imports remain.

## Checklist

- [ ] Replace `Sparkles` in `src/components/pensions/pension-card.tsx` with `Award`.
- [ ] Replace `Sparkles` in `src/components/pensions/amenities-breakdown-modal.tsx` with `CheckCircle2`.
- [ ] Replace `Sparkles` in `src/components/reviews/publish-review-modal.tsx` with `PenTool` or `MessageSquare`.
- [ ] Replace `Sparkles` in `src/components/landlord/pension-editor-drawer.tsx` (`area-estudio` -> `BookOpen`, header -> `PlusCircle`).
- [ ] Replace `Sparkles` in `src/components/landlord/room-editor-drawer.tsx` with domain icon.
- [ ] Replace `Sparkles` in `src/components/landlord/room-item-card.tsx` with `Check`.
- [ ] Verify zero occurrences of `Sparkles` remain across `src/` (`grep` verification).
- [ ] Run global Biome quality gate (`pnpm run check && pnpm run review`).
- [ ] Run TypeScript typecheck (`pnpm exec tsc --noEmit`).
- [ ] Run Vitest unit tests (`pnpm exec vitest run`).
- [ ] Stage and commit with conventional commit message (`refactor(ui): eliminate sparkles icon across all frontend components`).

## Verification

- Code Quality (Biome): `pnpm run check && pnpm run review`
- Typecheck: `pnpm exec tsc --noEmit`
- Tests: `pnpm exec vitest run`
