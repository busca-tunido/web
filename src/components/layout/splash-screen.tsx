'use client';

import { motion } from 'motion/react';
import { BrandLogo } from '@/components/ui/brand-logo';

export function SplashScreen() {
  return (
    <div
      id="splash-screen-container"
      className="fixed inset-0 z-50 flex min-h-dvh flex-col items-center justify-center bg-background px-4 text-foreground transition-colors select-none"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="flex flex-col items-center gap-4 text-center"
      >
        <BrandLogo size="lg" />

        <span className="text-xs font-medium text-muted-foreground">
          Tu hogar universitario en Chile
        </span>

        <div className="mt-4 relative h-1 w-32 overflow-hidden rounded-full bg-secondary">
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={{ x: '-100%', width: '45%' }}
            animate={{ x: '260%' }}
            transition={{
              repeat: Number.POSITIVE_INFINITY,
              duration: 1.1,
              ease: 'easeInOut',
            }}
          />
        </div>
      </motion.div>
    </div>
  );
}
