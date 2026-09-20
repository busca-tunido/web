'use client';

import {
  ArrowRight,
  Bell,
  GraduationCap,
  Home,
  Laptop,
  Lock,
  LogOut,
  Mail,
  Moon,
  Shield,
  Sparkles,
  Sun,
  User,
} from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { EmailCheckStep } from '@/components/auth/email-check-step';
import { Badge } from '@/components/ui/badge';
import { BrandLogo } from '@/components/ui/brand-logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/lib/auth-context';
import { type Theme, useTheme } from '@/lib/theme-context';

export function AccountScreen() {
  const { user, logout, login } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [authRole, setAuthRole] = useState<'student' | 'landlord'>('student');
  const [landlordEmail, setLandlordEmail] = useState('');
  const [landlordPassword, setLandlordPassword] = useState('');
  const [landlordLoading, setLandlordLoading] = useState(false);
  const [landlordError, setLandlordError] = useState('');

  const themeOptions: Array<{ id: Theme; label: string; icon: typeof Laptop; sublabel: string }> = [
    { id: 'system', label: 'Sistema', icon: Laptop, sublabel: 'Auto' },
    { id: 'light', label: 'Claro', icon: Sun, sublabel: 'Papel cálido' },
    { id: 'dark', label: 'Oscuro', icon: Moon, sublabel: 'Piedra cálido' },
  ];

  const handleLandlordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLandlordError('');

    if (!landlordEmail.trim() || !landlordEmail.includes('@')) {
      setLandlordError('Ingresa un correo válido');
      return;
    }

    setLandlordLoading(true);
    try {
      await login(landlordEmail, landlordPassword);
    } catch {
      setLandlordError('Error al autenticar. Verifica las credenciales.');
    } finally {
      setLandlordLoading(false);
    }
  };

  const handleDemoStudent = async () => {
    try {
      await login('estudiante.demo@alumnos.uchile.cl', 'Password123!');
    } catch {
      setLandlordError('No fue posible conectar con el servicio de autenticación.');
    }
  };

  const handleDemoLandlord = async () => {
    try {
      await login('propietario.demo@buscatunido.cl', 'Password123!');
    } catch {
      setLandlordError('No fue posible conectar con el servicio de autenticación.');
    }
  };

  if (!user) {
    return (
      <div
        id="account-screen-auth-view"
        className="flex flex-col gap-6 px-4 md:px-0 max-w-xl mx-auto w-full pb-20 md:pb-12 pt-2"
      >
        <div className="flex flex-col items-center text-center gap-2">
          <div className="flex items-center justify-center p-3 rounded-2xl bg-primary/10 border border-primary/20 text-primary">
            <User className="h-7 w-7" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Accede a BuscaTuNido
          </h1>
          <p className="text-xs text-muted-foreground max-w-sm">
            Inicia sesión o regístrate para validar pensiones universitarias, guardar favoritos y
            calificar tu experiencia estudiantil.
          </p>
        </div>

        <Card className="border-border bg-card shadow-sm overflow-hidden">
          <div className="grid grid-cols-2 border-b border-border bg-muted/40 p-1">
            <button
              id="tab-auth-student"
              type="button"
              onClick={() => {
                setAuthRole('student');
                setLandlordError('');
              }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                authRole === 'student'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <GraduationCap className="h-4 w-4 text-primary" />
              <span>Estudiantes</span>
            </button>
            <button
              id="tab-auth-landlord"
              type="button"
              onClick={() => {
                setAuthRole('landlord');
                setLandlordError('');
              }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                authRole === 'landlord'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Home className="h-4 w-4 text-primary" />
              <span>Dueños de Pensión</span>
            </button>
          </div>

          <CardContent className="p-5 flex flex-col gap-4">
            {authRole === 'student' ? (
              <EmailCheckStep />
            ) : (
              <form onSubmit={handleLandlordSubmit} className="flex flex-col gap-3">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary">
                    <Home className="h-3.5 w-3.5" />
                  </div>
                  <h2 className="text-base font-semibold text-foreground">Acceso para Dueños</h2>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="account-landlord-email"
                    className="text-xs font-medium text-muted-foreground flex items-center gap-1.5"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    Correo del Propietario
                  </label>
                  <input
                    id="account-landlord-email"
                    type="email"
                    required
                    value={landlordEmail}
                    onChange={(e) => setLandlordEmail(e.target.value)}
                    placeholder="propietario@ejemplo.com"
                    className="min-h-12 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="account-landlord-password"
                    className="text-xs font-medium text-muted-foreground flex items-center gap-1.5"
                  >
                    <Lock className="h-3.5 w-3.5" />
                    Contraseña
                  </label>
                  <input
                    id="account-landlord-password"
                    type="password"
                    required
                    value={landlordPassword}
                    onChange={(e) => setLandlordPassword(e.target.value)}
                    placeholder="••••••••"
                    className="min-h-12 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
                  />
                </div>

                {landlordError && (
                  <p className="text-xs text-destructive font-medium">{landlordError}</p>
                )}

                <Button
                  id="btn-account-landlord-submit"
                  type="submit"
                  disabled={landlordLoading}
                  className="mt-2 h-12 w-full bg-primary font-bold text-primary-foreground hover:opacity-90 text-sm shadow-md active:scale-[0.98] transition"
                >
                  {landlordLoading ? 'Validando...' : 'Iniciar Sesión como Dueño'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            )}

            <div className="border-t border-border pt-3 mt-1 flex flex-col gap-2">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                <Sparkles className="h-3 w-3 text-primary" />
                <span>Acceso Rápido Demo (Ambiente de Pruebas)</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  id="btn-demo-student-login"
                  type="button"
                  variant="outline"
                  onClick={handleDemoStudent}
                  className="h-10 text-xs border-border bg-background hover:bg-secondary font-medium cursor-pointer"
                >
                  <GraduationCap className="h-3.5 w-3.5 mr-1.5 text-primary" />
                  Estudiante Demo
                </Button>
                <Button
                  id="btn-demo-landlord-login"
                  type="button"
                  variant="outline"
                  onClick={handleDemoLandlord}
                  className="h-10 text-xs border-border bg-background hover:bg-secondary font-medium cursor-pointer"
                >
                  <Home className="h-3.5 w-3.5 mr-1.5 text-primary" />
                  Dueño Demo
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

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
                    id={`unauth-theme-option-${opt.id}`}
                    type="button"
                    onClick={() => setTheme(opt.id)}
                    className={`flex flex-col items-center justify-center gap-1 rounded-xl border p-2.5 text-xs font-semibold transition active:scale-95 cursor-pointer ${
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

        <div className="flex flex-col items-center justify-center pt-2 pb-2 text-center opacity-80">
          <BrandLogo size="sm" priority={false} />
          <p className="mt-1 text-[11px] font-semibold tracking-wider text-muted-foreground">
            Tu hogar universitario
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      id="account-screen-view"
      className="flex flex-col gap-6 px-4 md:px-0 max-w-2xl mx-auto w-full pb-20 md:pb-12 pt-2"
    >
      <div className="flex items-center gap-3.5">
        <div className="relative h-14 w-14 overflow-hidden rounded-2xl border-2 border-primary/40 bg-card shadow-md">
          {user.avatarUrl ? (
            <Image
              src={user.avatarUrl}
              alt={user.firstName}
              fill
              unoptimized
              sizes="56px"
              className="object-cover"
            />
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

      <div className="flex flex-col gap-2">
        <button
          type="button"
          className="flex items-center justify-between rounded-xl border border-border bg-card p-3.5 text-xs text-foreground hover:bg-secondary transition shadow-sm"
        >
          <div className="flex items-center gap-2.5">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <span>Validación de Matrícula Institucional</span>
          </div>
          <Badge className="bg-primary/20 text-primary border-0 text-[10px]">
            {user.role === 'STUDENT' ? 'Acreditado' : 'Verificado'}
          </Badge>
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

      <div className="flex flex-col items-center justify-center pt-4 pb-2 text-center opacity-80">
        <BrandLogo size="sm" priority={false} />
        <p className="mt-1 text-[11px] font-semibold tracking-wider text-muted-foreground">
          Tu hogar universitario
        </p>
      </div>
    </div>
  );
}
