'use client';

import { Home } from 'lucide-react';
import { motion } from 'motion/react';

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
        <div className="relative flex items-center justify-center">
          <motion.div
            className="absolute -inset-2 rounded-3xl bg-primary/10 blur-md"
            animate={{ opacity: [0.3, 0.7, 0.3], scale: [0.95, 1.05, 0.95] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
          />
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 text-primary shadow-md">
            <Home className="h-7 w-7" />
          </div>
        </div>

        <div className="flex flex-col items-center gap-1">
          <span className="text-2xl font-black tracking-tight text-foreground">BuscaTuNido</span>
          <span className="text-xs font-medium text-muted-foreground">
            Tu hogar universitario en Chile
          </span>
        </div>

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
