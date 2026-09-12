'use client';

import { Building2, LogOut } from 'lucide-react';
import { AccountScreen } from '@/components/account/account-screen';
import { Badge } from '@/components/ui/badge';
import { BrandLogo } from '@/components/ui/brand-logo';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';

export function LandlordAppShell() {
  const { logout } = useAuth();

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col justify-between transition-colors">
      <div className="mx-auto w-full max-w-lg md:max-w-4xl flex-1 flex flex-col pb-12">
        <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur px-4 md:px-8 py-3.5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <BrandLogo size="sm" priority={false} />
            <Badge
              variant="outline"
              className="border-primary/40 bg-primary/10 text-primary text-[10px] font-semibold"
            >
              Dueño / Propietario
            </Badge>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={logout}
            className="min-h-12 px-3 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-4 w-4 mr-1.5" />
            Salir
          </Button>
        </header>

        <div className="px-4 pt-4">
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-3.5 flex items-start gap-3 shadow-2xs">
            <Building2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div className="flex flex-col gap-0.5 text-left">
              <p className="text-xs font-semibold text-foreground">
                Panel de gestión de alojamientos en preparación
              </p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Por ahora puedes gestionar tu perfil y credenciales.
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 pt-2">
          <AccountScreen />
        </div>
      </div>
    </main>
  );
}
