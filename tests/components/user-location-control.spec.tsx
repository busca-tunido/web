import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ComponentProps, ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  LOCATION_INFO_HIDE_DELAY_MS,
  UserLocationControl,
} from '@/components/map/user-location-control';
import type { BrowserLocation } from '@/lib/use-user-location';

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
          createMotionElement(tag, domProps, children as ReactNode);
      },
    }
  );
  return {
    motion: motionTags,
    AnimatePresence: ({ children }: { children: ReactNode }) => <>{children}</>,
    useAnimation: () => ({ start: vi.fn(), stop: vi.fn(), set: vi.fn() }),
  };
});

afterEach(() => {
  vi.useRealTimers();
  cleanup();
});

const measured: BrowserLocation = { latitude: -33.046, longitude: -71.62, accuracy: 25, timestamp: 1794614400000 };

describe('UserLocationControl', () => {
  it('requests new coordinates and centers on the resolved reading rather than the previous reading', async () => {
    const fresh = { ...measured, latitude: -33.05 };
    const request = vi.fn().mockResolvedValue(fresh);
    const center = vi.fn();
    render(<UserLocationControl location={measured} source="browser" status="ready" error={null} onRequestLocation={request} onLocated={center} />);
    fireEvent.click(screen.getByRole('button', { name: 'Actualizar y centrar mi ubicación' }));
    await waitFor(() => expect(center).toHaveBeenCalledWith(fresh));
    expect(request).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('status').textContent).toContain('25 m');
  });

  it('shows approximate IP status without claiming it is a browser measurement', () => {
    render(<UserLocationControl location={null} source="ip" status="ready" error={null} onRequestLocation={vi.fn()} onLocated={vi.fn()} />);
    expect(screen.getByRole('status').textContent).toContain('aproximada por red');
  });

  it('disables concurrent location requests and announces progress', () => {
    render(<UserLocationControl location={null} source="default" status="locating" error={null} onRequestLocation={vi.fn()} onLocated={vi.fn()} />);
    expect(screen.getByRole<HTMLButtonElement>('button').disabled).toBe(true);
    expect(screen.getByRole('status').textContent).toContain('Obteniendo');
  });

  it('shows only the crossed-out location icon without text message on location failure, allows retry, and never centers', async () => {
    const center = vi.fn();
    const request = vi.fn().mockResolvedValue(null);
    const { container } = render(
      <UserLocationControl
        location={null}
        source="default"
        status="denied"
        error="Permiso denegado"
        onRequestLocation={request}
        onLocated={center}
      />,
    );
    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.queryByRole('status')).toBeNull();
    expect(container.querySelector('.lucide-locate-off')).not.toBeNull();
    const button = screen.getByRole('button', { name: 'Permiso denegado' });
    fireEvent.click(button);
    await waitFor(() => expect(request).toHaveBeenCalledTimes(1));
    expect(center).not.toHaveBeenCalled();
  });

  it('never auto-hides the message while locating is in progress', () => {
    vi.useFakeTimers();
    render(
      <UserLocationControl
        location={null}
        source="default"
        status="locating"
        error={null}
        onRequestLocation={vi.fn()}
        onLocated={vi.fn()}
      />,
    );

    expect(screen.getByRole('status').textContent).toContain('Obteniendo');
    act(() => {
      vi.advanceTimersByTime(30_000);
    });
    expect(screen.getByRole('status').textContent).toContain('Obteniendo');
  });

  it('auto-hides informational messages after delay and re-shows on manual locate', async () => {
    vi.useFakeTimers();
    const request = vi.fn().mockResolvedValue(measured);
    const center = vi.fn();
    render(
      <UserLocationControl
        location={measured}
        source="browser"
        status="ready"
        error={null}
        onRequestLocation={request}
        onLocated={center}
      />,
    );

    expect(screen.getByRole('status').textContent).toContain('25 m');

    act(() => {
      vi.advanceTimersByTime(LOCATION_INFO_HIDE_DELAY_MS - 100);
    });
    expect(screen.getByRole('status')).toBeDefined();

    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(screen.queryByRole('status')).toBeNull();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Actualizar y centrar mi ubicación' }));
    });
    expect(screen.getByRole('status').textContent).toContain('25 m');
  });

  it.each(['timeout', 'unavailable', 'unsupported'] as const)(
    'hides message bubble and keeps crossed-out location icon for status %s',
    (status) => {
      const { container } = render(
        <UserLocationControl
          location={null}
          source="default"
          status={status}
          error="No se pudo obtener ubicación"
          onRequestLocation={vi.fn()}
          onLocated={vi.fn()}
        />,
      );

      expect(screen.queryByRole('alert')).toBeNull();
      expect(screen.queryByRole('status')).toBeNull();
      expect(container.querySelector('.lucide-locate-off')).not.toBeNull();
    },
  );
});
