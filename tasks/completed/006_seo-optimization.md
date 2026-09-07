# Task: SEO Optimization & Structured Metadata (`tasks/seo-optimization.md`)

## Objective

Implement a comprehensive Search Engine Optimization (SEO) architecture for the BuscaTuNido web application, including global and route-level Next.js metadata, OpenGraph cards, Twitter preview cards, canonical URLs, dynamic `robots.ts` and `sitemap.ts` generators, and Schema.org JSON-LD structured data for rich search engine indexing.

---

## Detailed Scope

### 1. Global & Route Metadata (`src/app/layout.tsx`)
- Configure `metadataBase` using the production URL (`https://buscatunido.vercel.app` or `NEXT_PUBLIC_APP_URL`).
- Define title template: `{ default: 'BuscaTuNido - Pensiones y Residencias Universitarias en Chile', template: '%s | BuscaTuNido' }`.
- Provide targeted descriptive meta description highlighting housing search, student verification, transparent pricing, and university proximity.
- Add relevant keywords: `pensiones universitarias`, `residencias estudiantiles`, `arriendo estudiantes chile`, `alojamiento santiago`, `pensiones valparaiso`, `concepcion`, `valdivia`.
- Configure OpenGraph metadata:
  - `type: 'website'`
  - `locale: 'es_CL'`
  - `siteName: 'BuscaTuNido'`
  - `images: [{ url: '/assets/map-dark.png', width: 1200, height: 630, alt: 'BuscaTuNido' }]`
- Configure Twitter card metadata:
  - `card: 'summary_large_image'`
  - `title`, `description`, and preview image.
- Configure canonical alternates.

### 2. Search Engine Crawling Controls
- Create `src/app/robots.ts`:
  - Allow indexing for all public routes (`/`, `/explore`, `/pensions/*`).
  - Disallow private/account routes (`/api/*`, `/cuenta/*`, `/admin/*`).
  - Link canonical sitemap (`https://buscatunido.vercel.app/sitemap.xml`).
- Create `src/app/sitemap.ts`:
  - Generate entries for core public pages with `lastModified`, `changeFrequency`, and `priority`.

### 3. Structured Data (Schema.org JSON-LD with `schema-dts`)
- Add `schema-dts` (`pnpm add -D schema-dts`) to provide strict TypeScript type safety for Schema.org vocabulary.
- Create a reusable JSON-LD helper component (`src/components/seo/json-ld.tsx`):
  - Typed `WithContext<WebSite>` and `WithContext<Organization>` schemas on root layout.
  - Search action definition (`potentialAction` with `SearchAction`).
  - Typed `WithContext<Accommodation>` / `Residence` schema for individual pension detail views.
  - Render sanitized `<script type="application/ld+json">` for Google Search / Rich Results.

### 4. Semantic HTML & Accessible Hierarchy
- Ensure each page has a single, semantic `<h1>` element.
- Ensure all interactive and visual elements include descriptive `aria-label` or `alt` attributes.

---

## Checklist

- [ ] Install `schema-dts` as dev dependency via `pnpm add -D schema-dts`.
- [ ] Define `metadataBase`, title template, keywords, OpenGraph, and Twitter tags in `src/app/layout.tsx`.
- [ ] Create `src/app/robots.ts` defining crawl rules and referencing sitemap.
- [ ] Create `src/app/sitemap.ts` generating public URL entries and priorities.
- [ ] Implement `src/components/seo/json-ld.tsx` using `schema-dts` for Schema.org structured data.
- [ ] Integrate JSON-LD structured data into root layout.
- [ ] Verify semantic headings and image `alt` attributes across public views.
- [ ] Validate code quality and formatting with Biome (`pnpm run check && pnpm run review`).
- [ ] Verify production compilation with `pnpm run build`.

---

## Target Files

- `src/app/layout.tsx`
- `src/app/robots.ts`
- `src/app/sitemap.ts`
- `src/components/seo/json-ld.tsx`

---

## Verification

- Code Quality (Biome): `pnpm run check && pnpm run review`
- Production Build: `pnpm run build`
