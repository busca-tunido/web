import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ExploreScreen } from '@/components/explore/explore-screen';
import type { CityInfo, UniversityInfo } from '@/lib/types';

vi.mock('@/components/pensions/infinite-pension-list', () => ({
  InfinitePensionList: () => <div data-testid="mock-pension-list" />,
}));

vi.mock('@/lib/auth-context', () => ({
  useAuth: () => ({
    isLoading: false,
    user: null,
    token: null,
    isAuthenticated: false,
    favorites: [],
    login: vi.fn(),
    logout: vi.fn(),
    toggleFavorite: vi.fn(),
    isFavorite: () => false,
  }),
}));

describe('ExploreScreen Skeletons', () => {
  const defaultProps = {
    cities: [] as CityInfo[],
    universities: [] as UniversityInfo[],
    featuredPensions: [],
    selectedCity: null,
    onSelectCity: vi.fn(),
    onSelectUniversity: vi.fn(),
    onSelectPension: vi.fn(),
    onNavigateToMap: vi.fn(),
  };

  it('renders city and university skeletons when isLoadingMetadata is true and data is empty', () => {
    render(<ExploreScreen {...defaultProps} isLoadingMetadata={true} />);

    const citySkeletons = screen.getAllByTestId('city-card-skeleton');
    const uniSkeletons = screen.getAllByTestId('university-card-skeleton');

    expect(citySkeletons).toHaveLength(6);
    expect(uniSkeletons).toHaveLength(5);
  });

  it('renders city skeletons when isLoadingCities is explicitly true', () => {
    render(<ExploreScreen {...defaultProps} isLoadingCities={true} />);

    const citySkeletons = screen.getAllByTestId('city-card-skeleton');
    expect(citySkeletons).toHaveLength(6);
    expect(screen.queryByTestId('university-card-skeleton')).toBeNull();
  });

  it('renders university skeletons when isLoadingUniversities is explicitly true', () => {
    render(<ExploreScreen {...defaultProps} isLoadingUniversities={true} />);

    const uniSkeletons = screen.getAllByTestId('university-card-skeleton');
    expect(uniSkeletons).toHaveLength(5);
    expect(screen.queryByTestId('city-card-skeleton')).toBeNull();
  });

  it('renders real cards when data is available and not loading', () => {
    const mockCities: CityInfo[] = [
      {
        id: 'c1',
        name: 'Santiago',
        region: 'Región Metropolitana',
        pensionsCount: 42,
        averagePriceClp: 350000,
        imageUrl: 'https://example.com/santiago.webp',
        foreignStudentRate: 0.8,
        latitude: -33.4489,
        longitude: -70.6693,
      },
    ];

    const mockUniversities: UniversityInfo[] = [
      {
        id: 'u1',
        name: 'Universidad de Chile',
        acronym: 'UCH',
        city: 'Santiago',
        domains: ['uchile.cl'],
        foreignStudentRate: 0.9,
        pensionsNearbyCount: 25,
        imageUrl: 'https://example.com/uchile.webp',
        latitude: -33.444,
        longitude: -70.655,
      },
    ];

    render(
      <ExploreScreen
        {...defaultProps}
        cities={mockCities}
        universities={mockUniversities}
        isLoadingMetadata={false}
      />,
    );

    expect(screen.queryByTestId('city-card-skeleton')).toBeNull();
    expect(screen.queryByTestId('university-card-skeleton')).toBeNull();
    expect(screen.getByRole('heading', { name: 'Santiago' })).toBeDefined();
    expect(screen.getByRole('heading', { name: 'Universidad de Chile' })).toBeDefined();
  });

  it('limits cities to a single row on desktop and expands when clicking Ver más button', () => {
    const mockCities: CityInfo[] = Array.from({ length: 9 }, (_, index) => ({
      id: `city-${index + 1}`,
      name: `Ciudad ${index + 1}`,
      region: 'Región',
      pensionsCount: 10 - index,
      averagePriceClp: 300000,
      imageUrl: '',
      foreignStudentRate: 0.5,
      latitude: -33.0,
      longitude: -70.0,
    }));

    render(
      <ExploreScreen
        {...defaultProps}
        cities={mockCities}
        isLoadingMetadata={false}
      />,
    );

    const toggleButton = screen.getByRole('button', {
      name: /Ver más \(3 más\)/i,
    });
    expect(toggleButton).toBeDefined();

    const cityCards = screen.getAllByRole('button').filter((btn) =>
      btn.textContent?.includes('pensiones'),
    );
    expect(cityCards).toHaveLength(9);

    expect(cityCards[0].className).not.toContain('md:hidden');
    expect(cityCards[5].className).not.toContain('md:hidden');
    expect(cityCards[6].className).toContain('md:hidden');
    expect(cityCards[8].className).toContain('md:hidden');

    fireEvent.click(toggleButton);

    expect(screen.getByRole('button', { name: /Ver menos/i })).toBeDefined();
    expect(cityCards[6].className).not.toContain('md:hidden');
    expect(cityCards[8].className).not.toContain('md:hidden');

    fireEvent.click(screen.getByRole('button', { name: /Ver menos/i }));
    expect(screen.getByRole('button', { name: /Ver más \(3 más\)/i })).toBeDefined();
    expect(cityCards[6].className).toContain('md:hidden');
  });
});

