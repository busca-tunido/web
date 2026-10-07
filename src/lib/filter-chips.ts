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
    label: 'Calificación alta',
    priority: 0,
    textColorClass:
      'text-[#2d5e49] dark:text-[#599b7d] border-border/70 bg-card/60 hover:border-[#2d5e49]/50 font-semibold',
    activeColorClass:
      'border-[#2d5e49] bg-[#2d5e49]/15 text-[#2d5e49] dark:text-[#599b7d] dark:border-[#366e56] font-bold ring-1 ring-[#2d5e49]/30',
    isActive: (f) => f.ratingTier === 'high',
    toggle: (f) => ({
      ...f,
      ratingTier: f.ratingTier === 'high' ? undefined : 'high',
    }),
  },
  {
    id: 'rating_medium',
    label: 'Calificación media',
    priority: 0,
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
    label: 'Calificación baja',
    priority: 0,
    textColorClass:
      'text-[#78716c] dark:text-[#a8a29e] border-border/70 bg-card/60 hover:border-[#78716c]/50 font-semibold',
    activeColorClass:
      'border-[#78716c] bg-[#78716c]/15 text-[#78716c] dark:text-[#a8a29e] dark:border-[#a8a29e] font-bold ring-1 ring-[#78716c]/30',
    isActive: (f) => f.ratingTier === 'low',
    toggle: (f) => ({
      ...f,
      ratingTier: f.ratingTier === 'low' ? undefined : 'low',
    }),
  },
  {
    id: 'bathroom',
    label: 'Baño privado',
    priority: 1,
    isActive: (f) => Boolean(f.hasPrivateBathroom),
    toggle: (f) => ({ ...f, hasPrivateBathroom: !f.hasPrivateBathroom }),
  },
  {
    id: 'meals',
    label: 'Comida incluida',
    priority: 2,
    isActive: (f) => Boolean(f.includesMeals),
    toggle: (f) => ({ ...f, includesMeals: !f.includesMeals }),
  },
  {
    id: 'single',
    label: 'Pieza individual',
    priority: 3,
    isActive: (f) => f.roomType === 'SINGLE',
    toggle: (f) => ({
      ...f,
      roomType: f.roomType === 'SINGLE' ? undefined : 'SINGLE',
    }),
  },
  {
    id: 'female_only',
    label: 'Solo mujeres',
    priority: 4,
    isActive: (f) => f.genderPreference === 'FEMALE_ONLY',
    toggle: (f) => ({
      ...f,
      genderPreference: f.genderPreference === 'FEMALE_ONLY' ? undefined : 'FEMALE_ONLY',
    }),
  },
  {
    id: 'max_price',
    label: 'Hasta $250k',
    priority: 5,
    isActive: (f) => f.maxPriceClp === 250000,
    toggle: (f) => ({
      ...f,
      maxPriceClp: f.maxPriceClp === 250000 ? undefined : 250000,
    }),
  },
  {
    id: 'top_rated',
    label: 'Mejor evaluadas',
    priority: 6,
    isActive: (f) => f.sortBy === 'rating',
    toggle: (f) => ({
      ...f,
      sortBy: f.sortBy === 'rating' ? undefined : 'rating',
    }),
  },
  {
    id: 'price_asc',
    label: 'Menor precio',
    priority: 7,
    isActive: (f) => f.sortBy === 'price_asc',
    toggle: (f) => ({
      ...f,
      sortBy: f.sortBy === 'price_asc' ? undefined : 'price_asc',
    }),
  },
  {
    id: 'shared',
    label: 'Pieza compartida',
    priority: 8,
    isActive: (f) => f.roomType === 'SHARED',
    toggle: (f) => ({
      ...f,
      roomType: f.roomType === 'SHARED' ? undefined : 'SHARED',
    }),
  },
  {
    id: 'mixed',
    label: 'Residencia mixta',
    priority: 9,
    isActive: (f) => f.genderPreference === 'MIXED',
    toggle: (f) => ({
      ...f,
      genderPreference: f.genderPreference === 'MIXED' ? undefined : 'MIXED',
    }),
  },
];

export function getSortedFilterChips(filters: SearchFilters): FilterChipItem[] {
  return [...RECOMMENDED_FILTER_CHIPS].sort((a, b) => {
    const aActive = a.isActive(filters);
    const bActive = b.isActive(filters);
    if (aActive && !bActive) return -1;
    if (!aActive && bActive) return 1;
    return a.priority - b.priority;
  });
}
