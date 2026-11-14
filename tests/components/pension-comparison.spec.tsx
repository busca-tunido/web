import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { useEffect } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MapPensionComparison } from '@/components/pensions/map-pension-comparison';
import { PensionCompareButton } from '@/components/pensions/pension-compare-button';
import { PensionComparisonProvider, usePensionComparison } from '@/contexts/pension-comparison-context';
import { createError, createSuccess } from '@/lib/api-response';
import type { UserRole } from '@/lib/types';
import { pensionsService } from '@/services/pensions.service';
import { comparisonPension, comparisonPensions } from '../fixtures/comparison-pensions';

const auth = vi.hoisted(() => ({
  user: { id: 'student-a', role: 'STUDENT' as UserRole } as { id: string; role: UserRole } | null,
  isLoading: false, isFavorite: vi.fn(() => false), toggleFavorite: vi.fn(),
}));
vi.mock('@/lib/auth-context', () => ({ useAuth: () => auth }));
vi.mock('@/services/pensions.service', () => ({ pensionsService: { fetchPensionDetail: vi.fn() } }));

function MapHarness({ visible = true }: { visible?: boolean }) {
  const comparison = usePensionComparison();
  const setMapVisible = comparison?.setMapVisible;
  useEffect(() => { setMapVisible?.(visible); return () => setMapVisible?.(false); }, [setMapVisible, visible]);
  return <>
    {comparisonPensions.map(pension => <div key={pension.id}>
      <PensionCompareButton pension={pension} />
      <button type="button" onClick={() => comparison?.select(pension)}>Abrir marcador {pension.title}</button>
    </div>)}
    {visible && comparison?.selected.length ? <MapPensionComparison mapOnly={false} onToggleMap={vi.fn()} /> : null}
  </>;
}
function App({ visible = true }: { visible?: boolean }) {
  return <PensionComparisonProvider><MapHarness visible={visible} /></PensionComparisonProvider>;
}
function selectA() { fireEvent.click(screen.getByRole('button', { name: 'Comparar: Pensión A' })); }
function selectB() { fireEvent.click(screen.getByRole('button', { name: 'Abrir marcador Pensión B' })); }

beforeEach(() => {
  auth.user = { id: 'student-a', role: 'STUDENT' };
  auth.isLoading = false;
  auth.toggleFavorite.mockReset();
  vi.mocked(pensionsService.fetchPensionDetail).mockReset();
  vi.mocked(pensionsService.fetchPensionDetail).mockImplementation(async id => createSuccess(comparisonPensions.find(p => p.id === id) ?? comparisonPension));
});
afterEach(cleanup);

