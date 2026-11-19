import type { HTMLAttributes } from 'react';

export type AnimatedIconHandle = {
  startAnimation: () => void;
  stopAnimation: () => void;
};

export type AnimatedIconProps = Omit<
  HTMLAttributes<HTMLSpanElement>,
  'onAnimationStart' | 'onDrag' | 'onDragStart' | 'onDragEnd'
> & {
  size?: number;
};
