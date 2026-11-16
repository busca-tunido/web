type PensionDetailSkeletonProps = {
  title?: string;
  className?: string;
};

const AMENITY_PLACEHOLDERS = [1, 2, 3, 4];

export function PensionDetailSkeleton({ title, className = '' }: PensionDetailSkeletonProps) {
  return (
    <div className={`flex flex-col w-full ${className}`} aria-busy="true">
      <span role="status" className="sr-only">
        {title ? `Cargando ${title}…` : 'Cargando pensión…'}
      </span>

      <div className="relative h-64 sm:h-80 md:h-96 w-full rounded-2xl overflow-hidden bg-muted animate-pulse mb-4">
        <div className="absolute top-3 right-3 h-10 w-10 rounded-full bg-muted-foreground/20" />
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-6 rounded-full bg-muted-foreground/30" />
            <div className="h-1.5 w-2 rounded-full bg-muted-foreground/20" />
            <div className="h-1.5 w-2 rounded-full bg-muted-foreground/20" />
          </div>
          <div className="h-6 w-28 rounded-full bg-muted-foreground/25" />
        </div>
      </div>

      <div className="flex flex-col gap-2 mb-4">
        <div className="flex items-center gap-2">
          <div className="h-5 w-32 rounded-full bg-muted animate-pulse" />
          <div className="h-4 w-24 rounded-md bg-muted/80 animate-pulse" />
        </div>
        <div className="h-6 w-4/5 rounded-md bg-muted animate-pulse" />
        <div className="h-3.5 w-3/5 rounded-md bg-muted/75 animate-pulse" />
      </div>

      <div className="h-11 w-full rounded-xl bg-muted/60 animate-pulse mb-5" />

      <div className="space-y-2 mb-5">
        <div className="h-3.5 w-40 rounded bg-muted animate-pulse" />
        <div className="h-3 w-full rounded bg-muted/80 animate-pulse" />
        <div className="h-3 w-11/12 rounded bg-muted/75 animate-pulse" />
        <div className="h-3 w-3/4 rounded bg-muted/70 animate-pulse" />
      </div>

      <div className="space-y-2.5 mb-6">
        <div className="h-3.5 w-44 rounded bg-muted animate-pulse" />
        <div className="grid grid-cols-2 gap-2.5">
          {AMENITY_PLACEHOLDERS.map((item) => (
            <div
              key={`detail-skel-amenity-${item}`}
              className="h-9 rounded-xl bg-muted/60 animate-pulse"
            />
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-border/60">
        <div className="h-12 w-full rounded-xl bg-muted animate-pulse" />
      </div>
    </div>
  );
}
