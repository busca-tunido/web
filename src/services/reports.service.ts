import { apiFetch, wrapApiResponse } from '@/lib/api-fetch';
import type { ApiResponse } from '@/lib/api-response';
import type { paths } from '@/lib/api-schema';
import type { CreateReportDto, ReportDto, UpdateReportDto } from '@/lib/types';

export type ReportFilterQuery = NonNullable<paths['/reports']['get']['parameters']['query']>;

export async function fetchReports(query?: ReportFilterQuery): Promise<ApiResponse<ReportDto[]>> {
  const result = await apiFetch.GET('/reports', {
    params: {
      query,
    },
  });
  return wrapApiResponse<ReportDto[]>(result, 'Error al obtener reportes');
}

export async function submitReport(payload: CreateReportDto): Promise<ApiResponse<ReportDto>> {
  const result = await apiFetch.POST('/reports', {
    body: payload,
  });
  return wrapApiResponse<ReportDto>(result, 'Error al enviar reporte');
}

export async function updateReportStatus(
  id: string,
  payload: UpdateReportDto,
): Promise<ApiResponse<ReportDto>> {
  const result = await apiFetch.PATCH('/reports/{id}', {
    params: {
      path: { id },
    },
    body: payload,
  });
  return wrapApiResponse<ReportDto>(result, 'Error al actualizar reporte');
}

export const reportsService = {
  fetchReports,
  submitReport,
  updateReportStatus,
};
