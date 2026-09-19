# Task: Airbnb-Style Filter Drawer Redesign

## Execution Profile

- **Wave / Batch**: Wave 4 (Filter Drawer Redesign, Landlord Screens & Context)
- **Execution Mode**: `ISOLATED`
- **Assigned Role**: `Worker Agent (Web Filter UX)`
- **Dependencies (`depends_on`)**: `[web/tasks/price-histogram-slider-component.md, web/tasks/price-histogram-service-hook.md]`
- **Collision Risk**: `LOW`

## Target Files

- **Exclusive**:
  - `src/components/layout/filter-drawer.tsx`

## Objective

Completely redesign `FilterDrawer` replacing the legacy flat layout with a modern, mobile-first scrollable interface inspired by Airbnb:
1. Fix horizontal overflow issues when selecting multiple filters.
2. Enable vertical scrolling (`max-h-[85vh] overflow-y-auto`) to inspect all filter categories cleanly on mobile devices.
3. Integrate the dynamic `PriceHistogramRangeSlider` powered by `usePriceHistogram()`.
4. Provide sticky header (with "Limpiar" action) and sticky footer ("Mostrar X alojamientos").

## Technical Specifications

1. **Header Sticky**:
   - Drag handle on top (mobile).
   - Close button (X), centered title *"Filtros"*, and active filters badge counter.
   - Quick action: *"Limpiar"* button to reset all filters to default state.

2. **Scrollable Body Sections (`max-h-[82vh] overflow-y-auto pr-1`)**:
   - **Rango de Precios**:
     - Subtitle: *"Precio mensual por pensión, incluye servicios"*.
     - Integrate `<PriceHistogramRangeSlider />` using data from `usePriceHistogram()`.
   - **Tipo de Alojamiento (Icon Pills)**:
     - Horizontal selector with Lucide icons:
       - *Pieza Individual* (`User`)
       - *Pieza Compartida* (`Users`)
       - *Estudio* (`Home`)
   - **Comodidades Clave**:
     - Toggle pills: *Baño privado*, *Comida incluida*, *Cocina equipada*, *Lavandería*, *WiFi fibra*.
   - **Reglas de Convivencia y Género**:
     - Segmented preference: *Mixto*, *Solo Mujeres*, *Solo Hombres*.

3. **Sticky Footer**:
   - Left: *"Limpiar todo"* text button.
   - Right: Primary action button *"Mostrar alojamientos"* (updating label dynamically with matching listing count).

## Checklist

- [ ] Implement sticky header with handle and "Limpiar" action in `src/components/layout/filter-drawer.tsx`.
- [ ] Implement scrollable body containing PriceHistogramRangeSlider, room type pills, and amenities.
- [ ] Implement sticky footer with apply button.
- [ ] Stage target file and commit with `feat(filters): redesign filter drawer with airbnb-style scrollable layout and dynamic histogram`.
