import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AccountScreen } from '@/components/account/account-screen';
import { AuthModal } from '@/components/auth/auth-modal';
import { DesktopNavbar } from '@/components/layout/desktop-navbar';
import type { SearchFilters } from '@/lib/types';

let mockUser: { id: string; email: string; firstName: string; lastName: string; role: string } | null = null;

vi.mock('@/lib/auth-context', () => ({
  useAuth: () => ({
    login: vi.fn(),
    logout: vi.fn(),
    user: mockUser,
    isAuthenticated: Boolean(mockUser),
    isLoading: false,
    favorites: [],
    isFavorite: () => false,
    toggleFavorite: vi.fn(),
  }),
}));

vi.mock('@/lib/theme-context', () => ({
  useTheme: () => ({
    theme: 'dark',
    setTheme: vi.fn(),
    resolvedTheme: 'dark',
  }),
}));

describe('AuthModal and Unauthenticated Account Access', () => {
  beforeEach(() => {
    mockUser = null;
    vi.clearAllMocks();
  });

  it('renders AuthScreen when user is unauthenticated on AccountScreen', () => {
    mockUser = null;
    render(<AccountScreen />);

    expect(screen.getByText('Iniciar sesión o regístrate')).toBeDefined();
    expect(screen.getByText('Soy estudiante')).toBeDefined();
  });

  it('triggers onOpenAuthModal when clicking Ingresar button on DesktopNavbar', () => {
    const handleOpenAuthModal = vi.fn();
    const mockFilters: SearchFilters = {
      query: '',
      city: '',
      hasPrivateBathroom: false,
      includesMeals: false,
    };

    render(
      <DesktopNavbar
        activeTab="explore"
        onTabChange={vi.fn()}
        filters={mockFilters}
        onFilterChange={vi.fn()}
        onOpenFilterModal={vi.fn()}
        onOpenAuthModal={handleOpenAuthModal}
      />,
    );

    const loginBtn = screen.getByRole('button', { name: /ingresar/i });
    expect(loginBtn).toBeDefined();

    fireEvent.click(loginBtn);
    expect(handleOpenAuthModal).toHaveBeenCalledTimes(1);
  });

  it('renders AuthModal when isOpen is true and triggers onClose when clicking close button', () => {
    const handleClose = vi.fn();
    const { rerender } = render(<AuthModal isOpen={false} onClose={handleClose} />);

    expect(screen.queryByText('Iniciar sesión o regístrate')).toBeNull();

    rerender(<AuthModal isOpen={true} onClose={handleClose} />);
    expect(screen.getByText('Iniciar sesión o regístrate')).toBeDefined();

    const closeBtn = screen.getByRole('button', { name: /cerrar ventana de autenticación/i });
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
