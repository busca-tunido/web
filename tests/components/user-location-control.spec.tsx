import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ComponentProps, ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  LOCATION_ERROR_HIDE_DELAY_MS,
  LOCATION_INFO_HIDE_DELAY_MS,
  UserLocationControl,
} from '@/components/map/user-location-control';
import type { BrowserLocation } from '@/lib/use-user-location';

vi.mock('motion/react', () => ({
  motion: {
    div: (props: ComponentProps<'div'>) => (
      <div className={props.className}>{props.children}</div>
    ),
  },
  AnimatePresence: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

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

  it('shows permission errors, allows retry and never centers on failed readings', async () => {
    const center = vi.fn();
    const request = vi.fn().mockResolvedValue(null);
    render(<UserLocationControl location={null} source="default" status="denied" error="Permiso denegado" onRequestLocation={request} onLocated={center} />);
    expect(screen.getByRole('alert').textContent).toBe('Permiso denegado');
    fireEvent.click(screen.getByRole('button'));
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

  it('auto-hides error messages after the error display delay', () => {
    vi.useFakeTimers();
    render(
      <UserLocationControl
        location={null}
        source="default"
        status="timeout"
        error="No pudimos obtener tu ubicación a tiempo."
        onRequestLocation={vi.fn()}
        onLocated={vi.fn()}
      />,
    );

    expect(screen.getByRole('alert').textContent).toContain('a tiempo');

    act(() => {
      vi.advanceTimersByTime(LOCATION_ERROR_HIDE_DELAY_MS - 100);
    });
    expect(screen.getByRole('alert')).toBeDefined();

    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(screen.queryByRole('alert')).toBeNull();
  });
});
