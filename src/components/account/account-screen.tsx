'use client';

import { Bell, GraduationCap, LogOut, Shield, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/lib/auth-context';
import type { UserRole } from '@/lib/types';

export function AccountScreen() {
  const { user, logout, loginAsDemo } = useAuth();

  if (!user) return null;

  return (
    <div id="account-screen-view" className="flex flex-col gap-5 px-4 pb-28 pt-2">
      <div className="flex items-center gap-3.5">
        <div className="relative h-14 w-14 overflow-hidden rounded-2xl border-2 border-emerald-500/50 bg-zinc-900 shadow-lg">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.firstName} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-zinc-800 text-zinc-400">
              <User className="h-6 w-6" />
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white">
              {user.firstName} {user.lastName}
            </h2>
            <Badge
              variant="outline"
              className="border-emerald-500/40 bg-emerald-500/10 text-emerald-400 text-[10px]"
            >
              {user.role}
            </Badge>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">{user.email}</p>
          {user.universityName && (
            <div className="flex items-center gap-1 text-[11px] text-zinc-400 mt-1">
              <GraduationCap className="h-3 w-3 text-emerald-400" />
              <span>{user.universityName}</span>
            </div>
          )}
        </div>
      </div>

      <Card className="border-zinc-800 bg-zinc-900/60 backdrop-blur">
        <CardContent className="p-4 flex flex-col gap-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Cambiar Rol Activo (Modo Prueba)
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {(['STUDENT', 'LANDLORD', 'ADMIN'] as UserRole[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => loginAsDemo(r)}
                className={`rounded-xl border p-2.5 text-xs font-semibold transition ${
                  user.role === r
                    ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300'
                    : 'border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:text-white'
                }`}
              >
                {r === 'STUDENT' ? 'Estudiante' : r === 'LANDLORD' ? 'Propietario' : 'Admin'}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-2">
        <button
          type="button"
          className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/40 p-3.5 text-xs text-zinc-200 hover:bg-zinc-900 transition"
        >
          <div className="flex items-center gap-2.5">
            <Shield className="h-4 w-4 text-zinc-400" />
            <span>Validación de Matrícula Institucional</span>
          </div>
          <Badge className="bg-emerald-500/20 text-emerald-300 border-0 text-[10px]">
            Acreditado
          </Badge>
        </button>

        <button
          type="button"
          className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/40 p-3.5 text-xs text-zinc-200 hover:bg-zinc-900 transition"
        >
          <div className="flex items-center gap-2.5">
            <Bell className="h-4 w-4 text-zinc-400" />
            <span>Notificaciones de Cupos y Disponibilidad</span>
          </div>
          <span className="text-zinc-500 text-[11px]">Activas</span>
        </button>
      </div>

      <Button
        id="btn-logout"
        variant="outline"
        onClick={logout}
        className="mt-4 h-12 w-full border-rose-500/30 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 font-semibold text-xs"
      >
        <LogOut className="h-4 w-4 mr-2" />
        Cerrar Sesión
      </Button>
    </div>
  );
}
