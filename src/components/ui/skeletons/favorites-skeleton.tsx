import { PensionCardSkeleton } from './pension-card-skeleton';

type FavoritesSkeletonProps = {
  className?: string;
  count?: number;
  hideHeader?: boolean;
};

export function FavoritesSkeleton({
  className = '',
  count = 4,
  hideHeader = false,
}: FavoritesSkeletonProps) {
  const items = Array.from({ length: count }, (_, i) => i + 1);

  return (
    <div
      className={`flex flex-col gap-6 ${hideHeader ? '' : 'px-4 pb-28 pt-2'} ${className}`}
      aria-hidden="true"
    >
      {!hideHeader && (
        <div className="flex flex-col gap-1.5">
          <div className="h-6 w-36 rounded-md bg-muted animate-pulse" />
          <div className="h-3.5 w-52 rounded-md bg-muted/70 animate-pulse" />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {items.map((id) => (
          <PensionCardSkeleton key={`fav-skel-${id}`} />
        ))}
      </div>
    </div>
  );
}
