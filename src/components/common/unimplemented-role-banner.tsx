'use client';

import { Construction, LogOut, ShieldAlert } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { BrandLogo } from '@/components/ui/brand-logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/lib/auth-context';

export type UnimplementedRoleBannerProps = {
  role: string;
};

export function UnimplementedRoleBanner({ role }: UnimplementedRoleBannerProps) {
  const { logout, user } = useAuth();

  const roleLabel =
    role.toLowerCase() === 'admin'
      ? 'Administrador'
      : role.toLowerCase() === 'moderator'
        ? 'Moderador'
        : role;

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col justify-between transition-colors">
      <div className="mx-auto w-full max-w-lg flex-1 flex flex-col px-4 py-6">
        <header className="flex items-center justify-between border-b border-border pb-4">
          <BrandLogo size="sm" priority={false} />
          <Badge
            variant="outline"
            className="border-destructive/40 bg-destructive/10 text-destructive text-xs font-semibold"
          >
            {roleLabel}
          </Badge>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center py-10 text-center">
          <div className="relative mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground shadow-xs">
            <Construction className="h-8 w-8 text-primary" />
            <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground">
              <ShieldAlert className="h-3.5 w-3.5" />
            </span>
          </div>

          <h1 className="text-lg font-bold text-foreground">Panel de {roleLabel} en preparación</h1>

          <p className="mt-2 max-w-sm text-xs text-muted-foreground leading-relaxed">
            La interfaz de gestión y moderación para {roleLabel.toLowerCase()}es de BuscaTuNido se
            encuentra actualmente en desarrollo activo.
          </p>

          {user && (
            <Card className="mt-6 w-full max-w-sm border-border bg-card shadow-xs text-left">
              <CardContent className="p-3.5">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Sesión activa
                </p>
                <p className="mt-1 text-xs font-medium text-foreground">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-[11px] text-muted-foreground">{user.email}</p>
              </CardContent>
            </Card>
          )}

          <div className="mt-6 w-full max-w-sm">
            <Button
              type="button"
              variant="outline"
              onClick={logout}
              className="min-h-12 w-full border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive font-semibold text-xs"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
