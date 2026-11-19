import { fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FilterDrawer } from '@/components/layout/filter-drawer';
import { useStudentPensionsFeed } from '@/hooks/use-student-pensions-feed';
import { createSuccess } from '@/lib/api-response';
import { countActiveFilters, RECOMMENDED_FILTER_CHIPS } from '@/lib/filter-chips';
import { matchesSearchFilters } from '@/lib/filter-matcher';
import type { PaginatedPensionsResponse, PensionItem, SearchFilters } from '@/lib/types';
import { locationsService } from '@/services/locations.service';
import { pensionsService } from '@/services/pensions.service';

vi.mock('@/components/search/price-histogram-range-slider', () => ({
  PriceHistogramRangeSlider: () => <div data-testid="price-histogram-slider" />,
}));

const samplePension: PensionItem = {
  id: 'p1',
  slug: 'pension-demo',
  title: 'Pensión Demo Santiago',
  description: 'Cerca de campus',
  address: 'Av. República 100',
  neighborhood: 'República',
  city: 'Santiago',
  latitude: -33.45,
  longitude: -70.66,
  baseMonthlyPrice: 135000,
  currency: 'CLP',
  ratingAverage: 4.7,
  ratingCount: 5,
  reviewsCount: 5,
  verificationStatus: 'OFFICIALLY_VERIFIED',
  isActive: true,
  images: [],
  nearbyUniversities: [],
  _count: { reviews: 5, rooms: 1 },
  waterIncluded: true,
  electricityIncluded: true,
  gasIncluded: true,
  internetIncluded: true,
  guestsAllowed: true,
  smokingAllowed: false,
  petsAllowed: false,
  genderPreference: 'ANY',
  amenitySlugs: ['cocina-equipada', 'lavadora-secadora', 'desayuno-incluido'],
  amenities: [],
  rooms: [
    {
      id: 'r1',
      title: 'Pieza 1',
      type: 'SINGLE',
      monthlyPrice: 135000,
      isActive: true,
      hasPrivateBathroom: true,
      isAvailable: true,
    },
  ],
};

