import type { SearchFilters } from './types';

export type FilterChipItem = {
  id: string;
  label: string;
  priority: number;
  textColorClass?: string;
  activeColorClass?: string;
  isActive: (filters: SearchFilters) => boolean;
  toggle: (filters: SearchFilters) => SearchFilters;
};

export const RECOMMENDED_FILTER_CHIPS: readonly FilterChipItem[] = [
  {
    id: 'rating_high',
    label: 'Favoritas',
    priority: 0,
    textColorClass:
      'text-[#2d5e49] dark:text-[#72bca0] border-border/70 bg-card/60 hover:border-[#2d5e49]/50 font-semibold',
    activeColorClass:
      'border-[#2d5e49] bg-[#2d5e49]/15 text-[#2d5e49] dark:text-[#72bca0] dark:border-[#366e56] font-bold ring-1 ring-[#2d5e49]/30',
    isActive: (f) => f.ratingTier === 'high',
    toggle: (f) => ({
      ...f,
      ratingTier: f.ratingTier === 'high' ? undefined : 'high',
    }),
  },
  {
    id: 'rating_medium',
    label: 'Buenas reseñas',
    priority: 1,
    textColorClass:
      'text-[#945d0c] dark:text-[#e09d32] border-border/70 bg-card/60 hover:border-[#a26510]/50 font-semibold',
    activeColorClass:
      'border-[#a26510] bg-[#a26510]/15 text-[#945d0c] dark:text-[#e09d32] dark:border-[#c8861e] font-bold ring-1 ring-[#a26510]/30',
    isActive: (f) => f.ratingTier === 'medium',
    toggle: (f) => ({
      ...f,
      ratingTier: f.ratingTier === 'medium' ? undefined : 'medium',
    }),
  },
  {
    id: 'rating_low',
    label: 'Otras alternativas',
    priority: 2,
    textColorClass:
      'text-[#57534e] dark:text-[#a8a29e] border-border/70 bg-card/60 hover:border-[#78716c]/50 font-semibold',
    activeColorClass:
      'border-[#78716c] bg-[#78716c]/15 text-[#57534e] dark:text-[#a8a29e] dark:border-[#a8a29e] font-bold ring-1 ring-[#78716c]/30',
    isActive: (f) => f.ratingTier === 'low',
    toggle: (f) => ({
      ...f,
      ratingTier: f.ratingTier === 'low' ? undefined : 'low',
    }),
  },
  {
    id: 'only_available',
    label: 'Piezas libres',
    priority: 3,
    isActive: (f) => Boolean(f.onlyAvailable),
    toggle: (f) => ({
      ...f,
      onlyAvailable: f.onlyAvailable ? undefined : true,
    }),
  },
  {
    id: 'price_asc',
    label: 'Más baratas',
    priority: 4,
    isActive: (f) => f.sortBy === 'price_asc',
    toggle: (f) => ({
      ...f,
      sortBy: f.sortBy === 'price_asc' ? undefined : 'price_asc',
    }),
  },
  {
    id: 'max_price',
    label: 'Hasta $140 mil',
    priority: 5,
    isActive: (f) => f.maxPriceClp === 140000,
    toggle: (f) => ({
      ...f,
      maxPriceClp: f.maxPriceClp === 140000 ? undefined : 140000,
    }),
  },
  {
    id: 'bathroom',
    label: 'Baño privado',
    priority: 6,
    isActive: (f) => Boolean(f.hasPrivateBathroom),
    toggle: (f) => ({
      ...f,
      hasPrivateBathroom: f.hasPrivateBathroom ? undefined : true,
    }),
  },
  {
    id: 'meals',
    label: 'Comida incluida',
    priority: 7,
    isActive: (f) => Boolean(f.includesMeals),
    toggle: (f) => ({
      ...f,
      includesMeals: f.includesMeals ? undefined : true,
    }),
  },
  {
    id: 'single',
    label: 'Pieza individual',
    priority: 8,
    isActive: (f) => f.roomType === 'SINGLE',
    toggle: (f) => ({
      ...f,
      roomType: f.roomType === 'SINGLE' ? undefined : 'SINGLE',
    }),
  },
  {
    id: 'female_only',
    label: 'Solo mujeres',
    priority: 9,
    isActive: (f) => f.genderPreference === 'FEMALE_ONLY',
    toggle: (f) => ({
      ...f,
      genderPreference: f.genderPreference === 'FEMALE_ONLY' ? undefined : 'FEMALE_ONLY',
    }),
  },
  {
    id: 'shared',
    label: 'Pieza compartida',
    priority: 10,
    isActive: (f) => f.roomType === 'SHARED',
    toggle: (f) => ({
      ...f,
      roomType: f.roomType === 'SHARED' ? undefined : 'SHARED',
    }),
  },
  {
    id: 'mixed',
    label: 'Mixto',
    priority: 11,
    isActive: (f) => f.genderPreference === 'ANY' || f.genderPreference === 'MIXED',
    toggle: (f) => ({
      ...f,
      genderPreference:
        f.genderPreference === 'ANY' || f.genderPreference === 'MIXED' ? undefined : 'ANY',
    }),
  },
];

export function countActiveFilters(
  filters: SearchFilters,
  options?: {
    includeCity?: boolean;
    selectedCityName?: string;
    includeSort?: boolean;
  },
): number {
  let count = 0;
  if (filters.minPriceClp !== undefined || filters.maxPriceClp !== undefined) count += 1;
  if (filters.roomType) count += 1;
  if (filters.hasPrivateBathroom) count += 1;
  if (filters.includesMeals) count += 1;
  if (filters.onlyAvailable) count += 1;
  if (filters.minBeds !== undefined && filters.minBeds > 0) count += 1;
  if (filters.internetIncluded) count += 1;
  if (filters.petsAllowed) count += 1;
  if (filters.guestsAllowed) count += 1;
  if (filters.smokingAllowed) count += 1;
  if (filters.noCurfew) count += 1;
  if (filters.waterIncluded) count += 1;
  if (filters.electricityIncluded) count += 1;
  if (filters.gasIncluded) count += 1;
  if (filters.amenities && filters.amenities.length > 0) count += filters.amenities.length;
  if (filters.genderPreference && filters.genderPreference !== 'ALL') count += 1;
  if (filters.ratingTier) count += 1;
  if (filters.neighborhood?.trim()) count += 1;
  if (options?.includeCity && (options.selectedCityName ?? filters.city)) count += 1;
  if (options?.includeSort && filters.sortBy && filters.sortBy !== 'relevance') count += 1;
  return count;
}

export function getSortedFilterChips(filters: SearchFilters): FilterChipItem[] {
  return [...RECOMMENDED_FILTER_CHIPS].sort((a, b) => {
    const aActive = a.isActive(filters);
    const bActive = b.isActive(filters);
    if (aActive && !bActive) return -1;
    if (!aActive && bActive) return 1;
    return a.priority - b.priority;
  });
}
