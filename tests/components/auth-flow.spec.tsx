import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EmailCheckStep } from '@/components/auth/email-check-step';
import { StudentRegisterModal } from '@/components/auth/student-register-modal';
import { authService } from '@/services/auth.service';

const mockLogin = vi.fn().mockResolvedValue(undefined);

vi.mock('@/lib/auth-context', () => ({
  useAuth: () => ({
    login: mockLogin,
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
    checkEmailExists: vi.fn(),
    registerUser: vi.fn(),
    loginWithCredentials: vi.fn(),
    getCurrentUserProfile: vi.fn(),
    logoutSession: vi.fn(),
  },
}));

vi.mock('@/services/universities.service', () => ({
  fetchUniversities: vi.fn().mockResolvedValue({
    status: 'success',
    statusCode: 200,
    data: [
      {
        id: '00000000-0000-4000-8000-000000000001',
        name: 'Universidad de Chile',
        acronym: 'UCHILE',
        city: 'Santiago',
      },
    ],
  }),
}));

describe('Two-step Auth Flow & Student Register Modal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders initial email input without password field', () => {
    render(<EmailCheckStep initialEmail="alumno@uchile.cl" />);

    expect(screen.getByLabelText(/Correo institucional universitario/i)).toBeDefined();
    expect(document.querySelector('#student-password')).toBeNull();
    expect(screen.getByRole('button', { name: /Continuar/i })).toBeDefined();
    expect(screen.getByText(/Dominio institucional detectado/i)).toBeDefined();
  });

  it('executes Camino A when email exists: displays password field and Acceder button', async () => {
    vi.mocked(authService.checkEmailExists).mockResolvedValueOnce({
      status: 'success',
      statusCode: 200,
      data: { exists: true, role: 'STUDENT' },
    });

    render(<EmailCheckStep initialEmail="registrado@uchile.cl" />);

    const continueBtn = screen.getByRole('button', { name: /Continuar/i });
    await act(async () => {
      fireEvent.click(continueBtn);
    });

    await waitFor(() => {
      expect(document.querySelector('#student-password')).not.toBeNull();
    });

    const emailInput = screen.getByLabelText(/Correo institucional universitario/i) as HTMLInputElement;
    expect(emailInput.readOnly).toBe(true);

    expect(screen.getByRole('button', { name: /Acceder/i })).toBeDefined();
    expect(screen.getByText(/Cambiar correo/i)).toBeDefined();
    expect(screen.queryByText(/Registro de Estudiante/i)).toBeNull();
  });

  it('allows changing email after entering Camino A', async () => {
    vi.mocked(authService.checkEmailExists).mockResolvedValueOnce({
      status: 'success',
      statusCode: 200,
      data: { exists: true, role: 'STUDENT' },
    });

    render(<EmailCheckStep initialEmail="registrado@uchile.cl" />);

    const continueBtn = screen.getByRole('button', { name: /Continuar/i });
    await act(async () => {
      fireEvent.click(continueBtn);
    });

    await waitFor(() => {
      expect(screen.getByText(/Cambiar correo/i)).toBeDefined();
    });

    const changeEmailBtn = screen.getByText(/Cambiar correo/i);
    await act(async () => {
      fireEvent.click(changeEmailBtn);
    });

    expect(document.querySelector('#student-password')).toBeNull();
    expect(screen.getByRole('button', { name: /Continuar/i })).toBeDefined();

    const emailInput = screen.getByLabelText(/Correo institucional universitario/i) as HTMLInputElement;
    expect(emailInput.readOnly).toBe(false);
  });

  it('executes Camino B when email does not exist: opens StudentRegisterModal with prefilled email', async () => {
    vi.mocked(authService.checkEmailExists).mockResolvedValueOnce({
      status: 'success',
      statusCode: 200,
      data: { exists: false },
    });

    render(<EmailCheckStep initialEmail="nuevo.alumno@uchile.cl" />);

    const continueBtn = screen.getByRole('button', { name: /Continuar/i });
    await act(async () => {
      fireEvent.click(continueBtn);
    });

    await waitFor(() => {
      expect(screen.getByText(/Registro de Estudiante/i)).toBeDefined();
    });

    expect(document.querySelector('#student-password')).toBeNull();

    const prefilledInput = document.querySelector('#register-student-email') as HTMLInputElement;
    expect(prefilledInput).not.toBeNull();
    expect(prefilledInput.value).toBe('nuevo.alumno@uchile.cl');
    expect(prefilledInput.readOnly).toBe(true);
  });

  it('validates required fields in StudentRegisterModal before submitting', async () => {
    const handleSuccess = vi.fn();
    const handleClose = vi.fn();

    render(
      <StudentRegisterModal
        isOpen={true}
        onClose={handleClose}
        prefilledEmail="nuevo@uchile.cl"
        onSuccess={handleSuccess}
      />,
    );

    expect(screen.getByText(/Registro de Estudiante/i)).toBeDefined();
    const submitBtn = screen.getByRole('button', { name: /Completar Registro/i });

    await act(async () => {
      fireEvent.click(submitBtn);
    });

    expect(authService.registerUser).not.toHaveBeenCalled();
    expect(handleSuccess).not.toHaveBeenCalled();
  });

  it('registers student and logs in automatically on valid form submission', async () => {
    vi.mocked(authService.registerUser).mockResolvedValueOnce({
      status: 'success',
      statusCode: 201,
      data: {
        token: 'mock-jwt-token',
        user: {
          id: 'user-123',
          email: 'nuevo@uchile.cl',
          firstName: 'Carlos',
          lastName: 'Mendoza',
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
        prefilledEmail="nuevo@uchile.cl"
        onSuccess={handleSuccess}
      />,
    );

    await act(async () => {
      fireEvent.change(document.querySelector('#register-student-firstname') as HTMLInputElement, {
        target: { value: 'Carlos' },
      });
      fireEvent.change(document.querySelector('#register-student-lastname') as HTMLInputElement, {
        target: { value: 'Mendoza' },
      });
      fireEvent.change(document.querySelector('#register-student-password') as HTMLInputElement, {
        target: { value: 'Password123!' },
      });
      fireEvent.change(document.querySelector('#register-student-phone') as HTMLInputElement, {
        target: { value: '+56912345678' },
      });
    });

    const submitBtn = screen.getByRole('button', { name: /Completar Registro/i });
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    await waitFor(() => {
      expect(authService.registerUser).toHaveBeenCalledWith({
        email: 'nuevo@uchile.cl',
        password: 'Password123!',
        firstName: 'Carlos',
        lastName: 'Mendoza',
        phone: '+56912345678',
        universityId: '00000000-0000-4000-8000-000000000001',
        role: 'STUDENT',
      });
      expect(mockLogin).toHaveBeenCalledWith('nuevo@uchile.cl', 'Password123!');
      expect(handleSuccess).toHaveBeenCalled();
      expect(handleClose).toHaveBeenCalled();
    });
  });

  it('displays error message when email is already registered during submission', async () => {
    vi.mocked(authService.registerUser).mockResolvedValueOnce({
      status: 'error',
      statusCode: 409,
      message: 'Conflict',
      errorType: 'CONFLICT_ERROR',
    });

    render(
      <StudentRegisterModal
        isOpen={true}
        onClose={vi.fn()}
        prefilledEmail="repetido@uchile.cl"
      />,
    );

    await act(async () => {
      fireEvent.change(document.querySelector('#register-student-firstname') as HTMLInputElement, {
        target: { value: 'Carlos' },
      });
      fireEvent.change(document.querySelector('#register-student-lastname') as HTMLInputElement, {
        target: { value: 'Mendoza' },
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
      expect(screen.getByText(/Este correo ya ha sido registrado/i)).toBeDefined();
    });
  });
});
