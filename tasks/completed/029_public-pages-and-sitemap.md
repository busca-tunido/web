# Task: Public Informational Pages, Legal/FAQ/Contact Views & Enhanced Sitemap Architecture

## Execution Profile

- **Wave / Batch**: Wave 1
- **Execution Mode**: `SEQUENTIAL`
- **Assigned Role**: `Worker Agent`
- **Dependencies (`depends_on`)**: None
- **Collision Risk**: `MEDIUM (Shared robots, sitemap, auth screen footer)`

## Target Files

- **Exclusive**:
  - `src/app/terms/page.tsx`
  - `src/app/privacy/page.tsx`
  - `src/app/faq/page.tsx`
  - `src/app/contact/page.tsx`
  - `src/components/common/public-nav-header.tsx`
- **Shared / Integration Points**:
  - `src/app/sitemap.ts`
  - `src/app/robots.ts`
  - `src/components/auth/auth-screen.tsx`

---

## Objective

Create and populate responsive, accessible public pages for `/terms`, `/privacy`, `/faq`, and `/contact` that remain navigable without requiring active authentication. Ensure URLs, filenames, and code symbols are in English, while user-facing text, metadata titles, and descriptions are in Spanish. Enhance `src/app/sitemap.ts` and `src/app/robots.ts` to index these public routes while reflecting that `/` serves as the primary authentication portal. Add accessible footer navigation links from `AuthScreen`.

---

## Technical Specifications

### 1. Route Content Specifications

#### A. Terms of Service (`/terms` -> `src/app/terms/page.tsx`)
- **Language**: User-facing copy in Spanish.
- **Quantity**: Optimal / Minimal (concise, clear).
- **Core Sections**:
  1. **Propósito**: Conexión comunitaria entre estudiantes y arrendadores de residencias/pensiones universitarias en Chile.
  2. **Uso Responsable**: Obligación de proporcionar datos verídicos y mantener respeto en las evaluaciones.
  3. **Responsabilidad de Publicaciones**: Cada arrendador es responsable de las condiciones declaradas; BuscaTuNido actúa como plataforma facilitadora de información y validación comunitaria.
  4. **Modificaciones y Suspensión**: Reserva del derecho de moderar o suspender cuentas que incumplan las normas comunitarias.

#### B. Privacy Policy (`/privacy` -> `src/app/privacy/page.tsx`)
- **Language**: User-facing copy in Spanish.
- **Quantity**: Optimal / Minimal.
- **Core Sections**:
  1. **Datos Recopilados**: Correo institucional/personal, nombre de perfil, reseñas emitidas y preferencias de búsqueda.
  2. **Uso de la Información**: Verificación de identidad estudiantil/arrendador y funcionamiento de favoritos e historial.
  3. **No Comercialización**: Compromiso estricto de no vender ni ceder datos personales a terceros con fines publicitarios.
  4. **Derechos ARCO y Eliminación**: Medios para solicitar la rectificación o eliminación total de la cuenta y registros personales.

#### C. Frequently Asked Questions (`/faq` -> `src/app/faq/page.tsx`)
- **Language**: User-facing copy in Spanish.
- **Quantity**: Moderate, based on current real platform capabilities.
- **Core Sections**:
  1. **¿Qué es BuscaTuNido?**: Plataforma web para descubrir, comparar y validar pensiones universitarias en ciudades clave de Chile con cercanía a campus.
  2. **¿Por qué se requiere inicio de sesión obligatorio?**: Para preservar la seguridad, prevenir spam y asegurar que las valoraciones provengan de miembros verificados de la comunidad.
  3. **¿Cómo funciona el mapa y los filtros?**: Exploración geográfica interactiva con cálculo de distancias a universidades, filtros por precio mensual, tipo de habitación y servicios incluidos (wifi, baño privado, alimentación).
  4. **¿Cuál es la diferencia entre el rol Estudiante y el rol Dueño?**:
     - *Estudiantes*: Búsqueda, cálculo de rutas a campus, guardado de favoritos, historial de visitas y publicación de reseñas con calificación.
     - *Dueños*: Panel de gestión de publicaciones, actualización de servicios, precios y atención a sugerencias comunitarias.
  5. **¿Cómo reportar o sugerir ediciones a una pensión?**: Mecanismo de sugerencia de cambios para que la comunidad mantenga actualizados los datos de contacto y disponibilidad.

#### D. Contact (`/contact` -> `src/app/contact/page.tsx`)
- **Language**: User-facing copy in Spanish.
- **Direct channels & required links**:
  - Email: `email.joseleiva@gmail.com` (`mailto:email.joseleiva@gmail.com`)
  - GitHub: `https://github.com/JoseIgnacioGC`
  - LinkedIn: `https://www.linkedin.com/in/joseignaciogc/` (visible text `in/joseignaciogc`)

---

### 2. Navigation Header Primitive (`src/components/common/public-nav-header.tsx`)
- Mobile-first, lightweight top navigation header for public subpages.
- Includes `BrandLogo`, current page title, and a prominent "Iniciar sesión" / "Volver" button linking to `/` with minimum 48px touch target.
- Theme-aware, semantic Tailwind tokens.
- Strict typing with `type` (no `interface`, no comments).

---

### 3. Sitemap & SEO Upgrades (`src/app/sitemap.ts`)
- Enforce clean base URL handling (strip trailing slashes).
- Use a stable ISO date constant (`2026-09-14T00:00:00.000Z`) for `lastModified`.
- Register public routes with English URLs:
  - `/` (Priority: 1.0, ChangeFrequency: `'daily'`)
  - `/faq` (Priority: 0.7, ChangeFrequency: `'weekly'`)
  - `/contact` (Priority: 0.6, ChangeFrequency: `'monthly'`)
  - `/terms` (Priority: 0.4, ChangeFrequency: `'monthly'`)
  - `/privacy` (Priority: 0.4, ChangeFrequency: `'monthly'`)

---

### 4. Search Engine Crawling Controls (`src/app/robots.ts`)
- Update `allow` list to English routes: `['/', '/terms', '/privacy', '/faq', '/contact']`.
- Maintain `disallow: ['/api/', '/cuenta/', '/admin/']`.

---

### 5. Authentication Screen Footer Integration (`src/components/auth/auth-screen.tsx`)
- Add accessible footer links to `/terms`, `/privacy`, `/faq`, and `/contact` with Spanish label text ("Términos", "Privacidad", "Preguntas Frecuentes", "Contacto").

---

## Checklist

- [x] Create `src/components/common/public-nav-header.tsx`.
- [x] Create `src/app/terms/page.tsx`.
- [x] Create `src/app/privacy/page.tsx`.
- [x] Create `src/app/faq/page.tsx`.
- [x] Create `src/app/contact/page.tsx`.
- [x] Update `src/app/sitemap.ts`.
- [x] Update `src/app/robots.ts`.
- [x] Update `src/components/auth/auth-screen.tsx` footer.
- [x] Run Biome quality suite: `pnpm run check && pnpm run review`.
- [x] Run Next.js production build verification: `pnpm build`.
- [x] Archive completed task to `tasks/completed/029_public-pages-and-sitemap.md`.

---

## Verification

- Code Quality & Linting: `pnpm run check && pnpm run review` (Passed: 97 files checked, 0 errors)
- Production Build & Route Export: `pnpm build` (Passed: All static routes generated successfully)
