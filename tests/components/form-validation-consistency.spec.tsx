import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthScreen } from '@/components/auth/auth-screen';
import { EmailCheckStep } from '@/components/auth/email-check-step';
import { StudentRegisterModal } from '@/components/auth/student-register-modal';
import { LandlordPensionsScreen } from '@/components/landlord/landlord-pensions-screen';
import { PensionEditorDrawer } from '@/components/landlord/pension-editor-drawer';
import { RoomEditorDrawer } from '@/components/landlord/room-editor-drawer';
import { SuggestEditModal } from '@/components/pensions/suggest-edit-modal';
import { PublishReviewModal } from '@/components/reviews/publish-review-modal';
import { createSuccess } from '@/lib/api-response';
import type { PensionItem } from '@/lib/types';
import { SANTIAGO_COORDINATES } from '@/lib/use-user-location';
import { authService } from '@/services/auth.service';
import * as locationsService from '@/services/locations.service';
import { submitPensionProposal } from '@/services/proposals.service';

const mockUpdateDefaultContact = vi.fn();
const mockPublishReview = vi.fn();
const mockLogin = vi.fn().mockResolvedValue(undefined);

const mockPensionItem: PensionItem = {
  id: '6659f8c123456789abcdef01',
  slug: 'pension-demo',
  title: 'Pensión Universitaria Demo',
  description: 'Excelente pensión cerca del campus universitario.',
  address: 'Av. Vicuña Mackenna 4860',
  neighborhood: 'San Joaquín',
  city: 'Santiago',
  latitude: -33.499,
  longitude: -70.614,
  baseMonthlyPrice: 280000,
  currency: 'CLP',
  waterIncluded: true,
  electricityIncluded: true,
  gasIncluded: true,
  internetIncluded: true,
  guestsAllowed: false,
  smokingAllowed: false,
  petsAllowed: false,
  genderPreference: 'ANY',
  images: [],
  amenitySlugs: ['wifi-alta-velocidad'],
  amenities: [],
  ratingAverage: 4.5,
  ratingCount: 3,
  reviewsCount: 3,
  verificationStatus: 'OFFICIALLY_VERIFIED',
  nearbyUniversities: [],
  rooms: [],
  _count: { reviews: 3, rooms: 0 },
  isActive: true,
};

vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => {
    const { src, alt } = props;
    return <img src={String(src ?? '')} alt={String(alt ?? '')} />;
  },
}));

vi.mock('next/link', () => ({
  default: ({ children, href, ...rest }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

vi.mock('motion/react', async () => {
  const { createElement: createMotionElement } = await import('react');
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
          onHoverStart: _onHoverStart,
          onHoverEnd: _onHoverEnd,
          custom: _custom,
          ...domProps
        }: Record<string, unknown>) =>
          createMotionElement(tag, domProps, children as React.ReactNode);
      },
    }
  );
  return {
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    motion: motionTags,
    m: motionTags,
    LazyMotion: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    domAnimation: {},
    domMax: {},
    useAnimation: () => ({ start: vi.fn(), stop: vi.fn(), set: vi.fn() }),
  };
});

vi.mock('@/lib/auth-context', () => ({
  useAuth: () => ({
    login: mockLogin,
    setSession: vi.fn(),
    user: {
      id: 'user-1',
      email: 'alumno@uchile.cl',
      firstName: 'Ana',
      lastName: 'Pérez',
      role: 'STUDENT',
    },
    token: 'mock-token',
    isAuthenticated: true,
    isLoading: false,
    favorites: [],
    logout: vi.fn(),
    toggleFavorite: vi.fn(),
    isFavorite: vi.fn().mockReturnValue(false),
  }),
}));

vi.mock('@/contexts/landlord-context', () => ({
  useLandlord: () => ({
    pensions: [mockPensionItem],
    selectedPension: mockPensionItem,
    setSelectedPension: vi.fn(),
    setActiveTab: vi.fn(),
    openCreatePensionModal: vi.fn(),
    defaultContact: { name: 'Patricio Valenzuela', phone: '+56 9 9999 8888' },
    updateDefaultContact: mockUpdateDefaultContact,
    getPensionContact: vi.fn(() => ({
      isCustom: false,
      name: 'Patricio Valenzuela',
      phone: '+56 9 9999 8888',
    })),
    togglePensionActive: vi.fn(),
  }),
}));

