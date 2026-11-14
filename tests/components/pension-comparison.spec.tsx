import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PensionCard } from '@/components/pensions/pension-card';
import { PensionComparisonProvider } from '@/contexts/pension-comparison-context';
import { createError, createSuccess } from '@/lib/api-response';
import type { UserRole } from '@/lib/types';
import { pensionsService } from '@/services/pensions.service';
import { comparisonPension, comparisonPensions } from '../fixtures/comparison-pensions';
import type { ComponentProps } from 'react';

const auth = vi.hoisted(() => ({ user: { id: 'student-a', role: 'STUDENT' as UserRole } as { id: string; role: UserRole } | null, isLoading: false }));
let desktop = true;

vi.mock('@/lib/auth-context', () => ({ useAuth: () => auth }));
vi.mock('@/hooks/use-media-query', () => ({ useMediaQuery: () => desktop }));
vi.mock('@/services/pensions.service', () => ({ pensionsService: { fetchPensionDetail: vi.fn() } }));
vi.mock('motion/react', () => ({ motion: {
  article: (props: ComponentProps<'article'>) => <article aria-labelledby={props['aria-labelledby']} className={props.className}>{props.children}</article>,
  div: (props: ComponentProps<'div'>) => <div className={props.className}>{props.children}</div>,
  button: (props: ComponentProps<'button'>) => <button type="button" onClick={props.onClick} className={props.className} aria-label={props['aria-label']}>{props.children}</button>,
} }));

function Cards() {
  return <PensionComparisonProvider>{comparisonPensions.map((pension) => <PensionCard key={pension.id} pension={pension} isFavorite={false} onToggleFavorite={vi.fn()} onSelectPension={vi.fn()} />)}</PensionComparisonProvider>;
}

function selectPair(): void {
  fireEvent.click(screen.getByRole('button', { name: 'Comparar: Pensión A' }));
  fireEvent.click(screen.getByRole('button', { name: 'Comparar: Pensión B' }));
  fireEvent.click(screen.getByRole('button', { name: 'Comparar pensiones' }));
}

beforeEach(() => {
  auth.user = { id: 'student-a', role: 'STUDENT' };
  auth.isLoading = false;
  desktop = true;
  vi.mocked(pensionsService.fetchPensionDetail).mockReset();
  vi.mocked(pensionsService.fetchPensionDetail).mockImplementation(async (id) => createSuccess(comparisonPensions.find((pension) => pension.id === id) ?? comparisonPension));
});
afterEach(cleanup);

describe('Student pension comparison', () => {
  it.each([null, { id: 'landlord', role: 'LANDLORD' as const }])('restricts comparison to authenticated students: %s', (user) => {
    auth.user = user;
    render(<Cards />);
    expect(screen.queryByRole('button', { name: 'Comparar: Pensión A' })).toBeNull();
  });

  it('enforces two distinct selections and supports remove, replacement and clear', () => {
    render(<Cards />);
    fireEvent.click(screen.getByRole('button', { name: 'Comparar: Pensión A' }));
    expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Comparar pensiones' }).disabled).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'Comparar: Pensión B' }));
    expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Comparar: Pensión C' }).disabled).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'Quitar Pensión A de la comparación' }));
    fireEvent.click(screen.getByRole('button', { name: 'Comparar: Pensión C' }));
    expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Comparar pensiones' }).disabled).toBe(false);
    fireEvent.click(screen.getByRole('button', { name: 'Limpiar' }));
    expect(screen.queryByRole('complementary')).toBeNull();
  });

  it('uses fresh API data, preserves zero deposit and shows unknown values explicitly', async () => {
    vi.mocked(pensionsService.fetchPensionDetail).mockImplementation(async (id) => createSuccess({ ...comparisonPension, id, title: id, baseMonthlyPrice: 420000, deposit: id === 'pension-a' ? null : 0 }));
    render(<Cards />);
    selectPair();
    const table = await screen.findByRole('table');
    await waitFor(() => expect(within(table).getAllByText('420.000 CLP')).toHaveLength(2));
    expect(within(table).getAllByText('No informada')).toHaveLength(3);
    expect(within(table).getByText('0 CLP')).toBeTruthy();
    expect(within(table).getAllByText('Sin reseñas')).toHaveLength(2);
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar comparación' }));
    expect(screen.getByText('Comparar 2/2')).toBeTruthy();
  });

  it('shows an error and retries instead of displaying stale cards', async () => {
    vi.mocked(pensionsService.fetchPensionDetail).mockResolvedValue(createError('No disponible', 404));
    render(<Cards />);
    selectPair();
    expect(await screen.findByRole('alert')).toBeTruthy();
    expect(screen.queryByRole('table')).toBeNull();
    vi.mocked(pensionsService.fetchPensionDetail).mockResolvedValue(createSuccess(comparisonPension));
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(await screen.findByRole('table')).toBeTruthy();
  });

  it('clears the selection when the user changes or logs out', () => {
    const view = render(<Cards />);
    fireEvent.click(screen.getByRole('button', { name: 'Comparar: Pensión A' }));
    auth.user = { id: 'student-b', role: 'STUDENT' };
    view.rerender(<Cards />);
    expect(screen.queryByRole('complementary')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Comparar: Pensión A' }));
    auth.user = null;
    view.rerender(<Cards />);
    expect(screen.queryByRole('complementary')).toBeNull();
  });

  it('adapts to mobile sections and filters equal rows', async () => {
    desktop = false;
    render(<Cards />);
    selectPair();
    const table = await screen.findByRole('table');
    expect(within(table).queryByText('Características')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Servicios' }));
    expect(within(table).getAllByText('Agua')).toHaveLength(2);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Solo diferencias' }));
    expect(within(table).queryByText('Internet')).toBeNull();
    expect(within(table).getAllByText('Agua')).toHaveLength(2);
    fireEvent.click(screen.getByRole('button', { name: 'Reglas' }));
    expect(within(table).getByText('Sin diferencias en esta sección.')).toBeTruthy();
  });
});
