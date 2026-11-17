import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PensionDetailModal } from '@/components/pensions/pension-detail-modal';
import { PensionComparisonProvider } from '@/contexts/pension-comparison-context';
import type { PensionItem, PensionReview } from '@/lib/types';

const mockToggleFavorite = vi.fn();
const mockVoteHelpful = vi.fn();

const mockReviews: PensionReview[] = [
  {
    id: 'rev-1',
    pensionId: 'pension-100',
    userId: 'student-1',
    rating: 5,
    overallRating: 5,
    comment: 'Excelente lugar para estudiar durante el semestre.',
    helpfulCount: 3,
    userVoted: false,
    isVerifiedStay: true,
    isResidentVerified: true,
    isAnonymous: false,
    stayDurationCategory: 'ONE_SEMESTER',
    createdAt: '2026-10-01T12:00:00.000Z',
    user: {
      id: 'student-1',
      firstName: 'Camila',
      lastName: 'Rojas',
      avatarUrl: null,
      university: { name: 'Universidad de Chile', shortName: 'UCH' },
    },
    images: [],
  },
];

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
  baseMonthlyPrice: 310000,
  currency: 'CLP',
  deposit: 150000,
  contactPhone: '+56912345678',
  contactWhatsapp: '+56912345678',
  verificationStatus: 'OFFICIALLY_VERIFIED',
  genderPreference: 'ANY',
  ratingAverage: 4.8,
  ratingCount: 1,
  reviewsCount: 1,
  images: [
    {
      id: 'img-1',
      url: 'https://example.com/photo-1.webp',
      thumbnailUrl: 'https://example.com/photo-1.webp',
    },
  ],
  amenities: [],
  amenitySlugs: ['wifi-alta-velocidad'],
  nearbyUniversities: [],
  _count: { reviews: 1, rooms: 0 },
  waterIncluded: true,
  electricityIncluded: true,
  gasIncluded: true,
  internetIncluded: true,
  guestsAllowed: true,
  smokingAllowed: false,
  petsAllowed: false,
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
      isEmailVerified: true,
      createdAt: '',
      updatedAt: '',
    },
    isAuthenticated: true,
    isLoading: false,
    favorites: [],
    isFavorite: () => false,
    toggleFavorite: mockToggleFavorite,
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

vi.mock('@/hooks/use-pension-reviews', () => ({
  createReviewSchema: {},
  usePensionReviews: () => ({
    reviews: mockReviews,
    ratingStats: { average: 4.8, count: 1 },
    refetch: vi.fn(),
    voteHelpful: mockVoteHelpful,
  }),
}));

vi.mock('@/lib/theme-context', () => ({
  useTheme: () => ({
    theme: 'dark',
    setTheme: vi.fn(),
    resolvedTheme: 'dark',
  }),
}));

vi.mock('@/services/pensions.service', () => ({
  pensionsService: {
    fetchAmenitiesCatalog: vi.fn().mockResolvedValue({ success: true, data: [] }),
  },
}));

describe('PensionDetailModal in landlord preview mode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it('keeps mutating, contact, and external actions inert while preserving read-only inspection', async () => {
    render(
      <PensionComparisonProvider>
        <PensionDetailModal
          isOpen={true}
          onClose={vi.fn()}
          pension={mockPension}
          pensionId={mockPension.id}
          mode="preview"
        />
      </PensionComparisonProvider>,
    );

    const compareBtn = screen.getByRole('button', { name: 'Comparar: Pensión Bellavista' });
    expect(compareBtn.getAttribute('aria-disabled')).toBe('true');
    fireEvent.click(compareBtn);
    expect(screen.queryByRole('button', { name: /Abrir comparación/i })).toBeNull();
    expect(screen.getByRole('button', { name: 'Comparar: Pensión Bellavista' })).toBeDefined();

    const favBtn = screen.getByRole('button', { name: 'Guardar en favoritos' });
    expect(favBtn.getAttribute('aria-disabled')).toBe('true');
    fireEvent.click(favBtn);
    expect(mockToggleFavorite).not.toHaveBeenCalled();

    expect(screen.queryByRole('link', { name: /Consultar Disponibilidad/i })).toBeNull();
    const contactBtn = screen.getByRole('button', { name: /Consultar Disponibilidad/i });
    expect(contactBtn.getAttribute('aria-disabled')).toBe('true');

    const suggestBtn = screen.getByRole('button', { name: 'Sugerir una corrección' });
    expect(suggestBtn.getAttribute('aria-disabled')).toBe('true');
    fireEvent.click(suggestBtn);
    expect(screen.queryByText('Sugerir corrección')).toBeNull();

    const reviewBtn = screen.getByRole('button', { name: 'Publicar una reseña' });
    expect(reviewBtn.getAttribute('aria-disabled')).toBe('true');
    fireEvent.click(reviewBtn);
    expect(screen.queryByText('Publicar opinión')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: /Ver más detalles/i }));
    expect(screen.getByRole('dialog', { name: /Servicios y Comodidades/i })).toBeDefined();
    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() =>
      expect(screen.queryByRole('dialog', { name: /Servicios y Comodidades/i })).toBeNull(),
    );

    fireEvent.click(screen.getByRole('button', { name: 'Ver todas' }));
    const reviewsDialog = screen.getByRole('dialog', { name: /Reseñas de la pensión/i });
    expect(reviewsDialog).toBeDefined();

    const helpfulBtn = screen.getByRole('button', { name: /Marcar como útil/i });
    expect(helpfulBtn.getAttribute('aria-disabled')).toBe('true');
    fireEvent.click(helpfulBtn);
    expect(mockVoteHelpful).not.toHaveBeenCalled();
  });
});
