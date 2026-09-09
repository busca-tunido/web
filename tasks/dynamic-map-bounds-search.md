# Task: Búsqueda dinámica de pensiones por zona visible del mapa (`web/tasks/dynamic-map-bounds-search.md`)

## Objetivo

Implementar la búsqueda y actualización dinámica de pensiones en la pantalla del mapa (`MapScreen`) según la zona geográfica que el usuario está explorando activamente (al arrastrar o hacer zoom), desacoplándolo de la dependencia exclusiva del GPS del usuario y sincronizando tanto los pines en Leaflet como la lista de resultados del drawer inferior.

---

## Especificaciones Técnicas

### 1. Detección de Encuadre en Leaflet (`src/components/map/map-screen.tsx`)
- Suscribirse al evento nativo `moveend` de Leaflet (`map.on('moveend', ...)`).
- Implementar un temporizador de *debounce* (350ms - 500ms) para evitar llamadas redundantes a la API mientras el usuario desplaza o pellizca continuamente la pantalla.
- Extraer las coordenadas del encuadre visible mediante `map.getBounds()`:
  - `minLat`: límite sur (`bounds.getSouth()`)
  - `maxLat`: límite norte (`bounds.getNorth()`)
  - `minLng`: límite oeste (`bounds.getWest()`)
  - `maxLng`: límite este (`bounds.getEast()`)
  - Alternativamente, `center`: `map.getCenter()` con radio en km estimado a partir de la distancia diagonal visible.

### 2. Control de Experiencia de Usuario (UX)
- **Recarga 100% automática**:
  - No existe opción de recarga manual ni botón de "Buscar en esta zona". Todo el proceso de consulta y actualización es completamente automático al finalizar el desplazamiento o zoom (`moveend`).
- **Actualización silenciosa en segundo plano para desplazamientos cercanos**:
  - Al explorar zonas contiguas o desplazarse a corta distancia, las pensiones se cargan silenciosamente en segundo plano sin indicadores intrusivos, ya que los globos existentes siguen visibles en pantalla.
- **Indicador de carga condicional (solo por desplazamiento rápido o lejanía)**:
  - Activar un indicador visual de carga (por ejemplo, un spinner sutil o barra de carga en el mapa/drawer) **únicamente** si el usuario se mueve rápidamente a una zona muy alejada de la última carga realizada (donde ningún globo previo quede visible dentro del encuadre actual).
  - *Objetivo de UX*: Proporcionar retroalimentación visual inmediata para que el usuario comprenda que la app está cargando los datos de esa nueva área y no interprete erróneamente que no existen pensiones disponibles en esa zona.

### 3. Sincronización con el Drawer Inferior
- Actualizar el estado de pensiones mostrado en el mapa (`displayedPensions`) y en la lista deslizable del drawer (`<PensionDrawerCard />`).
- Actualizar el contador de resultados (`"${count} Pensiones disponibles"`).
- Al cambiar de zona, limpiar cualquier selección previa de pin (`activePinId = null`) a menos que la pensión seleccionada siga estando dentro del encuadre visible.

### 4. Soporte en el Cliente de API (`src/lib/api-client.ts` y `src/hooks/use-infinite-pensions.ts`)
- Añadir soporte de parámetros de límites geográficos opcionales en `fetchPaginatedPensions`:
  ```ts
  bounds?: {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  };
  ```
- Permitir que el hook o la pantalla del mapa solicite las pensiones por `bounds` prioritariamente cuando se navega por el mapa, manteniendo el fallback por GPS cuando se ingresa inicialmente.

### 5. Soporte en Backend (`api/src/pensions/`)
- Añadir en `FilterPensionsDto` los campos opcionales `minLat`, `maxLat`, `minLng`, `maxLng`.
- En `PensionsService.findAll`:
  ```ts
  if (filter.minLat !== undefined && filter.maxLat !== undefined) {
    where.latitude = { gte: filter.minLat, lte: filter.maxLat };
    where.longitude = { gte: filter.minLng, lte: filter.maxLng };
  }
  ```
  Permitiendo consultas SQL indexadas ultrarrápidas sobre los campos `latitude` y `longitude`.

---

## Checklist

- [x] Extender `FilterPensionsDto` y `PensionsService` en `api` para filtrar por rango de coordenadas (`minLat`, `maxLat`, `minLng`, `maxLng`).
- [x] Actualizar `src/lib/api-client.ts` para enviar los parámetros `bounds` a la API.
- [x] Implementar escucha de evento `moveend` con *debounce* en `src/components/map/map-screen.tsx`.
- [x] Implementar la consulta y recarga 100% automática tras el evento `moveend` (sin interacción manual ni botones).
- [x] Implementar el indicador de carga condicional que solo se muestre cuando el desplazamiento aleje la vista de todos los globos cargados previamente.
- [x] Sincronizar marcadores de Leaflet y tarjetas del drawer inferior con los resultados de la nueva zona explorada.
- [x] Validar que la selección de ciudad desde la pestaña "Explorar" mueva el mapa y actualice automáticamente las pensiones de esa ciudad.
- [x] Ejecutar comprobaciones de calidad y tipado (`pnpm run check && pnpm exec tsc --noEmit`).

---

## Archivos Involucrados

- `web/src/components/map/map-screen.tsx`
- `web/src/hooks/use-infinite-pensions.ts`
- `web/src/lib/api-client.ts`
- `web/src/app/page.tsx`
- `api/src/pensions/dto/filter-pensions.dto.ts`
- `api/src/pensions/pensions.service.ts`
