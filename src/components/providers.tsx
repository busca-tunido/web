'use client';

import { LazyMotion } from 'motion/react';
import { useEffect } from 'react';
import { Toaster } from 'sonner';
import { PensionComparisonProvider } from '@/contexts/pension-comparison-context';
import { AuthProvider } from '@/lib/auth-context';
import { ThemeProvider } from '@/lib/theme-context';

const loadMotionFeatures = () => import('@/lib/motion-features').then((mod) => mod.default);

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== 'undefined' && Element.prototype.releasePointerCapture) {
      const origRelease = Element.prototype.releasePointerCapture;
      Element.prototype.releasePointerCapture = function (pointerId: number) {
        try {
          if (this.hasPointerCapture(pointerId)) {
            origRelease.call(this, pointerId);
          }
        } catch {
          // Ignore invalid pointer ID during mobile touch emulation
        }
      };
    }
  }, []);

  return (
    <ThemeProvider>
      <LazyMotion features={loadMotionFeatures}>
        <AuthProvider>
          <PensionComparisonProvider>{children}</PensionComparisonProvider>
          <Toaster position="top-right" richColors closeButton />
        </AuthProvider>
      </LazyMotion>
    </ThemeProvider>
  );
}
