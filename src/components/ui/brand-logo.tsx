'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showSubtitle?: boolean;
  priority?: boolean;
}

export function BrandLogo({
  size = 'md',
  className,
  showSubtitle = false,
  priority = true,
}: BrandLogoProps) {
  const iconDimensions = {
    sm: { width: 74, height: 64 },
    md: { width: 84, height: 71 },
    lg: { width: 94, height: 78 },
    xl: { width: 104, height: 88 },
  }[size];

  const textClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl',
  }[size];

  return (
    <div className={cn('inline-flex flex-col items-center select-none', className)}>
      <div className="flex items-center">
        <Image
          src="/logo.svg"
          alt="BuscaTuNido"
          width={iconDimensions.width}
          height={iconDimensions.height}
          priority={priority}
          className="object-contain shrink-0"
        />
        <span className={cn('font-black tracking-tight text-foreground leading-none', textClasses)}>
          BuscaTuNido
        </span>
      </div>
      {showSubtitle && (
        <p className="mt-1.5 text-xs text-muted-foreground font-medium text-center">
          Pensiones y Residencias Universitarias
        </p>
      )}
    </div>
  );
}
