# Task: Comparar dos pensiones para estudiantes

## Execution Profile

- **Wave / Batch**: Desktop, luego mobile, luego integración
- **Execution Mode**: `SEQUENTIAL`
- **Assigned Role**: `Integrator Agent`
- **Dependencies (`depends_on`)**: None
- **Collision Risk**: `HIGH (Shared core files)`

## Target Files

- `src/contexts/pension-comparison-context.tsx`
- `src/components/pensions/pension-comparison.tsx`
- `src/components/pensions/pension-card.tsx`
- `src/components/providers.tsx`
- `src/lib/pension-comparison.ts`
- `tests/components/pension-comparison.spec.tsx`
- `tests/fixtures/comparison-pensions.ts`

## Objective

Permitir a estudiantes autenticados elegir dos pensiones desde las tarjetas y comparar datos reales del contrato OpenAPI existente. No se necesitan nuevos endpoints ni DTOs.

## Technical Specifications

Desktop: selección explícita con límite de dos, bandeja con quitar y limpiar, comparación en diálogo con tabla semántica y detalles actualizados por API. Manejar carga, error y reintento sin mostrar datos obsoletos como actuales.

Mobile (diseñado después de desktop): bandeja compacta por encima de la navegación, drawer con secciones de precio, servicios y reglas, columnas que caben en pantalla, filtro de diferencias y controles táctiles de al menos 48 px. Conservar selección al cerrar o navegar y borrarla al cambiar sesión. No persistir datos de otro usuario.

## Checklist

- [ ] Preparar dependencias y analizar AGENTS.md y arquitectura.
- [ ] Implementar desktop y registrar commit.
- [ ] Diseñar e implementar adaptación mobile y registrar commit.
- [ ] Verificar selección, roles, errores, datos faltantes y adaptación responsive.
- [ ] Ejecutar Biome, TypeScript y Vitest; integrar y publicar según autorización del usuario.

## Verification

`pnpm run check`, `pnpm run review`, `pnpm exec tsc --noEmit`, `pnpm exec vitest run`.

El usuario autorizó explícitamente implementación, commits, merge y push en el chat.
