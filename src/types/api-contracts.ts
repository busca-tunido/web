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
export type AuthSessionDto = {
  token: string;
  accessToken?: string;
  user: Partial<components['schemas']['SanitizedUserResponseDto']> & {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: components['schemas']['Role'];
  };
};

export type UserProfileDto = Partial<components['schemas']['SanitizedUserResponseDto']> & {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: components['schemas']['Role'];
};

export type RoomDto = Partial<components['schemas']['RoomResponseDto']> & {
  id: string;
  title: string;
  monthlyPrice: number;
  isAvailable: boolean;
  type?: string;
  roomType?: 'SINGLE' | 'SHARED' | 'STUDIO';
  name?: string | null;
  priceMonthlyClp?: number;
  bathType?: 'PRIVATE' | 'SHARED';
  photos?: string[];
  bedCount?: number;
};

export type ReviewItemDto = Partial<components['schemas']['ReviewResponseDto']> & {
  id: string;
  pensionId: string;
  rating: number;
  comment: string;
  overallRating?: number;
  userName?: string;
  userVoted?: boolean;
  user?: components['schemas']['ReviewUserDto'] | null;
};

export type PensionItemDto = Partial<components['schemas']['PensionItemResponseDto']> & {
  id: string;
  title: string;
  city: string;
  baseMonthlyPrice?: number;
  averageRating?: number;
  ratingAverage?: number;
  reviewsCount?: number;
  ratingCount?: number;
  verificationStatus?: components['schemas']['VerificationStatus'];
  isActive?: boolean;
  rooms?: RoomDto[];
  reviews?: ReviewItemDto[];
  amenities?: Array<components['schemas']['PensionAmenityResponseDto'] | string>;
  includesWifi?: boolean;
};

export type PensionDetailDto = PensionItemDto;
export type StudentStayDto = Partial<components['schemas']['StudentStayResponseDto']> & {
  id: string;
  pensionId: string;
  pensionTitle: string;
  pensionCity: string;
  roomTitle: string;
  monthlyPaidClp: number;
  hasReview: boolean;
};
export type FavoriteItemDto = components['schemas']['FavoriteItemResponseDto'];
export type FavoritePensionSummaryDto = components['schemas']['FavoritePensionSummaryDto'];

export type PaginationMeta = components['schemas']['PaginationMetaDto'];

export type PaginatedResponse<T> = {
  items: T[];
  pagination?: PaginationMeta;
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
  hasMore?: boolean;
  nearbyCityCounts?: Array<{ city: string; count: number; distanceKm?: number }>;
};

export type PaginatedPensionsResponse = PaginatedResponse<PensionItemDto>;
export type PaginatedReviewsResponse = PaginatedResponse<ReviewItemDto>;

export type GeoCoordinateDto = components['schemas']['GeoCoordinateDto'];
export type CampusAreaDto = components['schemas']['CampusAreaResponseDto'];
export type UniversityDto = Partial<components['schemas']['UniversityResponseDto']> & {
  id: string;
  name: string;
  city: string;
  latitude: number;
  longitude: number;
  acronym?: string | null;
  campus?: string;
  imageUrl?: string | null;
  campuses?: CampusAreaDto[];
};

export type ProposalDto = components['schemas']['ProposalResponseDto'] & {
  userId?: string;
  proposedChanges: Record<string, unknown>;
};

export type ReportDto = components['schemas']['ReportResponseDto'];
export type UploadImageResult = components['schemas']['UploadImageResponseDto'];
export type UserHelpfulVotesResponse = components['schemas']['HelpfulVotesResponseDto'];
