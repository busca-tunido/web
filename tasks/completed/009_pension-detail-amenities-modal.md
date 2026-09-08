# Task: Pension Detail Amenities Breakdown & Rules Modal (`web/tasks/pension-detail-amenities-modal.md`)

## Objective

Enhance the amenities and house rules section on the pension detail screen. Add an interactive **"Ver más detalles"** button directly beneath the highlighted amenities tags (Google Hotels / Booking style) to open an expanded bottom sheet/modal detailing all categorized amenities, utility inclusions, and house rules.

---

## Technical Specifications

### 1. Highlighted Amenities Trigger (`src/components/pensions/pension-detail-modal.tsx`)
- Render the 4 to 6 most prominent amenity tags inline (e.g. WiFi de Alta Velocidad, Cocina Equipada, Baño Privado, Sala de Estudio).
- Place an interactive link/button right next to or below the badges:
  - Text: `Ver más detalles` (or `Ver todas las comodidades y normas`).
  - Style: Subtle button or highlighted link with chevron icon.
  - Action: Opens `AmenitiesBreakdownModal`.

### 2. Amenities Breakdown Modal (`src/components/pensions/amenities-breakdown-modal.tsx`)
- **Cabecera**:
  - Título: `Comodidades y normas de convivencia`
  - Subtítulo: `Detalle completo de los servicios incluidos y reglas del alojamiento en {pension.title}.`
- **Sección 1: Servicios Básicos e Inclusiones**:
  - Estado claro de servicios incluidos en la mensualidad: Agua, Luz/Electricidad, Gas, Internet/Wi-Fi.
- **Sección 2: Comodidades Categorizadas**:
  - Agrupadas según `AmenityCategory` de Prisma:
    - `BASIC_UTILITY`: Servicios básicos
    - `ROOM_FEATURE`: Equipamiento de dormitorios (closet, escritorio, calefacción)
    - `COMMON_AREA`: Áreas comunes (cocina libre uso, lavandería, patio, terraza)
    - `STUDY_WORK`: Ambiente de estudio (sala de estudio silenciosa, buena iluminación)
    - `SAFETY_SECURITY`: Seguridad (cámaras, chapa electrónica, conserjería)
- **Sección 3: Normas de la Casa y Convivencia**:
  - Horario de llegada / toque de queda (`curfewTime`).
  - Horario de silencio (`quietHoursStart` a `quietHoursEnd`).
  - Política de visitas de terceros (`guestsAllowed`).
  - Política de mascotas (`petsAllowed`).
  - Política de fumadores (`smokingAllowed`).
  - Preferencia de género (`genderPreference`: Mixto, Solo Mujeres, Solo Hombres).

---

## Checklist

- [ ] Add `[Ver más detalles]` button beneath the highlighted amenities pills in `src/components/pensions/pension-detail-modal.tsx`.
- [ ] Implement component `src/components/pensions/amenities-breakdown-modal.tsx`.
- [ ] Render categorized amenities groups (`BASIC_UTILITY`, `ROOM_FEATURE`, `COMMON_AREA`, `STUDY_WORK`, `SAFETY_SECURITY`).
- [ ] Display utility inclusions status (Agua, Electricidad, Gas, WiFi).
- [ ] Display house rules breakdown (horarios de silencio, visitas, mascotas, toque de queda).
- [ ] Ensure responsive drawer on mobile and dialog on desktop.
- [ ] Validate code quality with Biome (`pnpm run check && pnpm run review`).
- [ ] Verify build with `pnpm run build`.

---

## Target Files

- `src/components/pensions/pension-detail-modal.tsx`
- `src/components/pensions/amenities-breakdown-modal.tsx`
