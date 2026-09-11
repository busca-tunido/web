import { PensionCardSkeleton } from './pension-card-skeleton';

type ExploreSkeletonProps = {
  className?: string;
};

export function ExploreSkeleton({ className = '' }: ExploreSkeletonProps) {
  return (
    <div className={`flex flex-col gap-6 pb-28 pt-2 ${className}`} aria-hidden="true">
      <section>
        <div className="flex items-center justify-between px-5 mb-3">
          <div className="flex flex-col gap-1">
            <div className="h-5 w-24 rounded-md bg-muted animate-pulse" />
            <div className="h-3 w-44 rounded-md bg-muted/70 animate-pulse" />
          </div>
          <div className="h-3.5 w-12 rounded-md bg-muted/60 animate-pulse" />
        </div>
        <div className="flex gap-3.5 overflow-x-auto px-5 pb-3 scrollbar-none">
          {[1, 2, 3, 4].map((id) => (
            <div
              key={`city-skel-${id}`}
              className="h-48 w-36 shrink-0 rounded-2xl bg-muted animate-pulse border border-border/40"
            />
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between px-5 mb-3">
          <div className="flex flex-col gap-1">
            <div className="h-5 w-32 rounded-md bg-muted animate-pulse" />
            <div className="h-3 w-48 rounded-md bg-muted/70 animate-pulse" />
          </div>
          <div className="h-3.5 w-14 rounded-md bg-muted/60 animate-pulse" />
        </div>
        <div className="flex gap-3.5 overflow-x-auto px-5 pb-3 scrollbar-none">
          {[1, 2, 3, 4].map((id) => (
            <div
              key={`uni-skel-${id}`}
              className="h-48 w-44 shrink-0 rounded-2xl bg-muted animate-pulse border border-border/40"
            />
          ))}
        </div>
      </section>

      <section className="px-4">
        <div className="flex items-center justify-between mb-4">
          <div className="h-5 w-44 rounded-md bg-muted animate-pulse" />
          <div className="h-3.5 w-20 rounded-md bg-muted/70 animate-pulse" />
        </div>
        <div className="flex flex-col gap-6 sm:grid sm:grid-cols-2">
          {[1, 2, 3, 4].map((id) => (
            <PensionCardSkeleton key={`pension-skel-${id}`} />
          ))}
        </div>
      </section>
    </div>
  );
}
