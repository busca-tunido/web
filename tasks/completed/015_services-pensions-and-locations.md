# Task: 100% Pensions, Rooms & Universities API Services Implementation (`web/tasks/services-pensions-and-locations.md`)

## Execution Profile

- **Wave / Batch**: Wave 1
- **Execution Mode**: `PARALLEL`
- **Assigned Role**: `Worker Agent`
- **Dependencies (`depends_on`)**: `[services-contracts-and-client-foundation.md]`
- **Collision Risk**: `LOW (Isolated files)`

## Target Files

- **Exclusive**:
  - `src/services/pensions.service.ts`
  - `src/services/rooms.service.ts`
  - `src/services/universities.service.ts`
  - `src/services/locations.service.ts`
- **Shared / Integration Points**:
  - `src/services/index.ts` (Requiere Merge Gate en Wave 1 Sync)

## Objective

Implement 100% of the backend API endpoints for pensions, individual rooms, and universities directly consuming the OpenAPI auto-generated types (`api-schema.d.ts`), returning strictly typed `ApiResponse<T>` discriminant tagged unions with zero mock fallbacks and zero unit test overhead.

## Technical Specifications

### 1. Pensions Service (`src/services/pensions.service.ts`)
- 100% OpenAPI endpoints coverage:
  - `GET /pensions`: `fetchPaginatedPensions(params: PensionFilterParams): Promise<ApiResponse<PaginatedPensionsResponse>>`
    - Supports full filter set: `city`, `neighborhood`, `minPrice`, `maxPrice`, `genderPreference`, `universityId`, `amenities`, `search`, `page`, `limit`, `latitude`, `longitude`, `radiusKm`, `sortBy`, and dynamic bounding box `minLat, maxLat, minLng, maxLng`.
  - `GET /pensions/:idOrSlug`: `fetchPensionDetail(idOrSlug: string): Promise<ApiResponse<PensionDetailDto>>`
  - `POST /pensions`: `createPension(payload: CreatePensionDto): Promise<ApiResponse<PensionDetailDto>>`
  - `PATCH /pensions/:id`: `updatePension(id: string, payload: UpdatePensionDto): Promise<ApiResponse<PensionDetailDto>>`
  - `DELETE /pensions/:id`: `deletePension(id: string): Promise<ApiResponse<{ success: boolean }>>`

### 2. Rooms Service (`src/services/rooms.service.ts`)
- 100% OpenAPI endpoints coverage:
  - `GET /pensions/:pensionId/rooms`: `fetchPensionRooms(pensionId: string): Promise<ApiResponse<RoomDto[]>>`
  - `GET /rooms/:id`: `fetchRoomDetail(roomId: string): Promise<ApiResponse<RoomDto>>`
  - `POST /pensions/:pensionId/rooms`: `createPensionRoom(pensionId: string, payload: CreateRoomDto): Promise<ApiResponse<RoomDto>>`
  - `PATCH /rooms/:id`: `updateRoom(roomId: string, payload: UpdateRoomDto): Promise<ApiResponse<RoomDto>>`
  - `DELETE /rooms/:id`: `deleteRoom(roomId: string): Promise<ApiResponse<{ success: boolean }>>`

### 3. Universities Service (`src/services/universities.service.ts`)
- 100% OpenAPI endpoints coverage:
  - `GET /universities`: `fetchUniversities(): Promise<ApiResponse<UniversityDto[]>>`
  - `GET /universities/:id`: `fetchUniversityDetail(id: string): Promise<ApiResponse<UniversityDto>>`
  - `POST /universities`: `createUniversity(payload: CreateUniversityDto): Promise<ApiResponse<UniversityDto>>`
  - `PATCH /universities/:id`: `updateUniversity(id: string, payload: UpdateUniversityDto): Promise<ApiResponse<UniversityDto>>`
  - `DELETE /universities/:id`: `deleteUniversity(id: string): Promise<ApiResponse<{ success: boolean }>>`

### 4. Locations Service (`src/services/locations.service.ts`)
- Helper functions to extract unique cities from universities/pensions and sort by user GPS location.

## Checklist

- [x] Implement `src/services/pensions.service.ts` covering 100% of pensions endpoints (`GET /pensions`, `GET /pensions/:idOrSlug`, `POST`, `PATCH`, `DELETE`).
- [x] Implement `src/services/rooms.service.ts` covering 100% of room endpoints (`GET`, `POST`, `PATCH`, `DELETE`).
- [x] Implement `src/services/universities.service.ts` covering 100% of universities endpoints (`GET`, `POST`, `PATCH`, `DELETE`).
- [x] Implement `src/services/locations.service.ts` for city extraction and GPS sorting.
- [x] Ensure all query parameters and payload types use `api-schema.d.ts` OpenAPI types.
- [x] Validate code quality with Biome (`pnpm run check && pnpm run review`).

## Verification

- TypeScript Typecheck: `pnpm exec tsc --noEmit`
- Code Quality (Biome): `pnpm run check && pnpm run review`
