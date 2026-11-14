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
