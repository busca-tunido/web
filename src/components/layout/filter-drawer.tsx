'use client';

import { Check, RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import type { SearchFilters } from '@/lib/types';

type FilterDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  filters: SearchFilters;
  onApply: (filters: SearchFilters) => void;
};

export function FilterDrawer({ isOpen, onClose, filters, onApply }: FilterDrawerProps) {
  const [localFilters, setLocalFilters] = useState<SearchFilters>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleReset = () => {
    const reset: SearchFilters = {
      query: localFilters.query,
      city: localFilters.city,
      maxPriceClp: undefined,
      hasPrivateBathroom: undefined,
      includesMeals: undefined,
      genderPreference: 'ALL',
    };
    setLocalFilters(reset);
    onApply(reset);
    onClose();
  };

  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent
        id="filter-drawer-content"
        className="max-w-lg mx-auto bg-card border-border text-foreground"
      >
        <DrawerHeader className="text-left">
          <DrawerTitle className="text-foreground text-lg">Filtros de Búsqueda</DrawerTitle>
          <DrawerDescription className="text-xs text-muted-foreground">
            Encuentra pensiones que se ajusten a tu presupuesto universitario y preferencias
          </DrawerDescription>
        </DrawerHeader>

        <div className="p-4 flex flex-col gap-5">
          <div>
            <span className="text-xs font-semibold text-foreground block mb-2">
              Presupuesto Máximo Mensual
            </span>
            <div className="grid grid-cols-3 gap-2">
              {[250000, 300000, 350000].map((price) => (
                <button
                  key={price}
                  type="button"
                  onClick={() =>
                    setLocalFilters((prev) => ({
                      ...prev,
                      maxPriceClp: prev.maxPriceClp === price ? undefined : price,
                    }))
                  }
                  className={`rounded-xl border p-2.5 text-xs font-semibold transition active:scale-95 ${
                    localFilters.maxPriceClp === price
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-background text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
                >
                  Hasta ${(price / 1000).toFixed(0)}k
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-semibold text-foreground">Comodidades Esenciales</span>

            <label className="flex items-center justify-between rounded-xl border border-border bg-card p-3 cursor-pointer">
              <span className="text-xs text-foreground">Baño privado exclusivo</span>
              <input
                type="checkbox"
                checked={!!localFilters.hasPrivateBathroom}
                onChange={(e) =>
                  setLocalFilters((prev) => ({ ...prev, hasPrivateBathroom: e.target.checked }))
                }
                className="h-4 w-4 accent-primary"
              />
            </label>

            <label className="flex items-center justify-between rounded-xl border border-border bg-card p-3 cursor-pointer">
              <span className="text-xs text-foreground">
                Alimentación incluida (Pensión completa)
              </span>
              <input
                type="checkbox"
                checked={!!localFilters.includesMeals}
                onChange={(e) =>
                  setLocalFilters((prev) => ({ ...prev, includesMeals: e.target.checked }))
                }
                className="h-4 w-4 accent-primary"
              />
            </label>
          </div>

          <div>
            <span className="text-xs font-semibold text-foreground block mb-2">
              Tipo de Residencia
            </span>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'ALL', label: 'Todas' },
                { id: 'MIXED', label: 'Mixta' },
                { id: 'FEMALE_ONLY', label: 'Mujeres' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() =>
                    setLocalFilters((prev) => ({
                      ...prev,
                      genderPreference: opt.id as SearchFilters['genderPreference'],
                    }))
                  }
                  className={`rounded-xl border p-2 text-xs font-semibold transition active:scale-95 ${
                    (localFilters.genderPreference ?? 'ALL') === opt.id
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-background text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <DrawerFooter className="border-t border-border bg-card p-4">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleReset}
              className="border-border text-muted-foreground hover:text-foreground h-12"
            >
              <RotateCcw className="h-4 w-4 mr-1.5" />
              Limpiar
            </Button>
            <Button
              id="btn-apply-filters"
              onClick={handleApply}
              className="flex-1 bg-primary hover:opacity-90 text-primary-foreground font-bold h-12 text-xs shadow-sm"
            >
              <Check className="h-4 w-4 mr-1.5" />
              Aplicar Filtros
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
