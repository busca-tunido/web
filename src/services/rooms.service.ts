import { apiFetch, wrapApiResponse } from '@/lib/api-fetch';
import type { ApiResponse } from '@/lib/api-response';
import type { CreateRoomDto, DeleteResultDto, RoomDto, UpdateRoomDto } from '@/lib/types';

export async function fetchPensionRooms(pensionId: string): Promise<ApiResponse<RoomDto[]>> {
  const result = await apiFetch.GET('/pensions/{pensionId}/rooms', {
    params: {
      path: { pensionId },
    },
  });
  return wrapApiResponse<RoomDto[]>(result, 'Error al obtener habitaciones');
}

export async function fetchRoomDetail(roomId: string): Promise<ApiResponse<RoomDto>> {
  const result = await apiFetch.GET('/rooms/{id}', {
    params: {
      path: { id: roomId },
    },
  });
  return wrapApiResponse<RoomDto>(result, 'Error al obtener habitación');
}

export async function createPensionRoom(
  pensionId: string,
  payload: CreateRoomDto,
): Promise<ApiResponse<RoomDto>> {
  const result = await apiFetch.POST('/pensions/{pensionId}/rooms', {
    params: {
      path: { pensionId },
    },
    body: payload,
  });
  return wrapApiResponse<RoomDto>(result, 'Error al crear habitación');
}

export async function updateRoom(
  roomId: string,
  payload: Partial<UpdateRoomDto> & { isAvailable?: boolean },
): Promise<ApiResponse<RoomDto>> {
  const result = await apiFetch.PATCH('/rooms/{id}', {
    params: {
      path: { id: roomId },
    },
    body: payload as UpdateRoomDto,
  });
  return wrapApiResponse<RoomDto>(result, 'Error al actualizar habitación');
}

export async function deleteRoom(roomId: string): Promise<ApiResponse<DeleteResultDto>> {
  const result = await apiFetch.DELETE('/rooms/{id}', {
    params: {
      path: { id: roomId },
    },
  });
  return wrapApiResponse<DeleteResultDto>(result, 'Error al eliminar habitación');
}

export const roomsService = {
  fetchPensionRooms,
  fetchRoomDetail,
  createPensionRoom,
  updateRoom,
  deleteRoom,
};
