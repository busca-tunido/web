import { apiFetch } from '@/lib/api-client-base';
import { type ApiResponse, createSuccess, isApiSuccess } from '@/lib/api-response';
import type { CreateProposalDto, ProposalDto, ReviewProposalDto } from '@/types/api-contracts';

export type ModerationProposalsQuery = {
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  page?: number;
  limit?: number;
};

type RawProposal = {
  id: string;
  pensionId: string;
  userId?: string;
  submittedById?: string;
  type: string;
  proposedChanges?: Record<string, unknown>;
  submissionNotes?: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | string;
  reviewNotes?: string | null;
  createdAt: string;
};

function normalizeProposal(raw: RawProposal): ProposalDto {
  return {
    id: raw.id,
    pensionId: raw.pensionId,
    userId: raw.userId ?? raw.submittedById ?? '',
    type: raw.type,
    proposedChanges: (raw.proposedChanges as Record<string, unknown>) ?? {},
    submissionNotes: raw.submissionNotes ?? undefined,
    status: (raw.status as ProposalDto['status']) ?? 'PENDING',
    reviewNotes: raw.reviewNotes ?? undefined,
    createdAt: String(raw.createdAt),
  };
}

export async function submitPensionProposal(
  pensionId: string,
  payload: CreateProposalDto,
): Promise<ApiResponse<ProposalDto>> {
  const response = await apiFetch<RawProposal>(
    `/pensions/${encodeURIComponent(pensionId)}/proposals`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
  );

  if (isApiSuccess(response)) {
    return createSuccess<ProposalDto>(normalizeProposal(response.data), response.statusCode);
  }

  return response;
}

export async function fetchPensionProposals(
  pensionId: string,
): Promise<ApiResponse<ProposalDto[]>> {
  const response = await apiFetch<RawProposal[]>(
    `/pensions/${encodeURIComponent(pensionId)}/proposals`,
    {
      method: 'GET',
    },
  );

  if (isApiSuccess(response)) {
    const list = Array.isArray(response.data) ? response.data : [];
    return createSuccess<ProposalDto[]>(list.map(normalizeProposal), response.statusCode);
  }

  return response;
}

export async function fetchAllModerationProposals(
  query?: ModerationProposalsQuery,
): Promise<ApiResponse<ProposalDto[]>> {
  const queryParams = new URLSearchParams();
  if (query?.status) {
    queryParams.set('status', query.status);
  }
  if (query?.page) {
    queryParams.set('page', String(query.page));
  }
  if (query?.limit) {
    queryParams.set('limit', String(query.limit));
  }
  const queryString = queryParams.toString();
  const endpoint = `/moderation/proposals${queryString ? `?${queryString}` : ''}`;

  const response = await apiFetch<RawProposal[] | { data: RawProposal[] }>(endpoint, {
    method: 'GET',
  });

  if (isApiSuccess(response)) {
    const rawList = Array.isArray(response.data)
      ? response.data
      : Array.isArray(response.data.data)
        ? response.data.data
        : [];
    const items = rawList.map(normalizeProposal);
    return createSuccess<ProposalDto[]>(items, response.statusCode);
  }

  return response;
}

export async function fetchModerationProposalDetail(id: string): Promise<ApiResponse<ProposalDto>> {
  const response = await apiFetch<RawProposal>(`/moderation/proposals/${encodeURIComponent(id)}`, {
    method: 'GET',
  });

  if (isApiSuccess(response)) {
    return createSuccess<ProposalDto>(normalizeProposal(response.data), response.statusCode);
  }

  return response;
}

export async function reviewProposal(
  id: string,
  payload: ReviewProposalDto,
): Promise<ApiResponse<ProposalDto>> {
  const response = await apiFetch<RawProposal>(
    `/moderation/proposals/${encodeURIComponent(id)}/review`,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    },
  );

  if (isApiSuccess(response)) {
    return createSuccess<ProposalDto>(normalizeProposal(response.data), response.statusCode);
  }

  return response;
}

export const proposalsService = {
  submitPensionProposal,
  fetchPensionProposals,
  fetchAllModerationProposals,
  fetchModerationProposalDetail,
  reviewProposal,
};
