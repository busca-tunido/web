# BuscaTuNido Web

Mobile-first web application for BuscaTuNido, built with Next.js, Tailwind CSS, and shadcn/ui.

<p align="center">
  <img src="assets/map-dark.png" alt="BuscaTuNido - Modo Oscuro" width="48%" />
  &nbsp;
  <img src="assets/map-light.png" alt="BuscaTuNido - Modo Claro" width="48%" />
</p>

## Getting Started

### Prerequisites

- Node.js >= 20
- pnpm >= 9

### Environment Configuration

Create a `.env.local` file in the `web` root (optional for API proxying):

```env
NEXT_PUBLIC_API_URL="http://localhost:4000"
```

### Commands

```bash
# Install dependencies
pnpm install

# Start development server (Turbopack)
pnpm dev

# Build production bundle
pnpm build

# Start production server
pnpm start

# Lint and format
pnpm run check
```
