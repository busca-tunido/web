'use client';

import {
  ArrowLeft,
  BookOpen,
  Check,
  Clock,
  Heart,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Star,
  Utensils,
  Wifi,
  Wind,
} from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { useAuth } from '@/lib/auth-context';
import type { PensionItem } from '@/lib/types';

type PensionDetailModalProps = {
  pension: PensionItem | null;
  isOpen: boolean;
  onClose: () => void;
};

export function PensionDetailModal({ pension, isOpen, onClose }: PensionDetailModalProps) {
  const { isFavorite, toggleFavorite } = useAuth();
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [contacted, setContacted] = useState(false);

  if (!pension) return null;

  const isFav = isFavorite(pension.id);

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent
        id="pension-detail-drawer"
        className="max-h-[92vh] max-w-lg mx-auto bg-card border-border text-foreground overflow-hidden flex flex-col"
      >
        <div className="mx-auto mt-2.5 mb-1 h-1.5 w-12 rounded-full bg-muted-foreground/30 shrink-0" />

        <div className="overflow-y-auto flex-1 px-4 pt-1 pb-6">
          <div className="relative h-64 w-full rounded-2xl overflow-hidden bg-muted mb-4 shadow-sm">
            <Image
              src={pension.photos[activePhotoIdx] ?? pension.photos[0]}
              alt={pension.title}
              fill
              unoptimized
              sizes="(max-width: 640px) 100vw, 480px"
              className="object-cover transition duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

            <button
              type="button"
              onClick={onClose}
              className="absolute top-3 left-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md hover:bg-black/80 active:scale-90 transition shadow-sm"
              aria-label="Cerrar detalle"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            <div className="absolute top-3 right-3 flex items-center gap-2">
              <button
                type="button"
                onClick={() => toggleFavorite(pension.id)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-black/60 backdrop-blur-md text-white hover:text-primary active:scale-90 transition shadow-sm"
                aria-label="Guardar en favoritos"
              >
                <Heart className={`h-5 w-5 ${isFav ? 'fill-primary text-primary' : ''}`} />
              </button>
            </div>

            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
              <div className="flex gap-1.5">
                {pension.photos.map((_, i) => (
                  <button
                    key={`photo-dot-${pension.id}-${i}`}
                    type="button"
                    onClick={() => setActivePhotoIdx(i)}
                    className={`h-1.5 rounded-full transition-all ${
                      i === activePhotoIdx ? 'w-6 bg-primary' : 'w-2 bg-white/40'
                    }`}
                  />
                ))}
              </div>
              <Badge className="bg-primary text-primary-foreground font-bold text-xs shadow">
                ${pension.priceMonthlyClp.toLocaleString('es-CL')} CLP/mes
              </Badge>
            </div>
          </div>

          <DrawerHeader className="p-0 text-left mb-4">
            <div className="flex items-center gap-2 mb-1.5">
              {pension.isVerified && (
                <Badge
                  variant="outline"
                  className="border-primary/40 bg-primary/10 text-primary gap-1 text-[11px]"
                >
                  <ShieldCheck className="h-3 w-3" />
                  Verificado BuscaTuNido
                </Badge>
              )}
              <div className="flex items-center gap-1 text-xs font-semibold text-amber-500">
                <Star className="h-3.5 w-3.5 fill-amber-500" />
                <span>{pension.ratingAverage.toFixed(1)}</span>
                <span className="text-muted-foreground font-normal">
                  ({pension.reviewsCount} reseñas)
                </span>
              </div>
            </div>

            <DrawerTitle className="text-xl font-bold text-foreground leading-tight">
              {pension.title}
            </DrawerTitle>
            <DrawerDescription className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
              <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span>
                {pension.address}, {pension.neighborhood}, {pension.city}
              </span>
            </DrawerDescription>
          </DrawerHeader>

          <div className="mb-4 rounded-xl border border-primary/20 bg-primary/5 p-3">
            <div className="flex items-center gap-2 text-xs font-medium text-primary">
              <MapPin className="h-3.5 w-3.5" />
              <span>
                A {pension.distanceToUniversityMeters}m de {pension.nearestUniversityName}
              </span>
            </div>
          </div>

          <div className="mb-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Descripción de la Pensión
            </h4>
            <p className="text-sm text-foreground/90 leading-relaxed">{pension.description}</p>
          </div>

          <div className="mb-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2.5">
              Servicios y Comodidades Incluidas
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div
                className={`flex items-center gap-2 rounded-lg border p-2.5 ${
                  pension.includesWifi
                    ? 'border-primary/30 bg-muted/40 text-foreground'
                    : 'border-border text-muted-foreground line-through opacity-50'
                }`}
              >
                <Wifi className="h-4 w-4 text-primary" />
                <span>WiFi Alta Velocidad</span>
              </div>
              <div
                className={`flex items-center gap-2 rounded-lg border p-2.5 ${
                  pension.includesMeals
                    ? 'border-primary/30 bg-muted/40 text-foreground'
                    : 'border-border text-muted-foreground opacity-50'
                }`}
              >
                <Utensils className="h-4 w-4 text-primary" />
                <span>{pension.includesMeals ? 'Comida incluida' : 'Cocina libre uso'}</span>
              </div>
              <div
                className={`flex items-center gap-2 rounded-lg border p-2.5 ${
                  pension.includesStudyRoom
                    ? 'border-primary/30 bg-muted/40 text-foreground'
                    : 'border-border text-muted-foreground opacity-50'
                }`}
              >
                <BookOpen className="h-4 w-4 text-primary" />
                <span>Sala de Estudio</span>
              </div>
              <div
                className={`flex items-center gap-2 rounded-lg border p-2.5 ${
                  pension.includesLaundry
                    ? 'border-primary/30 bg-muted/40 text-foreground'
                    : 'border-border text-muted-foreground opacity-50'
                }`}
              >
                <Wind className="h-4 w-4 text-primary" />
                <span>Lavandería</span>
              </div>
            </div>
          </div>

          {pension.curfewDescription && (
            <div className="mb-5 rounded-xl border border-border bg-muted/30 p-3.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Reglas de Convivencia
              </h4>
              <div className="flex flex-col gap-2 text-xs text-foreground/90">
                <div className="flex items-start gap-2">
                  <Clock className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                  <span>{pension.curfewDescription}</span>
                </div>
                {pension.visitsPolicy && (
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>{pension.visitsPolicy}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="mb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Habitaciones Disponibles
            </h4>
            <div className="flex flex-col gap-2">
              {pension.rooms.map((room) => (
                <div
                  key={room.id}
                  className="flex items-center justify-between rounded-xl border border-border bg-muted/30 p-3"
                >
                  <div>
                    <h5 className="text-xs font-semibold text-foreground">{room.title}</h5>
                    <p className="text-[11px] text-muted-foreground">
                      {room.hasPrivateBathroom ? 'Baño privado' : 'Baño compartido'} •{' '}
                      {room.isAvailable ? 'Disponible ahora' : 'Ocupada'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-primary">
                      ${room.priceMonthlyClp.toLocaleString('es-CL')}
                    </span>
                    <span className="block text-[10px] text-muted-foreground">CLP / mes</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DrawerFooter className="border-t border-border/80 bg-card p-4">
          <Button
            id="btn-contact-landlord"
            onClick={() => setContacted(true)}
            className="w-full h-12 bg-primary hover:opacity-90 text-primary-foreground font-bold text-sm rounded-xl shadow-md active:scale-[0.98] transition"
          >
            {contacted ? (
              <>
                <Check className="mr-2 h-4 w-4" /> Solicitud Enviada
              </>
            ) : (
              <>
                <MessageCircle className="mr-2 h-4 w-4" /> Contactar al Propietario
              </>
            )}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
