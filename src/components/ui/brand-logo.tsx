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
    sm: { width: 34, height: 24 },
    md: { width: 44, height: 31 },
    lg: { width: 54, height: 38 },
    xl: { width: 68, height: 48 },
  }[size];

  const textClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl',
  }[size];

  return (
    <div className={cn('inline-flex flex-col items-center select-none', className)}>
      <div className="flex items-center gap-3">
        <Image
          src="/vercel.svg"
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
