'use client';

import { createContext, useContext, useState } from 'react';
import { PensionComparison } from '@/components/pensions/pension-comparison';
import { useAuth } from '@/lib/auth-context';
import type { PensionItem } from '@/lib/types';

export const COMPARISON_LIMIT = 2;

type ComparisonContext = {
  selected: readonly PensionItem[];
  toggle: (pension: PensionItem) => void;
};

const PensionComparisonContext = createContext<ComparisonContext | null>(null);

function StudentComparisonSession({ children }: { children: React.ReactNode }) {
  const [selected, setSelected] = useState<readonly PensionItem[]>([]);

  const toggle = (pension: PensionItem): void => {
    setSelected((current) =>
      current.some((item) => item.id === pension.id)
        ? current.filter((item) => item.id !== pension.id)
        : current.length < COMPARISON_LIMIT
          ? [...current, pension]
          : current,
    );
  };

  return (
    <PensionComparisonContext.Provider value={{ selected, toggle }}>
      {children}
      <PensionComparison selected={selected} onRemove={toggle} onClear={() => setSelected([])} />
    </PensionComparisonContext.Provider>
  );
}

export function PensionComparisonProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading || user?.role !== 'STUDENT') return children;
  return <StudentComparisonSession key={user.id}>{children}</StudentComparisonSession>;
}

export function usePensionComparison(): ComparisonContext | null {
  return useContext(PensionComparisonContext);
}
