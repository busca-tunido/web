# BuscaTuNido Web

Mobile-first web application for BuscaTuNido, built with Next.js, Tailwind CSS, and shadcn/ui.

<p align="center">
  <img src="assets/map-dark.png" alt="BuscaTuNido - Modo Oscuro" width="48%" />
  &nbsp;
  <img src="assets/map-light.png" alt="BuscaTuNido - Modo Claro" width="48%" />
</p>

## Enlaces Públicos / Deployments

- **Web en Producción**: [https://web-theta-three-8zz8it8ws2.vercel.app/](https://web-theta-three-8zz8it8ws2.vercel.app/)
- **API Backend**: [https://buscatunido-api.onrender.com](https://buscatunido-api.onrender.com)
- **API Docs (Swagger)**: [https://buscatunido-api.onrender.com/api/docs](https://buscatunido-api.onrender.com/api/docs)

## Getting Started

### Prerequisites

- Node.js >= 20
- pnpm >= 9

### Environment Configuration

Create a `.env.local` file in the `web` root (optional for overriding API proxy target):

```env
NEXT_PUBLIC_API_URL="http://localhost:4000"
```

En producción, el proxy interno de Next.js redirige automáticamente las peticiones de `/api/*` hacia `https://buscatunido-api.onrender.com`.

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
