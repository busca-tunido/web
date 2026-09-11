import { apiFetch } from '@/lib/api-client-base';
import { type ApiResponse, createSuccess, isApiSuccess } from '@/lib/api-response';
import type { CreateReportDto, ReportDto, UpdateReportDto } from '@/types/api-contracts';

export type ReportFilterQuery = {
  status?: 'PENDING' | 'UNDER_REVIEW' | 'RESOLVED' | 'DISMISSED';
};

type RawReport = {
  id: string;
  pensionId: string;
  userId: string;
  reason: string;
  description: string;
  status: 'PENDING' | 'UNDER_REVIEW' | 'RESOLVED' | 'DISMISSED' | string;
  resolutionNotes?: string | null;
  createdAt: string;
};

function normalizeReport(raw: RawReport): ReportDto {
  return {
    id: raw.id,
    pensionId: raw.pensionId,
    userId: raw.userId,
    reason: raw.reason,
    description: raw.description,
    status: (raw.status as ReportDto['status']) ?? 'PENDING',
    resolutionNotes: raw.resolutionNotes ?? undefined,
    createdAt: String(raw.createdAt),
  };
}

export async function fetchReports(query?: ReportFilterQuery): Promise<ApiResponse<ReportDto[]>> {
  const queryParams = new URLSearchParams();
  if (query?.status) {
    queryParams.set('status', query.status);
  }
  const queryString = queryParams.toString();
  const endpoint = `/reports${queryString ? `?${queryString}` : ''}`;

  const response = await apiFetch<RawReport[]>(endpoint, {
    method: 'GET',
  });

  if (isApiSuccess(response)) {
    const list = Array.isArray(response.data) ? response.data : [];
    return createSuccess<ReportDto[]>(list.map(normalizeReport), response.statusCode);
  }

  return response;
}

export async function submitReport(payload: CreateReportDto): Promise<ApiResponse<ReportDto>> {
  const response = await apiFetch<RawReport>('/reports', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (isApiSuccess(response)) {
    return createSuccess<ReportDto>(normalizeReport(response.data), response.statusCode);
  }

  return response;
}

export async function updateReportStatus(
  id: string,
  payload: UpdateReportDto,
): Promise<ApiResponse<ReportDto>> {
  const response = await apiFetch<RawReport>(`/reports/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });

  if (isApiSuccess(response)) {
    return createSuccess<ReportDto>(normalizeReport(response.data), response.statusCode);
  }

  return response;
}

export const reportsService = {
  fetchReports,
  submitReport,
  updateReportStatus,
};
