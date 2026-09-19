# Task: Public SSR Catalog & View-Source Unblock

## Execution Profile

- **Wave / Batch**: Wave 2 (Backend Scope, SSR Unblock, Search Sync & Landlord Nav Atoms)
- **Execution Mode**: `PARALLEL`
- **Assigned Role**: `Worker Agent (Web SSR & Auth Routing)`
- **Dependencies (`depends_on`)**: `[web/tasks/seo-foundations-and-discovery.md]`
- **Collision Risk**: `MEDIUM (Core auth-routing and SSR page flow)`

## Target Files

- **Exclusive**:
  - `src/components/shells/role-router.tsx`
  - `src/lib/auth-context.tsx`
  - `src/app/page.tsx`

## Objective

Fix the critical SEO flaw where `view-source` on the main landing page (`/`) outputs only `<SplashScreen />` with zero accommodation content, and unauthenticated visitors/bots are blocked by `<AuthScreen />`. Allow guest browsing of pre-fetched pensions, cities, and universities in the initial server-rendered HTML.

## Technical Specifications

1. **`RoleRouter` (`src/components/shells/role-router.tsx`)**:
   - Prevent `<SplashScreen />` from rendering during initial Server-Side Rendering (SSR). When `initialData` is present, render `ForwardedStudentShell` immediately in the server HTML tree so that search engines (Googlebot) and users receive the full semantic catalog in the initial response.
   - Support Guest Mode / Public Exploring:
     - If the user is unauthenticated or `role === 'unauthenticated'`, allow them to browse the student explore feed (`ForwardedStudentShell`) instead of hard-blocking with `<AuthScreen />`.
     - Defer authentication to protected actions (favoriting, viewing stay history, publishing reviews).

2. **`AuthContext` (`src/lib/auth-context.tsx`)**:
   - Ensure `isLoading` transitions smoothly without causing full-page layout destruction on hydration.
   - Allow components to render public content immediately when no user token is stored in `localStorage`.

3. **`page.tsx` (`src/app/page.tsx`)**:
   - Verify that pre-fetched server data (`initialPensions`, `initialCities`, `initialUniversities`) is correctly hydrated into the public shell without hydration mismatches.

## Checklist

- [ ] Unblock SSR rendering in `src/components/shells/role-router.tsx` when `initialData` exists.
- [ ] Enable public guest browsing mode in `RoleRouter` for unauthenticated visitors.
- [ ] Adjust `isLoading` hydration flow in `src/lib/auth-context.tsx`.
- [ ] Verify that `view-source` outputs real pension titles, cities, and prices in HTML.
- [ ] Stage target files and commit with `feat(seo): enable public ssr catalog browsing and unblock view-source html`.
