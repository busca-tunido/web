'use client';

import { Building2, History, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export type HistoryGuestIncentiveProps = {
  onOpenAuth: () => void;
};

export function HistoryGuestIncentive({ onOpenAuth }: HistoryGuestIncentiveProps) {
  return (
    <div
      id="history-guest-incentive"
      className="flex flex-col items-center justify-center px-4 py-12 sm:py-16 max-w-md mx-auto text-center"
    >
      <div className="relative mb-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 text-primary border border-primary/20 shadow-inner">
          <History className="h-8 w-8 text-primary" />
        </div>
      </div>

      <h2 className="text-xl font-bold text-foreground sm:text-2xl mb-2">
        Construye tu historial de estadías
      </h2>

      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-6 max-w-sm">
        Inicia sesión para registrar tus residencias universitarias, calificar tu experiencia de
        arriendo y certificar tu perfil como estudiante verificado ante la comunidad.
      </p>

      <Card className="w-full border-border bg-card/60 shadow-sm mb-6 text-left">
        <CardContent className="p-4 space-y-2.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary shrink-0" />
            <span className="text-foreground font-medium">
              Historial formal de contratos y pensiones
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
            <span className="text-foreground font-medium">
              Insignia de Acreditación Estudiantil
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-primary ml-1 mr-1.5" />
            <span className="text-foreground font-medium">
              Publicación de reseñas y valoraciones
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-3 w-full">
        <Button
          id="btn-history-guest-login"
          type="button"
          onClick={onOpenAuth}
          className="flex-1 h-11 text-xs font-semibold bg-primary text-primary-foreground hover:opacity-90 shadow active:scale-95 transition cursor-pointer"
        >
          Iniciar sesión o registrarme
        </Button>
      </div>
    </div>
  );
}
