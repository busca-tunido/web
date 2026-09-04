# BuscaTuNido Web

Mobile-first web application for BuscaTuNido, built with Next.js (App Router), Tailwind CSS, and shadcn/ui.

## Features

- **Mobile-First Experience**: Touch-friendly interface designed for rapid university housing discovery and comparison.
- **Interactive Search & Map**: Geolocation pins with price badges and expandable bottom drawer.
- **Dynamic Theming**: Light and dark mode support with automatic system preference detection and warm neutral palettes.
- **Authentication**: Institutional student email validation and one-click guest/demo exploration modes.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, Turbopack)
- **UI & Styling**: [Tailwind CSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/), [Lucide React](https://lucide.dev/)
- **Linter & Formatter**: [Biome](https://biomejs.dev/)

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
