import { classifyPensionRating } from './rating-tier';
import type { PensionItem, SearchFilters } from './types';

export function matchesSearchFilters(
  pension: PensionItem,
  filters?: SearchFilters | null,
): boolean {
  if (!filters) return true;

  if (filters.query && filters.query.trim().length > 0) {
    const q = filters.query.trim().toLowerCase();
    const titleMatch = pension.title.toLowerCase().includes(q);
    const cityMatch = pension.city.toLowerCase().includes(q);
    const neighborhoodMatch = pension.neighborhood
      ? pension.neighborhood.toLowerCase().includes(q)
      : false;
    const addressMatch = pension.address ? pension.address.toLowerCase().includes(q) : false;
    const descMatch = pension.description ? pension.description.toLowerCase().includes(q) : false;
    const uniMatch = pension.nearestUniversityName
      ? pension.nearestUniversityName.toLowerCase().includes(q)
      : false;

    if (
      !titleMatch &&
      !cityMatch &&
      !neighborhoodMatch &&
      !addressMatch &&
      !descMatch &&
      !uniMatch
    ) {
      return false;
    }
  }

  if (filters.city && filters.city.trim().length > 0) {
    if (pension.city.toLowerCase() !== filters.city.trim().toLowerCase()) {
      return false;
    }
  }

  if (filters.minPriceClp !== undefined && filters.minPriceClp > 0) {
    if (pension.priceMonthlyClp < filters.minPriceClp) {
      return false;
    }
  }

  if (filters.maxPriceClp !== undefined && filters.maxPriceClp > 0) {
    if (pension.priceMonthlyClp > filters.maxPriceClp) {
      return false;
    }
  }

  if (filters.genderPreference && filters.genderPreference !== 'ALL') {
    if (pension.genderPreference !== filters.genderPreference) {
      return false;
    }
  }

  if (filters.roomType) {
    const hasMatchingRoom =
      pension.rooms && pension.rooms.length > 0
        ? pension.rooms.some((r) => r.roomType === filters.roomType)
        : true;
    if (!hasMatchingRoom) {
      return false;
    }
  }

  if (filters.hasPrivateBathroom) {
    const hasBath =
      pension.rooms && pension.rooms.length > 0
        ? pension.rooms.some((r) => r.hasPrivateBathroom)
        : false;
    if (!hasBath) {
      return false;
    }
  }

  if (filters.includesMeals) {
    if (!pension.includesMeals) {
      return false;
    }
  }

  if (filters.ratingTier) {
    const classification = classifyPensionRating(pension.ratingAverage, pension.reviewsCount);
    if (classification.tier !== filters.ratingTier) {
      return false;
    }
  }

  return true;
}
