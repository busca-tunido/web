import { PensionCardSkeleton } from './pension-card-skeleton';

type FavoritesSkeletonProps = {
  className?: string;
  count?: number;
};

export function FavoritesSkeleton({ className = '', count = 3 }: FavoritesSkeletonProps) {
  const items = Array.from({ length: count }, (_, i) => i + 1);

  return (
    <div className={`flex flex-col gap-6 px-4 pb-28 pt-2 ${className}`} aria-hidden="true">
      <div className="flex flex-col gap-1.5">
        <div className="h-6 w-36 rounded-md bg-muted animate-pulse" />
        <div className="h-3.5 w-52 rounded-md bg-muted/70 animate-pulse" />
      </div>

      <div className="flex flex-col gap-7 sm:grid sm:grid-cols-2">
        {items.map((id) => (
          <PensionCardSkeleton key={`fav-skel-${id}`} />
        ))}
      </div>
    </div>
  );
}
