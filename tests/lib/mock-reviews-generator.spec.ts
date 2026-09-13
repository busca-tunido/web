import { describe, expect, it } from 'vitest';
import {
  calculateRatingStats,
  generateRandomReviewsForPension,
  getDeterministicPensionRating,
} from '@/lib/mock-reviews-generator';

describe('mock-reviews-generator', () => {
  it('generates random reviews with thematic student accommodation content', () => {
    const reviews = generateRandomReviewsForPension('pension-1', 'Residencia República', 'Santiago');

    expect(reviews.length).toBeGreaterThanOrEqual(3);
    for (const r of reviews) {
      expect(r.overallRating).toBeGreaterThanOrEqual(1);
      expect(r.overallRating).toBeLessThanOrEqual(5);
      expect(r.user.firstName).toBeDefined();
      expect(r.user.lastName).toBeDefined();
      expect(r.user.university?.shortName).toBeDefined();
      expect(r.comment.length).toBeGreaterThan(20);
    }
  });

  it('produces diverse random reviews across multiple pensions', () => {
    const reviews1 = generateRandomReviewsForPension('pension-a');
    const reviews2 = generateRandomReviewsForPension('pension-b');

    expect(reviews1[0].comment).not.toBe(reviews2[0].comment);
  });

  it('calculates accurate rating statistics from generated reviews', () => {
    const reviews = generateRandomReviewsForPension('pension-test', undefined, undefined, 4);
    const stats = calculateRatingStats(reviews);

    expect(stats.count).toBe(4);
    expect(stats.average).toBeGreaterThanOrEqual(1);
    expect(stats.average).toBeLessThanOrEqual(5);
  });

  it('provides varied deterministic ratings across different pension IDs', () => {
    const ids = ['pension-santiago-1', 'pension-valpo-2', 'pension-conce-3', 'pension-isla-4'];
    const ratings = ids.map((id) => getDeterministicPensionRating(id).ratingAverage);
    const uniqueRatings = new Set(ratings);

    expect(uniqueRatings.size).toBeGreaterThan(1);
  });
});
