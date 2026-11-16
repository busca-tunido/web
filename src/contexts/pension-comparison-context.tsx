'use client';

import {
  createContext,
  type RefObject,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';
import { PensionComparison } from '@/components/pensions/pension-comparison';
import { useAuth } from '@/lib/auth-context';
import type { PensionItem } from '@/lib/types';

export const COMPARISON_LIMIT = 2;
export type ComparisonSelection = Pick<PensionItem, 'id' | 'title'>;
export type ComparisonSlot = 0 | 1;
export type FlyOriginRect = {
  left: number;
  top: number;
  width: number;
  height: number;
};
export type FlyPulse = {
  id: number;
  rect: FlyOriginRect;
};
export type ComparisonState = {
  slots: readonly [ComparisonSelection | null, ComparisonSelection | null];
  replacing: ComparisonSlot | null;
};
type ComparisonAction =
  | { type: 'select' | 'toggle'; pension: ComparisonSelection }
  | { type: 'remove'; slot: ComparisonSlot }
  | { type: 'replace'; slot: ComparisonSlot | null }
  | { type: 'swap' }
  | { type: 'clear' };

export const EMPTY_COMPARISON: ComparisonState = { slots: [null, null], replacing: null };

export function comparisonReducer(
  state: ComparisonState,
  action: ComparisonAction,
): ComparisonState {
  if (action.type === 'clear') return EMPTY_COMPARISON;
  if (action.type === 'replace') return { ...state, replacing: action.slot };
  if (action.type === 'swap') {
    if (!state.slots[0] || !state.slots[1]) return state;
    return { slots: [state.slots[1], state.slots[0]], replacing: null };
  }
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
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  flyPulse: FlyPulse | null;
  clearFlyPulse: (id: number) => void;
  floatingTargetRef: RefObject<HTMLButtonElement | null>;
  toggle: (pension: ComparisonSelection, sourceRect?: FlyOriginRect | null) => void;
  select: (pension: ComparisonSelection, sourceRect?: FlyOriginRect | null) => void;
  remove: (slot: ComparisonSlot) => void;
  replace: (slot: ComparisonSlot | null) => void;
  swap: () => void;
  clear: () => void;
};

const PensionComparisonContext = createContext<ComparisonContext | null>(null);

function PensionComparisonSession({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(comparisonReducer, EMPTY_COMPARISON);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [flyPulse, setFlyPulse] = useState<FlyPulse | null>(null);
  const flyCounterRef = useRef(0);
  const floatingTargetRef = useRef<HTMLButtonElement | null>(null);
  const slotsRef = useRef(state.slots);
  slotsRef.current = state.slots;

  const openDrawer = useCallback(() => {
    setIsDrawerOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  const clearFlyPulse = useCallback((id: number) => {
    setFlyPulse((current) => (current?.id === id ? null : current));
  }, []);

  const triggerAddEffects = useCallback(
    (sourceRect: FlyOriginRect | null | undefined, currentCount: number) => {
      if (sourceRect) {
        flyCounterRef.current += 1;
        setFlyPulse({ id: flyCounterRef.current, rect: sourceRect });
      }
      if (currentCount === 1) {
        setIsDrawerOpen(true);
      }
    },
    [],
  );

  const toggle = useCallback(
    (pension: ComparisonSelection, sourceRect?: FlyOriginRect | null) => {
      const currentSlots = slotsRef.current;
      const existingIdx = currentSlots.findIndex((item) => item?.id === pension.id);
      const currentCount = currentSlots.filter(Boolean).length;
      dispatch({ type: 'toggle', pension });
      if (existingIdx !== -1) {
        if (currentCount <= 1) {
          setIsDrawerOpen(false);
        }
        return;
      }
      if (currentCount < COMPARISON_LIMIT) {
        triggerAddEffects(sourceRect, currentCount);
      }
    },
    [triggerAddEffects],
  );

  const select = useCallback(
    (pension: ComparisonSelection, sourceRect?: FlyOriginRect | null) => {
      const currentSlots = slotsRef.current;
      const alreadyPresent = currentSlots.some((item) => item?.id === pension.id);
      const currentCount = currentSlots.filter(Boolean).length;
      dispatch({ type: 'select', pension });
      if (!alreadyPresent) {
        triggerAddEffects(sourceRect, currentCount);
      }
    },
    [triggerAddEffects],
  );

  const remove = useCallback((slot: ComparisonSlot) => {
    const remaining = slotsRef.current.filter((item, idx) => idx !== slot && item !== null).length;
    dispatch({ type: 'remove', slot });
    if (remaining === 0) {
      setIsDrawerOpen(false);
    }
  }, []);

  const replace = useCallback(
    (slot: ComparisonSlot | null) => dispatch({ type: 'replace', slot }),
    [],
  );

  const swap = useCallback(() => dispatch({ type: 'swap' }), []);

  const clear = useCallback(() => {
    dispatch({ type: 'clear' });
    setIsDrawerOpen(false);
    setFlyPulse(null);
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      selected: state.slots.filter((item): item is ComparisonSelection => item !== null),
      isDrawerOpen,
      openDrawer,
      closeDrawer,
      flyPulse,
      clearFlyPulse,
      floatingTargetRef,
      toggle,
      select,
      remove,
      replace,
      swap,
      clear,
    }),
    [
      state,
      isDrawerOpen,
      openDrawer,
      closeDrawer,
      flyPulse,
      clearFlyPulse,
      toggle,
      select,
      remove,
      replace,
      swap,
      clear,
    ],
  );

  return (
    <PensionComparisonContext.Provider value={value}>
      {children}
      <PensionComparison />
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
