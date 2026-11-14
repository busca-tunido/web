'use client';

import { Loader2, Locate } from 'lucide-react';
import type { BrowserLocation, LocationSource, LocationStatus } from '@/lib/use-user-location';

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
  const locating = status === 'locating';
  const handleLocate = async (): Promise<void> => {
    const nextLocation = await onRequestLocation();
    if (nextLocation) onLocated(nextLocation);
  };

  return (
    <div
      className={`flex max-w-[min(18rem,calc(100vw-2rem))] flex-col items-end gap-2 ${className ?? ''}`}
    >
      <div className="rounded-xl border border-border/80 bg-card/95 p-3 text-xs text-foreground shadow-lg backdrop-blur-md">
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
      </div>
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
