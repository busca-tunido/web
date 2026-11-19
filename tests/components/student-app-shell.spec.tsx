import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PensionDetailModal } from '@/components/pensions/pension-detail-modal';
import { StudentAppShell } from '@/components/shells/student-app-shell';
import { PensionComparisonProvider } from '@/contexts/pension-comparison-context';
import { createSuccess } from '@/lib/api-response';
import { cacheStore } from '@/lib/cache-store';
import { ThemeProvider } from '@/lib/theme-context';
import type { CityInfo, PensionItem, StayHistoryItem, UniversityInfo, UserProfile } from '@/lib/types';
import { favoritesService } from '@/services/favorites.service';
import { pensionsService } from '@/services/pensions.service';
import { staysService } from '@/services/stays.service';

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

const studentUser: UserProfile = {
  id: 'stu-1',
  email: 'ana@uchile.cl',
  firstName: 'Ana',
  lastName: 'Rojas',
  role: 'STUDENT',
  isEmailVerified: true,
  universityName: 'Universidad de Chile',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const sampleCity: CityInfo = {
  id: 'santiago',
  name: 'Santiago',
  pensionsCount: 12,
  latitude: -33.4489,
  longitude: -70.6693,
};

const sampleUni: UniversityInfo = {
  id: 'uni-1',
  name: 'Universidad de Chile',
  acronym: 'UCH',
  city: 'Santiago',
  latitude: -33.444,
  longitude: -70.655,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const samplePension: PensionItem = {
  id: 'pen-1',
  slug: 'residencia-centro',
  title: 'Residencia Centro Universitario',
  description: 'A pasos del metro y facultades',
  address: 'Alameda 420',
  neighborhood: 'Centro',
  city: 'Santiago',
  latitude: -33.449,
  longitude: -70.668,
  baseMonthlyPrice: 230000,
  currency: 'CLP',
  ratingAverage: 4.8,
  ratingCount: 6,
  reviewsCount: 6,
  verificationStatus: 'OFFICIALLY_VERIFIED',
  isActive: true,
  images: [],
  nearbyUniversities: [],
  _count: { reviews: 6, rooms: 2 },
  waterIncluded: true,
  electricityIncluded: true,
  gasIncluded: true,
  internetIncluded: true,
  guestsAllowed: true,
  smokingAllowed: false,
  petsAllowed: false,
  genderPreference: 'ANY',
  amenitySlugs: [],
  amenities: [],
  rooms: [],
};

const sampleStay: StayHistoryItem = {
  id: 'stay-1',
  pensionId: 'pen-1',
  pensionTitle: 'Residencia Centro Universitario',
  pensionCity: 'Santiago',
  roomTitle: 'Pieza Individual',
  monthlyPaidClp: 230000,
  ratingGiven: 5,
  hasReview: true,
};

describe('StudentAppShell keep-alive, SWR caching, and skeleton state machines', () => {
  beforeEach(() => {
    cacheStore.clear();
    vi.clearAllMocks();
    window.history.replaceState(null, '', '/');

    vi.spyOn(favoritesService, 'fetchStudentFavorites').mockResolvedValue(createSuccess([]));
    vi.spyOn(staysService, 'fetchStudentStays').mockResolvedValue(createSuccess([sampleStay]));
    vi.spyOn(pensionsService, 'fetchPensionById').mockResolvedValue(createSuccess(samplePension));
  });

  afterEach(() => {
    cleanup();
    cacheStore.clear();
    vi.restoreAllMocks();
  });

  it('keeps visited student tabs mounted with hidden attribute and zero SplashScreen across transitions', async () => {
    mockUseAuth.mockReturnValue({
      user: studentUser,
      token: 'tok-student',
      isAuthenticated: true,
      isLoading: false,
      favorites: ['pen-1'],
      login: vi.fn(),
      setSession: vi.fn(),
      logout: vi.fn(),
      toggleFavorite: vi.fn(),
      isFavorite: vi.fn((id: string) => id === 'pen-1'),
    });

    const { container } = render(
      <ThemeProvider>
        <PensionComparisonProvider>
          <StudentAppShell
            initialTab="explore"
            initialData={{
              cities: [sampleCity],
              universities: [sampleUni],
              pensions: [samplePension],
              totalPensions: 1,
            }}
          />
        </PensionComparisonProvider>
      </ThemeProvider>,
    );

    expect(container.querySelector('#splash-screen-container')).toBeNull();
    expect(await screen.findByText('Ciudades Universitarias')).toBeDefined();

    // Switch to Favoritos
    const favBtn = container.querySelector('#desktop-nav-favorites')!;
    await act(async () => {
      fireEvent.click(favBtn);
    });
    expect(await screen.findByText('Tus Favoritos')).toBeDefined();

    // Explore section remains mounted in keep-alive with hidden attribute
    const exploreHeading = screen.getByText('Ciudades Universitarias');
    const exploreSection = exploreHeading.closest('section[hidden]');
    expect(exploreSection).not.toBeNull();

    // Switch to Mis Estadías -> stays fetched once and cached
    const historyBtn = container.querySelector('#desktop-nav-history')!;
    await act(async () => {
      fireEvent.click(historyBtn);
    });
    expect(await screen.findByText('Historial de Estadías Universitarias')).toBeDefined();
    expect(staysService.fetchStudentStays).toHaveBeenCalledTimes(1);

    // Switch to Cuenta
    const accountBtn = screen.getByTitle('Ver mi cuenta');
    await act(async () => {
      fireEvent.click(accountBtn);
    });
    expect(await screen.findByText('Validación de Matrícula Institucional')).toBeDefined();
    expect(container.querySelector('#splash-screen-container')).toBeNull();

    // Return to Explore -> visible again immediately
    const exploreNav = container.querySelector('#desktop-nav-explore')!;
    await act(async () => {
      fireEvent.click(exploreNav);
    });
    expect(screen.getByText('Ciudades Universitarias').closest('section')?.hasAttribute('hidden')).toBe(
      false,
    );
  });

  it('renders PensionDetailSkeleton while loading deep-linked pension detail without initialPension', async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      favorites: [],
      login: vi.fn(),
      setSession: vi.fn(),
      logout: vi.fn(),
      toggleFavorite: vi.fn(),
      isFavorite: vi.fn(() => false),
    });

    vi.spyOn(pensionsService, 'fetchPensionById').mockImplementation(
      () => new Promise(() => {}),
    );

    render(
      <ThemeProvider>
        <PensionDetailModal isOpen={true} pensionId="pen-999" onClose={vi.fn()} />
      </ThemeProvider>,
    );

    expect(await screen.findByText(/cargando pensión/i)).toBeDefined();
    await waitFor(() => {
      expect(document.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
    });
  });
});
