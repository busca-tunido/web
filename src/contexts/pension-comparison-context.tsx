'use client';

import { createContext, useCallback, useContext, useMemo, useReducer, useState } from 'react';
import { PensionComparison } from '@/components/pensions/pension-comparison';
import { useAuth } from '@/lib/auth-context';
import type { PensionItem } from '@/lib/types';

export const COMPARISON_LIMIT = 2;
export type ComparisonSelection = Pick<PensionItem, 'id' | 'title'>;
export type ComparisonSlot = 0 | 1;
export type ComparisonState = {
  slots: readonly [ComparisonSelection | null, ComparisonSelection | null];
  replacing: ComparisonSlot | null;
};
type ComparisonAction =
  | { type: 'select' | 'toggle'; pension: ComparisonSelection }
  | { type: 'remove'; slot: ComparisonSlot }
  | { type: 'replace'; slot: ComparisonSlot | null }
  | { type: 'clear' };

export const EMPTY_COMPARISON: ComparisonState = { slots: [null, null], replacing: null };

export function comparisonReducer(
  state: ComparisonState,
  action: ComparisonAction,
): ComparisonState {
  if (action.type === 'clear') return EMPTY_COMPARISON;
  if (action.type === 'replace') return { ...state, replacing: action.slot };
  const slots: [ComparisonSelection | null, ComparisonSelection | null] = [...state.slots];
  if (action.type === 'remove') {
    slots[action.slot] = null;
    return { slots, replacing: null };
  }
  const existing = slots.findIndex((item) => item?.id === action.pension.id);
  if (existing !== -1) {
    if (action.type === 'select') return state;
    slots[existing as ComparisonSlot] = null;
    return { slots, replacing: null };
  }
  const target = state.replacing ?? (slots[0] === null ? 0 : 1);
  if (action.type === 'toggle' && slots.every(Boolean) && state.replacing === null) return state;
  slots[target] = action.pension;
  return { slots, replacing: null };
}

type ComparisonContext = ComparisonState & {
  selected: readonly ComparisonSelection[];
  mapVisible: boolean;
  setMapVisible: (visible: boolean) => void;
  toggle: (pension: ComparisonSelection) => void;
  select: (pension: ComparisonSelection) => void;
  remove: (slot: ComparisonSlot) => void;
  replace: (slot: ComparisonSlot | null) => void;
  clear: () => void;
};

const PensionComparisonContext = createContext<ComparisonContext | null>(null);

function PensionComparisonSession({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(comparisonReducer, EMPTY_COMPARISON);
  const [mapVisible, setMapVisible] = useState(false);
  const toggle = useCallback(
    (pension: ComparisonSelection) => dispatch({ type: 'toggle', pension }),
    [],
  );
  const select = useCallback(
    (pension: ComparisonSelection) => dispatch({ type: 'select', pension }),
    [],
  );
  const remove = useCallback((slot: ComparisonSlot) => dispatch({ type: 'remove', slot }), []);
  const replace = useCallback(
    (slot: ComparisonSlot | null) => dispatch({ type: 'replace', slot }),
    [],
  );
  const clear = useCallback(() => dispatch({ type: 'clear' }), []);
  const value = useMemo(
    () => ({
      ...state,
      selected: state.slots.filter((item): item is ComparisonSelection => item !== null),
      mapVisible,
      setMapVisible,
      toggle,
      select,
      remove,
      replace,
      clear,
    }),
    [state, mapVisible, toggle, select, remove, replace, clear],
  );

  return (
    <PensionComparisonContext.Provider value={value}>
      {children}
      {!mapVisible && <PensionComparison />}
    </PensionComparisonContext.Provider>
  );
}

export function PensionComparisonProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return children;
  return (
    <PensionComparisonSession key={user?.id ?? 'visitor'}>{children}</PensionComparisonSession>
  );
}

export function usePensionComparison(): ComparisonContext | null {
  return useContext(PensionComparisonContext);
}
