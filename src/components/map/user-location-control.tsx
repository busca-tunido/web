'use client';

import { Loader2, Locate } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import type { BrowserLocation, LocationSource, LocationStatus } from '@/lib/use-user-location';

export const LOCATION_INFO_HIDE_DELAY_MS = 4_500;
export const LOCATION_ERROR_HIDE_DELAY_MS = 6_000;

type UserLocationControlProps = {
  location: BrowserLocation | null;
  source: LocationSource;
  status: LocationStatus;
  error: string | null;
  onRequestLocation: () => Promise<BrowserLocation | null>;
  onLocated: (location: BrowserLocation) => void;
  className?: string;
};

export function UserLocationControl({
  location,
  source,
  status,
  error,
  onRequestLocation,
  onLocated,
  className,
}: UserLocationControlProps) {
  const [attempt, setAttempt] = useState(0);
  const [hiddenKey, setHiddenKey] = useState<string | null>(null);
  const locating = status === 'locating';
  const messageKey = `${status}:${error ?? ''}:${source}:${location?.timestamp ?? ''}:${attempt}`;
  const isMessageVisible = locating || hiddenKey !== messageKey;

  useEffect(() => {
    if (locating) return;
    const delay = error ? LOCATION_ERROR_HIDE_DELAY_MS : LOCATION_INFO_HIDE_DELAY_MS;
    const timer = window.setTimeout(() => {
      setHiddenKey(messageKey);
    }, delay);
    return () => {
      window.clearTimeout(timer);
    };
  }, [locating, error, messageKey]);

  const handleLocate = async (): Promise<void> => {
    setAttempt((value) => value + 1);
    const nextLocation = await onRequestLocation();
    if (nextLocation) onLocated(nextLocation);
  };

  return (
    <div
      className={`flex max-w-[min(18rem,calc(100vw-2rem))] flex-col items-end gap-2 ${className ?? ''}`}
    >
      <AnimatePresence>
        {isMessageVisible && (
          <motion.div
            key={locating ? 'locating' : error ? 'error' : 'info'}
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="rounded-xl border border-border/80 bg-card/95 p-3 text-xs text-foreground shadow-lg backdrop-blur-md"
          >
            {locating ? (
              <p role="status">Obteniendo tu ubicación…</p>
            ) : error ? (
              <p role="alert">{error}</p>
            ) : location ? (
              <p role="status">
                Ubicación del dispositivo · precisión aproximada:{' '}
                {Math.ceil(location.accuracy).toLocaleString('es-CL')} m.
              </p>
            ) : (
              <p role="status">
                {source === 'ip'
                  ? 'Mapa centrado en una ubicación aproximada por red.'
                  : 'Tu ubicación todavía no está disponible.'}
              </p>
            )}
            {location && !locating && (
              <p className="mt-1 text-muted-foreground">
                El círculo azul representa el margen de precisión.
              </p>
            )}
            {!location && !locating && (
              <p className="mt-1 text-muted-foreground">
                Pulsa el botón para volver a solicitar tu ubicación.
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      <button
        type="button"
        id="center-user-location-btn"
        onClick={() => void handleLocate()}
        disabled={locating}
        className="flex size-12 shrink-0 items-center justify-center rounded-full border border-border/80 bg-card/95 text-primary shadow-lg backdrop-blur-md transition hover:bg-secondary active:scale-90 disabled:opacity-60"
        title="Actualizar y centrar mi ubicación"
        aria-label="Actualizar y centrar mi ubicación"
        aria-busy={locating}
      >
        {locating ? (
          <Loader2 aria-hidden="true" className="size-5 animate-spin" />
        ) : (
          <Locate aria-hidden="true" className="size-5" />
        )}
      </button>
    </div>
  );
}
