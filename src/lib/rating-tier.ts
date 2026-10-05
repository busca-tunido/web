import type { PensionItem } from './types';

export type RatingTier = 'high' | 'medium' | 'low';
export type ReliabilityTier = 'high' | 'low';

export type RatingClassification = {
  tier: RatingTier | 'unreviewed';
  reliability: ReliabilityTier | 'unreviewed';
  label: string;
  ratingAverage: number;
  reviewsCount: number;
};

export type MarkerThemeStyle = {
  containerClass: string;
  dotColor: string;
  bgHex: string;
  textHex: string;
  borderHex: string;
  ringHex: string;
  isSolid: boolean;
  opacity: number;
};

export function classifyPensionRating(
  ratingAverage?: number | null,
  reviewsCount?: number | null,
): RatingClassification {
  const count = typeof reviewsCount === 'number' ? reviewsCount : 0;
  const rating = typeof ratingAverage === 'number' ? ratingAverage : 0;

  if (count === 0 || rating === 0) {
    return {
      tier: 'unreviewed',
      reliability: 'unreviewed',
      label: 'Sin reseñas',
      ratingAverage: 0,
      reviewsCount: 0,
    };
  }

  const reliability: ReliabilityTier = count >= 5 ? 'high' : 'low';

  if (rating >= 4.2) {
    return {
      tier: 'high',
      reliability,
      label: 'Alta',
      ratingAverage: rating,
      reviewsCount: count,
    };
  }

  if (rating >= 3.0) {
    return {
      tier: 'medium',
      reliability,
      label: 'Media',
      ratingAverage: rating,
      reviewsCount: count,
    };
  }

  return {
    tier: 'low',
    reliability,
    label: 'Baja',
    ratingAverage: rating,
    reviewsCount: count,
  };
}

export function filterPensionsByRatingTier(
  pensions: PensionItem[],
  tier?: RatingTier,
): PensionItem[] {
  if (!tier) return pensions;

  return pensions.filter((p) => {
    const classification = classifyPensionRating(p.ratingAverage, p.reviewsCount);
    return classification.tier === tier;
  });
}

export function getMarkerThemeStyles(
  classification: RatingClassification,
  isDark: boolean,
  isSelected: boolean,
): MarkerThemeStyle {
  const { tier, reliability } = classification;
  const isLowReliability = reliability === 'low';
  const targetOpacity = isLowReliability ? 0.65 : 1;

  if (tier === 'high') {
    return {
      containerClass: isSelected
        ? 'scale-110 shadow-xl ring-4'
        : 'shadow-md hover:scale-105 transition-transform',
      dotColor: '#ffffff',
      bgHex: isDark ? '#366e56' : '#2d5e49',
      textHex: '#ffffff',
      borderHex: isDark ? '#2d5e49' : '#224838',
      ringHex: isDark ? 'rgba(54, 110, 86, 0.45)' : 'rgba(45, 94, 73, 0.4)',
      isSolid: true,
      opacity: targetOpacity,
    };
  }

  if (tier === 'medium') {
    return {
      containerClass: isSelected
        ? 'scale-110 shadow-xl ring-4'
        : 'shadow-md hover:scale-105 transition-transform',
      dotColor: isDark ? '#1a140a' : '#ffffff',
      bgHex: isDark ? '#c8861e' : '#a26510',
      textHex: isDark ? '#1a140a' : '#ffffff',
      borderHex: isDark ? '#a26510' : '#855108',
      ringHex: isDark ? 'rgba(200, 134, 30, 0.45)' : 'rgba(162, 101, 16, 0.45)',
      isSolid: true,
      opacity: targetOpacity,
    };
  }

  if (tier === 'low') {
    return {
      containerClass: isSelected
        ? 'scale-110 shadow-xl ring-4'
        : 'shadow-md hover:scale-105 transition-transform',
      dotColor: isDark ? '#1c1a17' : '#ffffff',
      bgHex: isDark ? '#a8a29e' : '#78716c',
      textHex: isDark ? '#1c1a17' : '#ffffff',
      borderHex: isDark ? '#78716c' : '#57534e',
      ringHex: 'rgba(120, 113, 108, 0.45)',
      isSolid: true,
      opacity: targetOpacity,
    };
  }

  return {
    containerClass: isSelected
      ? 'scale-110 shadow-lg ring-4'
      : 'shadow-sm hover:scale-105 transition-transform',
    dotColor: isDark ? '#6b7280' : '#9ca3af',
    bgHex: isDark ? '#282522' : '#ffffff',
    textHex: isDark ? '#9e968d' : '#7e756f',
    borderHex: isDark ? '#36322d' : '#ece6de',
    ringHex: 'rgba(211, 123, 93, 0.25)',
    isSolid: false,
    opacity: 1,
  };
}
