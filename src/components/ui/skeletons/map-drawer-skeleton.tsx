import { PensionCardSkeleton } from './pension-card-skeleton';

type MapDrawerSkeletonProps = {
  className?: string;
  count?: number;
};

export function MapDrawerSkeleton({ className = '', count = 3 }: MapDrawerSkeletonProps) {
  const items = Array.from({ length: count }, (_, i) => i + 1);

  return (
    <div className={`flex flex-col gap-6 px-5 pt-2 ${className}`} aria-hidden="true">
      {items.map((id) => (
        <PensionCardSkeleton key={`map-drawer-skel-${id}`} />
      ))}
    </div>
  );
}
