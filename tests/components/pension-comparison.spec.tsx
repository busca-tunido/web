import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { useEffect, type ComponentProps } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MapPensionComparison } from '@/components/pensions/map-pension-comparison';
import { PensionCompareButton } from '@/components/pensions/pension-compare-button';
import { PensionDetailContent } from '@/components/pensions/pension-detail-content';
import { PensionComparisonProvider, usePensionComparison } from '@/contexts/pension-comparison-context';
import { NavigationProvider, useNavigation } from '@/contexts/navigation-context';
import { createError, createSuccess } from '@/lib/api-response';
import type { UserRole } from '@/lib/types';
import { pensionsService } from '@/services/pensions.service';
import { comparisonPension, comparisonPensions, comparisonReview } from '../fixtures/comparison-pensions';

const auth = vi.hoisted(() => ({
  user: { id: 'student-a', role: 'STUDENT' as UserRole } as { id: string; role: UserRole } | null,
  isLoading: false, isFavorite: vi.fn(() => false), toggleFavorite: vi.fn(),
}));
vi.mock('@/lib/auth-context', () => ({ useAuth: () => auth }));
vi.mock('@/services/pensions.service', () => ({ pensionsService: { fetchPensionDetail: vi.fn() } }));
vi.mock('@/hooks/use-pension-reviews', () => ({ usePensionReviews: () => ({
  reviews: [comparisonReview], ratingStats: { average: 5, count: 1 }, refetch: vi.fn(),
}) }));
vi.mock('@/components/pensions/pension-location-map', () => ({ PensionLocationMap: () => <div>Ubicación de la ficha</div> }));
vi.mock('@/components/reviews/publish-review-modal', () => ({ PublishReviewModal: () => <div role="dialog" aria-label="Publicar reseña">Formulario de publicación</div> }));
vi.mock('motion/react', () => ({ motion: {
  div: (props: ComponentProps<'div'>) => <div className={props.className}>{props.children}</div>,
}, AnimatePresence: (props: { children: React.ReactNode }) => props.children }));

const chooseAnother = vi.fn();
function MapHarness({ visible = true }: { visible?: boolean }) {
  const comparison = usePensionComparison();
  const setMapVisible = comparison?.setMapVisible;
  useEffect(() => { setMapVisible?.(visible); return () => setMapVisible?.(false); }, [setMapVisible, visible]);
  return <>
    {comparisonPensions.map(pension => <div key={pension.id}>
      <PensionCompareButton pension={pension} />
      <button type="button" onClick={() => comparison?.select(pension)}>Abrir marcador {pension.title}</button>
    </div>)}
    {visible && comparison?.selected.length ? <MapPensionComparison mapOnly={false} onToggleMap={vi.fn()} onChooseAnother={chooseAnother} /> : null}
  </>;
}
function App({ visible = true }: { visible?: boolean }) {
  return <PensionComparisonProvider><MapHarness visible={visible} /></PensionComparisonProvider>;
}
function DetailNavigation() {
  const navigation = useNavigation();
  return <><button type="button" onClick={() => navigation.openPensionDetail(comparisonPension)}>Abrir ficha</button>
    {navigation.isPensionDetailOpen && <PensionCompareButton pension={comparisonPension} variant="detail" />}
    <output data-testid="navigation">{navigation.activeTab}/{navigation.isPensionDetailOpen ? 'abierta' : 'cerrada'}/{navigation.selectedPension?.id}</output>
  </>;
}
function selectA() { fireEvent.click(screen.getByRole('button', { name: 'Comparar: Pensión A' })); }
function selectB() { fireEvent.click(screen.getByRole('button', { name: 'Abrir marcador Pensión B' })); }
async function openPair() {
  selectA();
  await screen.findByRole('heading', { name: 'Pensión A' });
  selectB();
  return screen.findByRole('dialog', { name: 'Comparación de dos pensiones' });
}

beforeEach(() => {
  auth.user = { id: 'student-a', role: 'STUDENT' };
  auth.isLoading = false;
  auth.toggleFavorite.mockReset();
  chooseAnother.mockReset();
  vi.mocked(pensionsService.fetchPensionDetail).mockReset();
  vi.mocked(pensionsService.fetchPensionDetail).mockImplementation(async id => createSuccess(comparisonPensions.find(p => p.id === id) ?? comparisonPension));
});
afterEach(cleanup);

