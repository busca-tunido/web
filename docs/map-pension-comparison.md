# Comparador de pensiones integrado con el mapa

## Arquitectura revisada antes de implementar

BuscaTuNido tiene un repositorio coordinador con los submódulos web (Next.js App Router, React y TypeScript) y api (NestJS, Prisma y MongoDB), además del orquestador Python. La funcionalidad pertenece a la experiencia de estudiantes de web; no requiere cambios del orquestador, esquema de base de datos ni dependencias nuevas.

La revisión cubrió navegación y rutas, proveedores de autenticación y comparación, búsqueda y filtros, alimentación y consultas por área del mapa, fichas y galería, favoritos, catálogo de comodidades del backend, DTO y tipos OpenAPI, estilos compartidos y pruebas. Se leyeron AGENTS.md y la guía incluida de componentes cliente de Next.js.

- StudentAppShell coordina las secciones, filtros, selección de pensión y ficha.
- NavigationProvider y useUrlNavigationState sincronizan las secciones y las fichas con el historial del navegador.
- MapScreen conserva una instancia imperativa de Leaflet, agrupa y reutiliza marcadores, y consulta publicaciones al recorrer el mapa.
- PensionDetailModal carga la publicación y presenta PensionDetailContent, también usado por la ruta de detalle.
- PensionComparisonProvider ya restringía la selección a estudiantes autenticados, pero el comparador anterior abría otro modal.
- Favoritos usa useFavoriteAction y el estado de autenticación; el nuevo comparador sigue usando esa misma acción.
- pensionsService y PensionItem consumen el contrato OpenAPI existente. Las universidades cercanas incluyen distanceMeters; distanceKm pertenece a la búsqueda y no se usa como distancia al campus.
- Button, Badge, FullScreenImageViewer y los tokens card, border, primary y sage son los componentes y estilos compartidos reutilizados.

## Comportamiento

El botón Comparar aparece junto al corazón en la ficha. La ficha pasa al panel del mapa conservando la publicación como Pensión A; no queda un segundo modal abierto. La transición usa navigateTab directamente, que ya retira la capa de detalle. Llamar además a cerrar la ficha produciría un history.back asíncrono y una carrera de navegación.

Mientras haya una selección, abrir un marcador o una tarjeta del mapa ocupa el espacio vacío. Con ambas ocupadas, una nueva publicación reemplaza B. Reemplazar A/B permite elegir explícitamente el destino; puede cancelarse y la misma pensión no puede ocupar ambos espacios.

En desktop, el comparador ocupa el lateral del listado y mantiene disponible el mapa. Con una selección se muestra una columna; con dos, las características quedan alineadas en filas paralelas. Los nombres permanecen en un encabezado fijo al desplazarse por las características.

En mobile y tablets bajo 1024 px se muestra una sola pensión mediante pestañas A/B, con flechas de teclado, Home y End. La pestaña cambia al espacio recién seleccionado o reemplazado. Elegir en el mapa contrae el comparador sin perder la selección. Elegir otra publicación vuelve a expandirlo.

Se puede quitar cada espacio, reemplazarlo, limpiar la comparación y volver al modo normal. Las últimas dos acciones vacían los espacios y recuperan el listado. El contador y el badge Comparando muestran el estado. Las galerías permiten cambiar de foto y abrir el visor existente. Los favoritos funcionan independientemente de la comparación.

## Estado y carga de datos

El proveedor existente usa un reducer con dos espacios estables, A/B, y un destino de reemplazo opcional. Quitar A deja B en B. La lista selected se deriva de esos espacios para conservar las integraciones de tarjetas existentes.

La selección vive por encima del shell y del mapa. Cerrar una ficha, mover el mapa, aplicar filtros o cambiar de sección no la elimina. Fuera del mapa se presenta un acceso para retomar la comparación. Se reinicia al cambiar de usuario o cerrar sesión. No se promete conservación tras recargar la página ni sincronización entre dispositivos.

Cada espacio actualiza su detalle desde la API por ID, sin volver a cargar A cuando cambia B. Las respuestas de selecciones anteriores se ignoran. Durante una actualización o error no se reutilizan datos de la pensión anterior para calcular ventajas. Cada espacio tiene su propio error y reintento; una publicación inactiva debe reemplazarse.

