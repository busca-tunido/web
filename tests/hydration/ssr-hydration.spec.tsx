import { act, cleanup } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { hydrateRoot, type Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AccountThemeCard } from '@/components/account/account-primitives';
import { PensionCard } from '@/components/pensions/pension-card';
import { ReviewCard } from '@/components/reviews/review-card';
import { LandlordAppShell } from '@/components/shells/landlord-app-shell';
import { RoleRouter } from '@/components/shells/role-router';
import { BrandLogo } from '@/components/ui/brand-logo';
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalTitle,
} from '@/components/ui/responsive-modal';
import { LandlordProvider, useLandlord } from '@/contexts/landlord-context';
import { SearchFiltersProvider, useSearchFilters } from '@/contexts/search-filters-context';
import { useStayHistory } from '@/hooks/use-stay-history';
import { useStudentFavorites } from '@/hooks/use-student-favorites';
import { useUrlNavigationState } from '@/hooks/use-url-navigation-state';
import { createSuccess } from '@/lib/api-response';
import { AuthProvider } from '@/lib/auth-context';
import { formatChileDate } from '@/lib/format-utils';
import { ThemeProvider } from '@/lib/theme-context';
import type { PensionItem, PensionReview } from '@/lib/types';
import { favoritesService } from '@/services/favorites.service';
import { pensionsService } from '@/services/pensions.service';
import { staysService } from '@/services/stays.service';

vi.mock('@/components/shells/student-app-shell', () => ({
  StudentAppShell: ({ initialTab }: { initialTab?: string }) => (
    <div data-testid="student-shell">{initialTab ?? 'explore'}</div>
  ),
}));

vi.mock('@/components/pensions/pension-compare-button', () => ({
  PensionCompareButton: () => null,
}));

