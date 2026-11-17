const AMENITY_CHIPS = [1, 2, 3, 4, 5, 6];
const PROPOSAL_CARDS = [1, 2];

export function LandlordAmenitiesSkeleton() {
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5"
      aria-busy="true"
    >
      <span role="status" className="sr-only">
        Cargando catálogo de comodidades…
      </span>
      {AMENITY_CHIPS.map((item) => (
        <div
          key={`landlord-amenity-skel-${item}`}
          className="h-12 rounded-xl border border-border/50 bg-muted/60 animate-pulse"
        />
      ))}
    </div>
  );
}

export function LandlordPensionSkeleton() {
  return (
    <div className="flex flex-col gap-6 w-full" aria-busy="true">
      <span role="status" className="sr-only">
        Cargando datos de la pensión…
      </span>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-1">
        <div className="space-y-2">
          <div className="h-7 w-64 rounded-lg bg-muted animate-pulse" />
          <div className="h-4 w-44 rounded-md bg-muted/75 animate-pulse" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-10 w-28 rounded-xl bg-muted animate-pulse" />
          <div className="h-10 w-36 rounded-xl bg-muted animate-pulse" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="rounded-2xl border border-border/60 bg-card p-5 space-y-4">
          <div className="h-5 w-40 rounded bg-muted animate-pulse" />
          <div className="space-y-3">
            <div className="h-11 w-full rounded-xl bg-muted/60 animate-pulse" />
            <div className="h-11 w-full rounded-xl bg-muted/60 animate-pulse" />
            <div className="h-11 w-full rounded-xl bg-muted/60 animate-pulse" />
          </div>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-5 space-y-4">
          <div className="h-5 w-44 rounded bg-muted animate-pulse" />
          <div className="space-y-3">
            <div className="h-11 w-full rounded-xl bg-muted/60 animate-pulse" />
            <div className="h-11 w-full rounded-xl bg-muted/60 animate-pulse" />
            <div className="h-11 w-full rounded-xl bg-muted/60 animate-pulse" />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-5 space-y-4">
        <div className="h-5 w-48 rounded bg-muted animate-pulse" />
        <LandlordAmenitiesSkeleton />
      </div>
    </div>
  );
}

type ProposalsListSkeletonProps = {
  count?: number;
};

export function ProposalsListSkeleton({ count = 2 }: ProposalsListSkeletonProps) {
  const items = PROPOSAL_CARDS.slice(0, Math.max(1, count));

  return (
    <div className="space-y-4" aria-busy="true">
      <span role="status" className="sr-only">
        Cargando sugerencias de la comunidad…
      </span>
      {items.map((item) => (
        <div
          key={`proposal-skel-${item}`}
          className="rounded-xl border border-border/70 bg-card p-4 space-y-3.5"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-full bg-muted animate-pulse shrink-0" />
              <div className="space-y-1.5">
                <div className="h-3.5 w-32 rounded bg-muted animate-pulse" />
                <div className="h-3 w-20 rounded bg-muted/70 animate-pulse" />
              </div>
            </div>
            <div className="h-5 w-20 rounded-full bg-muted animate-pulse shrink-0" />
          </div>

          <div className="h-12 w-full rounded-lg bg-muted/55 animate-pulse" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="h-10 rounded-lg bg-muted/60 animate-pulse" />
            <div className="h-10 rounded-lg bg-muted/60 animate-pulse" />
          </div>

          <div className="flex gap-2 pt-2 border-t border-border/50">
            <div className="h-10 flex-1 rounded-lg bg-muted/70 animate-pulse" />
            <div className="h-10 flex-1 rounded-lg bg-muted animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}
