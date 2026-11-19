import { preloadStudentTab } from '@/lib/student-prefetch';
import type { FavoritePensionSummaryDto, NavTab, PensionItem } from '@/lib/types';

export type StudentTabLayoutMode = 'viewport' | 'scroll';

export type StudentTabConfig = {
  readonly id: NavTab;
  readonly title: string;
  readonly layoutMode: StudentTabLayoutMode;
  readonly showSearchBar: boolean;
  readonly preload: (options?: { isAuthenticated?: boolean; city?: string | null }) => void;
};

export const STUDENT_TAB_CONFIG = {
  explore: {
    id: 'explore',
    title: 'Explorar | BuscaTuNido',
    layoutMode: 'scroll',
    showSearchBar: true,
    preload: (options) => preloadStudentTab('explore', options),
  },
  map: {
    id: 'map',
    title: 'Mapa | BuscaTuNido',
    layoutMode: 'viewport',
    showSearchBar: true,
    preload: (options) => preloadStudentTab('map', options),
  },
  favorites: {
    id: 'favorites',
    title: 'Favoritos | BuscaTuNido',
    layoutMode: 'scroll',
    showSearchBar: true,
    preload: (options) => preloadStudentTab('favorites', options),
  },
  history: {
    id: 'history',
    title: 'Estadías | BuscaTuNido',
    layoutMode: 'scroll',
    showSearchBar: true,
    preload: (options) => preloadStudentTab('history', options),
  },
  account: {
    id: 'account',
    title: 'Cuenta | BuscaTuNido',
    layoutMode: 'scroll',
    showSearchBar: false,
    preload: (options) => preloadStudentTab('account', options),
  },
} as const satisfies Record<NavTab, StudentTabConfig>;

export type StudentShellState = {
  readonly activeTab: NavTab;
  readonly visitedTabs: readonly NavTab[];
};

export type StudentShellAction =
  | { type: 'NAVIGATE_TAB'; tab: NavTab }
  | { type: 'SYNC_ROUTE_TAB'; tab: NavTab };

export function createInitialStudentShellState(initialTab: NavTab): StudentShellState {
  return {
    activeTab: initialTab,
    visitedTabs: [initialTab],
  };
}

export function studentShellReducer(
  state: StudentShellState,
  action: StudentShellAction,
): StudentShellState {
  switch (action.type) {
    case 'NAVIGATE_TAB':
    case 'SYNC_ROUTE_TAB': {
      const nextVisited = state.visitedTabs.includes(action.tab)
        ? state.visitedTabs
        : [...state.visitedTabs, action.tab];

      if (state.activeTab === action.tab && nextVisited === state.visitedTabs) {
        return state;
      }

      return {
        activeTab: action.tab,
        visitedTabs: nextVisited,
      };
    }
  }
}

export type AuthProtectedViewState<T> =
  | { status: 'resolving_auth' }
  | { status: 'guest' }
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'empty' }
  | { status: 'ready'; data: T };

export function deriveAuthProtectedViewState<T>(params: {
  isAuthLoading: boolean;
  isAuthenticated: boolean;
  isDataLoading?: boolean;
  error?: string | null;
  data: T;
  isEmpty?: (data: T) => boolean;
}): AuthProtectedViewState<T> {
  if (params.isAuthLoading) {
    return { status: 'resolving_auth' };
  }
  if (!params.isAuthenticated) {
    return { status: 'guest' };
  }
  if (params.isDataLoading) {
    return { status: 'loading' };
  }
  if (params.error) {
    return { status: 'error', message: params.error };
  }
  if (params.isEmpty?.(params.data)) {
    return { status: 'empty' };
  }
  return { status: 'ready', data: params.data };
}

export type PensionDetailModalState =
  | { status: 'closed' }
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; pension: PensionItem | FavoritePensionSummaryDto };

export function derivePensionDetailModalState(params: {
  isOpen: boolean;
  activePension: PensionItem | FavoritePensionSummaryDto | null;
  isLoading: boolean;
  error: string | null;
}): PensionDetailModalState {
  if (!params.isOpen) {
    return { status: 'closed' };
  }
  if (params.activePension) {
    return { status: 'ready', pension: params.activePension };
  }
  if (params.isLoading) {
    return { status: 'loading' };
  }
  if (params.error) {
    return { status: 'error', message: params.error };
  }
  return { status: 'closed' };
}

export function assertNever(value: never): never {
  throw new Error(`Unhandled state machine branch: ${JSON.stringify(value)}`);
}
