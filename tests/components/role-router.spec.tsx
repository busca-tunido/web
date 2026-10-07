import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RoleRouter } from '@/components/shells/role-router';

let mockIsLoading = false;
let mockRole = 'unauthenticated';

vi.mock('@/lib/auth-context', () => ({
  useAuth: () => ({
    isLoading: mockIsLoading,
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

vi.mock('@/hooks/use-user-role', () => ({
  useUserRole: () => ({
    role: mockRole,
    isStudent: mockRole === 'student',
    isLandlord: mockRole === 'landlord',
    isModerator: mockRole === 'moderator',
    isAdmin: mockRole === 'admin',
    isAuthenticated: mockRole !== 'unauthenticated',
    user: null,
    session: {
      status: mockRole === 'unauthenticated' ? 'unauthenticated' : 'authenticated',
      role: mockRole,
      user: null,
    },
  }),
}));

vi.mock('@/components/shells/student-app-shell', () => ({
  StudentAppShell: () => <div data-testid="student-shell">Student Page</div>,
}));

vi.mock('@/components/layout/splash-screen', () => ({
  SplashScreen: () => <div data-testid="splash-screen">Splash Loading</div>,
}));

describe('RoleRouter role switching and flash prevention', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    mockIsLoading = false;
    mockRole = 'unauthenticated';
    localStorage.clear();
    document.cookie = 'tunido_role=; path=/; max-age=0';

    Object.defineProperty(window, 'location', {
      writable: true,
      value: {
        ...originalLocation,
        replace: vi.fn(),
      },
    });
  });

  it('renders student shell for unauthenticated guest with initial data', () => {
    mockIsLoading = false;
    mockRole = 'unauthenticated';

    render(<RoleRouter initialData={{ pensions: [] }} />);

    expect(screen.getByTestId('student-shell')).toBeDefined();
    expect(screen.queryByTestId('splash-screen')).toBeNull();
  });

  it('prevents rendering student shell and displays splash screen when role is landlord', () => {
    mockIsLoading = false;
    mockRole = 'landlord';

    render(<RoleRouter initialData={{ pensions: [] }} />);

    expect(screen.queryByTestId('student-shell')).toBeNull();
    expect(screen.getByTestId('splash-screen')).toBeDefined();
    expect(window.location.replace).toHaveBeenCalledWith('/landlord');
  });

  it('prevents rendering student shell when stored landlord session is detected in localStorage', () => {
    localStorage.setItem('tunido_user', JSON.stringify({ role: 'LANDLORD' }));
    mockIsLoading = true;
    mockRole = 'unauthenticated';

    render(<RoleRouter initialData={{ pensions: [] }} />);

    expect(screen.queryByTestId('student-shell')).toBeNull();
    expect(screen.getByTestId('splash-screen')).toBeDefined();
    expect(window.location.replace).toHaveBeenCalledWith('/landlord');
  });

  it('prevents rendering student shell when tunido_role=LANDLORD cookie is present', () => {
    document.cookie = 'tunido_role=LANDLORD; path=/';
    mockIsLoading = true;
    mockRole = 'unauthenticated';

    render(<RoleRouter initialData={{ pensions: [] }} />);

    expect(screen.queryByTestId('student-shell')).toBeNull();
    expect(screen.getByTestId('splash-screen')).toBeDefined();
    expect(window.location.replace).toHaveBeenCalledWith('/landlord');
  });
});
