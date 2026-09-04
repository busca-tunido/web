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
        className="max-h-[92vh] max-w-lg mx-auto bg-zinc-950 border-zinc-800 text-zinc-50 overflow-hidden flex flex-col"
      >
        <div className="mx-auto mt-2.5 mb-1 h-1.5 w-12 rounded-full bg-zinc-700/80 shrink-0" />

        <div className="overflow-y-auto flex-1 px-4 pt-1 pb-6">
          <div className="relative h-64 w-full rounded-2xl overflow-hidden bg-zinc-900 mb-4">
            <img
              src={pension.photos[activePhotoIdx] ?? pension.photos[0]}
              alt={pension.title}
              className="h-full w-full object-cover transition duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-black/30" />

            <button
              type="button"
              onClick={onClose}
              className="absolute top-3 left-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md hover:bg-black/80 active:scale-90 transition"
              aria-label="Cerrar detalle"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            <div className="absolute top-3 right-3 flex items-center gap-2">
              <button
                type="button"
                onClick={() => toggleFavorite(pension.id)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-black/60 backdrop-blur-md text-white hover:text-emerald-400 active:scale-90 transition"
                aria-label="Guardar en favoritos"
              >
                <Heart className={`h-5 w-5 ${isFav ? 'fill-emerald-400 text-emerald-400' : ''}`} />
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
                      i === activePhotoIdx ? 'w-6 bg-emerald-400' : 'w-2 bg-white/40'
                    }`}
                  />
                ))}
              </div>
              <Badge className="bg-emerald-500/90 text-zinc-950 font-bold text-xs">
                ${pension.priceMonthlyClp.toLocaleString('es-CL')} CLP/mes
              </Badge>
            </div>
          </div>

          <DrawerHeader className="p-0 text-left mb-4">
            <div className="flex items-center gap-2 mb-1.5">
              {pension.isVerified && (
                <Badge
                  variant="outline"
                  className="border-emerald-500/40 bg-emerald-500/10 text-emerald-400 gap-1 text-[11px]"
                >
                  <ShieldCheck className="h-3 w-3" />
                  Verificado Busca TuNido
                </Badge>
              )}
              <div className="flex items-center gap-1 text-xs font-semibold text-amber-400">
                <Star className="h-3.5 w-3.5 fill-amber-400" />
                <span>{pension.ratingAverage.toFixed(1)}</span>
                <span className="text-zinc-500 font-normal">({pension.reviewsCount} reseñas)</span>
              </div>
            </div>

            <DrawerTitle className="text-xl font-bold text-white leading-tight">
              {pension.title}
            </DrawerTitle>
            <DrawerDescription className="text-xs text-zinc-400 flex items-center gap-1.5 mt-1">
              <MapPin className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
              <span>
                {pension.address}, {pension.neighborhood}, {pension.city}
              </span>
            </DrawerDescription>
          </DrawerHeader>

          <div className="mb-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-300">
              <MapPin className="h-3.5 w-3.5" />
              <span>
                A {pension.distanceToUniversityMeters}m de {pension.nearestUniversityName}
              </span>
            </div>
          </div>

          <div className="mb-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
              Descripción de la Pensión
            </h4>
            <p className="text-sm text-zinc-300 leading-relaxed">{pension.description}</p>
          </div>

          <div className="mb-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2.5">
              Servicios y Comodidades Incluidas
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div
                className={`flex items-center gap-2 rounded-lg border p-2.5 ${
                  pension.includesWifi
                    ? 'border-emerald-500/30 bg-zinc-900/80 text-zinc-200'
                    : 'border-zinc-800 text-zinc-600 line-through'
                }`}
              >
                <Wifi className="h-4 w-4 text-emerald-400" />
                <span>WiFi Alta Velocidad</span>
              </div>
              <div
                className={`flex items-center gap-2 rounded-lg border p-2.5 ${
                  pension.includesMeals
                    ? 'border-emerald-500/30 bg-zinc-900/80 text-zinc-200'
                    : 'border-zinc-800 text-zinc-600'
                }`}
              >
                <Utensils className="h-4 w-4 text-emerald-400" />
                <span>{pension.includesMeals ? 'Comida incluida' : 'Cocina libre uso'}</span>
              </div>
              <div
                className={`flex items-center gap-2 rounded-lg border p-2.5 ${
                  pension.includesStudyRoom
                    ? 'border-emerald-500/30 bg-zinc-900/80 text-zinc-200'
                    : 'border-zinc-800 text-zinc-600'
                }`}
              >
                <BookOpen className="h-4 w-4 text-emerald-400" />
                <span>Sala de Estudio</span>
              </div>
              <div
                className={`flex items-center gap-2 rounded-lg border p-2.5 ${
                  pension.includesLaundry
                    ? 'border-emerald-500/30 bg-zinc-900/80 text-zinc-200'
                    : 'border-zinc-800 text-zinc-600'
                }`}
              >
                <Wind className="h-4 w-4 text-emerald-400" />
                <span>Lavandería</span>
              </div>
            </div>
          </div>

          {pension.curfewDescription && (
            <div className="mb-5 rounded-xl border border-zinc-800 bg-zinc-900/50 p-3.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                Reglas de Convivencia
              </h4>
              <div className="flex flex-col gap-2 text-xs text-zinc-300">
                <div className="flex items-start gap-2">
                  <Clock className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>{pension.curfewDescription}</span>
                </div>
                {pension.visitsPolicy && (
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{pension.visitsPolicy}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="mb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
              Habitaciones Disponibles
            </h4>
            <div className="flex flex-col gap-2">
              {pension.rooms.map((room) => (
                <div
                  key={room.id}
                  className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/70 p-3"
                >
                  <div>
                    <h5 className="text-xs font-semibold text-white">{room.title}</h5>
                    <p className="text-[11px] text-zinc-400">
                      {room.hasPrivateBathroom ? 'Baño privado' : 'Baño compartido'} •{' '}
                      {room.isAvailable ? 'Disponible ahora' : 'Ocupada'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-emerald-400">
                      ${room.priceMonthlyClp.toLocaleString('es-CL')}
                    </span>
                    <span className="block text-[10px] text-zinc-500">CLP / mes</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DrawerFooter className="border-t border-zinc-800/80 bg-zinc-950 p-4">
          <Button
            id="btn-contact-landlord"
            onClick={() => setContacted(true)}
            className="w-full h-12 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition"
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
