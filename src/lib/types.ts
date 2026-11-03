import type {
  CitySummaryDto,
  NearbyCityCount,
  PaginationMeta,
  PensionItemDto,
  ReviewItemDto,
  RoomDto,
  StudentStayDto,
  UniversityDto,
  UserProfileDto,
} from '@/types/api-contracts';
import type { components } from './api-schema';

export type UserRole = components['schemas']['Role'];
export type UserProfile = UserProfileDto;

export type CityInfo = CitySummaryDto & {
  region?: string;
  isCurrentCity?: boolean;
};

export type UniversityInfo = UniversityDto & {
  domains?: string[];
  pensionsNearbyCount?: number;
};

export type RoomInfo = RoomDto & {
  roomType?: components['schemas']['RoomType'];
  photos?: string[];
};

export type PensionItem = Omit<PensionItemDto, 'genderPreference' | 'rooms' | 'amenities'> & {
  latitude: number;
  longitude: number;
  ratingAverage: number;
  reviewsCount: number;
  priceMonthlyClp: number;
  depositClp: number;
  isVerified: boolean;
  genderPreference: 'ANY' | 'FEMALE_ONLY' | 'MALE_ONLY' | 'MIXED';
  includesMeals: boolean;
  includesWifi: boolean;
  includesLaundry: boolean;
  includesStudyRoom: boolean;
  nearestUniversityName: string;
  distanceToUniversityMeters: number;
  photos: string[];
  rooms: RoomInfo[];
  curfewDescription?: string;
  visitsPolicy?: string;
  distanceKm?: number;
  relevanceScore?: number;
  amenities?: string[];
};

export type { NearbyCityCount, PaginationMeta };

export type PaginatedPensionsResponse = {
  items: PensionItem[];
  pagination: PaginationMeta;
  nearbyCityCounts: NearbyCityCount[];
};

export type PriceBinItem = components['schemas']['PriceHistogramBinDto'];
export type PriceHistogramResponse = components['schemas']['PriceHistogramResponseDto'];

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

export type StayDurationCategory = components['schemas']['StayDurationCategory'];

export type PensionReview = ReviewItemDto & {
  pros?: string | null;
  cons?: string | null;
  isResidentVerified?: boolean;
  isVerifiedStudent?: boolean;
  userVoted?: boolean;
};

export type StayHistoryItem = StudentStayDto & {
  startDate?: string | null;
  endDate?: string | null;
  review?: PensionReview | null;
};
