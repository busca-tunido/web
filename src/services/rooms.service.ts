import { apiFetch } from '@/lib/api-client-base';
import { type ApiResponse, createSuccess, isApiSuccess } from '@/lib/api-response';
import type { CreateRoomDto, RoomDto, UpdateRoomDto } from '@/types/api-contracts';

export function mapRoomDto(raw: Record<string, unknown>): RoomDto {
  const hasPrivateBath = Boolean(raw.hasPrivateBathroom ?? raw.bathType === 'PRIVATE');
  return {
    id: String(raw.id ?? ''),
    pensionId: String(raw.pensionId ?? ''),
    name: String(raw.title ?? raw.name ?? raw.roomNumber ?? 'Habitación'),
    description: typeof raw.description === 'string' ? raw.description : null,
    monthlyPrice: Number(raw.monthlyPrice ?? 0),
    isAvailable: typeof raw.isAvailable === 'boolean' ? raw.isAvailable : true,
    bathType: hasPrivateBath ? 'PRIVATE' : 'SHARED',
    availableFrom: typeof raw.availableFrom === 'string' ? raw.availableFrom : null,
    images: Array.isArray(raw.images) ? (raw.images as string[]) : [],
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
  payload: UpdateRoomDto,
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
