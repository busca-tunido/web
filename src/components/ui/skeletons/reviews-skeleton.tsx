type ReviewsSkeletonProps = {
  className?: string;
  count?: number;
};

export function ReviewsSkeleton({ className = '', count = 3 }: ReviewsSkeletonProps) {
  const items = Array.from({ length: count }, (_, i) => i + 1);

  return (
    <div className={`flex flex-col gap-4 ${className}`} aria-hidden="true">
      {items.map((id) => (
        <div
          key={`review-skel-${id}`}
          className="rounded-2xl border border-border/70 bg-card/60 p-4 shadow-sm flex flex-col gap-3"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="h-10 w-10 rounded-full bg-muted animate-pulse shrink-0" />
              <div className="flex flex-col gap-1">
                <div className="h-4 w-28 rounded bg-muted animate-pulse" />
                <div className="h-3 w-36 rounded bg-muted/70 animate-pulse" />
              </div>
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <div
                  key={`star-${star}`}
                  className="h-3.5 w-3.5 rounded-sm bg-muted animate-pulse"
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5 pt-1">
            <div className="h-3.5 w-full rounded bg-muted animate-pulse" />
            <div className="h-3.5 w-11/12 rounded bg-muted animate-pulse" />
            <div className="h-3.5 w-3/4 rounded bg-muted/80 animate-pulse" />
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="h-6 w-20 rounded-full bg-muted animate-pulse" />
            <div className="h-3 w-16 rounded bg-muted/60 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}
