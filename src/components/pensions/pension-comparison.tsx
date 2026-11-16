'use client';

import { ArrowLeftRight, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { MapPensionComparison } from '@/components/pensions/map-pension-comparison';
import { type FlyPulse, usePensionComparison } from '@/contexts/pension-comparison-context';

function FlyingComparisonBadge({
  pulse,
  targetElement,
  onDone,
}: {
  pulse: FlyPulse;
  targetElement: HTMLButtonElement | null;
  onDone: (id: number) => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [targetPos, setTargetPos] = useState<{ left: number; top: number } | null>(null);

  useEffect(() => {
    setMounted(true);
    const timer = window.setTimeout(() => onDone(pulse.id), 550);
    return () => window.clearTimeout(timer);
  }, [pulse.id, onDone]);

  useLayoutEffect(() => {
    const rect = targetElement?.getBoundingClientRect();
    if (rect && rect.width > 0) {
      setTargetPos({
        left: rect.left + rect.width / 2 - 20,
        top: rect.top + rect.height / 2 - 20,
      });
    } else if (typeof window !== 'undefined') {
      setTargetPos({
        left: Math.max(16, window.innerWidth - 136),
        top: window.innerWidth >= 768 ? 124 : 118,
      });
    }
  }, [targetElement]);

  if (!mounted || typeof document === 'undefined') return null;

  const destination = targetPos ?? {
    left: Math.max(16, window.innerWidth - 136),
    top: window.innerWidth >= 768 ? 124 : 118,
  };

  return createPortal(
    <motion.div
      key={pulse.id}
      aria-hidden="true"
      initial={{
        left: pulse.rect.left,
        top: pulse.rect.top,
        scale: 1,
        opacity: 0.95,
      }}
      animate={{
        left: destination.left,
        top: destination.top,
        scale: 0.85,
        opacity: 0.25,
      }}
      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
      onAnimationComplete={() => onDone(pulse.id)}
      className="pointer-events-none fixed z-50 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl"
    >
      <ArrowLeftRight className="h-4 w-4" />
    </motion.div>,
    document.body,
  );
}

export function PensionComparison() {
  const comparison = usePensionComparison();
  if (!comparison) return null;

  const count = comparison.selected.length;

  return (
    <>
      {comparison.flyPulse && (
        <FlyingComparisonBadge
          pulse={comparison.flyPulse}
          targetElement={comparison.floatingTargetRef.current}
          onDone={comparison.clearFlyPulse}
        />
      )}

      <AnimatePresence>
        {count > 0 && (
          <motion.div
            key="floating-comparison-pill"
            role="complementary"
            aria-label="Comparación de pensiones"
            initial={{ opacity: 0, scale: 0.85, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: -8 }}
            transition={{ type: 'spring', stiffness: 420, damping: 30 }}
            className="fixed right-3 top-[7.25rem] z-40 md:right-6 md:top-[7.5rem]"
          >
            <motion.div
              key={count}
              initial={{ scale: 0.94 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 450, damping: 24 }}
              className="flex items-center overflow-hidden rounded-full border border-border/80 bg-card/95 text-foreground shadow-xl backdrop-blur-xl"
            >
              <button
                ref={comparison.floatingTargetRef}
                type="button"
                onClick={comparison.openDrawer}
                aria-label={`Abrir comparación (${count})`}
                className="flex min-h-11 items-center gap-2 pl-3.5 pr-2.5 text-xs font-semibold transition hover:bg-secondary/70 active:scale-95 cursor-pointer"
              >
                <ArrowLeftRight aria-hidden="true" className="h-4 w-4 text-primary shrink-0" />
                <span>Comparar</span>
                <span className="relative flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-background/40 text-[11px] font-bold tabular-nums ring-1 ring-inset ring-primary/80">
                  <span
                    aria-hidden="true"
                    style={{ width: count >= 2 ? '100%' : '50%' }}
                    className="absolute inset-y-0 left-0 bg-primary transition-[width] duration-300 ease-out"
                  />
                  <span
                    className={`relative z-10 transition-colors ${
                      count >= 2
                        ? 'text-primary-foreground'
                        : 'text-foreground dark:[text-shadow:0_1px_2px_rgb(0_0_0/0.45)]'
                    }`}
                  >
                    {count}
                  </span>
                </span>
              </button>
              <button
                type="button"
                onClick={comparison.clear}
                aria-label="Cancelar comparación"
                title="Cancelar comparación"
                className="flex h-11 w-10 items-center justify-center border-l border-border/60 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive active:scale-90 cursor-pointer"
              >
                <X aria-hidden="true" className="h-4 w-4" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {count > 0 && <MapPensionComparison />}
    </>
  );
}
