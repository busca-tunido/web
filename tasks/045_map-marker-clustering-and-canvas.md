# Task: Map Marker Clustering and Canvas Layer Performance (`web/tasks/045_map-marker-clustering-and-canvas.md`)

## Execution Profile

- **Wave / Batch**: Wave 4
- **Execution Mode**: `PARALLEL`
- **Assigned Role**: `Worker Agent (Web Map Architecture)`
- **Dependencies (`depends_on`)**: `[]`
- **Collision Risk**: `LOW (Isolated map rendering subcomponents)`

## Target Files

- **Exclusive**:
  - `src/components/map/map-screen.tsx`

## Objective

Elevate Leaflet map rendering performance to 60 FPS when viewing dense metropolitan areas (like Santiago, Valparaíso, Concepción) by adding marker clustering / batch canvas rendering for distant pins, preventing DOM saturation from hundreds of simultaneous interactive elements.

## Technical Specifications

### 1. `src/components/map/map-screen.tsx`
- For high zoom levels (>= 15), render full custom HTML price badges.
- For lower zoom levels (< 14) or dense overlapping areas, group nearby pins or render streamlined circular dots to keep the DOM footprint low.
- Debounce marker layer clears and rebuilds to prevent frame drops during pinch-to-zoom gestures.

## Checklist

- [ ] Implement zoom-level aware marker density management in `MapScreen`.
- [ ] Optimize marker recreation to reuse existing marker instances when data hasn't changed.
- [ ] Verify 60 FPS smooth gestures during panning and zooming.
- [ ] Do NOT execute slow commands (`pnpm build`, `tsc`, `biome`).
- [ ] Stage exclusively target files and commit with `perf(map): implement zoom-aware marker rendering and clustering`.