vi.mock('motion/react', () => ({
  motion: {
    article: ({ children, ...rest }: Record<string, unknown>) => (
      <article className={rest.className as string}>{children as ReactNode}</article>
    ),
    span: ({ children, ...rest }: Record<string, unknown>) => (
      <span className={rest.className as string}>{children as ReactNode}</span>
    ),
    button: ({ children, onClick, className, ...rest }: Record<string, unknown>) => (
      <button
        type="button"
        onClick={onClick as React.MouseEventHandler<HTMLButtonElement>}
        className={className as string}
        aria-label={rest['aria-label'] as string}
      >
        {children as ReactNode}
      </button>
    ),
    div: ({ children, className }: Record<string, unknown>) => (
      <div className={className as string}>{children as ReactNode}</div>
    ),
  },
  AnimatePresence: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

function StayHistoryProbe() {
  const { expectedCount } = useStayHistory();
  return <div data-testid="stays-count">{expectedCount}</div>;
}

function FavoritesProbe() {
  const { favorites } = useStudentFavorites();
  return <div data-testid="favs-count">{favorites.length}</div>;
}

function SearchAndNavProbe() {
  const { filters } = useSearchFilters();
  const nav = useUrlNavigationState();
  return (
    <div data-testid="url-probe">
      {nav.tab}:{filters.city ?? ''}:{filters.query}
    </div>
  );
}

function LandlordTabProbe() {
  const { activeTab } = useLandlord();
  return <div data-testid="landlord-tab">{activeTab}</div>;
}

const samplePension: PensionItem = {
  id: 'pen-1',
  slug: 'pension-santiago',
  title: 'Pensión Santiago Centro',
  description: 'A pasos del metro',
  address: 'Alameda 100',
  neighborhood: 'Centro',
  city: 'Santiago',
  latitude: -33.45,
  longitude: -70.66,
  baseMonthlyPrice: 145000,
  currency: 'CLP',
  ratingAverage: 4.8,
  ratingCount: 6,
  reviewsCount: 6,
  verificationStatus: 'OFFICIALLY_VERIFIED',
  isActive: true,
  images: [],
  nearbyUniversities: [],
  _count: { reviews: 6, rooms: 2 },
  waterIncluded: true,
  electricityIncluded: true,
  gasIncluded: true,
  internetIncluded: true,
  guestsAllowed: true,
  smokingAllowed: false,
  petsAllowed: false,
  genderPreference: 'ANY',
  amenitySlugs: [],
  amenities: [],
  rooms: [],
};

const sampleReview: PensionReview = {
  id: 'rev-1',
  pensionId: 'pen-1',
  userId: 'usr-1',
  rating: 5,
  overallRating: 5,
  comment: 'Excelente estadía',
  createdAt: '2026-04-01T02:00:00.000Z',
  isVerifiedStay: true,
  isResidentVerified: true,
  isAnonymous: false,
  helpfulCount: 3,
  images: [],
  user: {
    id: 'usr-1',
    firstName: 'Camila',
    lastName: 'Rojas',
  },
};

async function assertCleanHydration(
  element: React.ReactElement,
  prepareClientEnv?: () => void,
): Promise<{ root: Root; container: HTMLDivElement }> {
  const originalWindow = globalThis.window;
  const originalDocument = globalThis.document;
  vi.stubGlobal('window', undefined);
  vi.stubGlobal('document', undefined);

  let ssrHtml = '';
  try {
    ssrHtml = renderToString(element);
  } finally {
    vi.stubGlobal('window', originalWindow);
    vi.stubGlobal('document', originalDocument);
  }

  prepareClientEnv?.();

  const container = document.createElement('div');
  container.innerHTML = ssrHtml;
  document.body.appendChild(container);

  const recoverableErrors: unknown[] = [];
  const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  let root!: Root;
  await act(async () => {
    root = hydrateRoot(container, element, {
      onRecoverableError: (error) => {
        recoverableErrors.push(error);
      },
    });
  });

  const hydrationConsoleErrors = consoleErrorSpy.mock.calls.filter((args) =>
    args.some((arg) => String(arg).toLowerCase().includes('hydrat')),
  );
  consoleErrorSpy.mockRestore();

  expect(recoverableErrors).toHaveLength(0);
  expect(hydrationConsoleErrors).toHaveLength(0);

  return { root, container };
}

describe('SSR Hydration safety across Guest, Student, and Landlord flows', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    window.localStorage.clear();
    window.sessionStorage.clear();
    window.history.replaceState(null, '', '/');
    document.body.innerHTML = '';
  });

  it('hydrates RoleRouter cleanly even when client localStorage holds a LANDLORD session', async () => {
    const { root } = await assertCleanHydration(
      <AuthProvider>
        <RoleRouter initialData={{ totalPensions: 10 }} initialTab="explore" />
      </AuthProvider>,
      () => {
        window.localStorage.setItem(
          'tunido_user',
          JSON.stringify({ id: 'u1', email: 'l@test.cl', role: 'LANDLORD' }),
        );
      },
    );
    await act(async () => {
      root.unmount();
    });
  });

  it('hydrates student stay history skeleton count cleanly despite sessionStorage override', async () => {
    vi.spyOn(staysService, 'fetchStudentStays').mockResolvedValue(createSuccess([]));
    const { root } = await assertCleanHydration(<StayHistoryProbe />, () => {
      window.sessionStorage.setItem('tunido_stays_count', '7');
    });
    await act(async () => {
      root.unmount();
    });
  });

  it('hydrates student favorites cleanly even when localStorage has saved favorites', async () => {
    vi.spyOn(favoritesService, 'fetchStudentFavorites').mockResolvedValue(createSuccess([]));
    const { root } = await assertCleanHydration(<FavoritesProbe />, () => {
      window.localStorage.setItem('tunido_favs', JSON.stringify(['pen-1', 'pen-2']));
    });
    await act(async () => {
      root.unmount();
    });
  });

  it('hydrates SearchFiltersProvider and useUrlNavigationState cleanly with query params in URL', async () => {
    const { root } = await assertCleanHydration(
      <SearchFiltersProvider>
        <SearchAndNavProbe />
      </SearchFiltersProvider>,
      () => {
        window.history.replaceState(null, '', '/?tab=map&city=Valparaiso&uni=UV');
      },
    );
    await act(async () => {
      root.unmount();
    });
  });

  it('hydrates LandlordProvider cleanly even when browser pathname differs from initialTab', async () => {
    const { root } = await assertCleanHydration(
      <AuthProvider>
        <LandlordProvider initialTab="pension">
          <LandlordTabProbe />
        </LandlordProvider>
      </AuthProvider>,
      () => {
        window.history.replaceState(null, '', '/landlord/proposals');
      },
    );
    await act(async () => {
      root.unmount();
    });
  });

  it('hydrates public guest components (BrandLogo, PensionCard, ReviewCard) cleanly with deterministic Chile dates', async () => {
    const formattedBoundaryDate = formatChileDate('2026-04-01T02:00:00.000Z', {
      month: 'long',
      year: 'numeric',
    });
    expect(formattedBoundaryDate.toLowerCase()).toContain('marzo');

    const tree = createElement(
      'div',
      null,
      <BrandLogo size="md" showSubtitle />,
      <PensionCard
        pension={samplePension}
        isFavorite={false}
        onToggleFavorite={() => {}}
        onSelectPension={() => {}}
      />,
      <ReviewCard review={sampleReview} />,
    );

    const { root } = await assertCleanHydration(tree);
    await act(async () => {
      root.unmount();
    });
  });

  it('hydrates AccountThemeCard cleanly without flashing Dark before resolving stored Light theme', async () => {
    const { root, container } = await assertCleanHydration(
      <ThemeProvider>
        <AccountThemeCard />
      </ThemeProvider>,
      () => {
        window.localStorage.setItem('tunido_theme', 'light');
      },
    );

    expect(container.textContent).toContain('Claro');
    expect(container.textContent).not.toContain('dark');
    await act(async () => {
      root.unmount();
    });
  });

  it('hydrates ResponsiveModal with open=true without flashing mobile Drawer before mount', async () => {
    const { root } = await assertCleanHydration(
      <ResponsiveModal open={true} onOpenChange={() => {}}>
        <ResponsiveModalContent showClose={false}>
          <ResponsiveModalTitle>Deep-linked modal</ResponsiveModalTitle>
        </ResponsiveModalContent>
      </ResponsiveModal>,
    );

    await act(async () => {
      root.unmount();
    });
  });

  it('hydrates LandlordAppShell SSR markup cleanly when hasServerLandlordSession is true', async () => {
    vi.spyOn(pensionsService, 'fetchMinePensions').mockResolvedValue(createSuccess([]));

    const { root, container } = await assertCleanHydration(
      <AuthProvider>
        <LandlordAppShell initialTab="pensions" hasServerLandlordSession={true} />
      </AuthProvider>,
      () => {
        window.localStorage.setItem(
          'tunido_user',
          JSON.stringify({ id: 'u-landlord', email: 'owner@test.cl', role: 'LANDLORD' }),
        );
        window.localStorage.setItem('tunido_token', 'tok-test');
      },
    );

    expect(container.querySelector('#landlord-mobile-header')).not.toBeNull();
    await act(async () => {
      root.unmount();
    });
  });
});
