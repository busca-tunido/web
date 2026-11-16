import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PensionCompareButton } from '@/components/pensions/pension-compare-button';
import { PensionDetailContent } from '@/components/pensions/pension-detail-content';
import { NavigationProvider, useNavigation } from '@/contexts/navigation-context';
import { PensionComparisonProvider } from '@/contexts/pension-comparison-context';
import { createError, createSuccess } from '@/lib/api-response';
import type { UserRole } from '@/lib/types';
import { pensionsService } from '@/services/pensions.service';
import { comparisonPension, comparisonPensions, comparisonReview } from '../fixtures/comparison-pensions';

const auth = vi.hoisted(() => ({
  user: { id: 'student-a', role: 'STUDENT' as UserRole } as { id: string; role: UserRole } | null,
  isLoading: false,
  isFavorite: vi.fn(() => false),
  toggleFavorite: vi.fn(),
}));
vi.mock('@/lib/auth-context', () => ({ useAuth: () => auth }));
vi.mock('@/services/pensions.service', () => ({ pensionsService: { fetchPensionDetail: vi.fn() } }));
vi.mock('@/hooks/use-pension-reviews', () => ({
  usePensionReviews: () => ({
    reviews: [comparisonReview],
    ratingStats: { average: 5, count: 1 },
    refetch: vi.fn(),
  }),
}));
vi.mock('@/components/pensions/pension-location-map', () => ({
  PensionLocationMap: () => <div>Ubicación de la ficha</div>,
}));
vi.mock('@/components/reviews/publish-review-modal', () => ({
  PublishReviewModal: () => (
    <div role="dialog" aria-label="Publicar reseña">
      Formulario de publicación
    </div>
  ),
}));
vi.mock('motion/react', () => ({
  motion: {
    div: (props: ComponentProps<'div'>) => <div className={props.className}>{props.children}</div>,
  },
  AnimatePresence: (props: { children: React.ReactNode }) => props.children,
}));

function Harness() {
  return (
    <div>
      {comparisonPensions.map((pension) => (
        <div key={pension.id}>
          <PensionCompareButton pension={pension} variant="icon" />
        </div>
      ))}
    </div>
  );
}

function App() {
  return (
    <PensionComparisonProvider>
      <Harness />
    </PensionComparisonProvider>
  );
}

function DetailNavigation() {
  const navigation = useNavigation();
  return (
    <>
      <button type="button" onClick={() => navigation.openPensionDetail(comparisonPension)}>
        Abrir ficha
      </button>
      {navigation.isPensionDetailOpen && (
        <PensionCompareButton pension={comparisonPension} variant="detail" />
      )}
      <output data-testid="navigation">
        {navigation.activeTab}/{navigation.isPensionDetailOpen ? 'abierta' : 'cerrada'}/
        {navigation.selectedPension?.id}
      </output>
    </>
  );
}

function selectCompare(title: string) {
  fireEvent.click(screen.getByRole('button', { name: `Comparar: ${title}` }));
}

async function openPair() {
  selectCompare('Pensión A');
  await screen.findByRole('button', { name: 'Abrir comparación (1)' });
  selectCompare('Pensión B');
  return screen.findByRole('dialog', { name: 'Comparación de dos pensiones' });
}

beforeEach(() => {
  auth.user = { id: 'student-a', role: 'STUDENT' };
  auth.isLoading = false;
  auth.toggleFavorite.mockReset();
  vi.mocked(pensionsService.fetchPensionDetail).mockReset();
  vi.mocked(pensionsService.fetchPensionDetail).mockImplementation(async (id) =>
    createSuccess(comparisonPensions.find((p) => p.id === id) ?? comparisonPension),
  );
});
afterEach(cleanup);

