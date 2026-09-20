import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthGate } from '@/components/auth/auth-gate';
import { FavoritesScreen } from '@/components/favorites/favorites-screen';
import { HistoryScreen } from '@/components/history/history-screen';
import { DesktopNavbar } from '@/components/layout/desktop-navbar';
import type { SearchFilters } from '@/lib/types';

let mockUser: { id: string; email: string; firstName: string; lastName: string; role: string } | null = null;
const mockOpenAuthModal = vi.fn();

vi.mock('@/lib/auth-context', () => ({
  useAuth: () => ({
    login: vi.fn(),
    logout: vi.fn(),
    user: mockUser,
    isAuthenticated: Boolean(mockUser),
    isLoading: false,
    favorites: mockUser ? ['pension-1'] : [],
    isFavorite: (id: string) => Boolean(mockUser && id === 'pension-1'),
    toggleFavorite: vi.fn(),
  }),
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
});
