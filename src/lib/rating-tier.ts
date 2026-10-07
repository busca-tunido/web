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
  pension: PensionItem | Partial<PensionItem>,
): RatingClassification;
export function classifyPensionRating(
  ratingAverage?: number | null,
  reviewsCount?: number | null,
  extraOptions?: Partial<PensionItem>,
): RatingClassification;
export function classifyPensionRating(
  arg1?: number | null | Partial<PensionItem>,
  arg2?: number | null,
  arg3?: Partial<PensionItem>,
): RatingClassification {
  let ratingAverage: number | null | undefined;
  let reviewsCount: number | null | undefined;
  let options: Partial<PensionItem> = {};

  if (typeof arg1 === 'object' && arg1 !== null) {
    ratingAverage = arg1.ratingAverage;
    reviewsCount = arg1.reviewsCount;
    options = arg1;
  } else {
    ratingAverage = arg1;
    reviewsCount = arg2;
    if (arg3 && typeof arg3 === 'object') {
      options = arg3;
    }
  }

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
  const confidenceInertia = 3;
  const priorMean = 3.5;
  const rAdj =
    (count / (count + confidenceInertia)) * rating +
    (confidenceInertia / (count + confidenceInertia)) * priorMean;

  const isVerified = options.isVerified === true;
  const hasWifi = options.includesWifi ?? true;
  const hasStudyRoom = options.includesStudyRoom === true;
  const hasProximity =
    typeof options.distanceToUniversityMeters === 'number' &&
    options.distanceToUniversityMeters > 0 &&
    options.distanceToUniversityMeters <= 1200;

  const deltaVerif = isVerified ? 0.25 : 0;
  const deltaWifi = hasWifi ? 0.1 : 0;
  const deltaStudy = hasStudyRoom ? 0.15 : 0;
  const deltaProx = hasProximity ? 0.15 : 0;

  const crs = rAdj + deltaVerif + deltaWifi + deltaStudy + deltaProx;

  const isHigh =
    count >= 3 &&
    rating >= 4.2 &&
    rAdj >= 4.2 &&
    hasWifi &&
    crs >= 4.35;

  if (isHigh) {
    return {
      tier: 'high',
      reliability,
      label: 'Favoritas de la comunidad',
      ratingAverage: rating,
      reviewsCount: count,
    };
  }

  const isEmerging = count >= 1 && count <= 2 && rating >= 4.0;
  const isSolidCommunity = rating >= 3.0 && crs >= 3.2;

  if (isEmerging || isSolidCommunity) {
    return {
      tier: 'medium',
      reliability,
      label: 'Experiencia positiva',
      ratingAverage: rating,
      reviewsCount: count,
    };
  }

  return {
    tier: 'low',
    reliability,
    label: 'Otras alternativas',
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
    const classification = classifyPensionRating(p);
    if (tier === 'low') {
      return classification.tier === 'low' || classification.tier === 'unreviewed';
    }
    return classification.tier === tier;
  });
}

export function getDominantRatingClassification(pensions: PensionItem[]): RatingClassification {
  if (!pensions || pensions.length === 0) {
    return {
      tier: 'unreviewed',
      reliability: 'unreviewed',
      label: 'Sin reseñas',
      ratingAverage: 0,
      reviewsCount: 0,
    };
  }

  const classifications = pensions.map((p) => classifyPensionRating(p));

  const counts: Record<RatingTier | 'unreviewed', number> = {
    high: 0,
    medium: 0,
    low: 0,
    unreviewed: 0,
  };

  for (const c of classifications) {
    counts[c.tier] += 1;
  }

  const tierOrder: (RatingTier | 'unreviewed')[] = ['high', 'medium', 'low', 'unreviewed'];

  let dominantTier: RatingTier | 'unreviewed' = 'unreviewed';
  let maxCount = 0;

  for (const tier of tierOrder) {
    if (counts[tier] > maxCount) {
      maxCount = counts[tier];
      dominantTier = tier;
    }
  }

  const dominantPensions = classifications.filter((c) => c.tier === dominantTier);

  if (dominantTier === 'unreviewed') {
    return {
      tier: 'unreviewed',
      reliability: 'unreviewed',
      label: 'Sin reseñas',
      ratingAverage: 0,
      reviewsCount: 0,
    };
  }

  const highReliabilityCount = dominantPensions.filter((c) => c.reliability === 'high').length;

  const reliability: ReliabilityTier =
    highReliabilityCount >= dominantPensions.length / 2 ? 'high' : 'low';

  const sumRating = dominantPensions.reduce((acc, c) => acc + c.ratingAverage, 0);
  const avgRating = dominantPensions.length > 0 ? sumRating / dominantPensions.length : 0;
  const totalReviews = dominantPensions.reduce((acc, c) => acc + c.reviewsCount, 0);

  const label =
    dominantTier === 'high'
      ? 'Favoritas de la comunidad'
      : dominantTier === 'medium'
        ? 'Experiencia positiva'
        : 'Otras alternativas';

  return {
    tier: dominantTier,
    reliability,
    label,
    ratingAverage: Math.round(avgRating * 10) / 10,
    reviewsCount: totalReviews,
  };
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
