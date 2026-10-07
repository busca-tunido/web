import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { StudentRegisterModal } from '@/components/auth/student-register-modal';
import { authService } from '@/services/auth.service';
import type { DetectedUniversityDto } from '@/types/api-contracts';

const mockLogin = vi.fn().mockResolvedValue(undefined);

vi.mock('@/lib/auth-context', () => ({
  useAuth: () => ({
    login: mockLogin,
    setSession: vi.fn(),
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    favorites: [],
    logout: vi.fn(),
    toggleFavorite: vi.fn(),
    isFavorite: vi.fn().mockReturnValue(false),
  }),
}));

vi.mock('@/services/auth.service', () => ({
  authService: {
    registerUser: vi.fn(),
  },
}));

describe('StudentRegisterModal - Auto-Detect University Affiliation', () => {
  const mockDetectedUniversity: DetectedUniversityDto = {
    id: '00000000-0000-4000-8000-000000000001',
    name: 'Universidad de Chile',
    shortName: 'UCHILE',
    city: 'Santiago',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders verified university card when detectedUniversity is provided', () => {
    render(
      <StudentRegisterModal
        isOpen={true}
        onClose={vi.fn()}
        prefilledEmail="estudiante@uchile.cl"
        detectedUniversity={mockDetectedUniversity}
      />,
    );

    expect(screen.getByText('Universidad de Chile')).toBeDefined();
    expect(screen.getByText('UCHILE')).toBeDefined();
    expect(screen.getByText(/Institución verificada automáticamente por tu correo/i)).toBeDefined();
    expect(screen.queryByLabelText(/^Universidad$/i)).toBeNull();
  });

  it('renders rejection alert and disables submit when no university is detected', () => {
    render(
      <StudentRegisterModal
        isOpen={true}
        onClose={vi.fn()}
        prefilledEmail="estudiante@desconocido.com"
        detectedUniversity={null}
      />,
    );

    expect(screen.getByText(/Dominio institucional no reconocido/i)).toBeDefined();
    expect(
      screen.getByText(/El dominio del correo ingresado no coincide con ninguna universidad registrada/i),
    ).toBeDefined();

    const submitBtn = screen.getByRole('button', { name: /Completar Registro/i }) as HTMLButtonElement;
    expect(submitBtn.disabled).toBe(true);
  });

  it('submits registration with auto-detected universityId and logs in successfully', async () => {
    vi.mocked(authService.registerUser).mockResolvedValueOnce({
      status: 'success',
      statusCode: 201,
      data: {
        token: 'jwt-token-xyz',
        user: {
          id: 'usr-1',
          email: 'estudiante@uchile.cl',
          firstName: 'Ana',
          lastName: 'Silva',
          role: 'STUDENT',
        },
      },
    });

    const handleSuccess = vi.fn();
    const handleClose = vi.fn();

    render(
      <StudentRegisterModal
        isOpen={true}
        onClose={handleClose}
        prefilledEmail="estudiante@uchile.cl"
        detectedUniversity={mockDetectedUniversity}
        onSuccess={handleSuccess}
      />,
    );

    await act(async () => {
      fireEvent.change(document.querySelector('#register-student-firstname') as HTMLInputElement, {
        target: { value: 'Ana' },
      });
      fireEvent.change(document.querySelector('#register-student-lastname') as HTMLInputElement, {
        target: { value: 'Silva' },
      });
      fireEvent.change(document.querySelector('#register-student-password') as HTMLInputElement, {
        target: { value: 'Password123!' },
      });
    });

    const submitBtn = screen.getByRole('button', { name: /Completar Registro/i });
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    await waitFor(() => {
      expect(authService.registerUser).toHaveBeenCalledWith({
        email: 'estudiante@uchile.cl',
        password: 'Password123!',
        firstName: 'Ana',
        lastName: 'Silva',
        phone: undefined,
        universityId: '00000000-0000-4000-8000-000000000001',
        role: 'STUDENT',
      });
      expect(mockLogin).toHaveBeenCalledWith('estudiante@uchile.cl', 'Password123!');
      expect(handleSuccess).toHaveBeenCalled();
      expect(handleClose).toHaveBeenCalled();
    });
  });
});
