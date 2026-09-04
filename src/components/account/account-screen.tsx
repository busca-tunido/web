'use client';

import { Bell, GraduationCap, Laptop, LogOut, Moon, Shield, Sun, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/lib/auth-context';
import { type Theme, useTheme } from '@/lib/theme-context';
import type { UserRole } from '@/lib/types';

export function AccountScreen() {
  const { user, logout, loginAsDemo } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();

  if (!user) return null;

  const themeOptions: Array<{ id: Theme; label: string; icon: typeof Laptop; sublabel: string }> = [
    { id: 'system', label: 'Sistema', icon: Laptop, sublabel: 'Auto' },
    { id: 'light', label: 'Claro', icon: Sun, sublabel: 'Papel cálido' },
    { id: 'dark', label: 'Oscuro', icon: Moon, sublabel: 'Piedra cálido' },
  ];

  return (
    <div id="account-screen-view" className="flex flex-col gap-5 px-4 pb-28 pt-2">
      <div className="flex items-center gap-3.5">
        <div className="relative h-14 w-14 overflow-hidden rounded-2xl border-2 border-primary/40 bg-card shadow-md">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.firstName} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
              <User className="h-6 w-6" />
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-foreground">
              {user.firstName} {user.lastName}
            </h2>
            <Badge
              variant="outline"
              className="border-primary/40 bg-primary/10 text-primary text-[10px]"
            >
              {user.role}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{user.email}</p>
          {user.universityName && (
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-1">
              <GraduationCap className="h-3 w-3 text-primary" />
              <span>{user.universityName}</span>
            </div>
          )}
        </div>
      </div>

      <Card className="border-border bg-card shadow-sm">
        <CardContent className="p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Modo Visual
            </h3>
            <span className="text-[11px] text-muted-foreground">
              Activo: <strong className="text-foreground capitalize">{resolvedTheme}</strong>
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {themeOptions.map((opt) => {
              const Icon = opt.icon;
              const isSelected = theme === opt.id;
              return (
                <button
                  key={opt.id}
                  id={`theme-option-${opt.id}`}
                  type="button"
                  onClick={() => setTheme(opt.id)}
                  className={`flex flex-col items-center justify-center gap-1 rounded-xl border p-2.5 text-xs font-semibold transition active:scale-95 ${
                    isSelected
                      ? 'border-primary bg-primary/15 text-primary shadow-sm'
                      : 'border-border bg-background/60 text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="leading-tight">{opt.label}</span>
                  <span className="text-[10px] font-normal opacity-70">{opt.sublabel}</span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card shadow-sm">
        <CardContent className="p-4 flex flex-col gap-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Cambiar Rol Activo (Modo Prueba)
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {(['STUDENT', 'LANDLORD', 'ADMIN'] as UserRole[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => loginAsDemo(r)}
                className={`rounded-xl border p-2.5 text-xs font-semibold transition active:scale-95 ${
                  user.role === r
                    ? 'border-primary bg-primary/15 text-primary shadow-sm'
                    : 'border-border bg-background/60 text-muted-foreground hover:text-foreground hover:bg-secondary'
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
          className="flex items-center justify-between rounded-xl border border-border bg-card p-3.5 text-xs text-foreground hover:bg-secondary transition shadow-sm"
        >
          <div className="flex items-center gap-2.5">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <span>Validación de Matrícula Institucional</span>
          </div>
          <Badge className="bg-primary/20 text-primary border-0 text-[10px]">Acreditado</Badge>
        </button>

        <button
          type="button"
          className="flex items-center justify-between rounded-xl border border-border bg-card p-3.5 text-xs text-foreground hover:bg-secondary transition shadow-sm"
        >
          <div className="flex items-center gap-2.5">
            <Bell className="h-4 w-4 text-muted-foreground" />
            <span>Notificaciones de Cupos y Disponibilidad</span>
          </div>
          <span className="text-muted-foreground text-[11px]">Activas</span>
        </button>
      </div>

      <Button
        id="btn-logout"
        variant="outline"
        onClick={logout}
        className="mt-4 h-12 w-full border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive font-semibold text-xs"
      >
        <LogOut className="h-4 w-4 mr-2" />
        Cerrar Sesión
      </Button>
    </div>
  );
}
