import { apiFetch, wrapApiResponse } from '@/lib/api-fetch';
import { type ApiResponse, createSuccess, isApiSuccess } from '@/lib/api-response';
import type { components, paths } from '@/lib/api-schema';
import type { CreateProposalDto, ProposalDto, ReviewProposalDto } from '@/lib/types';

export type ModerationProposalsQuery = NonNullable<
  paths['/moderation/proposals']['get']['parameters']['query']
>;

export async function submitPensionProposal(
  pensionId: string,
  payload: CreateProposalDto,
): Promise<ApiResponse<ProposalDto>> {
  const result = await apiFetch.POST('/pensions/{id}/proposals', {
    params: {
      path: { id: pensionId },
    },
    body: payload,
  });
  return wrapApiResponse<ProposalDto>(result, 'Error al enviar la sugerencia de edición');
}

export async function fetchPensionProposals(
  pensionId: string,
  status?: components['schemas']['ProposalStatus'],
): Promise<ApiResponse<ProposalDto[]>> {
  const result = await apiFetch.GET('/pensions/{id}/proposals', {
    params: {
      path: { id: pensionId },
      ...(status ? { query: { status } } : {}),
    },
  });
  return wrapApiResponse<ProposalDto[]>(result, 'Error al obtener propuestas de la pensión');
}

export async function fetchAllModerationProposals(
  query?: ModerationProposalsQuery,
): Promise<ApiResponse<ProposalDto[]>> {
  const result = await apiFetch.GET('/moderation/proposals', {
    params: {
      query,
    },
  });
  const res = wrapApiResponse<components['schemas']['PaginatedProposalsResponseDto']>(
    result,
    'Error al obtener propuestas para moderación',
  );
  if (!isApiSuccess(res)) {
    return res;
  }
  const items = Array.isArray(res.data.items) ? [...res.data.items] : [];
  return createSuccess(items, res.statusCode);
}

export async function reviewProposal(
  proposalId: string,
  payload: ReviewProposalDto,
): Promise<ApiResponse<ProposalDto>> {
  const result = await apiFetch.PATCH('/moderation/proposals/{id}/review', {
    params: {
      path: { id: proposalId },
    },
    body: payload,
  });
  return wrapApiResponse<ProposalDto>(result, 'Error al revisar la propuesta');
}

export async function approveProposal(
  proposalId: string,
  reviewNotes?: string,
): Promise<ApiResponse<ProposalDto>> {
  return reviewProposal(proposalId, { action: 'APPROVE', reviewNotes });
}

export async function rejectProposal(
  proposalId: string,
  reviewNotes?: string,
): Promise<ApiResponse<ProposalDto>> {
  return reviewProposal(proposalId, { action: 'REJECT', reviewNotes });
}

export const proposalsService = {
  submitPensionProposal,
  fetchPensionProposals,
  fetchAllModerationProposals,
  reviewProposal,
  approveProposal,
  rejectProposal,
};
