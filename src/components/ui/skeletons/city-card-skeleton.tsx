type CityCardSkeletonProps = {
  className?: string;
};

export function CityCardSkeleton({ className = '' }: CityCardSkeletonProps) {
  return (
    <div
      data-testid="city-card-skeleton"
      className={`relative h-48 w-36 md:w-full shrink-0 md:shrink snap-start overflow-hidden rounded-2xl border border-border/40 bg-muted/50 animate-pulse shadow-xs ${className}`}
      aria-hidden="true"
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
      <div className="absolute bottom-3 left-3 right-3 flex flex-col gap-1.5">
        <div className="h-4 w-20 rounded-md bg-muted-foreground/30" />
        <div className="h-3 w-14 rounded-md bg-muted-foreground/20" />
      </div>
    </div>
  );
}
