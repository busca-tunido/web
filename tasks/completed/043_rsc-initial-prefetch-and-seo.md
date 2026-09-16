# Task: React Server Component Initial Prefetch and SEO (`web/tasks/043_rsc-initial-prefetch-and-seo.md`)

## Execution Profile

- **Wave / Batch**: Wave 3
- **Execution Mode**: `PARALLEL`
- **Assigned Role**: `Worker Agent (Web SSR & Next.js App Router)`
- **Dependencies (`depends_on`)**: `[]`
- **Collision Risk**: `LOW (Isolated root page and shell wrapper)`

## Target Files

- **Exclusive**:
  - `src/app/page.tsx`
  - `src/components/shells/role-router.tsx`

## Objective

Transform `src/app/page.tsx` into an asynchronous React Server Component (RSC) that prefetches the initial page of pensions, universities, and cities on the server using `API_INTERNAL_URL`. Pass these pre-fetched datasets as initial props down to the student shell, eliminating initial loading skeletons, driving First Contentful Paint (FCP) to near zero, and ensuring real content is in the initial HTML for search engines.

## Technical Specifications

### 1. `src/app/page.tsx`
- Asynchronous server component:
  ```typescript
  export default async function HomePage() {
    const [initialPensions, initialCities, initialUniversities] = await Promise.allSettled([...]);
    return <RoleRouter initialData={{ ... }} />;
  }
  ```

### 2. `src/components/shells/role-router.tsx`
- Forward `initialData` to `StudentAppShell` when authenticated as student.
- Fall back gracefully to client loading if server prefetch fails.

## Checklist

- [ ] Convert `src/app/page.tsx` into async RSC with server-side prefetching.
- [ ] Pass initial preloaded pensions, cities, and universities to `RoleRouter`.
- [ ] Ensure SSR handles missing server network gracefully without 500 errors.
- [ ] Do NOT execute slow commands (`pnpm build`, `tsc`, `biome`).
- [ ] Stage exclusively target files and commit with `perf(ssr): implement server component prefetch for initial feed`.
