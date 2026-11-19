'use client';

import type { Variants } from 'motion/react';
import { m, useAnimation } from 'motion/react';
import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';

import type { AnimatedIconHandle, AnimatedIconProps } from '@/components/ui/animated-icon.types';
import { cn } from '@/lib/utils';

export type CheckIconHandle = AnimatedIconHandle;

const PATH_VARIANTS: Variants = {
  normal: {
    opacity: 1,
    pathLength: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      opacity: { duration: 0.1 },
    },
  },
  animate: {
    opacity: [0, 1],
    pathLength: [0, 1],
    scale: [0.5, 1],
    transition: {
      duration: 0.4,
      opacity: { duration: 0.1 },
    },
  },
};

const CheckIcon = forwardRef<CheckIconHandle, AnimatedIconProps>(
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
        <svg
          aria-hidden="true"
          fill="none"
          height={size}
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          width={size}
          xmlns="http://www.w3.org/2000/svg"
        >
          <m.path
            animate={controls}
            d="M4 12 9 17L20 6"
            initial="normal"
            variants={PATH_VARIANTS}
          />
        </svg>
      </m.span>
    );
  },
);

CheckIcon.displayName = 'CheckIcon';

export { CheckIcon };
