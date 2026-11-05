import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LandlordPensionScreen } from '@/components/landlord/landlord-pension-screen';
import type { PensionDetailDto } from '@/lib/types';
import { createSuccess } from '@/lib/api-response';
import { pensionsService } from '@/services/pensions.service';

const mockPension: PensionDetailDto = {
  id: '6659f8c123456789abcdef01',
  slug: 'pension-san-joaquin',
  title: 'Pensión San Joaquín',
  description: 'Excelente pensión cerca de campus.',
  address: 'Vicuña Mackenna 4860',
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
  curfewTime: '23:00',
  guestsAllowed: false,
  smokingAllowed: false,
  petsAllowed: false,
  genderPreference: 'ANY',
  quietHoursStart: '22:00',
  quietHoursEnd: '08:00',
  contactName: 'Sra. Carmen Gloria',
  contactPhone: '+56 9 1234 5678',
  images: [],
  rooms: [],
  amenities: [],
  ratingAverage: 4.5,
  ratingCount: 8,
  reviewsCount: 8,
  verificationStatus: 'OFFICIALLY_VERIFIED',
  nearbyUniversities: [],
  _count: { reviews: 8, rooms: 0 },
  isActive: true,
};

vi.mock('@/components/pensions/pension-detail-modal', () => ({
  PensionDetailModal: () => null,
}));

vi.mock('@/components/landlord/landlord-proposals-drawer', () => ({
  LandlordProposalsDrawer: () => null,
}));

const mockDefaultContact = { name: 'Patricio Valenzuela', phone: '+56 9 9999 8888' };
const mockGetPensionContact = vi.fn(() => ({
  isCustom: false,
  name: 'Patricio Valenzuela',
  phone: '+56 9 9999 8888',
}));
const mockOpenCreatePensionModal = vi.fn();
const mockTogglePensionActive = vi.fn();
const mockDeletePension = vi.fn();
const mockUpdatePensionCustomContact = vi.fn();
const mockUpdatePensionInList = vi.fn();
const mockRefetchProposals = vi.fn();

vi.mock('@/contexts/landlord-context', () => ({
  useLandlord: () => ({
    openCreatePensionModal: mockOpenCreatePensionModal,
    togglePensionActive: mockTogglePensionActive,
    deletePension: mockDeletePension,
    defaultContact: mockDefaultContact,
    getPensionContact: mockGetPensionContact,
    updatePensionCustomContact: mockUpdatePensionCustomContact,
    updatePensionInList: mockUpdatePensionInList,
    pendingProposalsCount: 0,
    refetchProposals: mockRefetchProposals,
  }),
}));

vi.mock('@/services/pensions.service', () => ({
  pensionsService: {
    fetchPensionDetail: vi.fn(),
    fetchMinePensions: vi.fn(),
    fetchAmenitiesCatalog: vi.fn().mockResolvedValue({ success: true, data: [] }),
    update: vi.fn(),
  },
}));

describe('LandlordPensionScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('submits updated pension payload including contact information without validation failure', async () => {
    vi.mocked(pensionsService.update).mockResolvedValueOnce(
      createSuccess({
        ...mockPension,
        contactName: 'Patricio Valenzuela',
        contactPhone: '+56 9 9999 8888',
      }),
    );

    render(<LandlordPensionScreen pension={mockPension} />);

    const saveButton = screen.getByRole('button', { name: /guardar cambios en ficha/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(pensionsService.update).toHaveBeenCalledTimes(1);
    });

    expect(pensionsService.update).toHaveBeenCalledWith(
      '6659f8c123456789abcdef01',
      expect.objectContaining({
        currency: 'CLP',
        contactName: 'Patricio Valenzuela',
        contactPhone: '+56 9 9999 8888',
        waterIncluded: true,
        electricityIncluded: true,
        gasIncluded: true,
        internetIncluded: true,
        genderPreference: 'ANY',
      }),
    );

    expect(await screen.findByText(/¡cambios guardados correctamente en la ficha de tu pensión!/i)).toBeDefined();
    expect(mockUpdatePensionInList).toHaveBeenCalledWith(
      expect.objectContaining({ id: '6659f8c123456789abcdef01' }),
    );
  });

  it('notifies onPensionUpdated and keeps updated state when saving', async () => {
    const onPensionUpdated = vi.fn();
    const updatedPension = {
      ...mockPension,
      smokingAllowed: true,
      petsAllowed: true,
    };

    vi.mocked(pensionsService.update).mockResolvedValueOnce(createSuccess(updatedPension));

    render(<LandlordPensionScreen pension={mockPension} onPensionUpdated={onPensionUpdated} />);

    const saveButton = screen.getByRole('button', { name: /guardar cambios en ficha/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(onPensionUpdated).toHaveBeenCalledWith(
        expect.objectContaining({
          id: '6659f8c123456789abcdef01',
          smokingAllowed: true,
          petsAllowed: true,
        }),
      );
    });

    expect(mockUpdatePensionInList).toHaveBeenCalledWith(
      expect.objectContaining({
        id: '6659f8c123456789abcdef01',
        smokingAllowed: true,
      }),
    );
  });

  it('opens delete confirmation modal and invokes deletePension on confirmation', async () => {
    mockDeletePension.mockResolvedValueOnce(true);

    render(<LandlordPensionScreen pension={mockPension} />);

    const openDeleteBtn = screen.getByRole('button', { name: /eliminar pensión/i });
    expect(openDeleteBtn).toBeDefined();

    fireEvent.click(openDeleteBtn);

    expect(screen.getByText('¿Eliminar esta pensión?')).toBeDefined();

    const confirmBtn = screen.getByRole('button', { name: /eliminar definitivamente/i });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(mockDeletePension).toHaveBeenCalledWith('6659f8c123456789abcdef01');
    });
  });
});
