# Task: Next.js High-Performance Optimization - Turbopack, Sharp & Barrel Treeshaking (`web/tasks/turbopack-performance-optimization.md`)

## Objective

Maximize frontend compilation speed, developer iteration velocity, and runtime performance in Next.js:
1. Enable **Turbopack** (Rust-based bundler) for sub-second development server startup and instant Hot Module Replacement (HMR).
2. Configure **barrel file import optimization** (`optimizePackageImports`) to prevent massive module loading from icon and animation libraries (`lucide-react`, `motion`).
3. Install **`sharp`** for high-speed production image optimization in `next/image`.
4. Enable production dead-code and console stripping in `next.config.ts`.

---

## Technical Specifications

### 1. Turbopack Development Script (`web/package.json`)
- Update dev script:
  ```json
  "scripts": {
    "dev": "next dev --turbopack",
    ...
  }
  ```

### 2. Next.js Config Optimizations (`web/next.config.ts`)
- Add compiler and experimental package optimization:
  ```typescript
  const nextConfig: NextConfig = {
    compiler: {
      removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
    },
    experimental: {
      optimizePackageImports: ['lucide-react', 'motion', '@base-ui/react'],
    },
    images: {
      formats: ['image/avif', 'image/webp'],
      remotePatterns: [ ... ],
    },
    ...
  };
  ```

### 3. Server-Side Image Acceleration
- Suggest terminal command to install `sharp` in `web/`:
  - `pnpm add sharp`
  - Replaces default slow WASM/Squoosh processor in Next.js image optimization with native libvips C++/Rust speed.

---

## Checklist

- [x] Update `dev` script in `web/package.json` to use `next dev --turbopack`.
- [x] Suggest terminal command to install `sharp` for native `next/image` optimization.
- [x] Add `optimizePackageImports: ['lucide-react', 'motion', '@base-ui/react']` in `next.config.ts`.
- [x] Add `compiler.removeConsole` in `next.config.ts` for clean production bundles.
- [x] Enable modern image formats `['image/avif', 'image/webp']` in `next.config.ts`.
- [x] Verify development startup speed with `pnpm run dev`.
- [x] Validate code quality with Biome (`pnpm run check && pnpm run review`).
- [x] Verify production build with `pnpm run build`.

---

## Target Files

- `web/package.json`
- `web/next.config.ts`
