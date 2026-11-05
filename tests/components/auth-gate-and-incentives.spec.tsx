import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthGate } from '@/components/auth/auth-gate';
import { FavoritesScreen } from '@/components/favorites/favorites-screen';
import { HistoryScreen } from '@/components/history/history-screen';
import { DesktopNavbar } from '@/components/layout/desktop-navbar';
import type { SearchFilters } from '@/lib/types';

let mockUser: { id: string; email: string; firstName: string; lastName: string; role: string } | null = null;
let mockIsLoading = false;
const mockOpenAuthModal = vi.fn();

vi.mock('@/lib/auth-context', () => ({
  useAuth: () => ({
    login: vi.fn(),
    logout: vi.fn(),
    user: mockUser,
    isAuthenticated: Boolean(mockUser),
    isLoading: mockIsLoading,
    favorites: mockUser ? ['pension-1'] : [],
    isFavorite: (id: string) => Boolean(mockUser && id === 'pension-1'),
    toggleFavorite: vi.fn(),
  }),
}));

let mockStudentFavorites = {
  favorites: [] as string[],
  isFavorite: (_id: string) => false,
  toggleFavorite: vi.fn(),
  errorMessage: null as string | null,
  clearError: vi.fn(),
  favoritePensions: [] as unknown[],
  isLoading: false,
  refreshFavorites: vi.fn(),
};

vi.mock('@/hooks/use-student-favorites', () => ({
  useStudentFavorites: () => mockStudentFavorites,
}));

let mockStayHistory = {
  stays: [] as unknown[],
  isLoading: false,
  expectedCount: 3,
  formatDateRange: () => '',
};

vi.mock('@/hooks/use-stay-history', () => ({
  useStayHistory: () => mockStayHistory,
}));

const mockNavValue = {
  openAuthModal: mockOpenAuthModal,
  closeAuthModal: vi.fn(),
  isAuthModalOpen: false,
  activeTab: 'explore' as const,
  navigateTab: vi.fn(),
  selectedPension: null,
  selectPension: vi.fn(),
  setSelectedPension: vi.fn(),
  mapTargetCity: null,
  setMapTargetCity: vi.fn(),
  selectedUniversity: null,
  setSelectedUniversity: vi.fn(),
  isPensionDetailOpen: false,
  openPensionDetail: vi.fn(),
  closePensionDetail: vi.fn(),
  isFiltersOpen: false,
  openFilters: vi.fn(),
  closeFilters: vi.fn(),
  urlCity: null,
  urlUni: null,
  urlPensionId: null,
  setCityAndUni: vi.fn(),
  handleSelectCity: vi.fn(),
};

vi.mock('@/contexts/navigation-context', () => ({
  useNavigation: () => mockNavValue,
  useOptionalNavigation: () => mockNavValue,
}));

vi.mock('@/lib/theme-context', () => ({
  useTheme: () => ({
    theme: 'dark',
    setTheme: vi.fn(),
    resolvedTheme: 'dark',
  }),
}));

