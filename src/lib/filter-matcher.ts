import { classifyPensionRating } from './rating-tier';
import type { PensionItem, SearchFilters } from './types';

const serverFilteredSignatures = new WeakMap<object, string>();

export function buildSearchFilterSignature(filters?: SearchFilters | null): string {
  if (!filters) return 'none';
  return JSON.stringify({
    query: filters.query ?? '',
    city: filters.city ?? '',
    universityId: filters.universityId ?? '',
    minPriceClp: filters.minPriceClp ?? null,
    maxPriceClp: filters.maxPriceClp ?? null,
    genderPreference: filters.genderPreference ?? '',
    roomType: filters.roomType ?? '',
    hasPrivateBathroom: Boolean(filters.hasPrivateBathroom),
    includesMeals: Boolean(filters.includesMeals),
    ratingTier: filters.ratingTier ?? '',
  });
}

export function markServerFilteredPensions(
  pensions: readonly PensionItem[],
  filters?: SearchFilters | null,
): void {
  const sig = buildSearchFilterSignature(filters);
  for (const p of pensions) {
    serverFilteredSignatures.set(p, sig);
  }
}

export function matchesSearchFilters(
  pension: PensionItem,
  filters?: SearchFilters | null,
): boolean {
  if (!filters) return true;
  if (serverFilteredSignatures.get(pension) === buildSearchFilterSignature(filters)) {
    return true;
  }

  if (filters.query && filters.query.trim().length > 0) {
    const q = filters.query.trim().toLowerCase();
    const titleMatch = pension.title.toLowerCase().includes(q);
    const cityMatch = pension.city.toLowerCase().includes(q);
    const neighborhoodMatch = pension.neighborhood
      ? pension.neighborhood.toLowerCase().includes(q)
      : false;
    const addressMatch = pension.address ? pension.address.toLowerCase().includes(q) : false;
    const descMatch = pension.description ? pension.description.toLowerCase().includes(q) : false;
    const uniName = pension.nearestUniversity?.name?.toLowerCase();
    const uniShort = pension.nearestUniversity?.shortName?.toLowerCase();
    const uniMatch = uniName?.includes(q) || uniShort?.includes(q);

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
    if (pension.baseMonthlyPrice < filters.minPriceClp) {
      return false;
    }
  }

  if (filters.maxPriceClp !== undefined && filters.maxPriceClp > 0) {
    if (pension.baseMonthlyPrice > filters.maxPriceClp) {
      return false;
    }
  }

  if (filters.genderPreference && filters.genderPreference !== 'ALL') {
    const filterGen =
      (filters.genderPreference as string) === 'MIXED' ? 'ANY' : filters.genderPreference;
    const pensionGen =
      (pension.genderPreference as string) === 'MIXED' ? 'ANY' : pension.genderPreference;
    if (pensionGen !== filterGen) {
      return false;
    }
  }

  if (filters.roomType) {
    const roomsOmittedInSummary =
      (!pension.rooms || pension.rooms.length === 0) && (pension._count?.rooms ?? 0) > 0;
    if (!roomsOmittedInSummary) {
      const hasMatchingRoom =
        pension.rooms && pension.rooms.length > 0
          ? pension.rooms.some((r) => r.type === filters.roomType)
          : false;
      if (!hasMatchingRoom) {
        return false;
      }
    }
  }

  if (filters.hasPrivateBathroom) {
    const roomsOmittedInSummary =
      (!pension.rooms || pension.rooms.length === 0) && (pension._count?.rooms ?? 0) > 0;
    if (!roomsOmittedInSummary) {
      const hasBath =
        pension.rooms && pension.rooms.length > 0
          ? pension.rooms.some((r) => r.hasPrivateBathroom)
          : false;
      if (!hasBath) {
        return false;
      }
    }
  }

  if (filters.includesMeals) {
    const includesMeals =
      pension.amenitySlugs?.includes('comida-incluida') ||
      pension.amenities?.some((a) => (typeof a === 'string' ? a : a.slug) === 'comida-incluida');
    if (!includesMeals) {
      return false;
    }
  }

  if (filters.ratingTier) {
    const classification = classifyPensionRating(pension);
    if (filters.ratingTier === 'low') {
      if (classification.tier !== 'low' && classification.tier !== 'unreviewed') {
        return false;
      }
    } else if (classification.tier !== filters.ratingTier) {
      return false;
    }
  }

  return true;
}
