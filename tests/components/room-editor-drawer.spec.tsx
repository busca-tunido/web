import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RoomEditorDrawer } from '@/components/landlord/room-editor-drawer';
import { createError, createSuccess } from '@/lib/api-response';
import { translateApiError } from '@/lib/error-translator';
import { roomsService } from '@/services/rooms.service';

vi.mock('@/services/rooms.service', () => ({
  createPensionRoom: vi.fn(),
  updateRoom: vi.fn(),
  roomsService: {
    createPensionRoom: vi.fn(),
    updateRoom: vi.fn(),
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

describe('RoomEditorDrawer - Validations & roomNumber safety', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  it('validates title minimum 3 characters in client', async () => {
    render(
      <RoomEditorDrawer
        isOpen={true}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
        pensionId="pension-1"
      />,
    );

    const titleInput = screen.getByLabelText(/Nombre de la Habitación/i);
    fireEvent.change(titleInput, { target: { value: 'ab' } });

    const priceInput = screen.getByLabelText(/Precio mensual/i);
    fireEvent.change(priceInput, { target: { value: '250000' } });

    const submitBtn = screen.getByRole('button', { name: /Publicar Habitación/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(
        screen.getByText('El nombre de la habitación debe tener al menos 3 caracteres.'),
      ).toBeDefined();
    });
  });

  it('sends undefined for roomNumber when not provided instead of the long title', async () => {
    const mockCreate = vi.fn().mockResolvedValue(createSuccess({ id: 'room-1' }));
    const roomsModule = await import('@/services/rooms.service');
    vi.mocked(roomsModule.createPensionRoom).mockImplementation(mockCreate);

    render(
      <RoomEditorDrawer
        isOpen={true}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
        pensionId="pension-1"
      />,
    );

    const titleInput = screen.getByLabelText(/Nombre de la Habitación/i);
    fireEvent.change(titleInput, { target: { value: 'Habitación de pensión 1' } });

    const priceInput = screen.getByLabelText(/Precio mensual/i);
    fireEvent.change(priceInput, { target: { value: '250000' } });

    const submitBtn = screen.getByRole('button', { name: /Publicar Habitación/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith(
        'pension-1',
        expect.objectContaining({
          title: 'Habitación de pensión 1',
          roomNumber: undefined,
        }),
      );
    });
  });

  it('extracts specific error from backend errors array', () => {
    const errorResponse = {
      message: 'Validation failed',
      errorCode: 'VALIDATION_FAILED',
      errors: ['El número o identificador no puede superar los 20 caracteres'],
    };

    const translated = translateApiError(errorResponse);
    expect(translated).toBe('El número o identificador no puede superar los 20 caracteres');
  });

  it('restores draft scoped to pensionId and removes banner on restore', async () => {
    sessionStorage.setItem(
      'buscatunido_draft_landlord-room-draft-pension-1',
      JSON.stringify({
        title: 'Habitación Luminosa 101',
        roomNumber: '101',
        monthlyPrice: '210000',
        totalBeds: 1,
        type: 'SINGLE',
        images: [],
      }),
    );

    render(
      <RoomEditorDrawer
        isOpen={true}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
        pensionId="pension-1"
      />,
    );

    expect(await screen.findByText(/Tienes un borrador de habitación no guardado/i)).toBeDefined();

    const restoreBtn = screen.getByRole('button', { name: 'Restaurar' });
    fireEvent.click(restoreBtn);

    await waitFor(() => {
      expect(screen.queryByText(/Tienes un borrador de habitación no guardado/i)).toBeNull();
      const titleInput = screen.getByLabelText(/Nombre de la Habitación/i) as HTMLInputElement;
      expect(titleInput.value).toBe('Habitación Luminosa 101');
    });
  });

  it('does not display draft belonging to another pensionId', async () => {
    sessionStorage.setItem(
      'buscatunido_draft_landlord-room-draft-pension-OTHER',
      JSON.stringify({
        title: 'Habitación Otra Pensión',
        roomNumber: '999',
        monthlyPrice: '300000',
      }),
    );

    render(
      <RoomEditorDrawer
        isOpen={true}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
        pensionId="pension-1"
      />,
    );

    expect(screen.queryByText(/Tienes un borrador de habitación no guardado/i)).toBeNull();
  });
});
