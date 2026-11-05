import type { components } from './api-schema';

export type UserRole = components['schemas']['Role'];
export type UserProfileDto = components['schemas']['SanitizedUserResponseDto'];
export type AuthResponseDto = components['schemas']['AuthResponseDto'];
export type RegisterDto = components['schemas']['RegisterDto'];
export type LoginDto = components['schemas']['LoginDto'];
export type DetectedUniversityDto = components['schemas']['DetectedUniversityResponseDto'];
export type CheckEmailResponseDto = components['schemas']['CheckEmailResponseDto'];

export type CitySummaryDto = components['schemas']['CitySummaryResponseDto'];
export type UniversityDto = components['schemas']['UniversityResponseDto'];
export type CampusAreaDto = components['schemas']['CampusAreaResponseDto'];
export type CreateUniversityDto = components['schemas']['CreateUniversityDto'];
export type UpdateUniversityDto = components['schemas']['UpdateUniversityDto'];

export type RoomDto = components['schemas']['RoomResponseDto'];
export type RoomType = components['schemas']['RoomType'];
export type BathType = components['schemas']['BathType'];
export type CreateRoomDto = components['schemas']['CreateRoomDto'];
export type UpdateRoomDto = components['schemas']['UpdateRoomDto'];

export type PensionItemDto = components['schemas']['PensionItemResponseDto'];
export type CreatePensionDto = components['schemas']['CreatePensionDto'];
export type UpdatePensionDto = Partial<components['schemas']['UpdatePensionDto']>;
export type PensionSortBy = components['schemas']['PensionSortBy'];

export type ReviewItemDto = components['schemas']['ReviewResponseDto'];
export type ReviewSortBy = components['schemas']['ReviewSortBy'];
export type CreateReviewDto = components['schemas']['CreateReviewDto'];
export type UpdateReviewDto = components['schemas']['UpdateReviewDto'];

export type StudentStayDto = components['schemas']['StudentStayResponseDto'];
export type StayDurationCategory = components['schemas']['StayDurationCategory'];

export type FavoriteItemDto = components['schemas']['FavoriteItemResponseDto'];
export type FavoritePensionSummaryDto = components['schemas']['FavoritePensionSummaryDto'];
export type PensionDetailViewItem = FavoritePensionSummaryDto &
  Partial<Omit<PensionItem, keyof FavoritePensionSummaryDto>> & {
    readonly reviewsCount?: number;
  };

export type ProposalDto = components['schemas']['ProposalResponseDto'];
export type ProposalType = components['schemas']['ProposalType'];
export type ProposalStatus = components['schemas']['ProposalStatus'];
export type ReviewAction = components['schemas']['ReviewAction'];
export type CreateProposalDto = components['schemas']['CreateProposalDto'];
export type ReviewProposalDto = components['schemas']['ReviewProposalDto'];

export type ReportDto = components['schemas']['ReportResponseDto'];
export type ReportReason = components['schemas']['ReportReason'];
export type ReportStatus = components['schemas']['ReportStatus'];
export type CreateReportDto = components['schemas']['CreateReportDto'];
export type UpdateReportDto = components['schemas']['UpdateReportDto'];

export type PaginationMetaDto = components['schemas']['PaginationMetaDto'];
export type NearbyCityCountDto = components['schemas']['NearbyCityCountDto'];
export type PriceHistogramBinDto = components['schemas']['PriceHistogramBinDto'];
export type PriceHistogramResponseDto = components['schemas']['PriceHistogramResponseDto'];

export type GenderPreference = components['schemas']['GenderPreference'];
export type VerificationStatus = components['schemas']['VerificationStatus'];
export type UploadImageResult = components['schemas']['UploadImageResponseDto'];
export type HelpfulVotesResponseDto = components['schemas']['HelpfulVotesResponseDto'];
export type VoteHelpfulResultDto = components['schemas']['VoteHelpfulResultResponseDto'];
export type UpdateReviewVisibilityDto = components['schemas']['UpdateReviewVisibilityDto'];
export type UpdatePensionStatusDto = components['schemas']['UpdatePensionStatusDto'];
export type DeleteResultDto = components['schemas']['DeleteResultResponseDto'];
export type ApiErrorCode = components['schemas']['ApiErrorCode'];
export type ErrorEnvelopeDto = components['schemas']['ErrorEnvelopeDto'];

export type PaginatedPensionsResponse = components['schemas']['PaginatedPensionsResponseDto'];
export type PaginatedReviewsResponse = components['schemas']['PaginatedReviewsResponseDto'];
export type PaginatedProposalsResponse = components['schemas']['PaginatedProposalsResponseDto'];

export type UserProfile = UserProfileDto;
export type UniversityInfo = UniversityDto;
export type RoomInfo = RoomDto;
export type PensionItem = PensionItemDto;
export type PensionDetailDto = PensionItemDto;
export type StayHistoryItem = StudentStayDto;
export type FavoriteItem = FavoriteItemDto;
export type FavoritePensionSummary = FavoritePensionSummaryDto;
export type PaginationMeta = PaginationMetaDto;
export type NearbyCityCount = NearbyCityCountDto;
export type PriceBinItem = PriceHistogramBinDto;
export type PriceHistogramResponse = PriceHistogramResponseDto;
export type UserHelpfulVotesResponse = HelpfulVotesResponseDto;

export type {
  CityInfo,
  NavTab,
  PensionReview,
  RatingTier,
  SearchFilters,
} from '@/types/ui';
