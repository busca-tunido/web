import { describe, expect, it } from 'vitest';
import {
  classifyPensionRating,
  filterPensionsByRatingTier,
  getDominantRatingClassification,
  getMarkerThemeStyles,
} from '@/lib/rating-tier';
import type { PensionItem } from '@/lib/types';

describe('Rating Tier & Semaforo Logic', () => {
  it('classifies unreviewed pensions correctly', () => {
    const zeroReviews = classifyPensionRating(4.5, 0);
    expect(zeroReviews.tier).toBe('unreviewed');
    expect(zeroReviews.reliability).toBe('unreviewed');
    expect(zeroReviews.label).toBe('Sin reseñas');

    const nullRating = classifyPensionRating(null, 3);
    expect(nullRating.tier).toBe('unreviewed');
    expect(nullRating.reliability).toBe('unreviewed');
    expect(nullRating.label).toBe('Sin reseñas');
  });

  it('classifies high rating with both reliability levels', () => {
    const highConfident = classifyPensionRating(4.8, 12);
    expect(highConfident.tier).toBe('high');
    expect(highConfident.reliability).toBe('high');
    expect(highConfident.label).toBe('Favoritas de la comunidad');

    const highUnconfident = classifyPensionRating(5.0, 4);
    expect(highUnconfident.tier).toBe('high');
    expect(highUnconfident.reliability).toBe('low');
    expect(highUnconfident.label).toBe('Favoritas de la comunidad');
  });

  it('classifies medium rating with both reliability levels', () => {
    const mediumConfident = classifyPensionRating(3.8, 8);
    expect(mediumConfident.tier).toBe('medium');
    expect(mediumConfident.reliability).toBe('high');
    expect(mediumConfident.label).toBe('Experiencia positiva');

    const mediumUnconfident = classifyPensionRating(3.5, 1);
    expect(mediumUnconfident.tier).toBe('medium');
    expect(mediumUnconfident.reliability).toBe('low');
    expect(mediumUnconfident.label).toBe('Experiencia positiva');
  });

  it('classifies low rating with both reliability levels', () => {
    const lowConfident = classifyPensionRating(2.5, 6);
    expect(lowConfident.tier).toBe('low');
    expect(lowConfident.reliability).toBe('high');
    expect(lowConfident.label).toBe('Otras alternativas');

    const lowUnconfident = classifyPensionRating(2.1, 3);
    expect(lowUnconfident.tier).toBe('low');
    expect(lowUnconfident.reliability).toBe('low');
    expect(lowUnconfident.label).toBe('Otras alternativas');
  });

  it('returns appropriate marker theme styles for Option 1 university prestige palette', () => {
    const highSolid = getMarkerThemeStyles(
      {
        tier: 'high',
        reliability: 'high',
        label: 'Favoritas de la comunidad',
        ratingAverage: 4.8,
        reviewsCount: 10,
      },
      false,
      false,
    );
    expect(highSolid.isSolid).toBe(true);
    expect(highSolid.bgHex).toBe('#2d5e49');
    expect(highSolid.opacity).toBe(1);

    const highSoft = getMarkerThemeStyles(
      {
        tier: 'high',
        reliability: 'low',
        label: 'Favoritas de la comunidad',
        ratingAverage: 4.8,
        reviewsCount: 2,
      },
      false,
      false,
    );
    expect(highSoft.isSolid).toBe(true);
    expect(highSoft.bgHex).toBe('#2d5e49');
    expect(highSoft.opacity).toBe(0.65);

    const medSolid = getMarkerThemeStyles(
      {
        tier: 'medium',
        reliability: 'high',
        label: 'Experiencia positiva',
        ratingAverage: 3.5,
        reviewsCount: 6,
      },
      false,
      false,
    );
    expect(medSolid.isSolid).toBe(true);
    expect(medSolid.bgHex).toBe('#a26510');
    expect(medSolid.opacity).toBe(1);

    const medSoft = getMarkerThemeStyles(
      {
        tier: 'medium',
        reliability: 'low',
        label: 'Experiencia positiva',
        ratingAverage: 3.5,
        reviewsCount: 2,
      },
      false,
      false,
    );
    expect(medSoft.isSolid).toBe(true);
    expect(medSoft.bgHex).toBe('#a26510');
    expect(medSoft.opacity).toBe(0.65);

    const lowSolid = getMarkerThemeStyles(
      {
        tier: 'low',
        reliability: 'high',
        label: 'Otras alternativas',
        ratingAverage: 2.0,
        reviewsCount: 7,
      },
      false,
      false,
    );
    expect(lowSolid.isSolid).toBe(true);
    expect(lowSolid.bgHex).toBe('#78716c');
    expect(lowSolid.opacity).toBe(1);

    const unreviewed = getMarkerThemeStyles(
      {
        tier: 'unreviewed',
        reliability: 'unreviewed',
        label: 'Sin reseñas',
        ratingAverage: 0,
        reviewsCount: 0,
      },
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
    expect(highTiers.map((p) => p.id)).toEqual(['1']);

    const mediumTiers = filterPensionsByRatingTier(mockPensions, 'medium');
    expect(mediumTiers.map((p) => p.id)).toEqual(['2', '3']);

    const lowTiers = filterPensionsByRatingTier(mockPensions, 'low');
    expect(lowTiers.map((p) => p.id)).toEqual(['4', '5']);

    const allTiers = filterPensionsByRatingTier(mockPensions, undefined);
    expect(allTiers.length).toBe(5);
  });

  it('determines the dominant rating classification for cluster groupings', () => {
    const emptyResult = getDominantRatingClassification([]);
    expect(emptyResult.tier).toBe('unreviewed');

    const highDominant = [
      { id: '1', ratingAverage: 4.8, reviewsCount: 10 } as PensionItem,
      { id: '2', ratingAverage: 4.6, reviewsCount: 6 } as PensionItem,
      { id: '3', ratingAverage: 3.5, reviewsCount: 5 } as PensionItem,
    ];
    const highResult = getDominantRatingClassification(highDominant);
    expect(highResult.tier).toBe('high');
    expect(highResult.reliability).toBe('high');
    expect(highResult.label).toBe('Favoritas de la comunidad');

    const highLowReliability = [
      { id: '1', ratingAverage: 5.0, reviewsCount: 4 } as PensionItem,
      { id: '2', ratingAverage: 5.0, reviewsCount: 4 } as PensionItem,
      { id: '3', ratingAverage: 3.5, reviewsCount: 8 } as PensionItem,
    ];
    const highSoftResult = getDominantRatingClassification(highLowReliability);
    expect(highSoftResult.tier).toBe('high');
    expect(highSoftResult.reliability).toBe('low');
    expect(highSoftResult.label).toBe('Favoritas de la comunidad');

    const mediumDominant = [
      { id: '1', ratingAverage: 3.8, reviewsCount: 5 } as PensionItem,
      { id: '2', ratingAverage: 3.6, reviewsCount: 7 } as PensionItem,
      { id: '3', ratingAverage: 4.9, reviewsCount: 15 } as PensionItem,
    ];
    const mediumResult = getDominantRatingClassification(mediumDominant);
    expect(mediumResult.tier).toBe('medium');
    expect(mediumResult.label).toBe('Experiencia positiva');

    const lowDominant = [
      { id: '1', ratingAverage: 2.1, reviewsCount: 5 } as PensionItem,
      { id: '2', ratingAverage: 2.4, reviewsCount: 8 } as PensionItem,
      { id: '3', ratingAverage: 4.5, reviewsCount: 6 } as PensionItem,
    ];
    const lowResult = getDominantRatingClassification(lowDominant);
    expect(lowResult.tier).toBe('low');
    expect(lowResult.label).toBe('Otras alternativas');

    const unreviewedDominant = [
      { id: '1', ratingAverage: 0, reviewsCount: 0 } as PensionItem,
      { id: '2', ratingAverage: 0, reviewsCount: 0 } as PensionItem,
      { id: '3', ratingAverage: 4.5, reviewsCount: 6 } as PensionItem,
    ];
    const unreviewedResult = getDominantRatingClassification(unreviewedDominant);
    expect(unreviewedResult.tier).toBe('unreviewed');
    expect(unreviewedResult.label).toBe('Sin reseñas');

    const tieHighMedium = [
      { id: '1', ratingAverage: 4.5, reviewsCount: 6 } as PensionItem,
      { id: '2', ratingAverage: 3.5, reviewsCount: 6 } as PensionItem,
    ];
    const tieResult = getDominantRatingClassification(tieHighMedium);
    expect(tieResult.tier).toBe('high');
  });

  it('demonstrates Bayesian dampening: 1 review of 5.0 does not qualify for Favoritas', () => {
    const singleReview = classifyPensionRating(5.0, 1);
    expect(singleReview.tier).toBe('medium');
    expect(singleReview.label).toBe('Experiencia positiva');
    expect(singleReview.reliability).toBe('low');
  });

  it('demonstrates consolidated high reputation: 4 reviews of 5.0 qualifies for Favoritas de la comunidad', () => {
    const consolidated = classifyPensionRating(5.0, 4);
    expect(consolidated.tier).toBe('high');
    expect(consolidated.label).toBe('Favoritas de la comunidad');
  });

  it('demonstrates mixed low average: 4 reviews with 2.75 raw rating is routed to Otras alternativas', () => {
    const mixedLow = classifyPensionRating(2.75, 4);
    expect(mixedLow.tier).toBe('low');
    expect(mixedLow.label).toBe('Otras alternativas');
  });

  it('routes 15 reviews of 4.4 to Favoritas de la comunidad', () => {
    const provenListing = classifyPensionRating(4.4, 15);
    expect(provenListing.tier).toBe('high');
    expect(provenListing.label).toBe('Favoritas de la comunidad');
  });

  it('evaluates multi-metric bonuses and polymorphic PensionItem parameter', () => {
    const pensionWithoutWifi: PensionItem = {
      id: 'p-no-wifi',
      ratingAverage: 4.8,
      reviewsCount: 10,
      includesWifi: false,
      isVerified: true,
      includesStudyRoom: true,
      distanceToUniversityMeters: 500,
    } as PensionItem;
    const resultNoWifi = classifyPensionRating(pensionWithoutWifi);
    expect(resultNoWifi.tier).toBe('medium');
    expect(resultNoWifi.label).toBe('Experiencia positiva');

    const pensionComplete: PensionItem = {
      id: 'p-complete',
      ratingAverage: 4.3,
      reviewsCount: 6,
      includesWifi: true,
      isVerified: true,
      includesStudyRoom: true,
      distanceToUniversityMeters: 800,
    } as PensionItem;
    const resultComplete = classifyPensionRating(pensionComplete);
    expect(resultComplete.tier).toBe('high');
    expect(resultComplete.label).toBe('Favoritas de la comunidad');
  });
});
