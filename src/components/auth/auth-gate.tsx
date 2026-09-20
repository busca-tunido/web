'use client';

import { Lock } from 'lucide-react';
import type React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigation } from '@/contexts/navigation-context';
import { useAuth } from '@/lib/auth-context';

export type AuthGateProps = {
  children: React.ReactNode;
  title?: string;
  description?: string;
  buttonText?: string;
  previewHeight?: string;
};

export function AuthGate({
  children,
  title = 'Inicia sesión para ver detalles y reseñas',
  description = 'Accede con tu correo institucional universitario para conocer las experiencias de otros estudiantes, reglas de convivencia y contacto directo.',
  buttonText = 'Iniciar sesión o regístrate',
  previewHeight = '200px',
}: AuthGateProps) {
  const { isAuthenticated } = useAuth();
  const { openAuthModal } = useNavigation();

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-border/80 bg-card/40 my-2">
      <div
        style={{ maxHeight: previewHeight }}
        className="overflow-hidden pointer-events-none select-none filter blur-[5px] opacity-30 transition"
        aria-hidden="true"
      >
        {children}
      </div>

      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gradient-to-t from-card via-card/90 to-card/40 p-5 sm:p-6 text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/15 text-primary border border-primary/20 mb-3 shadow-sm">
          <Lock className="h-5 w-5" />
        </div>

        <h3 className="text-sm sm:text-base font-bold text-foreground max-w-sm leading-tight mb-1.5">
          {title}
        </h3>

        <p className="text-xs text-muted-foreground max-w-md leading-relaxed mb-4">{description}</p>

        <Button
          id="btn-auth-gate-login"
          type="button"
          onClick={openAuthModal}
          className="h-10 px-5 text-xs font-semibold bg-primary text-primary-foreground hover:opacity-90 shadow-md active:scale-95 transition cursor-pointer"
        >
          {buttonText}
        </Button>
      </div>
    </div>
  );
}
