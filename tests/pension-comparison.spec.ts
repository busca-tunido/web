import { describe, expect, it } from 'vitest';
import { comparisonReducer, EMPTY_COMPARISON } from '@/contexts/pension-comparison-context';
import { comparisonCampus, comparisonWinner, COMPARISON_ROWS } from '@/lib/pension-comparison';
import { comparisonPension as a, comparisonPensions } from './fixtures/comparison-pensions';

const b = comparisonPensions[1];

describe('Comparison rules', () => {
  it('never awards ties, different currencies, missing distances or unrated pensions', () => {
    expect(comparisonWinner('price', [a, { ...b, baseMonthlyPrice: a.baseMonthlyPrice }])).toBeNull();
    expect(comparisonWinner('price', [a, { ...b, currency: 'USD' }])).toBeNull();
    expect(comparisonWinner('distance', [{ ...a, distanceKm: 0.1 }, { ...b, distanceKm: 5 }])).toBeNull();
    expect(comparisonWinner('rating', [a, { ...b, ratingCount: 5, ratingAverage: 4 }])).toBeNull();
    expect(comparisonWinner('reviews', [a, b])).toBeNull();
    expect(comparisonWinner('price', [a, null])).toBeNull();
  });

  it('uses published campus distances and honors a selected university', () => {
    const near = { ...a, nearbyUniversities: [
      { distanceMeters: 800, university: { id: 'u1', name: 'Universidad 1' } },
      { distanceMeters: 100, university: { id: 'u2', name: 'Universidad 2' } },
    ] };
    const far = { ...b, nearbyUniversities: [{ distanceMeters: 400, university: { id: 'u1', name: 'Universidad 1' } }] };
    expect(comparisonCampus(near)?.name).toBe('Universidad 2');
    expect(comparisonWinner('distance', [near, far])).toBe(a.id);
    expect(comparisonWinner('distance', [near, far], 'u1')).toBe(b.id);
    expect(comparisonWinner('distance', [near, far], 'u2')).toBeNull();
    expect(comparisonCampus({ ...a, nearestUniversity: { name: 'Campus', distanceMeters: 0 } })?.distanceMeters).toBe(0);
  });

  it('highlights real advantages and does not count duplicate amenities or internet twice', () => {
    expect(comparisonWinner('price', [a, b])).toBe(a.id);
    expect(comparisonWinner('rating', [{ ...a, ratingCount: 1, ratingAverage: 4 }, { ...b, ratingCount: 10, ratingAverage: 5 }])).toBe(b.id);
    expect(comparisonWinner('reviews', [{ ...a, reviewsCount: 15 }, { ...b, reviewsCount: 2 }])).toBe(a.id);
    const wifi = { slug: 'wifi-alta-velocidad', name: 'Wifi' };
    expect(comparisonWinner('equipment', [a, { ...a, id: b.id, amenities: [wifi, wifi], amenitySlugs: [wifi.slug] }])).toBeNull();
    expect(comparisonWinner('equipment', [a, { ...a, id: b.id, amenities: [{ slug: 'lavadora-secadora', name: 'Lavandería' }] }])).toBe(b.id);
  });

  it('does not mistake missing services for explicit absence', () => {
    const laundry = COMPARISON_ROWS.find(row => row.label === 'Lavandería');
    expect(laundry?.value(a)).toBe('No informado');
    expect(laundry?.value({ ...a, amenities: [{ slug: 'lavadora-secadora', name: 'Lavandería' }] })).toBe('Disponible');
    expect(COMPARISON_ROWS.find(row => row.label === 'Wifi')?.value({ ...a, internetIncluded: false })).toBe('No informado');
  });

  it('keeps slot identity and prevents the same pension occupying both slots', () => {
    const pair = comparisonReducer(comparisonReducer(EMPTY_COMPARISON, { type: 'select', pension: a }), { type: 'select', pension: b });
    const pending = comparisonReducer(pair, { type: 'replace', slot: 0 });
    expect(comparisonReducer(pending, { type: 'select', pension: b })).toBe(pending);
    const removed = comparisonReducer(pair, { type: 'remove', slot: 0 });
    expect(removed.slots).toEqual([null, b]);
    expect(comparisonReducer(removed, { type: 'clear' })).toEqual(EMPTY_COMPARISON);
  });
});


