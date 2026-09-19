'use client';

import { Check, ChevronDown, ChevronUp, Home } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useId, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export type LandlordPropertySummary = {
  id: string;
  title: string;
  address?: string;
  city?: string;
  isActive?: boolean;
  totalRooms?: number;
};

export type LandlordMobileHeaderProps = {
  properties?: LandlordPropertySummary[];
  selectedPropertyId?: string;
  selectedPropertyName?: string;
  onSelectProperty?: (propertyId: string) => void;
  isActive?: boolean;
  onToggleActive?: (active: boolean) => void;
  className?: string;
};

export function LandlordMobileHeader({
  properties = [],
  selectedPropertyId,
  selectedPropertyName,
  onSelectProperty,
  isActive = true,
  onToggleActive,
  className,
}: LandlordMobileHeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  const currentProperty =
    properties.find((p) => p.id === selectedPropertyId) ?? properties[0];

  const displayTitle =
    currentProperty?.title ?? selectedPropertyName ?? 'Mi Pensión';

  const totalCount = properties.length > 0 ? properties.length : 1;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false);
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDropdownOpen]);

  return (
    <header
      id="landlord-mobile-header"
      className={cn(
        'sticky top-0 z-40 w-full border-b border-border/60 bg-background/95 backdrop-blur-lg px-4 py-2.5 transition-colors',
        className,
      )}
    >
      <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
        <div ref={containerRef} className="relative min-w-0 flex-1">
          <button
            type="button"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            aria-expanded={isDropdownOpen}
            aria-haspopup="listbox"
            aria-controls={listboxId}
            className="flex min-h-[44px] max-w-full items-center gap-2 rounded-xl px-2 py-1 text-left text-foreground transition-colors hover:bg-secondary/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Home className="h-4 w-4" />
            </div>

            <div className="flex min-w-0 flex-col">
              <div className="flex items-center gap-1">
                <span className="truncate text-xs font-bold text-foreground max-w-[140px] sm:max-w-[200px]">
                  {displayTitle}
                </span>
                {isDropdownOpen ? (
                  <ChevronUp className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                )}
              </div>
              <span className="text-[10px] font-medium text-muted-foreground">
                {totalCount === 1 ? '1 pensión' : `${totalCount} pensiones`}
              </span>
            </div>
          </button>

          <AnimatePresence>
            {isDropdownOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-40 bg-black/20 backdrop-blur-2xs"
                  onClick={() => setIsDropdownOpen(false)}
                />
                <motion.div
                  id={listboxId}
                  role="listbox"
                  initial={{ opacity: 0, y: -6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 top-full z-50 mt-1.5 w-72 max-w-[calc(100vw-2rem)] rounded-2xl border border-border/80 bg-popover p-2 text-popover-foreground shadow-xl"
                >
                  <div className="px-2.5 py-1.5 text-[11px] font-semibold text-muted-foreground">
                    Tus Propiedades ({totalCount})
                  </div>

                  <div className="max-h-64 overflow-y-auto space-y-1">
                    {properties.length > 0 ? (
                      properties.map((prop) => {
                        const isSelected =
                          prop.id === (currentProperty?.id ?? selectedPropertyId);

                        return (
                          <button
                            key={prop.id}
                            type="button"
                            role="option"
                            aria-selected={isSelected}
                            onClick={() => {
                              onSelectProperty?.(prop.id);
                              setIsDropdownOpen(false);
                            }}
                            className={cn(
                              'flex w-full items-center justify-between gap-2 rounded-xl px-2.5 py-2 text-left text-xs transition-colors cursor-pointer',
                              isSelected
                                ? 'bg-primary/10 text-primary font-semibold'
                                : 'text-foreground hover:bg-secondary',
                            )}
                          >
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-xs font-medium leading-tight">
                                {prop.title}
                              </p>
                              {(prop.address || prop.city) && (
                                <p className="truncate text-[10px] text-muted-foreground mt-0.5">
                                  {[prop.address, prop.city].filter(Boolean).join(', ')}
                                </p>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              {prop.isActive !== undefined && (
                                <span
                                  className={cn(
                                    'h-2 w-2 rounded-full',
                                    prop.isActive ? 'bg-emerald-500' : 'bg-muted-foreground/40',
                                  )}
                                />
                              )}
                              {isSelected && (
                                <Check className="h-4 w-4 text-primary shrink-0" />
                              )}
                            </div>
                          </button>
                        );
                      })
                    ) : (
                      <div className="rounded-xl px-2.5 py-2 text-xs text-foreground bg-primary/10 font-semibold flex items-center justify-between">
                        <span>{displayTitle}</span>
                        <Check className="h-4 w-4 text-primary shrink-0" />
                      </div>
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        <div className="shrink-0 flex items-center">
          <button
            type="button"
            role="switch"
            aria-checked={isActive}
            onClick={() => onToggleActive?.(!isActive)}
            className="flex min-h-[44px] items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium transition-colors hover:bg-secondary/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
            aria-label={
              isActive
                ? 'Pensión activa. Pulsar para pausar publicación'
                : 'Pensión pausada. Pulsar para activar publicación'
            }
          >
            <span className="flex items-center gap-1.5">
              <span
                className={cn(
                  'h-2 w-2 rounded-full transition-colors',
                  isActive
                    ? 'bg-emerald-500 ring-2 ring-emerald-500/20 animate-pulse'
                    : 'bg-amber-500/80',
                )}
              />
              <span
                className={cn(
                  'text-[11px] font-medium leading-none',
                  isActive
                    ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                    : 'text-muted-foreground',
                )}
              >
                {isActive ? 'Activa' : 'Pausada'}
              </span>
            </span>

            <span
              className={cn(
                'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out',
                isActive ? 'bg-emerald-500' : 'bg-muted-foreground/30',
              )}
            >
              <span
                className={cn(
                  'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out',
                  isActive ? 'translate-x-4' : 'translate-x-0',
                )}
              />
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
