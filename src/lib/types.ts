export type UserRole = 'STUDENT' | 'LANDLORD' | 'ADMIN';

export type UserProfile = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
  universityName?: string;
  isForeignStudent?: boolean;
  avatarUrl?: string;
};

export type CityInfo = {
  id: string;
  name: string;
  region: string;
  foreignStudentRate: number;
  pensionsCount: number;
  averagePriceClp: number;
  imageUrl: string;
  isCurrentCity?: boolean;
  latitude: number;
  longitude: number;
};

export type UniversityInfo = {
  id: string;
  name: string;
  acronym: string;
  city: string;
  domains: string[];
  foreignStudentRate: number;
  pensionsNearbyCount: number;
  logoUrl?: string;
  imageUrl: string;
  latitude: number;
  longitude: number;
};

export type RoomInfo = {
  id: string;
  title: string;
  roomType: 'SINGLE' | 'SHARED';
  priceMonthlyClp: number;
  hasPrivateBathroom: boolean;
  isAvailable: boolean;
  photos: string[];
};

export type PensionItem = {
  id: string;
  slug: string;
  title: string;
  description: string;
  address: string;
  neighborhood: string;
  city: string;
  latitude: number;
  longitude: number;
  priceMonthlyClp: number;
  depositClp: number;
  ratingAverage: number;
  reviewsCount: number;
  isVerified: boolean;
  genderPreference: 'MIXED' | 'FEMALE_ONLY' | 'MALE_ONLY';
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
};

export type SearchFilters = {
  query: string;
  city?: string;
  universityId?: string;
  maxPriceClp?: number;
  hasPrivateBathroom?: boolean;
  includesMeals?: boolean;
  genderPreference?: 'MIXED' | 'FEMALE_ONLY' | 'MALE_ONLY' | 'ALL';
};

export type NavTab = 'explore' | 'favorites' | 'map' | 'history' | 'account';

export type StayHistoryItem = {
  id: string;
  pensionId: string;
  pensionTitle: string;
  pensionCity: string;
  roomTitle: string;
  startDate: string;
  endDate: string;
  ratingGiven?: number;
  hasReview: boolean;
  monthlyPaidClp: number;
  imageUrl: string;
};

export type StayDurationCategory =
  | 'FEW_DAYS'
  | 'FEW_WEEKS'
  | 'ONE_SEMESTER'
  | 'ONE_YEAR'
  | 'MORE_THAN_A_YEAR';

export type PensionReview = {
  id: string;
  pensionId: string;
  overallRating: number;
  rating?: number;
  cleanlinessRating?: number;
  landlordRating?: number;
  quietnessRating?: number;
  wifiRating?: number;
  comment: string;
  pros?: string;
  cons?: string;
  stayDurationCategory?: string;
  stayDuration?: StayDurationCategory | string;
  isResidentVerified?: boolean;
  isVerifiedStudent?: boolean;
  images?: Array<{ id?: string; url: string; caption?: string }>;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
    university?: {
      name?: string;
      shortName?: string;
    };
  };
};