vi.mock('@/components/landlord/pension-location-picker-map', () => ({
  PensionLocationPickerMap: () => <div data-testid="pension-location-map" />,
}));

vi.mock('@/components/landlord/room-occupancy-bar', () => ({
  RoomOccupancyBar: () => <div data-testid="room-occupancy-bar" />,
}));

vi.mock('@/components/pensions/pension-detail-modal', () => ({
  PensionDetailModal: () => null,
}));

vi.mock('@/services/locations.service', () => ({
  fetchCities: vi.fn(),
  forwardGeocode: vi.fn(),
  reverseGeocode: vi.fn(),
  findClosestCity: vi.fn(),
  normalizeCityName: (name: string) => name.toLowerCase().trim(),
}));

vi.mock('@/services/pensions.service', () => ({
  pensionsService: {
    createPension: vi.fn(),
    updatePension: vi.fn(),
  },
}));

vi.mock('@/services/rooms.service', () => ({
  createPensionRoom: vi.fn(),
  updateRoom: vi.fn(),
  roomsService: {
    createPensionRoom: vi.fn(),
    updateRoom: vi.fn(),
  },
}));

vi.mock('@/services/uploads.service', () => ({
  uploadSingleImage: vi.fn(),
  uploadsService: {
    uploadMultipleFiles: vi.fn(),
  },
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
  fetchUniversities: vi.fn().mockResolvedValue(createSuccess([])),
}));

vi.mock('@/hooks/use-pension-reviews', () => ({
  usePensionReviews: () => ({
    publishReview: mockPublishReview,
  }),
}));

vi.mock('@/services/proposals.service', () => ({
  submitPensionProposal: vi.fn(),
}));

