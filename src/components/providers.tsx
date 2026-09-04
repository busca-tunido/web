'use client';

import { useEffect } from 'react';
import { AuthProvider } from '@/lib/auth-context';
import { ThemeProvider } from '@/lib/theme-context';

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
      <AuthProvider>{children}</AuthProvider>
    </ThemeProvider>
  );
}