describe('Comparison floating pill and drawer flow', () => {
  it('renders icon-only compare buttons without card text', () => {
    render(<App />);
    const btn = screen.getByRole('button', { name: 'Comparar: Pensión A' });
    expect(btn.textContent).toBe('');
    expect(screen.queryByText('Comparar pensión')).toBeNull();
  });

  it('keeps the user on current tab when clicking compare inside detail without navigating away', () => {
    render(
      <PensionComparisonProvider>
        <NavigationProvider initialTab="explore" initialNavigationState={{ tab: 'explore' }}>
          <DetailNavigation />
        </NavigationProvider>
      </PensionComparisonProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Abrir ficha' }));
    fireEvent.click(screen.getByRole('button', { name: 'Comparar: Pensión A' }));
    expect(screen.getByTestId('navigation').textContent).toBe('explore/abierta/pension-a');
    expect(screen.getByRole('button', { name: 'Abrir comparación (1)' })).toBeTruthy();
  });

  it('opens single-pension special drawer from floating pill and removes banned instruction texts', async () => {
    render(<App />);
    selectCompare('Pensión A');
    const pill = await screen.findByRole('button', { name: 'Abrir comparación (1)' });
    fireEvent.click(pill);
    const dialog = await screen.findByRole('dialog', { name: 'Pensión seleccionada para comparar' });
    await within(dialog).findByRole('heading', { name: 'Pensión A' });
    expect(within(dialog).getByText('Pensión en comparación')).toBeTruthy();
    expect(within(dialog).getByRole('button', { name: 'Dejar de comparar: Pensión A' })).toBeTruthy();
    expect(within(dialog).getByRole('button', { name: 'Minimizar comparación' })).toBeTruthy();
    expect(within(dialog).queryByRole('button', { name: /cerrar|quitar pensión b/i })).toBeNull();
    expect(screen.queryByText('1 de 2 seleccionadas')).toBeNull();
    expect(screen.queryByText('Selecciona otra pensión para comparar')).toBeNull();
    expect(screen.queryByText('Tu comparación sigue guardada en el mapa.')).toBeNull();
  });

  it.each(['STUDENT', 'LANDLORD', 'MODERATOR', 'ADMIN'] as const)(
    'allows registered visitors with role %s to compare',
    async (role) => {
      auth.user = { id: role.toLowerCase(), role };
      render(<App />);
      const dialog = await openPair();
      await within(dialog).findByRole('heading', { name: 'Pensión B' });
      expect(within(dialog).getByRole('heading', { name: 'Pensión A' })).toBeTruthy();
    },
  );

  it('allows anonymous visitors to open pair drawer, swap A and B, minimize keeping both, and cancel via floating pill X', async () => {
    auth.user = null;
    render(<App />);
    const dialog = await openPair();
    await within(dialog).findByRole('heading', { name: 'Pensión B' });
    expect(within(dialog).getAllByText('Descripción de la Pensión')).toHaveLength(2);
    expect(within(dialog).getAllByText(comparisonReview.comment, { exact: false })).toHaveLength(2);
    expect(within(dialog).getByText('Más económica')).toBeTruthy();
    expect(screen.queryByText('2 de 2 seleccionadas')).toBeNull();
    expect(
      screen.queryByText(/La pensión A permanece fija hasta que pulses/i),
    ).toBeNull();
    expect(screen.queryByText(/Las ventajas usan precios/i)).toBeNull();
    expect(within(dialog).queryByRole('button', { name: /Elegir otra pensión|Quitar Pensión B/i })).toBeNull();

    fireEvent.click(within(dialog).getByRole('button', { name: 'Intercambiar Pensión A y Pensión B' }));
    expect(within(dialog).getByRole('tab', { name: /Pensión A.*Pensión B/i })).toBeTruthy();
    expect(within(dialog).getByRole('tab', { name: /Pensión B.*Pensión A/i })).toBeTruthy();

    fireEvent.click(within(dialog).getByRole('button', { name: 'Minimizar comparación' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    const pillWithTwo = screen.getByRole('button', { name: 'Abrir comparación (2)' });
    fireEvent.click(pillWithTwo);
    const reopened = await screen.findByRole('dialog', { name: 'Comparación de dos pensiones' });
    expect(within(reopened).getByRole('heading', { name: 'Pensión A' })).toBeTruthy();
    expect(within(reopened).getByRole('heading', { name: 'Pensión B' })).toBeTruthy();

    fireEvent.click(within(reopened).getByRole('button', { name: 'Dejar de comparar: Pensión B' }));
    const singleDialog = await screen.findByRole('dialog', { name: 'Pensión seleccionada para comparar' });
    expect(within(singleDialog).getByRole('heading', { name: 'Pensión A' })).toBeTruthy();

    fireEvent.click(within(singleDialog).getByRole('button', { name: 'Minimizar comparación' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(screen.getByRole('button', { name: 'Abrir comparación (1)' })).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar comparación' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(screen.queryByRole('button', { name: /Abrir comparación/i })).toBeNull();
  });

  it('resets comparison state when authenticated user changes', async () => {
    const app = render(<App />);
    await openPair();
    expect(screen.getByRole('dialog', { name: 'Comparación de dos pensiones' })).toBeTruthy();
    auth.user = { id: 'student-b', role: 'STUDENT' };
    app.rerender(<App />);
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(screen.queryByRole('button', { name: /Abrir comparación/i })).toBeNull();
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
  });

  it('keeps per-slot errors retryable and excludes inactive publications from advantages', async () => {
    vi.mocked(pensionsService.fetchPensionDetail).mockResolvedValue(createError('No disponible', 404));
    render(<App />);
    selectCompare('Pensión A');
    fireEvent.click(await screen.findByRole('button', { name: 'Abrir comparación (1)' }));
    await screen.findByRole('alert');
    vi.mocked(pensionsService.fetchPensionDetail).mockResolvedValue(createSuccess(comparisonPension));
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    await screen.findByRole('heading', { name: 'Pensión A' });
    fireEvent.click(screen.getByRole('button', { name: 'Minimizar comparación' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    vi.mocked(pensionsService.fetchPensionDetail).mockResolvedValue(
      createSuccess({ ...comparisonPensions[1], isActive: false }),
    );
    selectCompare('Pensión B');
    await screen.findByText('Esta publicación ya no está disponible.');
    expect(screen.queryByText('Más económica')).toBeNull();
  });

  it.each(['contactPhone', 'contactWhatsapp'] as const)(
    'blocks %s and publishing with a visible comparison notice',
    async (field) => {
      render(
        <PensionComparisonProvider>
          <PensionDetailContent
            pension={{ ...comparisonPension, [field]: '+56 9 1234 5678' }}
            mode="comparison"
          />
        </PensionComparisonProvider>,
      );
      fireEvent.click(screen.getByRole('button', { name: 'Consultar Disponibilidad' }));
      expect(screen.getByRole('alert').textContent).toContain('Estás en modo comparación');
      expect(screen.queryByRole('link', { name: 'Consultar Disponibilidad' })).toBeNull();
      fireEvent.click(screen.getByRole('button', { name: 'Publicar una reseña' }));
      expect(screen.queryByRole('dialog', { name: 'Publicar reseña' })).toBeNull();
    },
  );

  it('keeps guest contact and review buttons informational inside comparison', () => {
    auth.user = null;
    render(
      <PensionComparisonProvider>
        <PensionDetailContent
          pension={{ ...comparisonPension, contactPhone: '+56 9 1234 5678' }}
          mode="comparison"
        />
      </PensionComparisonProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Publicar una reseña' }));
    expect(screen.getByRole('alert').textContent).toContain('Estás en modo comparación');
    expect(screen.queryByRole('dialog')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Consultar Disponibilidad' }));
    expect(screen.queryByRole('link', { name: 'Consultar Disponibilidad' })).toBeNull();
    expect(auth.toggleFavorite).not.toHaveBeenCalled();
  });

  it('keeps API rating aggregates consistent with comparison badges while reviews load', () => {
    render(
      <PensionComparisonProvider>
        <PensionDetailContent
          pension={{ ...comparisonPension, ratingAverage: 4.2, ratingCount: 12, reviewsCount: 12 }}
          mode="comparison"
        />
      </PensionComparisonProvider>,
    );
    expect(screen.getByRole('button', { name: /4.2.*12 reseñas/ })).toBeTruthy();
    expect(screen.queryByText('5.0')).toBeNull();
  });

  it('normal details retain contact links and review publishing', () => {
    render(
      <PensionComparisonProvider>
        <PensionDetailContent
          pension={{ ...comparisonPension, contactPhone: '+56 9 1234 5678' }}
        />
      </PensionComparisonProvider>,
    );
    expect(screen.getByRole('link', { name: 'Consultar Disponibilidad' }).getAttribute('href')).toBe(
      'tel:+56912345678',
    );
    fireEvent.click(screen.getByRole('button', { name: 'Publicar una reseña' }));
    expect(screen.getByRole('dialog', { name: 'Publicar reseña' })).toBeTruthy();
    expect(screen.queryByRole('alert')).toBeNull();
  });
});

