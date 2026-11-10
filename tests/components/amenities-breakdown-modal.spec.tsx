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
          slug: 'agua-caliente',
          name: 'Agua caliente 24/7',
          category: 'ROOM_FEATURE',
          iconKey: 'droplet',
        },
        {
          slug: 'calefaccion',
          name: 'Calefacción central o estufa',
          category: 'ROOM_FEATURE',
          iconKey: 'thermometer',
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

  it('renders basic utilities and amenity categories, showing active and opaque items without filler text', () => {
    render(<AmenitiesBreakdownModal isOpen={true} onClose={vi.fn()} pension={mockPension} />);

    expect(screen.getByText('Servicios y Comodidades')).toBeDefined();
    expect(screen.getByText('Servicios Básicos')).toBeDefined();
    expect(screen.getByText('Agua Potable')).toBeDefined();
    expect(screen.getByText('Electricidad / Luz')).toBeDefined();
    expect(screen.getByText('Gas / Calefón')).toBeDefined();
    expect(screen.getByText('Internet Wi-Fi')).toBeDefined();

    expect(screen.getByText('Habitación y Confort')).toBeDefined();
    expect(screen.getByText('Agua caliente 24/7')).toBeDefined();
    expect(screen.getByText('Baño privado en habitación')).toBeDefined();
    expect(screen.getByText('Cerradura digital en dormitorios')).toBeDefined();

    expect(screen.queryByText('Incluido en la mensualidad')).toBeNull();
    expect(screen.queryByText('No disponible')).toBeNull();
  });

  it('omits redundant house rules and filler text', () => {
    render(<AmenitiesBreakdownModal isOpen={true} onClose={vi.fn()} pension={mockPension} />);

    expect(screen.queryByText('Normas y Reglas de la Casa')).toBeNull();
    expect(screen.queryByText(/Toque de queda/i)).toBeNull();
    expect(screen.queryByText(/sábanas base/i)).toBeNull();
    expect(screen.queryByText(/iluminación LED natural/i)).toBeNull();
  });

  it('calls onClose when clicking back button', () => {
    const onCloseMock = vi.fn();
    render(<AmenitiesBreakdownModal isOpen={true} onClose={onCloseMock} pension={mockPension} />);

    const backButton = screen.getByRole('button', { name: /volver/i });
    fireEvent.click(backButton);

    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });
});
