import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PensionDetailModal } from '@/components/pensions/pension-detail-modal';
import type { PensionItem } from '@/lib/types';

const mockPension: PensionItem = {
  id: 'pension-100',
  slug: 'pension-bellavista',
  title: 'Pensión Bellavista',
  description: 'Excelente pensión universitaria.',
  address: 'Calle Bellavista 123',
  neighborhood: 'Recoleta',
  city: 'Santiago',
  latitude: -33.435,
  longitude: -70.638,
  priceMonthlyClp: 310000,
  depositClp: 150000,
  isVerified: true,
  genderPreference: 'MIXED',
  ratingAverage: 4.8,
  reviewsCount: 12,
  nearestUniversityName: 'Universidad de Chile',
  distanceToUniversityMeters: 450,
  photos: ['https://br-gentle-butterfly-aevuizs0.storage.c-2.us-east-2.aws.neon.tech/uploads/pensions/pension-mock-facade.webp'],
  includesWifi: true,
  includesMeals: false,
  includesStudyRoom: true,
  includesLaundry: true,
  rooms: [],
  isActive: true,
};

vi.mock('@/lib/auth-context', () => ({
  useAuth: () => ({
    user: {
      id: 'landlord-1',
      email: 'landlord@test.cl',
      firstName: 'Don',
      lastName: 'Pedro',
      role: 'LANDLORD',
    },
    isAuthenticated: true,
    isLoading: false,
    favorites: [],
    isFavorite: () => false,
    toggleFavorite: vi.fn(),
  }),
}));

vi.mock('@/hooks/use-pension-detail', () => ({
  usePensionDetail: () => ({
    activePension: mockPension,
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  }),
}));

vi.mock('@/lib/theme-context', () => ({
  useTheme: () => ({
    theme: 'dark',
    setTheme: vi.fn(),
    resolvedTheme: 'dark',
  }),
}));

vi.mock('@/hooks/use-pension-reviews', () => ({
  usePensionReviews: () => ({
    reviews: [],
    ratingStats: { average: 4.8, count: 12 },
    refetch: vi.fn(),
  }),
}));

describe('PensionDetailModal without NavigationProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders successfully without NavigationProvider when landlord previews pension', () => {
    expect(() => {
      render(
        <PensionDetailModal
          isOpen={true}
          onClose={vi.fn()}
          pension={mockPension}
          pensionId={mockPension.id}
        />,
      );
    }).not.toThrow();

    expect(screen.getByText('Pensión Bellavista')).toBeDefined();
  });

  it('renders safely when closed without NavigationProvider', () => {
    expect(() => {
      render(
        <PensionDetailModal
          isOpen={false}
          onClose={vi.fn()}
          pension={mockPension}
          pensionId={mockPension.id}
        />,
      );
    }).not.toThrow();
  });
});
