# Task: Publish Review CTA & Review Submission Modal (`web/tasks/publish-review-modal.md`)

## Objective

Implement the complete student review publication flow on the pension detail screen:
1. Replace the bottom sticky "Contactar al Propietario" button in `src/components/pensions/pension-detail-modal.tsx` with a primary **`[Publicar una reseña]`** action.
2. Build an interactive, rich review submission modal (`src/components/reviews/publish-review-modal.tsx`) that allows students to rate the pension (overall + category sub-ratings), select their stay duration, write detailed feedback, and attach up to 3 photos with live thumbnail previews.

---

## Technical Specifications

### 1. Primary Bottom Action (`src/components/pensions/pension-detail-modal.tsx`)
- **Eliminación**: Retirar por completo el botón `Contactar al Propietario` y la lógica de mensaje simulado.
- **Nuevo Botón Principal**:
  - Ubicación: Barra inferior fija (`DrawerFooter`).
  - Texto: `Publicar una reseña`
  - Icono: `PenLine`.
  - Estilo: `bg-primary hover:opacity-95 text-primary-foreground font-bold h-12 rounded-xl shadow-md transition active:scale-[0.98]`.
- **Control de Acceso / Autenticación Estricta**:
  - La aplicación es **exclusiva para usuarios registrados** (no se permiten usuarios invitados ni interacciones sin iniciar sesión).
  - Si un usuario no ha iniciado sesión, no puede interactuar ni publicar: la acción bloquea la pantalla y abre inmediatamente el flujo de inicio de sesión / registro con el mensaje: *"Esta plataforma es exclusiva para la comunidad universitaria registrada. Inicia sesión o regístrate para continuar."*
  - Solo usuarios con cuenta activa y sesión iniciada pueden acceder a `PublishReviewModal` y enviar reseñas.

---

### 2. Review Submission Modal (`src/components/reviews/publish-review-modal.tsx`)

#### A. Cabecera Contextual
- Título: `Califica tu experiencia en {pension.title}`
- Subtítulo: `Tu opinión sincera orienta a otros universitarios y fomenta una comunidad transparente.`

#### B. Sistema de Calificación con Estrellas (1 a 5)
- **Calificación General (Obligatoria)**:
  - 5 estrellas interactivas grandes con feedback visual en hover y click (`1 = Muy mala`, `2 = Regular`, `3 = Aceptable`, `4 = Muy buena`, `5 = Excelente`).
- **Calificaciones por Categoría (Opcionales / Desplegables)**:
  - Limpieza e higiene (`cleanlinessRating`)
  - Convivencia y trato del dueño (`landlordRating`)
  - Tranquilidad y ambiente de estudio (`quietnessRating`)
  - Calidad del Internet y Wi-Fi (`wifiRating`)

#### C. Duración de la Estancia (`stayDurationCategory`)
- Selector visual tipo pills/chips o Radio Group con opciones del enum de Prisma:
  - `FEW_DAYS` / `FEW_WEEKS`: Pocos días o semanas
  - `ONE_SEMESTER`: Un semestre académico
  - `ONE_YEAR`: Un año completo
  - `MORE_THAN_A_YEAR`: Más de un año

#### D. Comentario Detallado
- Textarea con validación en tiempo real:
  - Longitud mínima de 10 caracteres (deshabilita el botón de envío si es menor).
  - Contador dinámico de caracteres: `{comment.length} / 1000`.
  - Placeholder orientador: `Ej. Viví aquí durante mi primer año de universidad. Las piezas son amplias, la cocina siempre limpia y el ambiente es silencioso para estudiar. El internet funciona muy bien en épocas de certámenes...`

#### E. Galería de Imágenes (Hasta 3 Fotos)
- **Selector de Fotos**:
  - Botón de carga con icono de cámara/imagen y contador: `Subir fotos ({images.length}/3)`.
  - Acepta formatos estándar: `.png, .jpg, .jpeg, .webp, .heic` (máx. 5 MB por imagen).
  - Limita la selección a un máximo de 3 imágenes en total.
- **Previsualización Interactiva**:
  - Grilla de miniaturas cuadradas con `object-cover`.
  - Botón flotante `X` en cada miniatura para remover la foto antes de enviar.
  - Previsualización instantánea vía `URL.createObjectURL(file)`.

#### F. Envío y Actualización Reactiva
- Botón de Envío: `Publicar mi reseña`.
- Llamada a la API: Envía payload a `POST /pensions/:id/reviews` (o vía `apiClient.createReview`).
- **Manejo de Errores Específicos**:
  - `409 Conflict`: Si el estudiante ya publicó una reseña previa en esta pensión, muestra alerta contextual: *"Ya has publicado una reseña para esta pensión. Puedes editar tu opinión existente desde tu perfil."*
  - `401 Unauthorized`: Solicita re-autenticación.
- **Actualización Inmediata en la UI**:
  - Al completar el envío exitoso, inserta la nueva reseña al inicio de la lista de reseñas en `PensionDetailModal`.
  - Recalcula el promedio de estrellas y aumenta el contador de opiniones en la cabecera sin necesidad de recargar la página.
  - Toast de felicitación: *"¡Reseña publicada con éxito!"*.

---

## Checklist

- [ ] Reemplazar botón "Contactar al Propietario" por `[Publicar una reseña]` en `src/components/pensions/pension-detail-modal.tsx`.
- [ ] Implementar verificación de sesión al hacer clic (prompt de login si es visitante).
- [ ] Construir componente `src/components/reviews/publish-review-modal.tsx`.
- [ ] Implementar selector interactivo de estrellas general (1 a 5) con feedback de texto.
- [ ] Implementar sub-calificaciones opcionales por categoría (limpieza, dueño, estudio, wifi).
- [ ] Implementar selector de duración de estancia (`stayDurationCategory`).
- [ ] Implementar textarea con contador de caracteres y validación de mínimo 10 caracteres.
- [ ] Implementar cargador de hasta 3 fotos con previsualización en miniatura y botón para eliminar.
- [ ] Conectar envío con endpoint `POST /pensions/:id/reviews` en `src/lib/api-client.ts`.
- [ ] Manejar error `409 Conflict` (reseña duplicada) de forma amigable.
- [ ] Actualizar estado de reseñas y promedio en memoria de forma reactiva tras publicación exitosa.
- [ ] Validar formato y estilos con Biome (`pnpm run check && pnpm run review`).
- [ ] Validar compilación con `pnpm run build`.

---

## Target Files

- `src/components/pensions/pension-detail-modal.tsx`
- `src/components/reviews/publish-review-modal.tsx`
- `src/lib/api-client.ts`
- `src/lib/types.ts`