MapScreen no se monta de nuevo al abrir el panel. ResizeObserver notifica los cambios de tamaño a Leaflet y mantiene visible la selección tras cambiar de una a dos columnas. Los eventos de marcadores reutilizados consultan el callback actual mediante una referencia para evitar cierres con selección antigua.

## Características y reglas de las ventajas

Se presentan precio y garantía, nombre y fotos, universidad y distancia al campus, dirección, tipos de habitación publicados, comodidades, comidas, lavandería, wifi, baño privado, sala de estudio, suministros incluidos, calificación, cantidad de reseñas, descripción resumida y reglas de convivencia.

- Más económica: precio publicado desde, únicamente entre monedas iguales.
- Más cercana: distanceMeters al campus seleccionado cuando existe filtro universitario; en otro caso, al campus más cercano publicado de cada pensión. Se explica esa base en pantalla.
- Mejor evaluada: promedio solamente cuando ambas tienen evaluaciones.
- Más equipada: cantidad de comodidades únicas y suministros publicados, sin contar de nuevo el wifi representado como internet incluido. No expresa calidad.
- Más reseñas: reviewsCount publicado.

Los empates, datos ausentes o valores inválidos no reciben un ganador. Los resaltados usan el verde sage del diseño existente, con texto e icono de verificación.

Las comodidades específicas se reconocen con los slugs del catálogo y servicio existentes del backend. Que una comodidad no esté informada no significa que no exista: se indica No informado. Las habitaciones y los suministros sí tienen valores explícitos. La garantía desconocida conserva su diferencia respecto de una garantía de cero. No se inventaron comidas, habitaciones, universidades ni distancias.

Solo diferencias filtra las filas con ambos detalles cargados. La descripción conserva el texto publicado y se limita visualmente a cuatro líneas.

## Archivos modificados

| Archivo | Cambio |
| --- | --- |
| src/contexts/pension-comparison-context.tsx | Reducer, espacios A/B, reemplazo y persistencia durante la navegación del estudiante. |
| src/components/pensions/pension-compare-button.tsx | Variante junto al corazón, transición al mapa y estado Comparando. |
| src/components/pensions/pension-detail-content.tsx | Integra el botón en la cabecera compartida de la ficha. |
| src/components/pensions/pension-comparison.tsx | Sustituye el modal global por el acceso para retomar la comparación fuera del mapa. |
| src/components/map/map-screen.tsx | Integra el panel responsive, conserva Leaflet, ajusta tamaño/centrado y callbacks de marcadores. |
| src/components/shells/student-app-shell.tsx | Dirige las aperturas del mapa a los espacios del comparador y evita superponer la ficha. |
| src/lib/pension-comparison.ts | Filas y funciones reutilizables para campus, precio y ventajas. |
| tests/components/pension-comparison.spec.tsx | Pruebas del flujo, navegación, sesiones, reemplazo, errores, pestañas y favoritos. |

## Archivos nuevos

| Archivo | Función |
| --- | --- |
| src/components/pensions/map-pension-comparison.tsx | Panel reutilizable, carga independiente por espacio, cabeceras, galerías y filas alineadas. |
| tests/pension-comparison.spec.ts | Reglas de distancias, empates, monedas, evaluaciones, servicios y estabilidad de espacios. |
| docs/map-pension-comparison.md | Este documento. |

No se modificó la API ni se añadieron dependencias: los datos requeridos ya están en su contrato.

## Verificación

- Biome global: check y review.
- TypeScript: tsc --noEmit.
- Vitest: 225 pruebas aprobadas en 30 archivos.
- Compilación de producción Next.js completa.
- Navegador con registros de prueba: 1440, 1024, 390 y 320 px; transición desde ficha, B desde marcador, reemplazo de A, retirada de A, regreso al modo normal, pestañas mobile y ausencia de desbordamiento horizontal.
- Se comprobó que la misma instancia del mapa permanece durante la comparación, con un desfase de centrado inferior a 0,51 píxeles tras el cambio de columnas.
- Galería y visor: cambio de foto, apertura y cierre, sin perder la comparación, en las cuatro resoluciones. Para esa comprobación se usaron imágenes mínimas de prueba.

Las capturas locales usan datos de prueba y estados vacíos de fotos; no representan publicaciones reales. El entorno local no dispone de una clave CARTO válida y sus mosaicos muestran API KEY REQUIRED. Esto limita la revisión visual del mapa base; se verificaron sus marcadores, eventos, dimensiones y selección. No se cambió la configuración de mapas de producción.

