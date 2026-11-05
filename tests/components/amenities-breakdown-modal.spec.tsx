import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AmenitiesBreakdownModal } from '@/components/pensions/amenities-breakdown-modal';
import type { PensionItem } from '@/lib/types';

const mockPension: PensionItem = {
  id: 'p-1',
  slug: 'pension-test',
  title: 'Pensión Universitaria Test',
  description: 'Descripción breve.',
  address: 'Av. España 1680',
  city: 'Valparaíso',
  neighborhood: 'Playa Ancha',
  latitude: -33.02,
  longitude: -71.63,
  baseMonthlyPrice: 220000,
  currency: 'CLP',
  waterIncluded: true,
  electricityIncluded: true,
  gasIncluded: false,
  internetIncluded: true,
  curfewTime: '23:30',
  guestsAllowed: true,
  smokingAllowed: false,
  petsAllowed: false,
  genderPreference: 'ANY',
  quietHoursStart: '22:00',
  quietHoursEnd: '07:30',
  verificationStatus: 'OFFICIALLY_VERIFIED',
  ratingAverage: 4.6,
  ratingCount: 5,
  reviewsCount: 5,
  isActive: true,
  rooms: [],
  nearbyUniversities: [],
  _count: { reviews: 5, rooms: 0 },
  images: [],
  amenities: [],
  amenitySlugs: ['bano-privado', 'escritorio-estudio', 'cocina-equipada'],
};

vi.mock('@/services/pensions.service', () => ({
  pensionsService: {
    fetchAmenitiesCatalog: vi.fn().mockResolvedValue({
      success: true,
      data: [
        {
          slug: 'wifi-alta-velocidad',
          name: 'Wi-Fi fibra óptica alta velocidad',
          category: 'BASIC_UTILITY',
          iconKey: 'wifi',
        },
        {
          slug: 'agua-caliente',
          name: 'Agua caliente 24/7',
          category: 'BASIC_UTILITY',
          iconKey: 'droplet',
        },
        {
          slug: 'gas-incluido',
          name: 'Gas incluido',
          category: 'BASIC_UTILITY',
          iconKey: 'flame',
        },
        {
          slug: 'bano-privado',
          name: 'Baño privado en habitación',
          category: 'ROOM_FEATURE',
          iconKey: 'bath',
        },
        {
          slug: 'cerradura-digital',
          name: 'Cerradura digital en dormitorios',
          category: 'SAFETY_SECURITY',
          iconKey: 'key',
        },
      ],
    }),
  },
}));

describe('AmenitiesBreakdownModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when closed', () => {
    const { container } = render(
      <AmenitiesBreakdownModal isOpen={false} onClose={vi.fn()} pension={mockPension} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders active amenities as included and missing ones as unavailable', () => {
    render(<AmenitiesBreakdownModal isOpen={true} onClose={vi.fn()} pension={mockPension} />);

    expect(screen.getByText('Servicios y Comodidades')).toBeDefined();
    expect(screen.getByText('Wi-Fi fibra óptica alta velocidad')).toBeDefined();
    expect(screen.getByText('Agua caliente 24/7')).toBeDefined();
    expect(screen.getByText('Baño privado en habitación')).toBeDefined();

    expect(screen.getByText('Gas incluido')).toBeDefined();
    expect(screen.getByText('Cerradura digital en dormitorios')).toBeDefined();

    const includedLabels = screen.getAllByText('Incluido en la mensualidad');
    expect(includedLabels.length).toBeGreaterThanOrEqual(3);

    const unavailableLabels = screen.getAllByText('No disponible');
    expect(unavailableLabels.length).toBeGreaterThanOrEqual(2);
  });

  it('renders factual house rules without placeholder filler text', () => {
    render(<AmenitiesBreakdownModal isOpen={true} onClose={vi.fn()} pension={mockPension} />);

    expect(screen.getByText('Normas y Reglas de la Casa')).toBeDefined();
    expect(screen.getByText('Toque de queda: 23:30 hrs')).toBeDefined();
    expect(screen.getByText('22:00 a 07:30 hrs')).toBeDefined();
    expect(screen.getByText('Espacio libre de humo')).toBeDefined();

    expect(screen.queryByText(/sábanas base/i)).toBeNull();
    expect(screen.queryByText(/iluminación LED natural/i)).toBeNull();
    expect(screen.queryByText(/entorno barrial seguro/i)).toBeNull();
  });

  it('calls onClose when clicking back button', () => {
    const onCloseMock = vi.fn();
    render(<AmenitiesBreakdownModal isOpen={true} onClose={onCloseMock} pension={mockPension} />);

    const backButton = screen.getByRole('button', { name: /volver/i });
    fireEvent.click(backButton);

    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });
});
