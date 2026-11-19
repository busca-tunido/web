import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LandlordProposalsScreen } from '@/components/landlord/landlord-proposals-screen';
import { LandlordAppShell } from '@/components/shells/landlord-app-shell';
import { LandlordProvider } from '@/contexts/landlord-context';
import { createSuccess } from '@/lib/api-response';
import { cacheStore } from '@/lib/cache-store';
import { ThemeProvider } from '@/lib/theme-context';
import type {
  PensionAmenityCatalogItemDto,
  PensionItem,
  ProposalDto,
  RoomDto,
  UserProfile,
} from '@/lib/types';
import { pensionsService } from '@/services/pensions.service';
import { proposalsService } from '@/services/proposals.service';
import { reviewsService } from '@/services/reviews.service';
import { roomsService } from '@/services/rooms.service';

const mockUseAuth = vi.fn();

vi.mock('@/lib/auth-context', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('motion/react', async () => {
  const { createElement } = await import('react');
  const motionTags = new Proxy(
    {},
    {
      get: (_target, tag: string) => {
        return ({
          children,
          initial: _initial,
          animate: _animate,
          exit: _exit,
          variants: _variants,
          transition: _transition,
          whileHover: _whileHover,
          whileTap: _whileTap,
          layout: _layout,
          layoutId: _layoutId,
          onHoverStart: _onHoverStart,
          onHoverEnd: _onHoverEnd,
          custom: _custom,
          ...domProps
        }: Record<string, unknown>) => createElement(tag, domProps, children as ReactNode);
      },
    },
  );
  return {
    motion: motionTags,
    m: motionTags,
    LazyMotion: ({ children }: { children: ReactNode }) => <>{children}</>,
    domAnimation: {},
    domMax: {},
    AnimatePresence: ({ children }: { children: ReactNode }) => <>{children}</>,
    useAnimation: () => ({ start: vi.fn(), stop: vi.fn(), set: vi.fn() }),
  };
});

vi.mock('@/components/pensions/pension-detail-modal', () => ({
  PensionDetailModal: () => null,
}));

vi.mock('@/components/landlord/room-editor-drawer', () => ({
  RoomEditorDrawer: () => null,
}));

vi.mock('@/components/landlord/landlord-proposals-drawer', () => ({
  LandlordProposalsDrawer: () => null,
}));

vi.mock('@/components/landlord/proposal-preview-comparison-modal', () => ({
  ProposalPreviewComparisonModal: () => null,
}));

const landlordUser: UserProfile = {
  id: 'owner-1',
  email: 'owner@buscatunido.cl',
  firstName: 'Carlos',
  lastName: 'Mena',
  role: 'LANDLORD',
  isEmailVerified: true,
  phone: '+56 9 1234 5678',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const sampleRoom: RoomDto = {
  id: 'room-1',
  pensionId: 'pen-owner-1',
  title: 'Pieza Individual Norte',
  description: 'Luminosa y amoblada',
  type: 'SINGLE',
  monthlyPrice: 240000,
  hasPrivateBathroom: true,
  bathType: 'PRIVATE',
  totalBeds: 1,
  availableBeds: 1,
  isAvailable: true,
  isActive: true,
  images: [],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const samplePension: PensionItem = {
  id: 'pen-owner-1',
  slug: 'residencia-andres-bello',
  title: 'Residencia Andrés Bello',
  description: 'A pasos del campus',
  address: 'Av. República 210',
  neighborhood: 'República',
  city: 'Santiago',
  latitude: -33.449,
  longitude: -70.668,
  baseMonthlyPrice: 240000,
  currency: 'CLP',
  ratingAverage: 4.7,
  ratingCount: 4,
  reviewsCount: 4,
  verificationStatus: 'OFFICIALLY_VERIFIED',
  isActive: true,
  images: [],
  nearbyUniversities: [],
  _count: { reviews: 4, rooms: 1 },
  waterIncluded: true,
  electricityIncluded: true,
  gasIncluded: true,
  internetIncluded: true,
  guestsAllowed: false,
  smokingAllowed: false,
  petsAllowed: false,
  genderPreference: 'ANY',
  amenitySlugs: ['calefaccion'],
  amenities: [],
  rooms: [
    {
      id: 'room-1',
      title: 'Pieza Individual Norte',
      type: 'SINGLE',
      monthlyPrice: 240000,
      hasPrivateBathroom: true,
      bathType: 'PRIVATE',
      isAvailable: true,
      isActive: true,
      images: [],
    },
  ],
};

const sampleAmenity: PensionAmenityCatalogItemDto = {
  slug: 'calefaccion',
  name: 'Calefacción central',
  category: 'ROOM_FEATURE',
  iconKey: 'thermometer',
};

const sampleProposal: ProposalDto = {
  id: 'prop-12345678',
  pensionId: 'pen-owner-1',
  submittedById: 'stu-1',
  type: 'BASIC_INFO',
  status: 'PENDING',
  proposedChanges: { baseMonthlyPrice: 250000 },
  submissionNotes: 'Actualización de tarifa vigente',
  submittedBy: {
    id: 'stu-1',
    firstName: 'Ana',
    lastName: 'Pérez',
  },
  createdAt: '2026-03-01T12:00:00.000Z',
  updatedAt: '2026-03-01T12:00:00.000Z',
};

describe('LandlordAppShell SPA navigation, hydration, and caching', () => {
  beforeEach(() => {
    cacheStore.clear();
    vi.clearAllMocks();
    window.history.replaceState(null, '', '/landlord');

    vi.spyOn(pensionsService, 'fetchMinePensions').mockResolvedValue(createSuccess([samplePension]));
    vi.spyOn(pensionsService, 'fetchAmenitiesCatalog').mockResolvedValue(
      createSuccess([sampleAmenity]),
    );
    vi.spyOn(roomsService, 'fetchPensionRooms').mockResolvedValue(createSuccess([sampleRoom]));
    vi.spyOn(reviewsService, 'fetchPensionReviews').mockResolvedValue(
      createSuccess({
        items: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
        hasMore: false,
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasMore: false,
        },
      }),
    );
    vi.spyOn(proposalsService, 'fetchPensionProposals').mockResolvedValue(
      createSuccess([sampleProposal]),
    );
  });

  afterEach(() => {
    cleanup();
    cacheStore.clear();
    vi.restoreAllMocks();
  });

  it('seeds from SSR initialData without redundant fetches and switches tabs with keep-alive and zero SplashScreen', async () => {
    mockUseAuth.mockReturnValue({
      user: landlordUser,
      token: 'tok-landlord',
      isAuthenticated: true,
      isLoading: false,
      favorites: [],
      login: vi.fn(),
      setSession: vi.fn(),
      logout: vi.fn(),
      toggleFavorite: vi.fn(),
      isFavorite: vi.fn(() => false),
    });

    const { container } = render(
      <ThemeProvider>
        <LandlordAppShell
          initialTab="pension"
          hasServerLandlordSession={true}
          initialData={{
            pensions: [samplePension],
            amenities: [sampleAmenity],
          }}
        />
      </ThemeProvider>,
    );

    expect(container.querySelector('#splash-screen-container')).toBeNull();
    expect(screen.getByText('Perfil de la Pensión')).toBeDefined();
    expect(screen.getByText('Calefacción central')).toBeDefined();
    expect(pensionsService.fetchMinePensions).not.toHaveBeenCalled();
    expect(pensionsService.fetchAmenitiesCatalog).not.toHaveBeenCalled();

    const sidebar = container.querySelector('#landlord-desktop-sidebar') as HTMLElement;
    // Navigate to Habitaciones
    await act(async () => {
      fireEvent.click(within(sidebar).getByRole('button', { name: /habitaciones/i }));
    });
    expect(container.querySelector('#splash-screen-container')).toBeNull();
    expect(await screen.findByText('Inventario de Habitaciones')).toBeDefined();

    // Previous tab (pension) stays mounted in keep-alive with hidden attribute
    const pensionHeading = screen.getByText('Perfil de la Pensión');
    const pensionSection = pensionHeading.closest('section');
    expect(pensionSection?.hasAttribute('hidden')).toBe(true);

    // Navigate to Pensiones -> Reseñas -> Cuenta without ever showing SplashScreen
    await act(async () => {
      fireEvent.click(within(sidebar).getByRole('button', { name: /mis pensiones/i }));
    });
    expect(container.querySelector('#splash-screen-container')).toBeNull();
    expect(screen.getByText('Pensión Seleccionada')).toBeDefined();

    await act(async () => {
      fireEvent.click(within(sidebar).getByRole('button', { name: /reseñas/i }));
    });
    expect(container.querySelector('#splash-screen-container')).toBeNull();
    expect(await screen.findByText('Calificaciones por Área')).toBeDefined();

    await act(async () => {
      fireEvent.click(within(sidebar).getByRole('button', { name: /ir a mi cuenta/i }));
    });
    expect(container.querySelector('#splash-screen-container')).toBeNull();
    expect(await screen.findByText('Propietario Anfitrión')).toBeDefined();

    // Return to Mi Pensión instantly (still mounted, visible)
    await act(async () => {
      fireEvent.click(within(sidebar).getByRole('button', { name: /mi pensión/i }));
    });
    expect(pensionSection?.hasAttribute('hidden')).toBe(false);
  });

  it('renders LandlordAccountSkeleton instead of AuthScreen while auth is loading with server session', async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,
      favorites: [],
      login: vi.fn(),
      setSession: vi.fn(),
      logout: vi.fn(),
      toggleFavorite: vi.fn(),
      isFavorite: vi.fn(() => false),
    });

    render(
      <ThemeProvider>
        <LandlordAppShell
          initialTab="account"
          hasServerLandlordSession={true}
          initialData={{ pensions: [samplePension] }}
        />
      </ThemeProvider>,
    );

    expect(await screen.findByText(/cargando información de cuenta/i)).toBeDefined();
    expect(screen.queryByText(/iniciar sesión/i)).toBeNull();
  });

  it('caches proposals in cacheStore so revisiting Proposals renders immediately without duplicate fetch', async () => {
    mockUseAuth.mockReturnValue({
      user: landlordUser,
      token: 'tok-landlord',
      isAuthenticated: true,
      isLoading: false,
      favorites: [],
      login: vi.fn(),
      setSession: vi.fn(),
      logout: vi.fn(),
      toggleFavorite: vi.fn(),
      isFavorite: vi.fn(() => false),
    });

    const firstRender = render(
      <LandlordProvider initialTab="proposals" initialData={{ pensions: [samplePension] }}>
        <LandlordProposalsScreen pension={samplePension} pensionId={samplePension.id} />
      </LandlordProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText(/Sugerencia #prop-123/i)).toBeDefined();
    });
    expect(proposalsService.fetchPensionProposals).toHaveBeenCalledTimes(1);

    firstRender.unmount();

    render(
      <LandlordProvider initialTab="proposals" initialData={{ pensions: [samplePension] }}>
        <LandlordProposalsScreen pension={samplePension} pensionId={samplePension.id} />
      </LandlordProvider>,
    );

    // Cached entry appears synchronously with no loading skeleton and no extra fetch inside TTL
    expect(screen.getByText(/Sugerencia #prop-123/i)).toBeDefined();
    expect(screen.queryByText(/cargando sugerencias de la comunidad/i)).toBeNull();
    expect(proposalsService.fetchPensionProposals).toHaveBeenCalledTimes(1);
  });
});