describe('Fullscreen comparison with a fixed left pension', () => {
  it('moves the open detail to the map without a history-back race', () => {
    const back = vi.spyOn(window.history, 'back');
    render(<PensionComparisonProvider><NavigationProvider initialTab="explore" initialNavigationState={{ tab: 'explore' }}><DetailNavigation /></NavigationProvider></PensionComparisonProvider>);
    fireEvent.click(screen.getByRole('button', { name: 'Abrir ficha' }));
    fireEvent.click(screen.getByRole('button', { name: 'Comparar: Pensión A' }));
    expect(screen.getByTestId('navigation').textContent).toBe('map/cerrada/pension-a');
    expect(back).not.toHaveBeenCalled();
    back.mockRestore();
  });

  it.each(['STUDENT', 'LANDLORD', 'MODERATOR', 'ADMIN'] as const)('allows registered public-map visitors with role %s', async role => {
    auth.user = { id: role.toLowerCase(), role };
    render(<App />);
    const dialog = await openPair();
    await within(dialog).findByRole('heading', { name: 'Pensión B' });
    expect(within(dialog).getByRole('button', { name: 'Dejar de comparar: Pensión A' }).textContent).toContain('Dejar de comparar');
  });

  it('lets an anonymous visitor compare, close B, pick another and stop comparing A without logging in', async () => {
    auth.user = null;
    render(<App />);
    const dialog = await openPair();
    await within(dialog).findByRole('heading', { name: 'Pensión B' });
    expect(within(dialog).getByRole('button', { name: 'Dejar de comparar: Pensión A' }).textContent).toContain('Dejar de comparar');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Quitar Pensión B y volver al mapa' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(screen.getByRole('heading', { name: 'Pensión A' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Abrir marcador Pensión C' }));
    const next = await screen.findByRole('dialog', { name: 'Comparación de dos pensiones' });
    await within(next).findByRole('heading', { name: 'Pensión C' });
    fireEvent.click(within(next).getByRole('button', { name: 'Dejar de comparar: Pensión A' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(screen.getByRole('heading', { name: 'Pensión C' })).toBeTruthy();
  });

  it('uses the normal detail and real review preview in a fullscreen comparison', async () => {
    render(<App />);
    const dialog = await openPair();
    await within(dialog).findByRole('heading', { name: 'Pensión B' });
    expect(dialog.className).toContain('max-w-none');
    expect(within(dialog).getAllByText('Descripción de la Pensión')).toHaveLength(2);
    expect(within(dialog).getAllByText(comparisonReview.comment, { exact: false })).toHaveLength(2);
    expect(within(dialog).getByText('Más económica')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Quitar Pensión A' })).toBeNull();
  });

  it('the X removes only B and keeps A for repeated comparisons without refetching A', async () => {
    render(<App />);
    await openPair();
    fireEvent.click(screen.getByRole('button', { name: 'Quitar Pensión B y volver al mapa' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(screen.getByRole('heading', { name: 'Pensión A' })).toBeTruthy();
    expect(screen.getByText('1 de 2 seleccionadas')).toBeTruthy();
    expect(chooseAnother).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole('button', { name: 'Abrir marcador Pensión C' }));
    const dialog = await screen.findByRole('dialog', { name: 'Comparación de dos pensiones' });
    await within(dialog).findByRole('heading', { name: 'Pensión C' });
    expect(within(dialog).getByRole('heading', { name: 'Pensión A' })).toBeTruthy();
    expect(vi.mocked(pensionsService.fetchPensionDetail).mock.calls.filter(([id]) => id === 'pension-a')).toHaveLength(1);
  });

  it('unmarks A only through its comparison toggle and preserves B in its own slot', async () => {
    render(<App />);
    const dialog = await openPair();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Dejar de comparar: Pensión A' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(screen.getByRole('heading', { name: 'Pensión B' })).toBeTruthy();
    expect(screen.getByText('Selecciona la pensión que quieres fijar a la izquierda.')).toBeTruthy();
    expect(screen.queryByRole('heading', { name: 'Pensión A' })).toBeNull();
  });

  it('preserves comparisons when leaving the map and resets on user changes', async () => {
    const app = render(<App />);
    await openPair();
    app.rerender(<App visible={false} />);
    await screen.findByRole('link', { name: 'Ver comparación' });
    app.rerender(<App />);
    await screen.findByRole('dialog', { name: 'Comparación de dos pensiones' });
    auth.user = { id: 'student-b', role: 'STUDENT' };
    app.rerender(<App />);
    expect(screen.queryByText('2 de 2 seleccionadas')).toBeNull();
  });

  it('supports keyboard mobile tabs and keeps favorites available', async () => {
    render(<App />);
    const dialog = await openPair();
    await within(dialog).findByRole('heading', { name: 'Pensión B' });
    const [a, b] = within(dialog).getAllByRole('tab');
    fireEvent.keyDown(b, { key: 'ArrowLeft' });
    expect(a.getAttribute('aria-selected')).toBe('true');
    fireEvent.click(within(dialog).getAllByRole('button', { name: 'Guardar en favoritos' })[0]);
    expect(auth.toggleFavorite).toHaveBeenCalledWith('pension-a');
    expect(screen.getByText('2 de 2 seleccionadas')).toBeTruthy();
  });

  it('keeps per-slot errors retryable and excludes inactive publications from advantages', async () => {
    vi.mocked(pensionsService.fetchPensionDetail).mockResolvedValue(createError('No disponible', 404));
    render(<App />); selectA();
    await screen.findByRole('alert');
    vi.mocked(pensionsService.fetchPensionDetail).mockResolvedValue(createSuccess(comparisonPension));
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar Pensión A' }));
    await screen.findByRole('heading', { name: 'Pensión A' });
    vi.mocked(pensionsService.fetchPensionDetail).mockResolvedValue(createSuccess({ ...comparisonPensions[1], isActive: false }));
    selectB();
    await screen.findByText('Esta publicación ya no está disponible. Reemplázala por otra.');
    expect(screen.queryByText('Más económica')).toBeNull();
  });

  it.each(['contactPhone', 'contactWhatsapp'] as const)('blocks %s and publishing with a visible comparison notice', async field => {
    render(<PensionComparisonProvider><PensionDetailContent pension={{ ...comparisonPension, [field]: '+56 9 1234 5678' }} mode="comparison" /></PensionComparisonProvider>);
    fireEvent.click(screen.getByRole('button', { name: 'Consultar Disponibilidad' }));
    expect(screen.getByRole('alert').textContent).toContain('Estás en modo comparación');
    expect(screen.queryByRole('link', { name: 'Consultar Disponibilidad' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Publicar una reseña' }));
    expect(screen.queryByRole('dialog', { name: 'Publicar reseña' })).toBeNull();
  });

  it('keeps guest contact and review buttons informational inside comparison', () => {
    auth.user = null;
    render(<PensionComparisonProvider><PensionDetailContent pension={{ ...comparisonPension, contactPhone: '+56 9 1234 5678' }} mode="comparison" /></PensionComparisonProvider>);
    fireEvent.click(screen.getByRole('button', { name: 'Publicar una reseña' }));
    expect(screen.getByRole('alert').textContent).toContain('Estás en modo comparación');
    expect(screen.queryByRole('dialog')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Consultar Disponibilidad' }));
    expect(screen.queryByRole('link', { name: 'Consultar Disponibilidad' })).toBeNull();
    expect(auth.toggleFavorite).not.toHaveBeenCalled();
  });

  it('keeps API rating aggregates consistent with comparison badges while reviews load', () => {
    render(<PensionComparisonProvider><PensionDetailContent pension={{ ...comparisonPension, ratingAverage: 4.2, ratingCount: 12, reviewsCount: 12 }} mode="comparison" /></PensionComparisonProvider>);
    expect(screen.getByRole('button', { name: /4.2.*12 reseñas/ })).toBeTruthy();
    expect(screen.queryByText('5.0')).toBeNull();
  });

  it('normal details retain contact links and review publishing', () => {
    render(<PensionComparisonProvider><PensionDetailContent pension={{ ...comparisonPension, contactPhone: '+56 9 1234 5678' }} /></PensionComparisonProvider>);
    expect(screen.getByRole('link', { name: 'Consultar Disponibilidad' }).getAttribute('href')).toBe('tel:+56912345678');
    fireEvent.click(screen.getByRole('button', { name: 'Publicar una reseña' }));
    expect(screen.getByRole('dialog', { name: 'Publicar reseña' })).toBeTruthy();
    expect(screen.queryByRole('alert')).toBeNull();
  });
});

