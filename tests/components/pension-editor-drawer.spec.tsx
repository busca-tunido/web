import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PensionEditorDrawer } from '@/components/landlord/pension-editor-drawer';
import { createSuccess } from '@/lib/api-response';
import { SANTIAGO_COORDINATES } from '@/lib/use-user-location';
import * as locationsService from '@/services/locations.service';
import { pensionsService } from '@/services/pensions.service';
import { uploadsService } from '@/services/uploads.service';

vi.mock('@/components/landlord/pension-location-picker-map', () => ({
  PensionLocationPickerMap: ({
    latitude,
    longitude,
    city,
    onLocationChange,
  }: {
    latitude: number;
    longitude: number;
    city: string;
    neighborhood?: string;
    address?: string;
    onLocationChange: (lat: number, lng: number) => void;
  }) => (
    <div
      data-testid="pension-location-map"
      data-latitude={latitude}
      data-longitude={longitude}
      data-city={city}
    >
      <button
        type="button"
        data-testid="map-move-pin"
        onClick={() => onLocationChange(-33.4501, -70.6602)}
      >
        Mover Pin
      </button>
    </div>
  ),
}));

vi.mock('@/services/locations.service', () => ({
  fetchCities: vi.fn(),
  forwardGeocode: vi.fn(),
  reverseGeocode: vi.fn(),
  findClosestCity: vi.fn(),
  normalizeCityName: (name: string) =>
    name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim(),
}));

vi.mock('@/services/pensions.service', () => ({
  pensionsService: {
    createPension: vi.fn(),
  },
}));

vi.mock('@/services/uploads.service', () => ({
  uploadsService: {
    uploadMultipleFiles: vi.fn(),
  },
}));

vi.mock('@/components/ui/drawer', () => ({
  Drawer: ({ children, open }: { children: React.ReactNode; open: boolean }) =>
    open ? <div data-testid="drawer">{children}</div> : null,
  DrawerContent: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="drawer-content" className={className}>
      {children}
    </div>
  ),
  DrawerHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DrawerTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
  DrawerDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
}));

describe('PensionEditorDrawer - Map Coordinates & City Fallback', () => {
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
          pensionsCount: 20,
        },
        {
          id: 'city-calama',
          name: 'Calama',
          latitude: 0,
          longitude: 0,
          pensionsCount: 0,
        },
      ]),
    );
    vi.mocked(locationsService.forwardGeocode).mockResolvedValue({
      lat: -22.456,
      lng: -68.9295,
      displayName: 'Calama, Región de Antofagasta, Chile',
    });
  });

  it('initializes map with Santiago coordinates instead of 0, 0', async () => {
    render(<PensionEditorDrawer isOpen={true} onClose={vi.fn()} />);

    await waitFor(() => {
      const map = screen.getByTestId('pension-location-map');
      expect(map).toBeDefined();
      const lat = Number(map.getAttribute('data-latitude'));
      const lng = Number(map.getAttribute('data-longitude'));
      expect(lat).toBeCloseTo(SANTIAGO_COORDINATES.latitude, 2);
      expect(lng).toBeCloseTo(SANTIAGO_COORDINATES.longitude, 2);
      expect(lat).not.toBe(0);
      expect(lng).not.toBe(0);
    });
  });

  it('updates map to resolved coordinates when selecting Calama even if DB coordinates are 0, 0', async () => {
    render(<PensionEditorDrawer isOpen={true} onClose={vi.fn()} />);

    const calamaBtn = await screen.findByRole('button', { name: 'Calama' });
    expect(calamaBtn).toBeDefined();

    fireEvent.click(calamaBtn);

    await waitFor(() => {
      const map = screen.getByTestId('pension-location-map');
      const lat = Number(map.getAttribute('data-latitude'));
      const lng = Number(map.getAttribute('data-longitude'));
      expect(lat).toBeCloseTo(-22.456, 2);
      expect(lng).toBeCloseTo(-68.9295, 2);
      expect(lat).not.toBe(0);
      expect(lng).not.toBe(0);
    });
  });

  it('does not render Completar con GPS button', async () => {
    render(<PensionEditorDrawer isOpen={true} onClose={vi.fn()} />);
    await waitFor(() => {
      expect(screen.queryByText(/Completar con GPS/i)).toBeNull();
    });
  });

  it('renders 2. Fotos de la Pensión section and Subir foto button', async () => {
    render(<PensionEditorDrawer isOpen={true} onClose={vi.fn()} />);
    await waitFor(() => {
      expect(screen.getByText('2. Fotos de la Pensión')).toBeDefined();
      expect(screen.getByText('Subir foto')).toBeDefined();
    });
  });

  it('uploads selected images and sends images array to pensionsService.createPension', async () => {
    if (!globalThis.URL.createObjectURL) {
      globalThis.URL.createObjectURL = vi.fn(() => 'blob:http://localhost/test-photo.jpg');
    }
    if (!globalThis.URL.revokeObjectURL) {
      globalThis.URL.revokeObjectURL = vi.fn();
    }

    vi.mocked(uploadsService.uploadMultipleFiles).mockResolvedValue(
      createSuccess({
        urls: ['https://storage.buscatunido.cl/pensions/photo-1.webp'],
      }),
    );

    const mockCreate = vi.fn().mockResolvedValue(
      createSuccess({
        id: 'pension-123',
        title: 'Mi Pensión Universitaria',
      }),
    );
    vi.mocked(pensionsService.createPension).mockImplementation(mockCreate);

    render(<PensionEditorDrawer isOpen={true} onClose={vi.fn()} />);

    const titleInput = screen.getByLabelText(/Título de la Publicación/i);
    fireEvent.change(titleInput, { target: { value: 'Mi Pensión Universitaria' } });

    const descInput = screen.getByLabelText(/Descripción General/i);
    fireEvent.change(descInput, {
      target: { value: 'Una excelente pensión para estudiantes cerca del metro.' },
    });

    const addrInput = screen.getByLabelText(/Dirección Exacta/i);
    fireEvent.change(addrInput, { target: { value: 'Av. Vicuña Mackenna 4860' } });

    const neighInput = screen.getByLabelText(/Comuna o Barrio/i);
    fireEvent.change(neighInput, { target: { value: 'San Joaquín' } });

    const priceInput = screen.getByLabelText(/Precio Base Mensual/i);
    fireEvent.change(priceInput, { target: { value: '350000' } });

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput).not.toBeNull();

    const dummyFile = new File(['dummy-content'], 'fachada.png', { type: 'image/png' });
    fireEvent.change(fileInput, { target: { files: [dummyFile] } });

    await waitFor(() => {
      expect(screen.getByText('1 seleccionadas')).toBeDefined();
    });

    const submitBtn = screen.getByRole('button', { name: /Publicar Pensión/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(uploadsService.uploadMultipleFiles).toHaveBeenCalledWith([dummyFile]);
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Mi Pensión Universitaria',
          images: ['https://storage.buscatunido.cl/pensions/photo-1.webp'],
        }),
      );
    });
  });
});
