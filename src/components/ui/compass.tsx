'use client';

import { motion, useAnimation } from 'motion/react';
import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';

import type { AnimatedIconHandle, AnimatedIconProps } from '@/components/ui/animated-icon.types';
import { cn } from '@/lib/utils';

export type CompassIconHandle = AnimatedIconHandle;

const CompassIcon = forwardRef<CompassIconHandle, AnimatedIconProps>(
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
      <motion.span
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
          <circle cx="12" cy="12" r="10" />
          <motion.polygon
            animate={controls}
            points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"
            transition={{
              type: 'spring',
              stiffness: 120,
              damping: 15,
            }}
            variants={{
              normal: {
                rotate: 0,
              },
              animate: {
                rotate: 360,
              },
            }}
          />
        </svg>
      </motion.span>
    );
  },
);

CompassIcon.displayName = 'CompassIcon';

export { CompassIcon };
