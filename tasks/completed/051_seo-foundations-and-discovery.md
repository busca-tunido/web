# Task: SEO Foundations, AI Discovery & Social Metadata

## Execution Profile

- **Wave / Batch**: Wave 1 (Backend Core & Frontend UI Foundations)
- **Execution Mode**: `PARALLEL`
- **Assigned Role**: `Worker Agent (Web SEO & Discovery)`
- **Dependencies (`depends_on`)**: `[]`
- **Collision Risk**: `LOW`

## Target Files

- **Exclusive**:
  - `public/llms.txt` [NEW]
  - `public/llms-full.txt` [NEW]
  - `src/app/robots.ts`
  - `src/app/not-found.tsx` [NEW]
  - `src/app/opengraph-image.tsx` [NEW]
  - `src/app/layout.tsx`
  - `src/app/terms/page.tsx`
  - `src/app/privacy/page.tsx`
  - `src/app/faq/page.tsx`
  - `src/app/contact/page.tsx`

## Objective

Establish the core SEO, AI agent discoverability, social preview, and error-handling foundation:
1. Implement `llms.txt` and `llms-full.txt` adhering to Jeremy Howard's specification for AI search engines, and update `robots.ts` to allow AI crawlers (`GPTBot`, `ClaudeBot`, `PerplexityBot`).
2. Implement branded 404 page in `src/app/not-found.tsx` with helpful student navigation.
3. Generate dynamic 1200x630 OpenGraph and Twitter preview images via `src/app/opengraph-image.tsx` using `ImageResponse` from `next/og`, removing broken asset references in `layout.tsx`.
4. Configure self-referencing canonical URLs (`alternates.canonical`) in `/terms`, `/privacy`, `/faq`, and `/contact`.

## Technical Specifications

1. **`llms.txt` & `llms-full.txt` (`public/`)**:
   - Title: `# BuscaTuNido - Plataforma de Pensiones y Residencias Universitarias en Chile`.
   - Summary block: Chilean student housing directory with verified reviews and CLP prices.
   - City links, housing types (individual, compartida, estudio), and FAQ glossary in `llms-full.txt`.

2. **`robots.ts` (`src/app/robots.ts`)**:
   - Allow `/llms.txt` and `/llms-full.txt`.
   - Explicitly permit `GPTBot`, `ClaudeBot`, `PerplexityBot`, and `Google-Extended`.

3. **`not-found.tsx` (`src/app/not-found.tsx`)**:
   - Visual 404 container with student-friendly message *"Parece que este nido no está en el mapa"*.
   - Action links to `/`, `/faq`, `/contact`.

4. **`opengraph-image.tsx` & `layout.tsx`**:
   - Dynamic `ImageResponse` with BuscaTuNido branding and featured cities.
   - Set `<html lang="es-CL">` in `layout.tsx` and remove broken `/assets/map-dark.png`.

5. **Canonical URLs**:
   - Explicit `canonical: '/terms'`, `canonical: '/privacy'`, `canonical: '/faq'`, `canonical: '/contact'`.

## Checklist

- [ ] Create `public/llms.txt` and `public/llms-full.txt`.
- [ ] Update `src/app/robots.ts` with AI crawler rules.
- [ ] Create branded `src/app/not-found.tsx`.
- [ ] Create dynamic `src/app/opengraph-image.tsx`.
- [ ] Clean up metadata and set `lang="es-CL"` in `src/app/layout.tsx`.
- [ ] Add explicit canonical tags to legal and support pages.
- [ ] Stage target files and commit with `feat(seo): configure llms.txt, dynamic opengraph, not-found page and canonical metadata`.
