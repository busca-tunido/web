# Task: Community Suggested Edit Modal & Proposal Submission (`web/tasks/suggest-edit-proposal-modal.md`)

## Objective

Implement the community collaborative editing interface on the pension detail screen. Add an understated link ("¿Conoces este lugar o viste algo incorrecto? Sugerir una corrección") below the rooms section that opens an interactive modal for students to submit change proposals (suggested edits) to moderators.

---

## Technical Specifications

### 1. Trigger Link (`src/components/pension-detail-modal.tsx`)
- Render below the available rooms section:
  - Texto principal: `¿Conoces este lugar o viste algo incorrecto?`
  - Enlace de acción: `Sugerir una corrección` (estilo discreto en tono gris/zinc, con subrayado sutil al pasar el cursor).
- Al hacer clic abre el modal interactivo `SuggestEditModal`.

### 2. Suggest Edit Modal (`src/components/suggest-edit-modal.tsx`)
- **Cabecera clara y motivadora**:
  - Título: `Ayúdanos a mantener la información al día`
  - Subtítulo: `Si vives aquí o conoces esta pensión, cuéntanos qué cambió o qué datos faltan para que otros estudiantes tengan información confiable.`
- **Campos pre-llenados automáticamente con la publicación actual**:
  - El modal clona el estado actual de la publicación recibido desde la API (`title`, `description`, `priceMonthlyClp`, `depositClp`, `amenities`, `services`, `rules`, `address`, `photos`, etc.).
  - El usuario no escribe desde cero; visualiza la información vigente y solo modifica lo que esté incorrecto o desactualizado.
- **Panel de edición rápida (Cambios más comunes y frecuentes)**:
  - **Comodidades interactivas (Tags rápidos)**: Muestra los tags de amenidades actuales con pills activables. El estudiante puede desmarcar un tag existente con un clic (para indicar que ya no existe) o seleccionar del catálogo de comodidades las que falten.
  - **Precios y servicios incluidos**: Modificar el arriendo base y activar/desactivar toggles de servicios (Agua, Electricidad, Gas, Internet).
  - **Normas de convivencia clave**: Toggles rápidos para visitas permitidas, mascotas, fumar y horarios de silencio.
- **Sección colapsable de edición avanzada (`<details>` / acordeón)**:
  - Elemento interactivo tipo `<details>` con resumen: `▶ Edición avanzada (título, descripción, fotos y ubicación)`.
  - Permite proponer una actualización profunda o total de la pensión:
    - Corrección de título y descripción detallada.
    - Corrección de dirección exacta, calle y barrio.
    - Proponer URLs de nuevas fotografías o señalar imágenes obsoletas.
    - Corrección en la configuración de habitaciones (baño privado, disponibilidad de camas).
- **Justificación y envío**:
  - Campo descriptivo: `¿Por qué propones este cambio? (Información para los moderadores)`
    - Placeholder: `Ej. Viví aquí el último semestre: ahora cuentan con lavandería en el primer piso y el valor del arriendo subió a $250.000 con luz incluida...`
  - El frontend calcula el diff entre los datos originales y los modificados, enviando el payload estructurado hacia `POST /pensions/:id/proposals`.
  - Mensaje de confirmación: `¡Gracias por colaborar! Tu propuesta de cambio fue enviada a los moderadores para su revisión.`

---

## Checklist

- [ ] Add `¿Conoces este lugar o viste algo incorrecto? Sugerir una corrección` trigger below rooms list in `src/components/pension-detail-modal.tsx`.
- [ ] Build `src/components/suggest-edit-modal.tsx` with pre-filled cloned data from current pension details.
- [ ] Implement quick-edit panel with interactive amenity pills toggle (add missing / remove obsolete tags).
- [ ] Implement expandable `<details>` section for advanced full-property editing (title, description, address, photos, rooms).
- [ ] Implement diff calculation comparing original and modified state before sending payload to `POST /pensions/:id/proposals`.
- [ ] Add loading, validation, and success toast states with collaborative messaging.
- [ ] Validate code quality with Biome (`pnpm run check && pnpm run review`).
- [ ] Verify build with `pnpm run build`.

---

## Target Files

- `src/components/pension-detail-modal.tsx`
- `src/components/suggest-edit-modal.tsx`
- `src/lib/api-client.ts`
