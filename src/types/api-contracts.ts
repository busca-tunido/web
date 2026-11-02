import type { components, operations, paths } from '@/lib/api-schema';

export type ApiPaths = paths;
export type ApiOperations = operations;

export type RegisterDto = components['schemas']['RegisterDto'];
export type LoginDto = components['schemas']['LoginDto'];
export type CreatePensionDto = components['schemas']['CreatePensionDto'];
export type UpdatePensionDto = Partial<components['schemas']['UpdatePensionDto']> & {
  isActive?: boolean;
};
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

export type UserProfileDto = components['schemas']['SanitizedUserResponseDto'];

export type RoomDto = Partial<components['schemas']['RoomResponseDto']> & {
  id: string;
  pensionId: string;
  monthlyPrice: number;
  isAvailable: boolean;
  name?: string;
  bathType?: 'PRIVATE' | 'SHARED';
  availableFrom?: string | null;
  images?: string[];
  photos?: string[];
};

export type ReviewItemDto = Partial<components['schemas']['ReviewResponseDto']> & {
  id: string;
  pensionId: string;
  userId: string;
  rating: number;
  comment: string;
  helpfulCount: number;
  userName?: string;
  overallRating?: number;
  landlordRating?: number;
  stayDuration?: string;
  userVoted?: boolean;
  images?: string[];
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string | null;
    university?: {
      shortName?: string | null;
      name?: string;
    } | null;
  };
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
  quietHoursStart?: string | null;
  quietHoursEnd?: string | null;
  images?: Array<
    | components['schemas']['PensionImageResponseDto']
    | { id: string; url: string; order?: number; isMain?: boolean }
  >;
  rooms?: RoomDto[];
  reviews?: ReviewItemDto[];
  amenities?: Array<
    components['schemas']['PensionAmenityResponseDto'] | { id?: string; slug: string; name: string }
  >;
  includesWifi?: boolean;
};

export type PensionDetailDto = PensionItemDto;

export type PaginationMeta = components['schemas']['PaginationMetaDto'];

export type PaginatedResponse<T> = {
  items: T[];
  pagination?: PaginationMeta;
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
  hasMore?: boolean;
  nearbyCityCounts?: Array<{
    city: string;
    count: number;
    distanceKm?: number;
  }>;
};

export type PaginatedPensionsResponse = PaginatedResponse<PensionItemDto>;
export type PaginatedReviewsResponse = PaginatedResponse<ReviewItemDto>;

export type GeoCoordinateDto = components['schemas']['GeoCoordinateDto'];
export type CampusAreaDto = components['schemas']['CampusAreaResponseDto'];

export type UniversityDto = Partial<components['schemas']['UniversityResponseDto']> & {
  id: string;
  name: string;
  acronym: string;
  city: string;
  latitude: number;
  longitude: number;
  campus?: string;
  imageUrl?: string;
  campuses?: CampusAreaDto[];
};

export type ProposalDto = components['schemas']['ProposalResponseDto'] & {
  userId?: string;
  proposedChanges: Record<string, unknown>;
};

export type ReportDto = components['schemas']['ReportResponseDto'];
export type UploadImageResult = components['schemas']['UploadImageResponseDto'];
export type UserHelpfulVotesResponse = components['schemas']['HelpfulVotesResponseDto'];
