# Task: Pension Detail & Amenities Modal UX Remediation

## Execution Profile

- **Wave / Batch**: Wave 1 (Pension Detail & Amenities UX Fixes)
- **Execution Mode**: `SEQUENTIAL`
- **Assigned Role**: `Worker Agent (Pension Detail UI)`
- **Dependencies (`depends_on`)**: None
- **Collision Risk**: `LOW (Isolated pension detail components)`

## Target Files

- **Exclusive**:
  - `src/components/pensions/pension-detail-content.tsx`
  - `src/components/pensions/amenities-breakdown-modal.tsx`
- **Shared / Integration Points**:
  - `src/app/globals.css` (Reference only for color tokens)

## Objective

Remediate visual inconsistencies and redundant controls in the pension detail sheet and amenities breakdown modal:
1. Conditionally hide the nearby university distance container when distance is 0 or unassigned.
2. Remove redundant "Ver todas las comodidades y normas" button while retaining "Ver más detalles" in the section header.
3. Align the "Detalle de Comodidades" modal palette with the application's warm terracotta and neutral design tokens from `globals.css`.
4. Ensure inactive amenity pills display muted, non-orange icons.

## Technical Specifications

### 1. Distance Badge Conditional Display (`pension-detail-content.tsx`)
- Currently renders:
  ```tsx
  <div className="mb-4 rounded-xl border border-primary/20 bg-primary/5 p-3">
    <div className="flex items-center gap-2 text-xs font-medium text-primary">
      <MapPin className="h-3.5 w-3.5 shrink-0" />
      <span>A {pension.distanceToUniversityMeters}m de {pension.nearestUniversityName}</span>
    </div>
  </div>
  ```
- **Requirement**: Wrap in conditional rendering so it only displays when a nearby university exists and distance is strictly greater than 0:
  ```tsx
  {Boolean(
    pension.distanceToUniversityMeters &&
    pension.distanceToUniversityMeters > 0 &&
    pension.nearestUniversityName
  ) && (
    <div className="mb-4 rounded-xl border border-primary/20 bg-primary/5 p-3">
      {/* ... */}
    </div>
  )}
  ```

### 2. Remove Redundant Amenities Button (`pension-detail-content.tsx`)
- Keep the header link `Ver más detalles` (`onClick={() => setIsAmenitiesModalOpen(true)}`).
- Delete the redundant bottom trigger button `id="btn-open-amenities-breakdown"` (`Ver todas las comodidades y normas`).

### 3. Inactive Amenity Icons Styling (`pension-detail-content.tsx`)
- In the 4-pill grid (`Wifi`, `Utensils`, `BookOpen`, `Wind`):
  - Inactive pills currently keep `<Icon className="h-4 w-4 text-primary shrink-0" />`, rendering a vibrant terracotta/orange icon inside an inactive pill.
  - Dynamically assign the icon class:
    - Active: `text-primary`
    - Inactive: `text-muted-foreground/60` (or `text-muted-foreground`)
  - Example:
    ```tsx
    <Wifi className={`h-4 w-4 shrink-0 ${pension.includesWifi ? 'text-primary' : 'text-muted-foreground/60'}`} />
    ```

### 4. Color Palette Alignment for "Detalle de Comodidades" (`amenities-breakdown-modal.tsx`)
- Replace disjointed rainbow utility colors (`text-sky-500`, `text-amber-500`, `text-orange-500`, `text-emerald-600`, `text-rose-500`, `text-indigo-500`) with canonical design tokens from `globals.css`:
  - **Servicios Básicos Cards**:
    - Icons: Use `text-primary` or `text-foreground/80` instead of arbitrary saturated colors.
    - Badges / Inclusions: Use `text-primary text-[10px] font-medium` or `text-muted-foreground` instead of `text-emerald-600`.
  - **Check Icons**:
    - Replace `text-emerald-600` with `text-primary` or `text-foreground/70` for list bullets (`CheckCircle2`).
  - **Rules & Curfew Icons**:
    - Replace `text-sky-500`, `text-amber-500`, `text-rose-500`, `text-indigo-500` with warm neutrals (`text-muted-foreground` or `text-primary/80`).
  - **Card Containers**:
    - Rely on `bg-card`, `bg-muted/30`, `border-border` and dark mode token mappings (`--card: #282522`, `--primary: #e59a7d`).

## Checklist

- [ ] Conditionally render university distance container in `src/components/pensions/pension-detail-content.tsx` only when distance is greater than 0.
- [ ] Remove redundant "Ver todas las comodidades y normas" button in `src/components/pensions/pension-detail-content.tsx`.
- [ ] Update amenity pills in `src/components/pensions/pension-detail-content.tsx` so inactive pills render muted icons without orange `text-primary`.
- [ ] Refactor icon and badge colors in `src/components/pensions/amenities-breakdown-modal.tsx` to match `globals.css` design system.
- [ ] Verify light and dark mode appearance in both components.
- [ ] Run global Biome quality gate (`pnpm run check && pnpm run review`).
- [ ] Run TypeScript typecheck (`pnpm exec tsc --noEmit`).
- [ ] Run Vitest unit tests (`pnpm exec vitest run`).
- [ ] Stage and commit with conventional commit message (`fix(pensions): improve detail amenities ux and align breakdown modal colors`).

## Verification

- Code Quality (Biome): `pnpm run check && pnpm run review`
- Typecheck: `pnpm exec tsc --noEmit`
- Tests: `pnpm exec vitest run`
