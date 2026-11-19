'use client';

import { useCallback, useRef } from 'react';
import type { AnimatedIconHandle } from '@/components/ui/animated-icon.types';

export function useAnimatedIconTrigger() {
  const iconRef = useRef<AnimatedIconHandle>(null);

  const start = useCallback(() => {
    const handle = iconRef.current as Partial<AnimatedIconHandle> | null;
    if (typeof handle?.startAnimation === 'function') {
      handle.startAnimation();
    }
  }, []);

  const stop = useCallback(() => {
    const handle = iconRef.current as Partial<AnimatedIconHandle> | null;
    if (typeof handle?.stopAnimation === 'function') {
      handle.stopAnimation();
    }
  }, []);

  const triggerProps = {
    onMouseEnter: start,
    onMouseLeave: stop,
    onFocus: start,
    onBlur: stop,
  };

  return { iconRef, start, stop, triggerProps };
}
