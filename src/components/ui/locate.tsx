'use client';

import type { Transition, Variants } from 'motion/react';
import { m, useAnimation } from 'motion/react';
import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';

import type { AnimatedIconHandle, AnimatedIconProps } from '@/components/ui/animated-icon.types';
import { cn } from '@/lib/utils';

export type LocateIconHandle = AnimatedIconHandle;

const CENTER = 12;
const FULL_RADIUS = 7;
const TICK_OUTER_NEAR = 2;
const TICK_OUTER_FAR = 22;
const TICK_PULL = 0.75;
const TICK_OVERSHOOT = 0.25;

const RADIUS_KEYFRAMES = [7, 1, 1, 4.25, 3.5, 7.7, 7];

const TICK_INSET_KEYFRAMES = [0, TICK_PULL, TICK_PULL, TICK_PULL, TICK_PULL, -TICK_OVERSHOOT, 0];

const ANIMATE_TRANSITION: Transition = {
  duration: 1.2,
  times: [0, 0.28, 0.36, 0.52, 0.62, 0.84, 1],
  ease: ['easeInOut', 'linear', 'easeOut', 'easeInOut', 'easeOut', 'easeInOut'],
};

const NORMAL_TRANSITION: Transition = {
  duration: 0.2,
  ease: 'easeOut',
};

const INNER_BEFORE_CENTER = RADIUS_KEYFRAMES.map((r) => CENTER - r);
const INNER_AFTER_CENTER = RADIUS_KEYFRAMES.map((r) => CENTER + r);
const OUTER_BEFORE_CENTER = TICK_INSET_KEYFRAMES.map((inset) => TICK_OUTER_NEAR + inset);
const OUTER_AFTER_CENTER = TICK_INSET_KEYFRAMES.map((inset) => TICK_OUTER_FAR - inset);

const CIRCLE_VARIANTS: Variants = {
  normal: { r: FULL_RADIUS, transition: NORMAL_TRANSITION },
  animate: { r: RADIUS_KEYFRAMES, transition: ANIMATE_TRANSITION },
};

const WEST_VARIANTS: Variants = {
  normal: {
    x1: TICK_OUTER_NEAR,
    x2: CENTER - FULL_RADIUS,
    transition: NORMAL_TRANSITION,
  },
  animate: {
    x1: OUTER_BEFORE_CENTER,
    x2: INNER_BEFORE_CENTER,
    transition: ANIMATE_TRANSITION,
  },
};

const EAST_VARIANTS: Variants = {
  normal: {
    x1: CENTER + FULL_RADIUS,
    x2: TICK_OUTER_FAR,
    transition: NORMAL_TRANSITION,
  },
  animate: {
    x1: INNER_AFTER_CENTER,
    x2: OUTER_AFTER_CENTER,
    transition: ANIMATE_TRANSITION,
  },
};

const NORTH_VARIANTS: Variants = {
  normal: {
    y1: TICK_OUTER_NEAR,
    y2: CENTER - FULL_RADIUS,
    transition: NORMAL_TRANSITION,
  },
  animate: {
    y1: OUTER_BEFORE_CENTER,
    y2: INNER_BEFORE_CENTER,
    transition: ANIMATE_TRANSITION,
  },
};

const SOUTH_VARIANTS: Variants = {
  normal: {
    y1: CENTER + FULL_RADIUS,
    y2: TICK_OUTER_FAR,
    transition: NORMAL_TRANSITION,
  },
  animate: {
    y1: INNER_AFTER_CENTER,
    y2: OUTER_AFTER_CENTER,
    transition: ANIMATE_TRANSITION,
  },
};

const LocateIcon = forwardRef<LocateIconHandle, AnimatedIconProps>(
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
          <m.line
            animate={controls}
            initial="normal"
            variants={WEST_VARIANTS}
            x1="2"
            x2="5"
            y1="12"
            y2="12"
          />
          <m.line
            animate={controls}
            initial="normal"
            variants={EAST_VARIANTS}
            x1="19"
            x2="22"
            y1="12"
            y2="12"
          />
          <m.line
            animate={controls}
            initial="normal"
            variants={NORTH_VARIANTS}
            x1="12"
            x2="12"
            y1="2"
            y2="5"
          />
          <m.line
            animate={controls}
            initial="normal"
            variants={SOUTH_VARIANTS}
            x1="12"
            x2="12"
            y1="19"
            y2="22"
          />
          <m.circle
            animate={controls}
            cx="12"
            cy="12"
            initial="normal"
            r="7"
            variants={CIRCLE_VARIANTS}
          />
        </svg>
      </m.span>
    );
  },
);

LocateIcon.displayName = 'LocateIcon';

export { LocateIcon };
