import type { CitySummaryDto, ReviewItemDto } from '@/lib/types';

export type CityInfo = CitySummaryDto & {
  readonly isCurrentCity?: boolean;
};

export type PensionReview = ReviewItemDto & {
  readonly userVoted?: boolean;
};

export type RatingTier = 'high' | 'medium' | 'low';

export type SearchFilters = {
  readonly query: string;
  readonly city?: string;
  readonly neighborhood?: string;
  readonly universityId?: string;
  readonly minPriceClp?: number;
  readonly maxPriceClp?: number;
  readonly roomType?: 'SINGLE' | 'SHARED' | 'STUDIO';
  readonly hasPrivateBathroom?: boolean;
  readonly includesMeals?: boolean;
  readonly amenities?: readonly string[];
  readonly minBeds?: number;
  readonly onlyAvailable?: boolean;
  readonly internetIncluded?: boolean;
  readonly petsAllowed?: boolean;
  readonly guestsAllowed?: boolean;
  readonly smokingAllowed?: boolean;
  readonly noCurfew?: boolean;
  readonly waterIncluded?: boolean;
  readonly electricityIncluded?: boolean;
  readonly gasIncluded?: boolean;
  readonly genderPreference?: 'ANY' | 'FEMALE_ONLY' | 'MALE_ONLY' | 'MIXED' | 'ALL';
  readonly sortBy?: 'relevance' | 'distance' | 'price_asc' | 'price_desc' | 'rating';
  readonly ratingTier?: RatingTier;
};

export type NavTab = 'explore' | 'favorites' | 'map' | 'history' | 'account';
