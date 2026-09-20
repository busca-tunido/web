'use client';

import { Compass, Heart, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export type FavoritesGuestIncentiveProps = {
  onOpenAuth: () => void;
  onExplore: () => void;
};

export function FavoritesGuestIncentive({ onOpenAuth, onExplore }: FavoritesGuestIncentiveProps) {
  return (
    <div
      id="favorites-guest-incentive"
      className="flex flex-col items-center justify-center px-4 py-12 sm:py-16 max-w-md mx-auto text-center"
    >
      <div className="relative mb-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 text-primary border border-primary/20 shadow-inner">
          <Heart className="h-8 w-8 fill-primary/20 text-primary" />
        </div>
        <div className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow">
          <Sparkles className="h-3.5 w-3.5" />
        </div>
      </div>

      <h2 className="text-xl font-bold text-foreground sm:text-2xl mb-2">
        Guarda y compara tus pensiones favoritas
      </h2>

      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-6 max-w-sm">
        Inicia sesión con tu correo universitario para guardar residencias estudiantiles, hacer
        seguimiento a sus cupos y comparar opciones antes de postular.
      </p>

      <Card className="w-full border-border bg-card/60 shadow-sm mb-6 text-left">
        <CardContent className="p-4 space-y-2.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span className="text-foreground font-medium">Sincronización multidispositivo</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span className="text-foreground font-medium">Alertas de disponibilidad y precios</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span className="text-foreground font-medium">Acceso rápido a contacto de dueños</span>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-3 w-full">
        <Button
          id="btn-favorites-guest-login"
          type="button"
          onClick={onOpenAuth}
          className="flex-1 h-11 text-xs font-semibold bg-primary text-primary-foreground hover:opacity-90 shadow active:scale-95 transition cursor-pointer"
        >
          Iniciar sesión o registrarme
        </Button>
        <Button
          id="btn-favorites-guest-explore"
          type="button"
          variant="outline"
          onClick={onExplore}
          className="flex-1 h-11 text-xs font-semibold border-border hover:bg-secondary active:scale-95 transition cursor-pointer"
        >
          <Compass className="h-3.5 w-3.5 mr-1.5" />
          Explorar alojamientos
        </Button>
      </div>
    </div>
  );
}
