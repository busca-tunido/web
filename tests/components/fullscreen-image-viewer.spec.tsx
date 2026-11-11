import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { FullScreenImageViewer } from '@/components/ui/fullscreen-image-viewer';

describe('FullScreenImageViewer', () => {
  const sampleImages = [
    'https://images.unsplash.com/photo-1555854877-bab0e564b8d5',
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688',
  ];

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <FullScreenImageViewer
        isOpen={false}
        onClose={vi.fn()}
        images={sampleImages}
        title="Pensión Central"
      />,
    );

    expect(container.firstChild).toBeNull();
  });

  it('renders single image viewer without navigation arrows or thumbnails', () => {
    const handleClose = vi.fn();
    render(
      <FullScreenImageViewer
        isOpen={true}
        onClose={handleClose}
        images={['https://images.unsplash.com/photo-1555854877-bab0e564b8d5']}
        title="Habitación Individual"
        subtitle="Pensión Bellavista"
      />,
    );

    expect(screen.getByText('Habitación Individual')).toBeDefined();
    expect(screen.getByText('Pensión Bellavista')).toBeDefined();
    expect(screen.queryByLabelText('Foto siguiente')).toBeNull();
    expect(screen.queryByLabelText('Foto anterior')).toBeNull();

    const closeBtn = screen.getByLabelText('Cerrar visor de imágenes');
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('renders multi-image gallery with navigation and counters', () => {
    const handleClose = vi.fn();
    render(
      <FullScreenImageViewer
        isOpen={true}
        onClose={handleClose}
        images={sampleImages}
        title="Galería Completa"
        initialIndex={0}
      />,
    );

    expect(screen.getByText('1 / 3')).toBeDefined();

    const nextBtn = screen.getByLabelText('Siguiente foto');
    fireEvent.click(nextBtn);
    expect(screen.getByText('2 / 3')).toBeDefined();

    const prevBtn = screen.getByLabelText('Foto anterior');
    fireEvent.click(prevBtn);
    expect(screen.getByText('1 / 3')).toBeDefined();
  });

  it('navigates with keyboard ArrowRight and ArrowLeft, and closes with Escape', () => {
    const handleClose = vi.fn();
    render(
      <FullScreenImageViewer
        isOpen={true}
        onClose={handleClose}
        images={sampleImages}
        title="Teclado Test"
        initialIndex={0}
      />,
    );

    expect(screen.getByText('1 / 3')).toBeDefined();

    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(screen.getByText('2 / 3')).toBeDefined();

    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    expect(screen.getByText('1 / 3')).toBeDefined();

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('allows clicking thumbnail to jump directly to specific image', () => {
    render(
      <FullScreenImageViewer
        isOpen={true}
        onClose={vi.fn()}
        images={sampleImages}
        title="Thumbnail Test"
        initialIndex={0}
      />,
    );

    const thumbnail3 = screen.getByLabelText('Ver foto 3');
    fireEvent.click(thumbnail3);
    expect(screen.getByText('3 / 3')).toBeDefined();
  });
});
