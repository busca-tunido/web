import type { components } from './api-schema';

export type UserRole = components['schemas']['Role'];
export type UserProfile = components['schemas']['SanitizedUserResponseDto'];
export type UserProfileDto = components['schemas']['SanitizedUserResponseDto'];
export type AuthResponseDto = components['schemas']['AuthResponseDto'];
export type RegisterDto = components['schemas']['RegisterDto'];
export type LoginDto = components['schemas']['LoginDto'];
export type DetectedUniversityDto = components['schemas']['DetectedUniversityResponseDto'];
export type CheckEmailResponseDto = components['schemas']['CheckEmailResponseDto'];

export type CitySummaryDto = components['schemas']['CitySummaryResponseDto'];
export type CityInfo = CitySummaryDto & { isCurrentCity?: boolean };

export type UniversityDto = components['schemas']['UniversityResponseDto'];
export type UniversityInfo = UniversityDto;
export type CreateUniversityDto = components['schemas']['CreateUniversityDto'];
export type UpdateUniversityDto = components['schemas']['UpdateUniversityDto'];
export type CampusAreaDto = components['schemas']['CampusAreaResponseDto'];

export type RoomDto = components['schemas']['RoomResponseDto'];
export type RoomInfo = RoomDto;
export type CreateRoomDto = components['schemas']['CreateRoomDto'];
export type UpdateRoomDto = components['schemas']['UpdateRoomDto'];

export type PensionItemDto = components['schemas']['PensionItemResponseDto'];
export type PensionDetailDto = components['schemas']['PensionItemResponseDto'];
export type PensionItem = components['schemas']['PensionItemResponseDto'];
export type CreatePensionDto = components['schemas']['CreatePensionDto'];
export type UpdatePensionDto = Partial<components['schemas']['UpdatePensionDto']>;

export type ReviewItemDto = components['schemas']['ReviewResponseDto'];
export type PensionReview = components['schemas']['ReviewResponseDto'] & {
  userVoted?: boolean;
};
export type CreateReviewDto = components['schemas']['CreateReviewDto'];
export type UpdateReviewDto = components['schemas']['UpdateReviewDto'];

export type StudentStayDto = components['schemas']['StudentStayResponseDto'];
export type StayHistoryItem = StudentStayDto;

export type FavoriteItemDto = components['schemas']['FavoriteItemResponseDto'];
export type FavoriteItem = FavoriteItemDto;
export type FavoritePensionSummaryDto = components['schemas']['FavoritePensionSummaryDto'];
export type FavoritePensionSummary = FavoritePensionSummaryDto;

export type ProposalDto = components['schemas']['ProposalResponseDto'];
export type CreateProposalDto = components['schemas']['CreateProposalDto'];
export type ReviewProposalDto = components['schemas']['ReviewProposalDto'];

export type ReportDto = components['schemas']['ReportResponseDto'];
export type CreateReportDto = components['schemas']['CreateReportDto'];
export type UpdateReportDto = components['schemas']['UpdateReportDto'];

export type PaginationMeta = components['schemas']['PaginationMetaDto'];
export type PaginationMetaDto = components['schemas']['PaginationMetaDto'];
export type NearbyCityCount = components['schemas']['NearbyCityCountDto'];
export type NearbyCityCountDto = components['schemas']['NearbyCityCountDto'];
export type PriceBinItem = components['schemas']['PriceHistogramBinDto'];
export type PriceHistogramResponse = components['schemas']['PriceHistogramResponseDto'];
export type StayDurationCategory = components['schemas']['StayDurationCategory'];
export type GenderPreference = components['schemas']['GenderPreference'];
export type VerificationStatus = components['schemas']['VerificationStatus'];
export type UploadImageResult = components['schemas']['UploadImageResponseDto'];
export type UserHelpfulVotesResponse = components['schemas']['HelpfulVotesResponseDto'];
export type UpdateReviewVisibilityDto = components['schemas']['UpdateReviewVisibilityDto'];
export type UpdatePensionStatusDto = components['schemas']['UpdatePensionStatusDto'];

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

export type RatingTier = 'high' | 'medium' | 'low';

export type SearchFilters = {
  query: string;
  city?: string;
  universityId?: string;
  minPriceClp?: number;
  maxPriceClp?: number;
  roomType?: 'SINGLE' | 'SHARED' | 'STUDIO';
  hasPrivateBathroom?: boolean;
  includesMeals?: boolean;
  minBeds?: number;
  genderPreference?: 'ANY' | 'FEMALE_ONLY' | 'MALE_ONLY' | 'MIXED' | 'ALL';
  sortBy?: 'relevance' | 'distance' | 'price_asc' | 'price_desc' | 'rating';
  ratingTier?: RatingTier;
};

export type NavTab = 'explore' | 'favorites' | 'map' | 'history' | 'account';
