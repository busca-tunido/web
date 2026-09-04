# Task: 002 - Migrate Web Linter and Formatter to Biome

## Objective
Migrate the Next.js web application toolchain from ESLint to Biome, standardizing code formatting, linting, and imports sorting across the Busca TuNido monorepo ecosystem.

## Checklist
- [x] Install `@biomejs/biome` and remove `eslint` and `eslint-config-next`
- [x] Delete legacy `eslint.config.mjs` and configure `next.config.ts`
- [x] Configure `biome.json` with React/Next.js rules
- [x] Update `package.json` scripts (`lint`, `format`, `check`)
- [x] Format and lint all web files with Biome (`pnpm run check`)
- [x] Verify Next.js production build (`pnpm build`)

## Target Files
- `biome.json`
- `next.config.ts`
- `package.json`

## Verification
- Command: `pnpm run check && pnpm build`
