# Task: HTML Semantics, Heading Hierarchy, Dynamic Titles & Schema.org

## Execution Profile

- **Wave / Batch**: Wave 3 (Data Contracts, Landlord Drawer Atoms & Semantics)
- **Execution Mode**: `PARALLEL`
- **Assigned Role**: `Worker Agent (Web Semantics & Schema)`
- **Dependencies (`depends_on`)**: `[web/tasks/seo-public-ssr-catalog-viewsource.md]`
- **Collision Risk**: `LOW`

## Target Files

- **Exclusive**:
  - `src/components/pensions/pension-card.tsx`
  - `src/components/explore/explore-screen.tsx`
  - `src/components/shells/student-app-shell.tsx`
  - `src/components/seo/json-ld.tsx`

## Objective

Remediate accessibility issues, enforce a strict heading hierarchy, dynamically update document titles, and expand structured JSON-LD schemas:
1. `PensionCard`: Wrap in semantic `<article aria-labelledby={titleId}>` and decouple nested heading tags from within `<button>` interactive elements.
2. `ExploreScreen`: Insert a single canonical `<h1>`, promote section titles to `<h2>`, and cascade inner cards to `<h3>`.
3. `StudentAppShell`: Dynamically update `document.title` on tab switch (`Explorar`, `Mapa`, `Favoritos`, `Estadías`, `Cuenta`) and modal open.
4. `json-ld.tsx`: Add Schema.org `ItemList` and `Accommodation` rich snippets using `schema-dts`.

## Technical Specifications

1. **`PensionCard` (`src/components/pensions/pension-card.tsx`)**:
   - Wrap container in `<article aria-labelledby={titleId}>`.
   - Decouple `<h3 id={titleId}>` from inside the interactive `<button>` to satisfy W3C validation.

2. **`ExploreScreen` (`src/components/explore/explore-screen.tsx`)**:
   - Add `<h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">Pensiones y Residencias Universitarias en Chile</h1>`.
   - Section titles as `<h2>` ("Ciudades Universitarias", "Universidades Destacadas", "Alojamientos Disponibles").
   - Entity names as `<h3>`.

3. **`StudentAppShell` (`src/components/shells/student-app-shell.tsx`)**:
   - Synchronize `document.title` reactively when `activeTab` or `selectedPension` changes.

4. **`json-ld.tsx` (`src/components/seo/json-ld.tsx`)**:
   - Generate `ItemList` for listings and `Accommodation` schema with pricing, ratings, and address coordinates.

## Checklist

- [ ] Convert `PensionCard` to `<article>` and decouple headings from buttons.
- [ ] Add canonical `<h1>` and restructure `<h2>`/`<h3>` headings in `ExploreScreen`.
- [ ] Implement reactive document title updates in `StudentAppShell`.
- [ ] Inject `ItemList` and `Accommodation` schemas into `RootJsonLd`.
- [ ] Stage target files and commit with `refactor(seo): enforce semantic html, heading hierarchy, dynamic titles and json-ld schemas`.