describe('Form validation consistency across all user roles', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
    vi.mocked(locationsService.fetchCities).mockResolvedValue(
      createSuccess([
        {
          id: 'city-santiago',
          name: 'Santiago',
          latitude: SANTIAGO_COORDINATES.latitude,
          longitude: SANTIAGO_COORDINATES.longitude,
          pensionsCount: 10,
        },
      ]),
    );
  });

  it('validates PensionEditorDrawer on blur and highlights multiple invalid fields simultaneously on submit', async () => {
    render(<PensionEditorDrawer isOpen={true} onClose={vi.fn()} />);

    const titleInput = screen.getByLabelText(/Título de la Publicación/i);
    fireEvent.change(titleInput, { target: { value: 'ab' } });
    fireEvent.blur(titleInput);

    expect(
      await screen.findByText('El título de la pensión debe tener al menos 3 caracteres'),
    ).toBeDefined();
    expect(titleInput.getAttribute('aria-invalid')).toBe('true');

    const submitBtn = screen.getByRole('button', { name: /Publicar Pensión/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('La descripción debe tener al menos 10 caracteres')).toBeDefined();
      expect(screen.getByText('Ingresa una dirección válida (mín. 3 caracteres)')).toBeDefined();
      expect(
        screen.getByText('Ingresa un valor mensual de arriendo base válido en CLP'),
      ).toBeDefined();
    });
  });

  it('validates RoomEditorDrawer on blur and shows multiple field errors simultaneously without disabled submit button', async () => {
    render(
      <RoomEditorDrawer isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} pensionId="pension-1" />,
    );

    const titleInput = screen.getByLabelText(/Nombre de la Habitación/i);
    fireEvent.change(titleInput, { target: { value: 'xy' } });
    fireEvent.blur(titleInput);

    expect(
      await screen.findByText('El nombre de la habitación debe tener al menos 3 caracteres'),
    ).toBeDefined();
    expect(titleInput.getAttribute('aria-invalid')).toBe('true');

    const submitBtn = screen.getByRole('button', { name: /Publicar Habitación/i }) as HTMLButtonElement;
    expect(submitBtn.disabled).toBe(false);
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Ingresa un valor mensual de arriendo válido en CLP')).toBeDefined();
    });
  });

  it('validates LandlordPensionsScreen default contact fields inline on blur and submit', async () => {
    render(<LandlordPensionsScreen />);

    const nameInput = screen.getByLabelText(/Nombre del Anfitrión General/i);
    const phoneInput = screen.getByLabelText(/WhatsApp de Contacto \(Chile\)/i);

    fireEvent.change(nameInput, { target: { value: 'A' } });
    fireEvent.blur(nameInput);

    expect(
      await screen.findByText('Ingresa el nombre del anfitrión (mínimo 2 caracteres)'),
    ).toBeDefined();
    expect(nameInput.getAttribute('aria-invalid')).toBe('true');

    fireEvent.change(phoneInput, { target: { value: '123' } });
    const saveBtn = screen.getByRole('button', { name: /Guardar Predeterminados/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(
        screen.getByText('Ingresa un número telefónico chileno válido (ej: +56 9 1234 5678)'),
      ).toBeDefined();
      expect(phoneInput.getAttribute('aria-invalid')).toBe('true');
    });
    expect(mockUpdateDefaultContact).not.toHaveBeenCalled();
  });

  it('validates PublishReviewModal inline on blur and shows multiple errors on empty submit without top banner duplication', async () => {
    render(
      <PublishReviewModal
        isOpen={true}
        onClose={vi.fn()}
        pension={mockPensionItem}
        onReviewPublished={vi.fn()}
      />,
    );

    const commentTextarea = document.querySelector('#review-comment-textarea') as HTMLTextAreaElement;
    fireEvent.change(commentTextarea, { target: { value: 'Muy corto' } });
    fireEvent.blur(commentTextarea);

    expect(
      await screen.findByText('Tu reseña debe tener al menos 15 caracteres'),
    ).toBeDefined();
    expect(commentTextarea.getAttribute('aria-invalid')).toBe('true');

    const submitBtn = document.querySelector('#btn-submit-review') as HTMLButtonElement;
    expect(submitBtn.disabled).toBe(false);
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Tu reseña debe tener al menos 15 caracteres')).toBeDefined();
    });
    expect(mockPublishReview).not.toHaveBeenCalled();
  });

  it('validates SuggestEditModal inline under submissionNotes without silently disabling the submit button', async () => {
    render(<SuggestEditModal isOpen={true} onClose={vi.fn()} pension={mockPensionItem} />);

    const submitBtn = document.querySelector('#btn-submit-proposal') as HTMLButtonElement;
    expect(submitBtn.disabled).toBe(false);
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(
        screen.getByText('Por favor incluye una breve explicación (mínimo 5 caracteres)'),
      ).toBeDefined();
    });

    const textarea = document.querySelector('#suggest-submission-notes') as HTMLTextAreaElement;
    expect(textarea.getAttribute('aria-invalid')).toBe('true');
    expect(vi.mocked(submitPensionProposal)).not.toHaveBeenCalled();
  });

  it('validates AuthScreen landlord registration fields inline on blur and submit', async () => {
    render(<AuthScreen />);

    fireEvent.click(screen.getByRole('button', { name: /Acceso para dueños/i }));
    fireEvent.click(await screen.findByRole('button', { name: /Regístrate como dueño/i }));

    const phoneInput = document.querySelector('#landlord-register-phone') as HTMLInputElement;
    fireEvent.change(phoneInput, { target: { value: '123' } });
    fireEvent.blur(phoneInput);

    expect(
      await screen.findByText('Ingresa un número telefónico válido (ej: +56 9 1234 5678)'),
    ).toBeDefined();
    expect(phoneInput.getAttribute('aria-invalid')).toBe('true');

    const registerSubmitBtn = document.querySelector(
      '#btn-landlord-register-submit',
    ) as HTMLButtonElement;
    fireEvent.click(registerSubmitBtn);

    await waitFor(() => {
      expect(screen.getByText('El nombre debe tener al menos 2 caracteres')).toBeDefined();
      expect(screen.getByText('El apellido debe tener al menos 2 caracteres')).toBeDefined();
      expect(screen.getByText('Ingresa un correo electrónico válido')).toBeDefined();
      expect(screen.getByText('La contraseña debe tener al menos 8 caracteres')).toBeDefined();
    });
  });

  it('validates EmailCheckStep student email inline on blur without triggering server error slot', async () => {
    render(<EmailCheckStep />);

    const emailInput = document.querySelector('#student-email') as HTMLInputElement;
    fireEvent.change(emailInput, { target: { value: 'no-es-correo' } });
    fireEvent.blur(emailInput);

    expect(await screen.findByText('Ingresa un correo electrónico válido')).toBeDefined();
    expect(emailInput.getAttribute('aria-invalid')).toBe('true');
    expect(document.querySelector('#student-auth-error')).toBeNull();
  });

  it('submits EmailCheckStep default demo email and password without requiring user typing', async () => {
    vi.mocked(authService.checkEmailExists).mockResolvedValueOnce(
      createSuccess({ exists: true, role: 'STUDENT' }),
    );
    const handleSuccess = vi.fn();

    render(<EmailCheckStep onSuccess={handleSuccess} />);

    fireEvent.click(screen.getByRole('button', { name: /Continuar/i }));

    await waitFor(() => {
      expect(authService.checkEmailExists).toHaveBeenCalledWith('estudiante.demo@uchile.cl');
      expect(document.querySelector('#student-password')).not.toBeNull();
    });

    fireEvent.click(screen.getByRole('button', { name: /Acceder/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('estudiante.demo@uchile.cl', 'Password123!');
      expect(handleSuccess).toHaveBeenCalled();
    });
  });

  it('submits AuthScreen landlord login with default demo or autofilled values without requiring typing', async () => {
    const handleSuccess = vi.fn();
    render(<AuthScreen onSuccess={handleSuccess} />);

    fireEvent.click(screen.getByRole('button', { name: /Acceso para dueños/i }));

    const submitBtn = await screen.findByRole('button', { name: /Acceder como Dueño/i });
    const emailInput = document.querySelector('#landlord-email') as HTMLInputElement;
    const passwordInput = document.querySelector('#landlord-password') as HTMLInputElement;

    expect(emailInput.value).toBe('propietario.demo@buscatunido.cl');
    expect(passwordInput.value).toBe('Password123!');

    emailInput.value = 'dueno.autofill@buscatunido.cl';
    passwordInput.value = 'AutofillPass123!';

    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('dueno.autofill@buscatunido.cl', 'AutofillPass123!');
      expect(handleSuccess).toHaveBeenCalled();
    });
  });

  it('toggles password visibility across student login, landlord login/register, and student registration', async () => {
    vi.mocked(authService.checkEmailExists).mockResolvedValueOnce(
      createSuccess({ exists: true, role: 'STUDENT' }),
    );

    const { unmount } = render(<EmailCheckStep />);
    fireEvent.click(screen.getByRole('button', { name: /Continuar/i }));

    await waitFor(() => {
      expect(document.querySelector('#student-password')).not.toBeNull();
    });

    const studentPwdInput = document.querySelector('#student-password') as HTMLInputElement;
    expect(studentPwdInput.type).toBe('password');
    const studentToggleBtn = screen.getByRole('button', { name: 'Mostrar contraseña' });
    const mouseDownEvent = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
    studentToggleBtn.dispatchEvent(mouseDownEvent);
    expect(mouseDownEvent.defaultPrevented).toBe(true);
    fireEvent.click(studentToggleBtn);
    expect(studentPwdInput.type).toBe('text');
    expect(screen.getByRole('button', { name: 'Ocultar contraseña' }).getAttribute('aria-pressed')).toBe(
      'true',
    );
    unmount();

    const authView = render(<AuthScreen />);
    fireEvent.click(screen.getByRole('button', { name: /Acceso para dueños/i }));

    const landlordPwdInput = (await waitFor(() => {
      const el = document.querySelector('#landlord-password') as HTMLInputElement | null;
      expect(el).not.toBeNull();
      return el;
    })) as HTMLInputElement;
    expect(landlordPwdInput.type).toBe('password');
    fireEvent.click(screen.getByRole('button', { name: 'Mostrar contraseña' }));
    expect(landlordPwdInput.type).toBe('text');

    fireEvent.click(screen.getByRole('button', { name: /Regístrate como dueño/i }));
    const landlordRegPwdInput = (await waitFor(() => {
      const el = document.querySelector('#landlord-register-password') as HTMLInputElement | null;
      expect(el).not.toBeNull();
      return el;
    })) as HTMLInputElement;
    expect(landlordRegPwdInput.type).toBe('password');
    fireEvent.click(screen.getByRole('button', { name: 'Mostrar contraseña' }));
    expect(landlordRegPwdInput.type).toBe('text');
    authView.unmount();

    render(
      <StudentRegisterModal
        isOpen={true}
        onClose={vi.fn()}
        prefilledEmail="nuevo@uchile.cl"
      />,
    );
    const studentRegPwdInput = document.querySelector(
      '#register-student-password',
    ) as HTMLInputElement;
    expect(studentRegPwdInput.type).toBe('password');
    fireEvent.click(screen.getByRole('button', { name: 'Mostrar contraseña' }));
    expect(studentRegPwdInput.type).toBe('text');
  });
});
