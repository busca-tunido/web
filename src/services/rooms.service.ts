import { apiFetch } from '@/lib/api-client-base';
import { type ApiResponse, createSuccess, isApiSuccess } from '@/lib/api-response';
import type { CreateRoomDto, RoomDto, UpdateRoomDto } from '@/types/api-contracts';

export function mapRoomDto(raw: Record<string, unknown>): RoomDto {
  const hasPrivateBath = Boolean(raw.hasPrivateBathroom ?? raw.bathType === 'PRIVATE');
  const images = Array.isArray(raw.images)
    ? (raw.images as string[])
    : Array.isArray(raw.photos)
      ? (raw.photos as string[])
      : [];
  return {
    id: String(raw.id ?? ''),
    pensionId: String(raw.pensionId ?? ''),
    title: String(raw.title ?? raw.name ?? raw.roomNumber ?? 'Habitación'),
    name: String(raw.title ?? raw.name ?? raw.roomNumber ?? 'Habitación'),
    description: typeof raw.description === 'string' ? raw.description : null,
    type: (raw.type as RoomDto['type']) ?? 'SINGLE',
    monthlyPrice: Number(raw.monthlyPrice ?? 0),
    deposit: raw.deposit !== undefined && raw.deposit !== null ? Number(raw.deposit) : null,
    totalBeds: Number(raw.totalBeds ?? 1),
    availableBeds: Number(raw.availableBeds ?? 1),
    isAvailable: typeof raw.isAvailable === 'boolean' ? raw.isAvailable : true,
    hasPrivateBathroom: hasPrivateBath,
    bathType: hasPrivateBath ? 'PRIVATE' : 'SHARED',
    availableFrom: typeof raw.availableFrom === 'string' ? raw.availableFrom : null,
    images,
    photos: images,
    createdAt: String(raw.createdAt ?? new Date().toISOString()),
    updatedAt: String(raw.updatedAt ?? new Date().toISOString()),
  };
}

export async function fetchPensionRooms(pensionId: string): Promise<ApiResponse<RoomDto[]>> {
  const response = await apiFetch<Array<Record<string, unknown>>>(
    `/pensions/${encodeURIComponent(pensionId)}/rooms`,
    {
      method: 'GET',
    },
  );

  if (!isApiSuccess(response)) {
    return response;
  }

  const items = Array.isArray(response.data) ? response.data.map(mapRoomDto) : [];
  return createSuccess(items, response.statusCode);
}

export async function fetchRoomDetail(roomId: string): Promise<ApiResponse<RoomDto>> {
  const response = await apiFetch<Record<string, unknown>>(`/rooms/${encodeURIComponent(roomId)}`, {
    method: 'GET',
  });

  if (!isApiSuccess(response)) {
    return response;
  }

  return createSuccess(mapRoomDto(response.data), response.statusCode);
}

export async function createPensionRoom(
  pensionId: string,
  payload: CreateRoomDto,
): Promise<ApiResponse<RoomDto>> {
  const response = await apiFetch<Record<string, unknown>>(
    `/pensions/${encodeURIComponent(pensionId)}/rooms`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
  );

  if (!isApiSuccess(response)) {
    return response;
  }

  return createSuccess(mapRoomDto(response.data), response.statusCode);
}

export async function updateRoom(
  roomId: string,
  payload: Partial<UpdateRoomDto> & { isAvailable?: boolean },
): Promise<ApiResponse<RoomDto>> {
  const response = await apiFetch<Record<string, unknown>>(`/rooms/${encodeURIComponent(roomId)}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });

  if (!isApiSuccess(response)) {
    return response;
  }

  return createSuccess(mapRoomDto(response.data), response.statusCode);
}

export async function deleteRoom(roomId: string): Promise<ApiResponse<{ success: boolean }>> {
  const response = await apiFetch<{ id?: string; deleted?: boolean }>(
    `/rooms/${encodeURIComponent(roomId)}`,
    {
      method: 'DELETE',
    },
  );

  if (!isApiSuccess(response)) {
    return response;
  }

  return createSuccess(
    {
      success: response.data.deleted ?? true,
    },
    response.statusCode,
  );
}
