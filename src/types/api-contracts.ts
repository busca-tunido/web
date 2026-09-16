import type { components, operations, paths } from '@/lib/api-schema';

export type ApiPaths = paths;
export type ApiOperations = operations;

export type RegisterDto = components['schemas']['RegisterDto'];
export type LoginDto = components['schemas']['LoginDto'];
export type CreatePensionDto = components['schemas']['CreatePensionDto'];
export type UpdatePensionDto = components['schemas']['UpdatePensionDto'];
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

export type AuthSessionDto = {
  token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'STUDENT' | 'LANDLORD' | 'ADMIN' | 'MODERATOR';
  };
};

export type UserProfileDto = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  role: 'STUDENT' | 'LANDLORD' | 'ADMIN' | 'MODERATOR';
  universityId?: string | null;
  avatarUrl?: string | null;
  createdAt: string;
};

export type RoomDto = {
  id: string;
  pensionId: string;
  name: string;
  description?: string | null;
  monthlyPrice: number;
  isAvailable: boolean;
  bathType?: 'PRIVATE' | 'SHARED';
  availableFrom?: string | null;
  images?: string[];
};

export type ReviewItemDto = {
  id: string;
  pensionId: string;
  userId: string;
  userName?: string;
  rating: number;
  cleanlinessRating?: number;
  landlordRating?: number;
  locationRating?: number;
  roomType?: string;
  comment: string;
  stayDuration?: string;
  images?: string[];
  helpfulCount: number;
  userVoted?: boolean;
  createdAt: string;
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

export type PensionItemDto = {
  id: string;
  slug?: string;
  title: string;
  description?: string;
  address?: string;
  neighborhood?: string;
  city: string;
  latitude?: number;
  longitude?: number;
  baseMonthlyPrice?: number;
  currency?: string;
  deposit?: number | null;
  waterIncluded?: boolean;
  electricityIncluded?: boolean;
  gasIncluded?: boolean;
  internetIncluded?: boolean;
  curfewTime?: string | null;
  guestsAllowed?: boolean;
  smokingAllowed?: boolean;
  petsAllowed?: boolean;
  genderPreference?: 'ANY' | 'FEMALE_ONLY' | 'MALE_ONLY';
  quietHoursStart?: string | null;
  quietHoursEnd?: string | null;
  verificationStatus?: string;
  isActive?: boolean;
  images?: { id: string; url: string; order: number; isMain: boolean }[];
  rooms?: RoomDto[];
  reviews?: ReviewItemDto[];
  averageRating?: number;
  ratingAverage?: number;
  reviewsCount?: number;
  ratingCount?: number;
};

export type PensionDetailDto = PensionItemDto;

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  nearbyCityCounts?: Array<{
    city: string;
    count: number;
    distanceKm?: number;
  }>;
};

export type PaginatedPensionsResponse = PaginatedResponse<PensionItemDto>;
export type PaginatedReviewsResponse = PaginatedResponse<ReviewItemDto>;

export type UniversityDto = {
  id: string;
  name: string;
  acronym: string;
  city: string;
  campus?: string;
  latitude: number;
  longitude: number;
  imageUrl?: string;
};

export type ProposalDto = {
  id: string;
  pensionId: string;
  userId: string;
  type: string;
  proposedChanges: Record<string, unknown>;
  submissionNotes?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewNotes?: string;
  createdAt: string;
};

export type ReportDto = {
  id: string;
  pensionId: string;
  userId: string;
  reason: string;
  description: string;
  status: 'PENDING' | 'UNDER_REVIEW' | 'RESOLVED' | 'DISMISSED';
  resolutionNotes?: string;
  createdAt: string;
};

export type UploadImageResult = {
  url?: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  format?: string;
  size?: number;
};
