import { ProposalsListSkeleton } from '@/components/ui/skeletons/landlord-pension-skeleton';
import { ReviewsSkeleton } from '@/components/ui/skeletons/reviews-skeleton';
import { cn } from '@/lib/utils';

type SkeletonProps = {
  className?: string;
};

export function LandlordRoomsSkeleton({ className }: SkeletonProps = {}) {
  return (
    <div className={cn('space-y-5 w-full', className)} aria-busy="true">
      <span role="status" className="sr-only">
        Cargando habitaciones…
      </span>

      <div className="rounded-xl border border-border/70 bg-card p-5 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-1.5">
            <div className="h-4 w-40 rounded bg-muted animate-pulse" />
            <div className="h-3 w-48 rounded bg-muted/70 animate-pulse" />
          </div>
          <div className="h-6 w-28 rounded-full bg-muted animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
          <div className="h-20 rounded-lg border border-border/60 bg-muted/30 animate-pulse" />
          <div className="h-20 rounded-lg border border-border/60 bg-muted/30 animate-pulse" />
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-1">
        <div className="h-6 w-48 rounded-lg bg-muted animate-pulse" />
        <div className="h-12 w-full sm:w-44 rounded-xl bg-muted animate-pulse" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {[1, 2].map((col) => (
          <div key={`room-col-skel-${col}`} className="flex flex-col gap-3.5">
            <div className="flex items-center justify-between pb-1.5 border-b border-border/50">
              <div className="h-4 w-44 rounded bg-muted animate-pulse" />
              <div className="h-5 w-8 rounded-full bg-muted animate-pulse" />
            </div>
            {[1, 2].map((card) => (
              <div
                key={`room-card-skel-${col}-${card}`}
                className="rounded-xl border border-border/60 bg-card p-4 space-y-3"
              >
                <div className="flex items-start gap-3">
                  <div className="h-16 w-20 rounded-lg bg-muted animate-pulse shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
                    <div className="h-3.5 w-1/2 rounded bg-muted/70 animate-pulse" />
                    <div className="flex gap-2">
                      <div className="h-5 w-20 rounded-full bg-muted/70 animate-pulse" />
                      <div className="h-5 w-16 rounded-full bg-muted/70 animate-pulse" />
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border/40">
                  <div className="h-4 w-24 rounded bg-muted animate-pulse" />
                  <div className="h-8 w-24 rounded-lg bg-muted animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function LandlordPensionsSkeleton({ className }: SkeletonProps = {}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-6 text-left pb-[calc(7rem+env(safe-area-inset-bottom))] md:pb-12',
        className,
      )}
      aria-busy="true"
    >
      <span role="status" className="sr-only">
        Cargando propiedades…
      </span>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="h-7 w-40 rounded-lg bg-muted animate-pulse" />
          <div className="h-6 w-20 rounded-full bg-muted animate-pulse" />
        </div>
        <div className="h-11 w-48 rounded-xl bg-muted animate-pulse" />
      </div>

      <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
        {[1, 2, 3].map((kpi) => (
          <div
            key={`kpi-skel-${kpi}`}
            className="rounded-xl border border-border/70 bg-card/60 p-3 space-y-2"
          >
            <div className="h-3 w-20 rounded bg-muted/70 animate-pulse" />
            <div className="h-6 w-12 rounded bg-muted animate-pulse" />
            <div className="h-2.5 w-24 rounded bg-muted/60 animate-pulse" />
          </div>
        ))}
      </div>

      <div className="h-16 rounded-xl border border-border/70 bg-card/60 animate-pulse" />

      <div className="space-y-4">
        {[1, 2].map((card) => (
          <div
            key={`pension-item-skel-${card}`}
            className="rounded-xl border border-border/60 bg-card/60 p-4 sm:p-5 space-y-4"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3.5">
                <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-xl bg-muted animate-pulse shrink-0" />
                <div className="space-y-2">
                  <div className="h-4 w-44 rounded bg-muted animate-pulse" />
                  <div className="h-3 w-56 rounded bg-muted/70 animate-pulse" />
                </div>
              </div>
              <div className="h-6 w-20 rounded-full bg-muted animate-pulse shrink-0" />
            </div>
            <div className="h-3 w-3/4 rounded bg-muted/60 animate-pulse" />
            <div className="h-10 w-full rounded-lg bg-muted/40 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function LandlordReviewsScreenSkeleton({ className }: SkeletonProps = {}) {
  return (
    <div className={cn('flex flex-col gap-5 pb-24 text-left', className)} aria-busy="true">
      <span role="status" className="sr-only">
        Cargando reseñas de la pensión…
      </span>

      <div className="flex items-center justify-between px-1">
        <div className="h-6 w-28 rounded-lg bg-muted animate-pulse" />
        <div className="h-6 w-20 rounded-full bg-muted animate-pulse" />
      </div>

      <div className="rounded-xl border border-border/70 bg-card overflow-hidden">
        <div className="p-4 sm:p-5 pb-3 border-b border-border/50 flex items-center justify-between">
          <div className="h-4 w-40 rounded bg-muted animate-pulse" />
          <div className="h-7 w-20 rounded-lg bg-muted animate-pulse" />
        </div>
        <div className="p-4 sm:p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((metric) => (
              <div
                key={`review-metric-skel-${metric}`}
                className="h-16 rounded-lg border border-border/60 bg-muted/25 animate-pulse"
              />
            ))}
          </div>
          <div className="h-28 rounded-xl border border-border/60 bg-muted/25 animate-pulse" />
        </div>
      </div>

      <div className="flex gap-2 overflow-hidden">
        {[1, 2, 3, 4].map((chip) => (
          <div
            key={`review-chip-skel-${chip}`}
            className="h-11 w-28 rounded-full bg-muted/70 animate-pulse shrink-0"
          />
        ))}
      </div>

      <ReviewsSkeleton count={3} />
    </div>
  );
}

export function LandlordProposalsScreenSkeleton({ className }: SkeletonProps = {}) {
  return (
    <div className={cn('space-y-6 w-full text-left', className)} aria-busy="true">
      <span role="status" className="sr-only">
        Cargando sugerencias de la comunidad…
      </span>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="h-7 w-64 rounded-lg bg-muted animate-pulse" />
        <div className="h-10 w-28 rounded-xl bg-muted animate-pulse" />
      </div>

      <div className="flex items-center gap-2 overflow-hidden pb-1">
        {[1, 2, 3, 4].map((chip) => (
          <div
            key={`proposal-chip-skel-${chip}`}
            className="h-8 w-24 rounded-xl bg-muted/70 animate-pulse shrink-0"
          />
        ))}
      </div>

      <ProposalsListSkeleton count={2} />
    </div>
  );
}

export function LandlordAccountSkeleton({ className }: SkeletonProps = {}) {
  return (
    <div
      className={cn('flex flex-col gap-6 pb-20 w-full max-w-2xl mx-auto', className)}
      aria-busy="true"
    >
      <span role="status" className="sr-only">
        Cargando información de cuenta…
      </span>

      <div className="rounded-2xl border border-border/70 bg-card p-5 flex items-center gap-4">
        <div className="h-16 w-16 rounded-2xl bg-muted animate-pulse shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-5 w-44 rounded bg-muted animate-pulse" />
          <div className="h-3.5 w-56 rounded bg-muted/70 animate-pulse" />
          <div className="h-3 w-40 rounded bg-muted/60 animate-pulse" />
        </div>
      </div>

      <div className="h-28 rounded-2xl border border-border/70 bg-card animate-pulse" />

      <div className="space-y-2.5">
        <div className="h-3.5 w-44 rounded bg-muted/80 animate-pulse" />
        {[1, 2, 3, 4].map((row) => (
          <div
            key={`account-row-skel-${row}`}
            className="h-16 rounded-2xl border border-border/70 bg-card animate-pulse"
          />
        ))}
      </div>

      <div className="h-12 rounded-2xl bg-muted/70 animate-pulse" />
    </div>
  );
}

export function LandlordRouteLoadingSkeleton() {
  return (
    <div className="w-full space-y-5" aria-busy="true">
      <span role="status" className="sr-only">
        Cargando vista del panel…
      </span>
      <div className="flex items-center justify-between gap-3">
        <div className="h-7 w-48 rounded-lg bg-muted animate-pulse" />
        <div className="h-10 w-32 rounded-xl bg-muted animate-pulse" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-36 rounded-2xl border border-border/60 bg-card animate-pulse" />
        <div className="h-36 rounded-2xl border border-border/60 bg-card animate-pulse" />
      </div>
      <div className="h-56 rounded-2xl border border-border/60 bg-card animate-pulse" />
    </div>
  );
}