describe('Quick filter chips & FilterDrawer OpenAPI alignment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exposes the requested student-oriented quick chips and excludes Cerca de mí and Mejor evaluadas', () => {
    const labels = RECOMMENDED_FILTER_CHIPS.map((c) => c.label);

    expect(labels).toContain('Piezas libres');
    expect(labels).toContain('Más baratas');
    expect(labels).toContain('Hasta $140 mil');
    expect(labels).toContain('Favoritas');
    expect(labels).toContain('Buenas reseñas');
    expect(labels).toContain('Otras alternativas');
    expect(labels).toContain('Mixto');
    expect(labels).not.toContain('Cerca de mí');
    expect(labels).not.toContain('Más cercanas');
    expect(labels).not.toContain('Mejor evaluadas');
    expect(labels).not.toContain('Hasta $250k');

    const maxPriceChip = RECOMMENDED_FILTER_CHIPS.find((c) => c.id === 'max_price');
    const updatedMax = maxPriceChip?.toggle({ query: '' });
    expect(updatedMax?.maxPriceClp).toBe(140000);

    const mixedChip = RECOMMENDED_FILTER_CHIPS.find((c) => c.id === 'mixed');
    const updatedMixed = mixedChip?.toggle({ query: '' });
    expect(updatedMixed?.genderPreference).toBe('ANY');

    const availableChip = RECOMMENDED_FILTER_CHIPS.find((c) => c.id === 'only_available');
    const updatedAvail = availableChip?.toggle({ query: '' });
    expect(updatedAvail?.onlyAvailable).toBe(true);

    const bathroomChip = RECOMMENDED_FILTER_CHIPS.find((c) => c.id === 'bathroom');
    const bathOn = bathroomChip?.toggle({ query: '' });
    expect(bathOn?.hasPrivateBathroom).toBe(true);
    const bathOff = bathOn ? bathroomChip?.toggle(bathOn) : undefined;
    expect(bathOff?.hasPrivateBathroom).toBeUndefined();
  });

  it('counts all real active filters consistently via countActiveFilters', () => {
    const filters: SearchFilters = {
      query: 'Santiago',
      city: 'Santiago',
      neighborhood: 'República',
      minPriceClp: 120000,
      onlyAvailable: true,
      minBeds: 2,
      amenities: ['cocina-equipada', 'lavadora-secadora'],
      hasPrivateBathroom: true,
      includesMeals: true,
      genderPreference: 'ANY',
      roomType: 'SINGLE',
      ratingTier: 'high',
      sortBy: 'price_asc',
    };

    expect(countActiveFilters(filters, { includeCity: true, includeSort: true })).toBe(13);
    expect(countActiveFilters({ query: '' }, { includeCity: true, includeSort: true })).toBe(0);
  });

  it('matches extended client filters including neighborhood, amenities, onlyAvailable, and meals', () => {
    expect(
      matchesSearchFilters(samplePension, {
        query: '',
        neighborhood: 'repúb',
        amenities: ['cocina-equipada', 'lavadora-secadora'],
        onlyAvailable: true,
        includesMeals: true,
      }),
    ).toBe(true);

    const unavailablePension: PensionItem = {
      ...samplePension,
      rooms: samplePension.rooms?.map((r) => ({ ...r, isAvailable: false })),
    };

    expect(
      matchesSearchFilters(unavailablePension, {
        query: '',
        onlyAvailable: true,
      }),
    ).toBe(false);

    expect(
      matchesSearchFilters(samplePension, {
        query: '',
        amenities: ['conserjeria-24-7'],
      }),
    ).toBe(false);
  });

  it('renders FilterDrawer without removed sort options and applies real API filters including catalog amenities', async () => {
    vi.spyOn(pensionsService, 'fetchAmenitiesCatalog').mockResolvedValueOnce(
      createSuccess([
        {
          slug: 'cocina-equipada',
          name: 'Cocina compartida full equipada',
          category: 'COMMON_AREA',
          iconKey: 'utensils',
        },
        {
          slug: 'lavadora-secadora',
          name: 'Lavandería (lavadora y secadora)',
          category: 'COMMON_AREA',
          iconKey: 'disc',
        },
      ]),
    );
    vi.spyOn(pensionsService, 'fetchPriceHistogram').mockResolvedValueOnce(
      createSuccess({
        minPrice: 110000,
        maxPrice: 400000,
        currency: 'CLP',
        totalListings: 4,
        bins: [{ min: 110000, max: 200000, count: 4 }],
      }),
    );

    const handleApply = vi.fn();
    render(
      <FilterDrawer
        isOpen={true}
        onClose={vi.fn()}
        filters={{ query: '' }}
        onApply={handleApply}
      />,
    );

    expect(screen.queryByRole('button', { name: /Cerca de mí/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /Mejor evaluadas/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /WiFi fibra/i })).toBeNull();

    expect(screen.getByRole('button', { name: /^Favoritas/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /^Buenas reseñas/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /^Otras alternativas/i })).toBeDefined();

    fireEvent.click(screen.getByRole('button', { name: 'Mayor precio' }));
    fireEvent.click(screen.getByRole('button', { name: 'Piezas libres' }));
    fireEvent.click(screen.getByRole('button', { name: '2+ camas' }));
    fireEvent.click(screen.getByRole('button', { name: 'Mixto' }));
    fireEvent.click(screen.getByRole('button', { name: /^Favoritas/i }));

    const kitchenBtn = await screen.findByRole('button', {
      name: 'Cocina compartida full equipada',
    });
    fireEvent.click(kitchenBtn);

    fireEvent.change(screen.getByLabelText(/Barrio o comuna/i), {
      target: { value: 'República' },
    });

    fireEvent.click(document.querySelector('#btn-apply-filters') as HTMLButtonElement);

    expect(handleApply).toHaveBeenCalledWith(
      expect.objectContaining({
        sortBy: 'price_desc',
        onlyAvailable: true,
        minBeds: 2,
        genderPreference: 'ANY',
        ratingTier: 'high',
        amenities: ['cocina-equipada'],
        neighborhood: 'República',
      }),
    );
  });

  it('forwards hasPrivateBathroom, includesMeals, amenities, minBeds, onlyAvailable, neighborhood, and sortBy in useStudentPensionsFeed', async () => {
    vi.spyOn(locationsService, 'fetchCities').mockResolvedValueOnce(createSuccess([]));
    vi.spyOn(locationsService, 'fetchUniversities').mockResolvedValueOnce(createSuccess([]));
    const emptyPaginated: PaginatedPensionsResponse = {
      items: [],
      total: 0,
      page: 1,
      limit: 12,
      totalPages: 0,
      hasMore: false,
      nearbyCityCounts: [],
      pagination: { page: 1, limit: 12, total: 0, totalPages: 0, hasMore: false },
    };
    const spy = vi
      .spyOn(pensionsService, 'fetchPaginatedPensions')
      .mockResolvedValueOnce(createSuccess(emptyPaginated));

    const { result } = renderHook(() =>
      useStudentPensionsFeed({
        filters: {
          query: '',
          neighborhood: 'República',
          hasPrivateBathroom: true,
          includesMeals: true,
          amenities: ['cocina-equipada'],
          minBeds: 2,
          onlyAvailable: true,
          sortBy: 'price_asc',
          genderPreference: 'ANY',
        },
      }),
    );

    await waitFor(() => {
      expect(result.current.isLoadingPensions).toBe(false);
    });

    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        neighborhood: 'República',
        hasPrivateBathroom: true,
        includesMeals: true,
        amenities: ['cocina-equipada'],
        minBeds: 2,
        onlyAvailable: true,
        sortBy: 'price_asc',
        genderPreference: 'ANY',
      }),
    );
  });
});
