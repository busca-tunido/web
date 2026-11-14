import type { PensionItem } from '@/lib/types';

export const comparisonPension: PensionItem = {
  id: 'pension-a', slug: 'pension-a', title: 'Pensión A', description: 'Alojamiento de prueba',
  address: 'Dirección de prueba', neighborhood: 'Centro', city: 'Santiago',
  latitude: -33.4, longitude: -70.6, baseMonthlyPrice: 250000, deposit: null, currency: 'CLP',
  waterIncluded: true, electricityIncluded: false, gasIncluded: true, internetIncluded: true,
  guestsAllowed: true, petsAllowed: false, smokingAllowed: false, curfewTime: null,
  genderPreference: 'ANY', verificationStatus: 'UNVERIFIED', isActive: true,
  ratingAverage: 0, ratingCount: 0, reviewsCount: 0, images: [], amenities: [],
  nearbyUniversities: [], rooms: [], _count: { rooms: 0, reviews: 0 },
};

export const comparisonPensions: readonly PensionItem[] = [
  comparisonPension,
  { ...comparisonPension, id: 'pension-b', slug: 'pension-b', title: 'Pensión B', baseMonthlyPrice: 300000, deposit: 0, waterIncluded: false },
  { ...comparisonPension, id: 'pension-c', slug: 'pension-c', title: 'Pensión C' },
];

export const comparisonReview: import('@/lib/types').PensionReview = {
  id: 'review-a', pensionId: 'pension-a', userId: 'review-author', rating: 5, overallRating: 5,
  comment: 'Una experiencia de prueba cerca de la universidad.', isVerifiedStay: true,
  isResidentVerified: true, isAnonymous: false, helpfulCount: 0, images: [], createdAt: '2026-01-01T00:00:00.000Z',
  user: { id: 'review-author', firstName: 'Estudiante', lastName: 'Prueba' },
};
