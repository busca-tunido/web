import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  AccountScreen,
  LandlordAccountScreen,
  StudentAccountScreen,
} from '@/components/account/account-screen';
import { AuthModal } from '@/components/auth/auth-modal';
import { DesktopNavbar } from '@/components/layout/desktop-navbar';
import type { SearchFilters } from '@/lib/types';

let mockUser: {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  universityName?: string;
  phone?: string;
} | null = null;

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

  it('renders student specific items when user is authenticated as STUDENT', () => {
    mockUser = {
      id: 'student-1',
      email: 'estudiante@usach.cl',
      firstName: 'Matías',
      lastName: 'González',
      role: 'STUDENT',
      universityName: 'Universidad de Santiago de Chile',
    };

    render(<AccountScreen />);

    expect(screen.getByText('Validación de Matrícula Institucional')).toBeDefined();
    expect(screen.getByText('Acreditado')).toBeDefined();
    expect(screen.getByText('Notificaciones de Cupos y Disponibilidad')).toBeDefined();
    expect(screen.getByText('Estudiante')).toBeDefined();
    expect(screen.queryByText('Verificación de Identidad del Anfitrión')).toBeNull();
    expect(screen.queryByText('Resumen de Mis Alojamientos')).toBeNull();
  });

  it('renders landlord specific items and omits student enrollment validation when user is LANDLORD', () => {
    mockUser = {
      id: 'landlord-1',
      email: 'dueno@gmail.com',
      firstName: 'Carlos',
      lastName: 'Silva',
      role: 'LANDLORD',
      phone: '+56912345678',
    };

    render(<AccountScreen />);

    expect(screen.getByText('Verificación de Identidad del Anfitrión')).toBeDefined();
    expect(screen.getByText('Canal de Contacto Directo (WhatsApp)')).toBeDefined();
    expect(screen.getByText('Resumen de Mis Alojamientos')).toBeDefined();
    expect(screen.getByText('Propietario Anfitrión')).toBeDefined();
    expect(screen.queryByText('Validación de Matrícula Institucional')).toBeNull();
  });

  it('renders StudentAccountScreen directly with student content', () => {
    mockUser = {
      id: 'student-2',
      email: 'ana@uchile.cl',
      firstName: 'Ana',
      lastName: 'Pérez',
      role: 'STUDENT',
      universityName: 'Universidad de Chile',
    };

    render(<StudentAccountScreen />);

    expect(screen.getByText('Validación de Matrícula Institucional')).toBeDefined();
    expect(screen.getAllByText('Universidad de Chile').length).toBeGreaterThan(0);
    expect(screen.queryByText('Verificación de Identidad del Anfitrión')).toBeNull();
  });

  it('renders LandlordAccountScreen directly with landlord content', () => {
    mockUser = {
      id: 'landlord-2',
      email: 'mariana@gmail.com',
      firstName: 'Mariana',
      lastName: 'López',
      role: 'LANDLORD',
    };

    render(<LandlordAccountScreen />);

    expect(screen.getByText('Verificación de Identidad del Anfitrión')).toBeDefined();
    expect(screen.queryByText('Validación de Matrícula Institucional')).toBeNull();
  });
});
