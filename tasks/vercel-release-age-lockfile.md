# Task: Corregir instalación de dependencias en Vercel

## Execution Profile

- **Wave / Batch**: Wave 1
- **Execution Mode**: `SEQUENTIAL`
- **Assigned Role**: `Integrator Agent`
- **Dependencies (`depends_on`)**: None
- **Collision Risk**: `HIGH (lockfile compartido)`

## Target Files

- `pnpm-lock.yaml`
- `pnpm-workspace.yaml`

## Objective

Corregir ERR_PNPM_MINIMUM_RELEASE_AGE_VIOLATION del deploy 87464f4 mediante una resolución compatible con pnpm 12.4.1 y su antigüedad mínima de 1440 minutos.

## Technical Specifications

Regenerar el lockfile con el gestor declarado, conservando los rangos del manifiesto. Hacer explícita la política de antigüedad y su cumplimiento estricto; no añadir excepciones ni desactivar verificaciones. Validar instalación congelada y build con el nuevo lockfile. Mantener autoría configurada y actualizar el submódulo web tras publicar su commit.

## Checklist

- [x] Reproducir los siete rechazos del log con pnpm 12.4.1.
- [x] Regenerar el lockfile y verificar la política; instalación limpia congelada con pnpm 12.4.1 exitosa.
- [x] TypeScript, Biome y 203 pruebas aprobadas; build compila y pasa TypeScript, pero el prerenderizado está bloqueado por EPERM del sandbox Windows.
- [ ] Integrar en main, publicar web y actualizar monorepo. La publicación requiere ejecutar publicar-cambios.ps1 fuera del sandbox.