describe('AuthGate and Guest Incentive Screens', () => {
  beforeEach(() => {
    mockUser = null;
    mockIsLoading = false;
    mockStudentFavorites = {
      favorites: [] as string[],
      isFavorite: (_id: string) => false,
      toggleFavorite: vi.fn(),
      errorMessage: null,
      clearError: vi.fn(),
      favoritePensions: [] as unknown[],
      isLoading: false,
      refreshFavorites: vi.fn(),
    };
    vi.clearAllMocks();
  });

  it('renders teaser, lock icon, and CTA when user is not authenticated in AuthGate', () => {
    render(
      <AuthGate
        title="Inicia sesión para ver detalles"
        description="Conoce opiniones y normas."
        buttonText="Ingresar ahora"
      >
        <div data-testid="secret-content">Contenido exclusivo</div>
      </AuthGate>,
    );

    expect(screen.getByText('Inicia sesión para ver detalles')).toBeDefined();
    expect(screen.getByText('Conoce opiniones y normas.')).toBeDefined();

    const ctaButton = screen.getByRole('button', { name: 'Ingresar ahora' });
    expect(ctaButton).toBeDefined();

    fireEvent.click(ctaButton);
    expect(mockOpenAuthModal).toHaveBeenCalledTimes(1);
  });

  it('renders children directly without overlay when user is authenticated in AuthGate', () => {
    mockUser = {
      id: 'usr-1',
      email: 'student@universidad.cl',
      firstName: 'Ana',
      lastName: 'Valdés',
      role: 'STUDENT',
    };

    render(
      <AuthGate>
        <div data-testid="secret-content">Contenido exclusivo</div>
      </AuthGate>,
    );

    expect(screen.getByTestId('secret-content')).toBeDefined();
    expect(screen.queryByRole('button', { name: /iniciar sesión o regístrate/i })).toBeNull();
  });

  it('renders FavoritesGuestIncentive when unauthenticated on FavoritesScreen and triggers modal', () => {
    mockUser = null;
    render(<FavoritesScreen allPensions={[]} onSelectPension={vi.fn()} onExplore={vi.fn()} />);

    expect(screen.getByText('Guarda y compara tus pensiones favoritas')).toBeDefined();
    const loginBtn = screen.getByRole('button', { name: /iniciar sesión o registrarme/i });
    expect(loginBtn).toBeDefined();

    fireEvent.click(loginBtn);
    expect(mockOpenAuthModal).toHaveBeenCalledTimes(1);
  });

  it('renders HistoryGuestIncentive when unauthenticated on HistoryScreen and triggers modal', () => {
    mockUser = null;
    render(<HistoryScreen onExplore={vi.fn()} />);

    expect(screen.getByText('Construye tu historial de estadías')).toBeDefined();
    const loginBtn = screen.getByRole('button', { name: /iniciar sesión o registrarme/i });
    expect(loginBtn).toBeDefined();

    fireEvent.click(loginBtn);
    expect(mockOpenAuthModal).toHaveBeenCalledTimes(1);
  });

  it('triggers onOpenAuthModal in DesktopNavbar when clicking favorites or history as guest', () => {
    mockUser = null;
    const handleTabChange = vi.fn();
    const handleOpenAuth = vi.fn();
    const mockFilters: SearchFilters = {
      query: '',
      city: '',
      hasPrivateBathroom: false,
      includesMeals: false,
    };

    render(
      <DesktopNavbar
        activeTab="explore"
        onTabChange={handleTabChange}
        filters={mockFilters}
        onFilterChange={vi.fn()}
        onOpenFilterModal={vi.fn()}
        onOpenAuthModal={handleOpenAuth}
      />,
    );

    const favButton = screen.getByRole('button', { name: 'Favoritos' });
    fireEvent.click(favButton);
    expect(handleTabChange).toHaveBeenCalledWith('favorites');
    expect(handleOpenAuth).toHaveBeenCalledTimes(1);

    const histButton = screen.getByRole('button', { name: 'Mis Estadías' });
    fireEvent.click(histButton);
    expect(handleTabChange).toHaveBeenCalledWith('history');
    expect(handleOpenAuth).toHaveBeenCalledTimes(2);
  });

  it('renders nothing when isLoading is true in AuthGate', () => {
    mockIsLoading = true;
    mockUser = null;

    const { container } = render(
      <AuthGate
        title="Inicia sesión para ver detalles"
        description="Conoce opiniones y normas."
        buttonText="Ingresar ahora"
      >
        <div data-testid="secret-content">Contenido exclusivo</div>
      </AuthGate>,
    );

    expect(container.firstChild).toBeNull();
    expect(screen.queryByText('Inicia sesión para ver detalles')).toBeNull();
    expect(screen.queryByTestId('secret-content')).toBeNull();
  });

  it('renders nothing when isLoading is true on FavoritesScreen', () => {
    mockIsLoading = true;
    mockUser = null;

    const { container } = render(
      <FavoritesScreen allPensions={[]} onSelectPension={vi.fn()} onExplore={vi.fn()} />,
    );

    expect(container.firstChild).toBeNull();
    expect(screen.queryByText('Guarda y compara tus pensiones favoritas')).toBeNull();
  });

  it('renders nothing when isLoading is true on HistoryScreen', () => {
    mockIsLoading = true;
    mockUser = null;

    const { container } = render(<HistoryScreen onExplore={vi.fn()} />);

    expect(container.firstChild).toBeNull();
    expect(screen.queryByText('Construye tu historial de estadías')).toBeNull();
  });

  it('renders authenticated content when isLoading is false and user is authenticated on FavoritesScreen', () => {
    mockIsLoading = false;
    mockUser = {
      id: 'usr-1',
      email: 'student@universidad.cl',
      firstName: 'Ana',
      lastName: 'Valdés',
      role: 'STUDENT',
    };

    render(<FavoritesScreen allPensions={[]} onSelectPension={vi.fn()} onExplore={vi.fn()} />);

    expect(screen.getByText('Tus Favoritos')).toBeDefined();
    expect(screen.queryByText('Guarda y compara tus pensiones favoritas')).toBeNull();
  });

  it('renders authenticated content when isLoading is false and user is authenticated on HistoryScreen', () => {
    mockIsLoading = false;
    mockUser = {
      id: 'usr-1',
      email: 'student@universidad.cl',
      firstName: 'Ana',
      lastName: 'Valdés',
      role: 'STUDENT',
    };
    mockStayHistory = {
      stays: [],
      isLoading: false,
      expectedCount: 3,
      formatDateRange: () => '',
    };

    render(<HistoryScreen onExplore={vi.fn()} />);

    expect(screen.getByText('Donde me he alojado')).toBeDefined();
    expect(screen.getByText('Aún no registras estadías finalizadas')).toBeDefined();
    expect(screen.queryByText('Construye tu historial de estadías')).toBeNull();
  });

  it('renders skeleton cards without empty message while stays are loading on HistoryScreen', () => {
    mockIsLoading = false;
    mockUser = {
      id: 'usr-1',
      email: 'student@universidad.cl',
      firstName: 'Ana',
      lastName: 'Valdés',
      role: 'STUDENT',
    };
    mockStayHistory = {
      stays: [],
      isLoading: true,
      expectedCount: 2,
      formatDateRange: () => '',
    };

    const { container } = render(<HistoryScreen onExplore={vi.fn()} />);

    expect(screen.getByText('Donde me he alojado')).toBeDefined();
    expect(screen.queryByText('Aún no registras estadías finalizadas')).toBeNull();
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders preloaded pension cards alongside skeletons for remaining pending favorites', () => {
    mockIsLoading = false;
    mockUser = {
      id: 'usr-1',
      email: 'student@universidad.cl',
      firstName: 'Ana',
      lastName: 'Valdés',
      role: 'STUDENT',
    };
    mockStudentFavorites = {
      favorites: ['pen-1', 'pen-2', 'pen-3', 'pen-4', 'pen-5'],
      isFavorite: (id: string) => ['pen-1', 'pen-2', 'pen-3', 'pen-4', 'pen-5'].includes(id),
      toggleFavorite: vi.fn(),
      errorMessage: null,
      clearError: vi.fn(),
      favoritePensions: [],
      isLoading: true,
      refreshFavorites: vi.fn(),
    };

    const mockAllPensions = [
      {
        id: 'pen-1',
        slug: 'pension-1',
        title: 'Pensión Uno',
        description: 'Desc',
        address: 'Calle 1',
        neighborhood: 'Centro',
        city: 'Santiago',
        latitude: -33.4,
        longitude: -70.6,
        baseMonthlyPrice: 200000,
        currency: 'CLP',
        waterIncluded: true,
        electricityIncluded: true,
        gasIncluded: true,
        internetIncluded: true,
        guestsAllowed: true,
        smokingAllowed: false,
        petsAllowed: false,
        genderPreference: 'ANY',
        verificationStatus: 'OFFICIALLY_VERIFIED',
        isActive: true,
        ratingAverage: 4.8,
        ratingCount: 10,
        reviewsCount: 10,
        images: [],
        amenities: [],
        nearbyUniversities: [],
        rooms: [],
      },
      {
        id: 'pen-2',
        slug: 'pension-2',
        title: 'Pensión Dos',
        description: 'Desc',
        address: 'Calle 2',
        neighborhood: 'Providencia',
        city: 'Santiago',
        latitude: -33.4,
        longitude: -70.6,
        baseMonthlyPrice: 250000,
        currency: 'CLP',
        waterIncluded: true,
        electricityIncluded: true,
        gasIncluded: true,
        internetIncluded: true,
        guestsAllowed: true,
        smokingAllowed: false,
        petsAllowed: false,
        genderPreference: 'ANY',
        verificationStatus: 'OFFICIALLY_VERIFIED',
        isActive: true,
        ratingAverage: 4.5,
        ratingCount: 8,
        reviewsCount: 8,
        images: [],
        amenities: [],
        nearbyUniversities: [],
        rooms: [],
      },
    ] as unknown as SearchFilters[];

    const { container } = render(
      <FavoritesScreen
        allPensions={mockAllPensions as unknown as Parameters<typeof FavoritesScreen>[0]['allPensions']}
        onSelectPension={vi.fn()}
        onExplore={vi.fn()}
      />,
    );

    expect(screen.getByText('Pensión Uno')).toBeDefined();
    expect(screen.getByText('Pensión Dos')).toBeDefined();
    expect(screen.getByText('Cargando 5 alojamientos guardados...')).toBeDefined();
    expect(screen.queryByText('No tienes favoritos guardados')).toBeNull();
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });
});
