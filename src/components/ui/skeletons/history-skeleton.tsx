type HistorySkeletonProps = {
  className?: string;
  count?: number;
};

export function HistorySkeleton({ className = '', count = 3 }: HistorySkeletonProps) {
  const items = Array.from({ length: count }, (_, i) => i + 1);

  return (
    <div className={`flex flex-col gap-4 px-4 pb-28 pt-2 ${className}`} aria-hidden="true">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded-md bg-muted animate-pulse" />
          <div className="h-6 w-48 rounded-md bg-muted animate-pulse" />
        </div>
        <div className="h-3.5 w-64 rounded-md bg-muted/70 animate-pulse" />
      </div>

      <div className="rounded-2xl border border-border/60 bg-muted/40 p-3.5 flex items-center gap-2.5 animate-pulse">
        <div className="h-5 w-5 rounded-full bg-muted-foreground/20 shrink-0" />
        <div className="flex flex-col gap-1 w-full">
          <div className="h-3.5 w-32 rounded bg-muted-foreground/20" />
          <div className="h-3 w-4/5 rounded bg-muted-foreground/15" />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {items.map((id) => (
          <div
            key={`history-skel-${id}`}
            className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm flex flex-col"
          >
            <div className="relative h-36 w-full bg-muted animate-pulse">
              <div className="absolute bottom-2.5 left-2.5 h-5 w-20 rounded-full bg-muted-foreground/20" />
            </div>

            <div className="p-3.5 flex flex-col gap-2.5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col gap-1 w-3/5">
                  <div className="h-4 w-full rounded bg-muted animate-pulse" />
                  <div className="h-3 w-2/3 rounded bg-muted/70 animate-pulse" />
                </div>
                <div className="h-4 w-20 rounded bg-muted animate-pulse shrink-0" />
              </div>

              <div className="h-3.5 w-40 rounded bg-muted/60 animate-pulse" />

              <div className="flex items-center justify-between pt-1 border-t border-border/60">
                <div className="h-3.5 w-28 rounded bg-muted animate-pulse" />
                <div className="h-8 w-24 rounded-lg bg-muted animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
