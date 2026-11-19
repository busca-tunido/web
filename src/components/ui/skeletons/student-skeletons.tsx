import { ExploreSkeleton } from './explore-skeleton';

export function StudentAccountSkeleton() {
  return (
    <div
      className="flex flex-col gap-6 px-4 md:px-0 pb-24 pt-2 max-w-2xl mx-auto w-full"
      aria-busy="true"
    >
      <span role="status" className="sr-only">
        Cargando perfil de estudiante…
      </span>

      <div className="rounded-2xl border border-border bg-card p-5 flex items-center gap-4">
        <div className="h-14 w-14 rounded-full bg-muted animate-pulse shrink-0" />
        <div className="flex flex-col gap-2 flex-1">
          <div className="h-5 w-44 rounded bg-muted animate-pulse" />
          <div className="h-3.5 w-52 rounded bg-muted/70 animate-pulse" />
          <div className="h-3.5 w-40 rounded bg-muted/60 animate-pulse" />
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4 flex items-center justify-between">
        <div className="flex flex-col gap-1.5">
          <div className="h-4 w-28 rounded bg-muted animate-pulse" />
          <div className="h-3 w-44 rounded bg-muted/70 animate-pulse" />
        </div>
        <div className="h-9 w-36 rounded-xl bg-muted animate-pulse" />
      </div>

      <div className="flex flex-col gap-2.5">
        <div className="h-3 w-40 rounded bg-muted/80 animate-pulse mx-1" />
        {[1, 2, 3].map((id) => (
          <div
            key={`student-account-row-skel-${id}`}
            className="rounded-2xl border border-border bg-card p-4 flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3 flex-1">
              <div className="h-9 w-9 rounded-xl bg-muted animate-pulse shrink-0" />
              <div className="flex flex-col gap-1.5 flex-1">
                <div className="h-4 w-52 rounded bg-muted animate-pulse" />
                <div className="h-3 w-64 rounded bg-muted/70 animate-pulse" />
              </div>
            </div>
            <div className="h-5 w-20 rounded-full bg-muted animate-pulse shrink-0" />
          </div>
        ))}
      </div>

      <div className="h-11 w-full rounded-xl bg-muted animate-pulse" />
    </div>
  );
}

export function PortalRouteLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col" aria-busy="true">
      <span role="status" className="sr-only">
        Cargando BuscaTuNido…
      </span>

      <header className="sticky top-0 z-40 hidden w-full border-b border-border/70 bg-background/95 md:block">
        <div className="flex h-16 w-full items-center justify-between gap-4 px-6 lg:px-8 xl:px-10">
          <div className="h-8 w-36 rounded-lg bg-muted animate-pulse" />
          <div className="flex items-center gap-3 flex-1 justify-center">
            <div className="h-9 w-72 rounded-full bg-muted animate-pulse" />
            <div className="h-10 w-64 rounded-full bg-muted/80 animate-pulse" />
          </div>
          <div className="h-9 w-28 rounded-full bg-muted animate-pulse" />
        </div>
        <div className="flex h-12 w-full items-center justify-center gap-2 px-6">
          {[1, 2, 3, 4, 5, 6].map((id) => (
            <div
              key={`portal-chip-skel-${id}`}
              className="h-7 w-24 rounded-full bg-muted/70 animate-pulse"
            />
          ))}
        </div>
      </header>

      <div className="w-full flex-1 mx-auto max-w-lg md:max-w-7xl md:px-6 lg:px-8 pt-4">
        <ExploreSkeleton />
      </div>
    </div>
  );
}
