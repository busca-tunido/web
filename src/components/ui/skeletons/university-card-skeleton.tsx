type UniversityCardSkeletonProps = {
  className?: string;
};

export function UniversityCardSkeleton({ className = '' }: UniversityCardSkeletonProps) {
  return (
    <div
      data-testid="university-card-skeleton"
      className={`relative h-48 w-44 md:w-full shrink-0 md:shrink snap-start overflow-hidden rounded-2xl border border-border/40 bg-muted/50 animate-pulse shadow-xs ${className}`}
      aria-hidden="true"
    >
      <div className="absolute top-2.5 left-2.5">
        <div className="h-4.5 w-11 rounded-md bg-muted-foreground/30" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
      <div className="absolute bottom-3 left-3 right-3 flex flex-col gap-1.5">
        <div className="h-3.5 w-4/5 rounded-md bg-muted-foreground/30" />
        <div className="h-3.5 w-3/5 rounded-md bg-muted-foreground/20" />
        <div className="flex items-center gap-1.5 mt-0.5">
          <div className="h-3 w-3 rounded-full bg-muted-foreground/20" />
          <div className="h-2.5 w-16 rounded-md bg-muted-foreground/20" />
        </div>
      </div>
    </div>
  );
}
