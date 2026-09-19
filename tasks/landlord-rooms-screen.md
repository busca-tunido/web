# Task: Landlord Rooms Management Screen

## Execution Profile

- **Wave / Batch**: Wave 4 (Filter Drawer Redesign, Landlord Screens & Context)
- **Execution Mode**: `PARALLEL`
- **Assigned Role**: `Worker Agent (Web Landlord Rooms Screen)`
- **Dependencies (`depends_on`)**: `[web/tasks/landlord-room-atom-components.md]`
- **Collision Risk**: `LOW`

## Target Files

- **Exclusive**:
  - `src/components/landlord/landlord-rooms-screen.tsx` [NEW]

## Objective

Build the primary operational screen for the landlord:
1. Display property KPIs: Occupancy progress bar (`X de Y ocupadas`) and projected monthly revenue in CLP.
2. Render the list of registered rooms using `RoomItemCard`.
3. Provide an `+ Agregar Habitación` button and integrate `RoomEditorDrawer` to create and edit rooms.
4. Show empty states and loading skeletons.

## Technical Specifications

1. **`LandlordRoomsScreen` (`src/components/landlord/landlord-rooms-screen.tsx`)**:
   - Reads `selectedPension` from `useLandlord()`.
   - Fetches rooms for the selected pension via `roomsService.fetchRoomsByPension(pensionId)`.
   - **KPI Summary Card**:
     - Occupancy: `totalRooms`, `occupiedRooms`, visual percentage progress bar (`bg-emerald-500`).
     - Projected Revenue: Formatted monthly sum of occupied rooms (`$X.XXX.XXX CLP / mes`).
   - Action Button: `+ Agregar Habitación` (triggers drawer in create mode).
   - Room List: Maps `rooms` to `<RoomItemCard />` with `onEdit` and `onToggleAvailability` handlers.
   - Drawer Integration: Mounts `<RoomEditorDrawer />` controlled by local state.

## Checklist

- [ ] Implement KPI summary card (occupancy bar and monthly revenue) in `src/components/landlord/landlord-rooms-screen.tsx`.
- [ ] Connect rooms list rendering via `RoomItemCard`.
- [ ] Connect `RoomEditorDrawer` for creation and editing workflows.
- [ ] Stage target file and commit with `feat(landlord): implement LandlordRoomsScreen with occupancy KPIs and drawer integration`.
