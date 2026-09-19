# Task: Landlord Room Item Card & Room Editor Drawer

## Execution Profile

- **Wave / Batch**: Wave 3 (Data Contracts, Landlord Drawer Atoms & Semantics)
- **Execution Mode**: `PARALLEL`
- **Assigned Role**: `Worker Agent (Web Landlord Room Atoms)`
- **Dependencies (`depends_on`)**: `[]`
- **Collision Risk**: `LOW`

## Target Files

- **Exclusive**:
  - `src/components/landlord/room-item-card.tsx` [NEW]
  - `src/components/landlord/room-editor-drawer.tsx` [NEW]

## Objective

Build the room presentation and editing building blocks for property owners:
1. `RoomItemCard`: Visual room card displaying room thumbnail, room type badges (`SINGLE`, `SHARED`, `STUDIO`), bathroom badge (`Baño privado`), formatted Chilean price (`$260.000 CLP / mes`), instant availability toggle switch (`Disponible / Ocupada`) with optimistic update, and edit button callback.
2. `RoomEditorDrawer`: Mobile bottom-sheet drawer for creating and modifying rooms with room type selection pills, CLP numeric input, private bathroom switch, bed counters for shared rooms, and photo uploader/preview.

## Technical Specifications

1. **`RoomItemCard` (`src/components/landlord/room-item-card.tsx`)**:
   - Props: `room: RoomItem`, `onEdit: (room: RoomItem) => void`, `onToggleAvailability: (roomId: string, isAvailable: boolean) => Promise<void>`.
   - Renders room metadata, instant switch calling `onToggleAvailability` optimistically, and edit trigger.

2. **`RoomEditorDrawer` (`src/components/landlord/room-editor-drawer.tsx`)**:
   - Props: `isOpen: boolean`, `onClose: () => void`, `pensionId: string`, `roomToEdit?: RoomItem | null`, `onSuccess: () => void`.
   - Form fields:
     - Room name input.
     - Room type pills (`Individual`, `Compartida`, `Estudio`).
     - CLP rent input.
     - Private bathroom toggle switch.
     - Bed count stepper (for shared rooms).
     - Image file picker / thumbnail preview.
   - Primary action: calls `roomsService.createRoom` or `roomsService.updateRoom`.

## Checklist

- [ ] Build `RoomItemCard` with optimistic availability toggle in `src/components/landlord/room-item-card.tsx`.
- [ ] Build `RoomEditorDrawer` with room filters inputs in `src/components/landlord/room-editor-drawer.tsx`.
- [ ] Format currency in Chilean pesos (`CLP`).
- [ ] Stage target files and commit with `feat(landlord): implement room item card and mobile room editor drawer`.
