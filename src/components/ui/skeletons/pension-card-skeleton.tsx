type PensionCardSkeletonProps = {
  className?: string;
};

export function PensionCardSkeleton({ className = '' }: PensionCardSkeletonProps) {
  return (
    <div className={`flex flex-col text-left ${className}`} aria-hidden="true">
      <div className="relative w-full aspect-[16/10] overflow-hidden rounded-2xl bg-muted animate-pulse shadow-sm">
        <div className="absolute bottom-3 left-3 flex gap-1.5">
          <div className="h-5 w-16 rounded-full bg-muted-foreground/20" />
          <div className="h-5 w-20 rounded-full bg-muted-foreground/20" />
        </div>
        <div className="absolute top-2.5 right-2.5 h-11 w-11 rounded-full bg-muted-foreground/20" />
      </div>

      <div className="mt-2.5 flex flex-col gap-1.5 w-full">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1 w-3/5">
            <div className="h-5 w-full rounded-md bg-muted animate-pulse" />
            <div className="h-4 w-4/5 rounded-md bg-muted/80 animate-pulse" />
          </div>
          <div className="h-4 w-10 rounded-md bg-muted animate-pulse shrink-0" />
        </div>

        <div className="h-3.5 w-2/5 rounded-md bg-muted/80 animate-pulse" />

        <div className="mt-2 pt-1 flex items-baseline gap-1">
          <div className="h-5 w-28 rounded-md bg-muted animate-pulse" />
          <div className="h-3 w-8 rounded-md bg-muted/70 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
