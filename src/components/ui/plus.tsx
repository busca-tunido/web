'use client';

import { m, useAnimation } from 'motion/react';
import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';

import type { AnimatedIconHandle, AnimatedIconProps } from '@/components/ui/animated-icon.types';
import { cn } from '@/lib/utils';

export type PlusIconHandle = AnimatedIconHandle;

const PlusIcon = forwardRef<PlusIconHandle, AnimatedIconProps>(
  ({ className, size = 28, ...props }, ref) => {
    const controls = useAnimation();
    const isControlledRef = useRef(false);

    useImperativeHandle(ref, () => {
      isControlledRef.current = true;

      return {
        startAnimation: () => controls.start('animate'),
        stopAnimation: () => controls.start('normal'),
      };
    });

    const handleHoverStart = useCallback(() => {
      if (!isControlledRef.current) {
        controls.start('animate');
      }
    }, [controls]);

    const handleHoverEnd = useCallback(() => {
      if (!isControlledRef.current) {
        controls.start('normal');
      }
    }, [controls]);

    return (
      <m.span
        aria-hidden="true"
        className={cn('inline-flex shrink-0 items-center justify-center', className)}
        onHoverEnd={handleHoverEnd}
        onHoverStart={handleHoverStart}
        {...props}
      >
        <m.svg
          aria-hidden="true"
          animate={controls}
          fill="none"
          height={size}
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          transition={{ type: 'spring', stiffness: 100, damping: 15 }}
          variants={{
            normal: {
              rotate: 0,
            },
            animate: {
              rotate: 180,
            },
          }}
          viewBox="0 0 24 24"
          width={size}
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M5 12h14" />
          <path d="M12 5v14" />
        </m.svg>
      </m.span>
    );
  },
);

PlusIcon.displayName = 'PlusIcon';

export { PlusIcon };