describe('Integrated map comparison', () => {
  it.each([null, { id: 'landlord', role: 'LANDLORD' as const }])('restricts comparison to students: %s', user => {
    auth.user = user;
    render(<App />);
    expect(screen.queryByRole('button', { name: 'Comparar: Pensión A' })).toBeNull();
  });

  it('pins A immediately and opens B without a comparison modal or duplicate selection', async () => {
    render(<App />);
    selectA();
    expect(screen.getByText('1 de 2 seleccionadas')).toBeTruthy();
    expect(screen.getAllByText('Selecciona otra pensión para comparar').length).toBeGreaterThan(0);
    await screen.findByText('250.000 CLP');
    selectB();
    expect(screen.getByText('2 de 2 seleccionadas')).toBeTruthy();
    await screen.findByText('300.000 CLP');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.getByText('Más económica')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Abrir marcador Pensión A' }));
    expect(screen.getByText('2 de 2 seleccionadas')).toBeTruthy();
    expect(vi.mocked(pensionsService.fetchPensionDetail).mock.calls.filter(([id]) => id === 'pension-a')).toHaveLength(1);
  });

  it('keeps B in its slot, fills empty A, and replaces either slot explicitly', async () => {
    render(<App />);
    selectA(); selectB();
    await screen.findByText('300.000 CLP');
    fireEvent.click(screen.getByRole('button', { name: 'Quitar Pensión A' }));
    expect(screen.getByRole('button', { name: 'Reemplazar B' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Abrir marcador Pensión C' }));
    await screen.findByRole('heading', { name: 'Pensión C' });
    fireEvent.click(screen.getByRole('button', { name: 'Reemplazar A' }));
    fireEvent.click(screen.getByRole('button', { name: 'Abrir marcador Pensión A' }));
    await screen.findByRole('heading', { name: 'Pensión A' });
    fireEvent.click(screen.getByRole('button', { name: 'Abrir marcador Pensión C' }));
    await screen.findByRole('heading', { name: 'Pensión C' });
    expect(screen.queryByRole('heading', { name: 'Pensión B' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Limpiar comparación' }));
    expect(screen.queryByRole('region', { name: 'Comparación de pensiones en el mapa' })).toBeNull();
  });

  it('preserves selection when leaving and returning to the map', async () => {
    const app = render(<App />);
    selectA(); selectB();
    await screen.findByText('300.000 CLP');
    app.rerender(<App visible={false} />);
    expect(screen.getByRole('link', { name: 'Ver comparación' })).toBeTruthy();
    app.rerender(<App />);
    expect(screen.getByText('2 de 2 seleccionadas')).toBeTruthy();
    await screen.findByRole('heading', { name: 'Pensión A' });
  });

  it('supports mobile tabs with arrow keys and preserves favorites', async () => {
    render(<App />);
    selectA(); selectB();
    await screen.findByText('300.000 CLP');
    const [a, b] = screen.getAllByRole('tab');
    expect(b.getAttribute('aria-selected')).toBe('true');
    fireEvent.keyDown(b, { key: 'ArrowLeft' });
    expect(a.getAttribute('aria-selected')).toBe('true');
    fireEvent.click(screen.getByRole('button', { name: 'Guardar en favoritos: Pensión A' }));
    expect(auth.toggleFavorite).toHaveBeenCalledWith('pension-a');
    expect(screen.getByText('2 de 2 seleccionadas')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Volver al modo normal' }));
    expect(screen.queryByRole('tablist')).toBeNull();
  });

  it('shows published zero guarantee and unknown services instead of fabricated values', async () => {
    render(<App />); selectA(); selectB();
    await screen.findByText('300.000 CLP');
    expect(screen.getByText('0 CLP')).toBeTruthy();
    const services = screen.getByRole('region', { name: 'Servicios' });
    expect(within(services).getAllByText('No informado').length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Solo diferencias' }));
    expect(screen.queryByText('Comidas incluidas')).toBeNull();
  });

  it('handles errors per slot and retries; inactive publications never produce winners', async () => {
    vi.mocked(pensionsService.fetchPensionDetail).mockResolvedValue(createError('No disponible', 404));
    render(<App />); selectA();
    expect(await screen.findByRole('alert')).toBeTruthy();
    expect(screen.queryByText('250.000 CLP')).toBeNull();
    vi.mocked(pensionsService.fetchPensionDetail).mockResolvedValue(createSuccess(comparisonPension));
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar Pensión A' }));
    await screen.findByText('250.000 CLP');
    vi.mocked(pensionsService.fetchPensionDetail).mockResolvedValue(createSuccess({ ...comparisonPensions[1], isActive: false }));
    selectB();
    await screen.findByText('Esta publicación ya no está disponible. Reemplázala por otra.');
    expect(screen.queryByText('Más económica')).toBeNull();
  });

  it('ignores late responses after replacing a pension', async () => {
    let resolveOld: (value: ReturnType<typeof createSuccess<typeof comparisonPension>>) => void = () => {};
    vi.mocked(pensionsService.fetchPensionDetail).mockImplementation(id => id === 'pension-a'
      ? new Promise(resolve => { resolveOld = resolve; })
      : Promise.resolve(createSuccess(comparisonPensions.find(p => p.id === id) ?? comparisonPension)));
    render(<App />); selectA();
    fireEvent.click(screen.getByRole('button', { name: 'Reemplazar A' }));
    fireEvent.click(screen.getByRole('button', { name: 'Abrir marcador Pensión C' }));
    await screen.findByRole('heading', { name: 'Pensión C' });
    resolveOld(createSuccess({ ...comparisonPension, title: 'Respuesta antigua' }));
    await waitFor(() => expect(screen.queryByRole('heading', { name: 'Respuesta antigua' })).toBeNull());
  });

  it('resets selection on user change and logout', () => {
    const app = render(<App />); selectA();
    auth.user = { id: 'student-b', role: 'STUDENT' };
    app.rerender(<App />);
    expect(screen.queryByText('1 de 2 seleccionadas')).toBeNull();
    selectA();
    auth.user = null;
    app.rerender(<App />);
    expect(screen.queryByText('1 de 2 seleccionadas')).toBeNull();
  });
});

