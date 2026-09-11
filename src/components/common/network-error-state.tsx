'use client';

import { Loader2, RotateCw, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type NetworkErrorBannerProps = {
  message?: string;
  description?: string;
  onRetry?: () => void;
  isRetrying?: boolean;
  className?: string;
};

export function NetworkErrorBanner({
  message = 'No pudimos conectar con el servidor',
  description,
  onRetry,
  isRetrying = false,
  className = '',
}: NetworkErrorBannerProps) {
  return (
    <div
      role="alert"
      aria-live="polite"
      className={`flex items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-destructive shadow-sm ${className}`}
    >
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <WifiOff className="h-5 w-5 shrink-0 text-destructive" />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold sm:text-sm truncate">{message}</p>
          {description && (
            <p className="text-[11px] text-muted-foreground line-clamp-1">{description}</p>
          )}
        </div>
      </div>
      {onRetry && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRetry}
          disabled={isRetrying}
          className="h-8 shrink-0 gap-1.5 border-destructive/40 bg-background/80 px-2.5 text-xs font-medium text-destructive hover:bg-destructive/15 hover:text-destructive"
        >
          {isRetrying ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <RotateCw className="h-3.5 w-3.5" />
          )}
          <span>Reintentar</span>
        </Button>
      )}
    </div>
  );
}

export type NetworkErrorStateProps = {
  title?: string;
  message?: string;
  onRetry?: () => void;
  isRetrying?: boolean;
  className?: string;
};

export function NetworkErrorState({
  title = 'Sin conexión con el servidor',
  message = 'Comprueba tu conexión a internet o intenta nuevamente en unos momentos.',
  onRetry,
  isRetrying = false,
  className = '',
}: NetworkErrorStateProps) {
  return (
    <div
      role="alert"
      aria-live="polite"
      className={`flex flex-col items-center justify-center gap-4 rounded-2xl border border-border/80 bg-card/60 p-8 text-center backdrop-blur-sm ${className}`}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive ring-8 ring-destructive/5">
        <WifiOff className="h-7 w-7" />
      </div>
      <div className="max-w-xs space-y-1">
        <h4 className="text-base font-bold text-foreground">{title}</h4>
        <p className="text-xs text-muted-foreground">{message}</p>
      </div>
      {onRetry && (
        <Button
          type="button"
          onClick={onRetry}
          disabled={isRetrying}
          className="h-10 gap-2 px-5 text-xs font-semibold shadow-sm"
        >
          {isRetrying ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RotateCw className="h-4 w-4" />
          )}
          <span>Reintentar conexión</span>
        </Button>
      )}
    </div>
  );
}
