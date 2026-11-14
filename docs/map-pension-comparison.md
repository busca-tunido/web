# Comparación de pensiones a pantalla completa

## Comportamiento vigente

1. La persona marca Comparar en una ficha o tarjeta. La pensión queda en el espacio A, a la izquierda.
2. Sigue eligiendo desde el mapa. Al abrir otra pensión, esta ocupa B y aparece el comparador a pantalla completa.
3. En desktop, A y B ocupan cada una el 50 % del ancho disponible. Cada ficha tiene su propio desplazamiento.
4. La X superior derecha quita únicamente B, cierra la vista completa y deja el mapa disponible. A conserva su identidad y selección.
5. Al elegir otra publicación, se abre otra comparación con la misma A.
6. A solo se retira al pulsar su botón Dejar de comparar. No tiene un botón X propio.
7. En mobile se conserva la pantalla completa con pestañas A/B, sin forzar dos columnas estrechas. La X sigue visible en ambas pestañas.

El mapa permanece montado detrás del comparador. En mobile, al cerrar B se contrae el panel de A para dejar espacio al mapa; Ver pensión fija permite consultarla sin desmarcarla.

## Acceso público

La comparación no exige registro ni inicio de sesión. Usa los mismos endpoints públicos de pensiones y reseñas, sin crear usuarios ni tokens ficticios. Las acciones privadas conservan sus permisos; el bloqueo de contacto y publicación dentro del comparador se aplica también a visitantes.

El botón seleccionado dice Dejar de comparar, de forma visible y en su nombre accesible. El texto de ayuda utiliza la misma etiqueta.

## Mismo formato de la ficha normal

Las dos columnas reutilizan directamente PensionDetailContent. Conservan galería y visor, nombre, precio, dirección, universidad cercana, descripción, comodidades, habitaciones, ubicación y las reseñas. Se puede abrir el lector completo de reseñas.

Se muestran ventajas calculadas sobre los datos publicados mediante los badges sage existentes: Más económica, Más cercana, Mejor evaluada, Más equipada y Más reseñas. Los empates, datos ausentes y monedas diferentes no producen ganadores falsos.

La presentación principal pasó de filas de comparación a dos fichas completas, conforme al ajuste solicitado. No se ocultan secciones de la ficha para mostrar únicamente diferencias.

## Restricciones del modo comparación

PensionDetailContent recibe una propiedad opcional mode, cuyo valor normal por defecto es detail. En mode=comparison:

- Publicar una reseña muestra un aviso visible con role=alert y no abre el formulario.
- Consultar Disponibilidad muestra el mismo aviso y no abre teléfono ni WhatsApp.
- Los controles de contacto son botones informativos; no existen enlaces tel: o wa.me en esas fichas.
- El aviso dice: Estás en modo comparación. Sal de la comparación y abre la ficha para contactar o publicar una reseña.
- Leer reseñas, abrir fotos y usar favoritos siguen disponibles.

En una ficha normal se conservan los enlaces de contacto y la publicación de reseñas. Estas restricciones corresponden al flujo de interfaz del comparador.

## Arquitectura y estado

El repositorio coordinador mantiene los submódulos web (Next.js, React, TypeScript) y api (NestJS, Prisma y MongoDB). Esta modificación afecta únicamente web; reutiliza su contrato OpenAPI y no añade dependencias ni cambia la base de datos.

PensionComparisonProvider mantiene los espacios A/B tanto para visitantes sin cuenta como para usuarios registrados, sin filtrar por rol en las pantallas públicas. La selección se conserva al recorrer el mapa y al cerrar B. Se reinicia al iniciar sesión, cambiar de usuario o cerrar sesión; no se promete persistencia tras recargar el navegador.

MapPensionComparison conserva la carga de datos por ID de cada espacio. Quitar B y escoger otra no vuelve a solicitar el detalle A. Se ignoran respuestas de selecciones anteriores y se permite reintentar errores de cada espacio. Las publicaciones inactivas no generan ventajas. En comparación, el promedio y la cantidad de reseñas del resumen conservan los totales de la API: leer una página de opiniones no reemplaza esos totales con su muestra parcial.

La vista completa usa el Dialog existente con una variante fullScreen que no cambia sus valores por defecto. Gestiona foco y teclado. Escape tiene el mismo efecto que la X: quitar B. Los lectores de reseñas y el visor de imágenes mantienen su funcionamiento.

MapScreen conserva el ancho del panel de A detrás de la comparación, sin reconstruir Leaflet. StudentAppShell sigue dirigiendo las selecciones del mapa al proveedor compartido.

## Archivos modificados en este ajuste

| Archivo | Cambio |
| --- | --- |
| src/components/pensions/map-pension-comparison.tsx | Comparador completo, fichas normales, A fija, X exclusiva de B, pestañas y badges. |
| src/components/pensions/pension-detail-content.tsx | Modo de comparación; bloqueo informativo de contacto y publicación; identificadores únicos por pensión. |
| src/components/pensions/pension-compare-button.tsx | Variante visual para desmarcar dentro de la ficha comparada. |
| src/components/map/map-screen.tsx | Mantiene el mapa detrás y lo muestra al retirar B. |
| src/components/ui/dialog.tsx | Variante opcional a pantalla completa. |
| tests/components/pension-comparison.spec.tsx | Casos del nuevo flujo y restricciones; verifica también las acciones normales. |
| tests/fixtures/comparison-pensions.ts | Reseña de prueba tipada mediante el contrato existente. |
| src/contexts/pension-comparison-context.tsx | Comparador para visitantes y usuarios registrados, independiente del rol de la sesión. |
| AGENTS.md | Reglas de acceso público a la comparación y protección de acciones privadas. |
| docs/map-pension-comparison.md | Esta documentación actualizada. |

## Verificación

- Biome global: check y review aprobados.
- TypeScript sin errores.
- Vitest: 231 pruebas aprobadas en 30 archivos.
- Compilación de producción Next.js completa.
- Navegador en 1440, 1024, 390 y 320 px: pantalla completa, dos mitades iguales en desktop, pestañas mobile, lectura de reseñas, lector completo, visor de fotos, X de B, conservación de A y misma instancia del mapa.
- Contactar y publicar no generaron solicitudes de escritura ni abrieron ventanas nuevas durante la prueba.
- Flujo completo con y sin sesión a 1440 y 320 px: etiqueta visible Dejar de comparar, A fija, selección de B y otra pensión, lectura de reseñas y visor de fotos.

Las capturas y pruebas de navegador usan registros, reseñas e imágenes mínimas de prueba, no publicaciones reales. Los mosaicos CARTO locales siguen limitados por la falta de una clave válida; se verificó el comportamiento del mapa sin modificar la configuración de producción.

