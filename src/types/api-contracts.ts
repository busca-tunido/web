import type { components, operations, paths } from '@/lib/api-schema';

export type ApiPaths = paths;
export type ApiOperations = operations;

export type RegisterDto = components['schemas']['RegisterDto'];
export type LoginDto = components['schemas']['LoginDto'];
export type CreatePensionDto = components['schemas']['CreatePensionDto'];
export type UpdatePensionDto = Partial<components['schemas']['UpdatePensionDto']>;
export type CreateRoomDto = components['schemas']['CreateRoomDto'];
export type UpdateRoomDto = components['schemas']['UpdateRoomDto'];
export type CreateUniversityDto = components['schemas']['CreateUniversityDto'];
export type UpdateUniversityDto = components['schemas']['UpdateUniversityDto'];
export type CreateReviewDto = components['schemas']['CreateReviewDto'];
export type UpdateReviewDto = components['schemas']['UpdateReviewDto'];
export type CreateProposalDto = components['schemas']['CreateProposalDto'];
export type ReviewProposalDto = components['schemas']['ReviewProposalDto'];
export type CreateReportDto = components['schemas']['CreateReportDto'];
export type UpdateReportDto = components['schemas']['UpdateReportDto'];
export type UpdateReviewVisibilityDto = components['schemas']['UpdateReviewVisibilityDto'];
export type UpdatePensionStatusDto = components['schemas']['UpdatePensionStatusDto'];

export type DetectedUniversityDto = components['schemas']['DetectedUniversityResponseDto'];
export type CitySummaryDto = components['schemas']['CitySummaryResponseDto'];
export type CheckEmailResponseDto = components['schemas']['CheckEmailResponseDto'];

export type AuthResponseDto = components['schemas']['AuthResponseDto'];
export type UserProfileDto = components['schemas']['SanitizedUserResponseDto'];

export type AuthSessionDto = {
  token: string;
  accessToken?: string;
  user: UserProfileDto;
};

export type RoomDto = components['schemas']['RoomResponseDto'];
export type ReviewItemDto = components['schemas']['ReviewResponseDto'];
export type PensionItemDto = components['schemas']['PensionItemResponseDto'];
export type PensionDetailDto = components['schemas']['PensionItemResponseDto'];
export type StudentStayDto = components['schemas']['StudentStayResponseDto'];
export type FavoriteItemDto = components['schemas']['FavoriteItemResponseDto'];
export type FavoritePensionSummaryDto = components['schemas']['FavoritePensionSummaryDto'];

export type PaginationMeta = components['schemas']['PaginationMetaDto'];
export type NearbyCityCount = components['schemas']['NearbyCityCountDto'];

export type PaginatedResponse<T> = {
  items: T[];
  pagination?: PaginationMeta;
  total: number;
  page: number;
  limit: number;
  totalPages?: number;
  hasMore?: boolean;
  nearbyCityCounts?: NearbyCityCount[];
};

export type PaginatedPensionsResponse = PaginatedResponse<PensionItemDto>;
export type PaginatedReviewsResponse = PaginatedResponse<ReviewItemDto>;

export type GeoCoordinateDto = components['schemas']['GeoCoordinateDto'];
export type CampusAreaDto = components['schemas']['CampusAreaResponseDto'];
export type UniversityDto = components['schemas']['UniversityResponseDto'];
export type ProposalDto = components['schemas']['ProposalResponseDto'];
export type ReportDto = components['schemas']['ReportResponseDto'];
export type UploadImageResult = components['schemas']['UploadImageResponseDto'];
export type UserHelpfulVotesResponse = components['schemas']['HelpfulVotesResponseDto'];
