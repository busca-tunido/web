import { describe, expect, it } from 'vitest';
import {
  classifyPensionRating,
  filterPensionsByRatingTier,
  getMarkerThemeStyles,
} from '@/lib/rating-tier';
import type { PensionItem } from '@/lib/types';

describe('Rating Tier & Semaforo Logic', () => {
  it('classifies unreviewed pensions correctly', () => {
    const zeroReviews = classifyPensionRating(4.5, 0);
    expect(zeroReviews.tier).toBe('unreviewed');
    expect(zeroReviews.reliability).toBe('unreviewed');

    const nullRating = classifyPensionRating(null, 3);
    expect(nullRating.tier).toBe('unreviewed');
  });

  it('classifies high rating with both reliability levels', () => {
    const highConfident = classifyPensionRating(4.8, 12);
    expect(highConfident.tier).toBe('high');
    expect(highConfident.reliability).toBe('high');

    const highUnconfident = classifyPensionRating(4.9, 2);
    expect(highUnconfident.tier).toBe('high');
    expect(highUnconfident.reliability).toBe('low');
  });

  it('classifies medium rating with both reliability levels', () => {
    const mediumConfident = classifyPensionRating(3.8, 8);
    expect(mediumConfident.tier).toBe('medium');
    expect(mediumConfident.reliability).toBe('high');

    const mediumUnconfident = classifyPensionRating(3.5, 1);
    expect(mediumUnconfident.tier).toBe('medium');
    expect(mediumUnconfident.reliability).toBe('low');
  });

  it('classifies low rating with both reliability levels', () => {
    const lowConfident = classifyPensionRating(2.5, 6);
    expect(lowConfident.tier).toBe('low');
    expect(lowConfident.reliability).toBe('high');

    const lowUnconfident = classifyPensionRating(2.1, 3);
    expect(lowUnconfident.tier).toBe('low');
    expect(lowUnconfident.reliability).toBe('low');
  });

  it('returns appropriate marker theme styles for Option 1 university prestige palette', () => {
    const highSolid = getMarkerThemeStyles(
      { tier: 'high', reliability: 'high', label: 'Alta', ratingAverage: 4.8, reviewsCount: 10 },
      false,
      false,
    );
    expect(highSolid.isSolid).toBe(true);
    expect(highSolid.bgHex).toBe('#2d5e49');
    expect(highSolid.opacity).toBe(1);

    const highSoft = getMarkerThemeStyles(
      { tier: 'high', reliability: 'low', label: 'Alta', ratingAverage: 4.8, reviewsCount: 2 },
      false,
      false,
    );
    expect(highSoft.isSolid).toBe(true);
    expect(highSoft.bgHex).toBe('#2d5e49');
    expect(highSoft.opacity).toBe(0.65);

    const medSolid = getMarkerThemeStyles(
      { tier: 'medium', reliability: 'high', label: 'Media', ratingAverage: 3.5, reviewsCount: 6 },
      false,
      false,
    );
    expect(medSolid.isSolid).toBe(true);
    expect(medSolid.bgHex).toBe('#d37b5d');
    expect(medSolid.opacity).toBe(1);

    const medSoft = getMarkerThemeStyles(
      { tier: 'medium', reliability: 'low', label: 'Media', ratingAverage: 3.5, reviewsCount: 2 },
      false,
      false,
    );
    expect(medSoft.isSolid).toBe(true);
    expect(medSoft.bgHex).toBe('#d37b5d');
    expect(medSoft.opacity).toBe(0.65);

    const lowSolid = getMarkerThemeStyles(
      { tier: 'low', reliability: 'high', label: 'Baja', ratingAverage: 2.0, reviewsCount: 7 },
      false,
      false,
    );
    expect(lowSolid.isSolid).toBe(true);
    expect(lowSolid.bgHex).toBe('#78716c');
    expect(lowSolid.opacity).toBe(1);

    const unreviewed = getMarkerThemeStyles(
      { tier: 'unreviewed', reliability: 'unreviewed', label: 'Sin reseñas', ratingAverage: 0, reviewsCount: 0 },
      false,
      false,
    );
    expect(unreviewed.isSolid).toBe(false);
    expect(unreviewed.bgHex).toBe('#ffffff');
    expect(unreviewed.opacity).toBe(1);
  });

  it('filters pensions by rating tier selecting both reliability levels', () => {
    const mockPensions = [
      { id: '1', ratingAverage: 4.9, reviewsCount: 15 } as PensionItem,
      { id: '2', ratingAverage: 4.5, reviewsCount: 2 } as PensionItem,
      { id: '3', ratingAverage: 3.6, reviewsCount: 7 } as PensionItem,
      { id: '4', ratingAverage: 2.2, reviewsCount: 1 } as PensionItem,
      { id: '5', ratingAverage: 0, reviewsCount: 0 } as PensionItem,
    ];

    const highTiers = filterPensionsByRatingTier(mockPensions, 'high');
    expect(highTiers.map((p) => p.id)).toEqual(['1', '2']);

    const mediumTiers = filterPensionsByRatingTier(mockPensions, 'medium');
    expect(mediumTiers.map((p) => p.id)).toEqual(['3']);

    const lowTiers = filterPensionsByRatingTier(mockPensions, 'low');
    expect(lowTiers.map((p) => p.id)).toEqual(['4']);

    const allTiers = filterPensionsByRatingTier(mockPensions, undefined);
    expect(allTiers.length).toBe(5);
  });
});
