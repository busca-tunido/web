import { describe, expect, it } from 'vitest';
import { matchesSearchFilters } from '@/lib/filter-matcher';
import type { PensionItem, SearchFilters } from '@/lib/types';

describe('matchesSearchFilters', () => {
  const basePension: PensionItem = {
    id: 'p1',
    slug: 'pension-central',
    title: 'Pensión Central Universitaria',
    description: 'Excelente ambiente de estudio cerca del metro',
    address: 'Av. Libertador 1234',
    neighborhood: 'Barrio Universitario',
    city: 'Santiago',
    latitude: -33.4489,
    longitude: -70.6693,
    priceMonthlyClp: 280000,
    baseMonthlyPrice: 280000,
    currency: 'CLP',
    depositClp: 280000,
    ratingAverage: 4.5,
    ratingCount: 12,
    reviewsCount: 12,
    isVerified: true,
    verificationStatus: 'OFFICIALLY_VERIFIED',
    isActive: true,
    images: [],
    nearbyUniversities: [],
    _count: { reviews: 12, rooms: 1 },
    waterIncluded: true,
    electricityIncluded: true,
    gasIncluded: true,
    internetIncluded: true,
    guestsAllowed: true,
    smokingAllowed: false,
    petsAllowed: false,
    genderPreference: 'ANY',
    includesMeals: true,
    includesWifi: true,
    includesLaundry: true,
    includesStudyRoom: true,
    nearestUniversityName: 'Universidad de Chile',
    distanceToUniversityMeters: 450,
    photos: [],
    rooms: [
      {
        id: 'r1',
        pensionId: 'p1',
        title: 'Pieza Individual con Baño',
        type: 'SINGLE',
        roomType: 'SINGLE',
        monthlyPrice: 280000,
        priceMonthlyClp: 280000,
        totalBeds: 1,
        availableBeds: 1,
        isActive: true,
        hasPrivateBathroom: true,
        isAvailable: true,
        images: [],
        photos: [],
        createdAt: '',
        updatedAt: '',
      },
    ],
  };

  it('returns true when filters are undefined or empty', () => {
    expect(matchesSearchFilters(basePension, undefined)).toBe(true);
    expect(matchesSearchFilters(basePension, null)).toBe(true);
    expect(matchesSearchFilters(basePension, { query: '' })).toBe(true);
  });

  it('filters correctly by text search query', () => {
    expect(matchesSearchFilters(basePension, { query: 'Central' })).toBe(true);
    expect(matchesSearchFilters(basePension, { query: 'santiago' })).toBe(true);
    expect(matchesSearchFilters(basePension, { query: 'Barrio' })).toBe(true);
    expect(matchesSearchFilters(basePension, { query: 'Chile' })).toBe(true);
    expect(matchesSearchFilters(basePension, { query: 'Concepcion' })).toBe(false);
  });

  it('filters correctly by city', () => {
    expect(matchesSearchFilters(basePension, { query: '', city: 'Santiago' })).toBe(true);
    expect(matchesSearchFilters(basePension, { query: '', city: 'santiago' })).toBe(true);
    expect(matchesSearchFilters(basePension, { query: '', city: 'Valparaíso' })).toBe(false);
  });

  it('filters correctly by price range', () => {
    expect(
      matchesSearchFilters(basePension, { query: '', minPriceClp: 200000, maxPriceClp: 300000 }),
    ).toBe(true);
    expect(matchesSearchFilters(basePension, { query: '', maxPriceClp: 250000 })).toBe(false);
    expect(matchesSearchFilters(basePension, { query: '', minPriceClp: 300000 })).toBe(false);
  });

  it('filters correctly by gender preference', () => {
    expect(matchesSearchFilters(basePension, { query: '', genderPreference: 'MIXED' })).toBe(true);
    expect(matchesSearchFilters(basePension, { query: '', genderPreference: 'ALL' })).toBe(true);
    expect(matchesSearchFilters(basePension, { query: '', genderPreference: 'FEMALE_ONLY' })).toBe(
      false,
    );
  });

  it('filters correctly by roomType and private bathroom', () => {
    expect(matchesSearchFilters(basePension, { query: '', roomType: 'SINGLE' })).toBe(true);
    expect(matchesSearchFilters(basePension, { query: '', roomType: 'SHARED' })).toBe(false);
    expect(matchesSearchFilters(basePension, { query: '', hasPrivateBathroom: true })).toBe(true);

    const pensionNoPrivateBath: PensionItem = {
      ...basePension,
      rooms: [
        {
          id: 'r2',
          pensionId: 'p1',
          title: 'Pieza Compartida',
          type: 'SHARED',
          roomType: 'SHARED',
          monthlyPrice: 180000,
          priceMonthlyClp: 180000,
          totalBeds: 2,
          availableBeds: 1,
          isActive: true,
          hasPrivateBathroom: false,
          isAvailable: true,
          images: [],
          photos: [],
          createdAt: '',
          updatedAt: '',
        },
      ],
    };
    expect(matchesSearchFilters(pensionNoPrivateBath, { query: '', hasPrivateBathroom: true })).toBe(
      false,
    );
  });

  it('filters correctly by includesMeals', () => {
    expect(matchesSearchFilters(basePension, { query: '', includesMeals: true })).toBe(true);
    const pensionNoMeals: PensionItem = {
      ...basePension,
      includesMeals: false,
    };
    expect(matchesSearchFilters(pensionNoMeals, { query: '', includesMeals: true })).toBe(false);
  });

  it('filters correctly by rating tier', () => {
    expect(matchesSearchFilters(basePension, { query: '', ratingTier: 'high' })).toBe(true);
    expect(matchesSearchFilters(basePension, { query: '', ratingTier: 'medium' })).toBe(false);
    expect(matchesSearchFilters(basePension, { query: '', ratingTier: 'low' })).toBe(false);

    const mediumPension: PensionItem = {
      ...basePension,
      ratingAverage: 3.5,
      reviewsCount: 8,
    };
    expect(matchesSearchFilters(mediumPension, { query: '', ratingTier: 'medium' })).toBe(true);
    expect(matchesSearchFilters(mediumPension, { query: '', ratingTier: 'high' })).toBe(false);
    expect(matchesSearchFilters(mediumPension, { query: '', ratingTier: 'low' })).toBe(false);

    const lowPension: PensionItem = {
      ...basePension,
      ratingAverage: 2.2,
      reviewsCount: 4,
    };
    expect(matchesSearchFilters(lowPension, { query: '', ratingTier: 'low' })).toBe(true);
    expect(matchesSearchFilters(lowPension, { query: '', ratingTier: 'high' })).toBe(false);
    expect(matchesSearchFilters(lowPension, { query: '', ratingTier: 'medium' })).toBe(false);

    const unreviewedPension: PensionItem = {
      ...basePension,
      ratingAverage: 0,
      reviewsCount: 0,
    };
    expect(matchesSearchFilters(unreviewedPension, { query: '', ratingTier: 'low' })).toBe(true);
    expect(matchesSearchFilters(unreviewedPension, { query: '', ratingTier: 'high' })).toBe(false);
    expect(matchesSearchFilters(unreviewedPension, { query: '', ratingTier: 'medium' })).toBe(false);
  });
});
