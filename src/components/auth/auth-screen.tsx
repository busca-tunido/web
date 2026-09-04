'use client';

import { ArrowRight, CheckCircle2, Compass, GraduationCap, Home, Shield } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { useAuth } from '@/lib/auth-context';

type AuthScreenProps = {
  onContinueAsGuest?: () => void;
};

export function AuthScreen({ onContinueAsGuest }: AuthScreenProps) {
  const { loginAsStudent, loginAsDemo } = useAuth();
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'email' | 'password'>('email');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const isEduEmail =
    email.endsWith('.edu') ||
    email.endsWith('.cl') ||
    email.includes('alumnos') ||
    email.includes('est') ||
    email.includes('uchile') ||
    email.includes('uc');

  const handleStudentContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Ingresa un correo institucional válido');
      return;
    }

    if (step === 'email') {
      setStep('password');
      return;
    }

    setLoading(true);
    try {
      await loginAsStudent(email);
    } catch {
      setErrorMessage('Error al autenticar. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="auth-screen-container"
      className="flex min-h-screen flex-col justify-between bg-background px-4 py-8 text-foreground transition-colors"
    >
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
        <div className="mb-6 flex items-center justify-center gap-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 border border-primary/30 text-primary shadow-md">
            <Home className="h-6 w-6" />
          </div>
          <span className="text-2xl font-black tracking-tight text-foreground">BuscaTuNido</span>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl text-foreground">
            Iniciar sesión o regístrate
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Plataforma comunitaria de arriendo y validación para estudiantes universitarios
          </p>
        </div>

        <Card className="border-border bg-card shadow-lg">
          <CardContent className="p-6 flex flex-col gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary">
                  <GraduationCap className="h-3.5 w-3.5" />
                </div>
                <h2 className="text-base font-semibold text-foreground">Soy estudiante</h2>
              </div>

              <form onSubmit={handleStudentContinue} className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="student-email"
                    className="text-xs font-medium text-muted-foreground"
                  >
                    Correo institucional universitario
                  </label>
                  <input
                    id="student-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ejemplo@alumnos.uchile.cl"
                    className="h-12 rounded-xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
                  />
                  {email && isEduEmail && (
                    <div className="flex items-center gap-1.5 text-[11px] text-primary mt-1">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Dominio institucional detectado</span>
                    </div>
                  )}
                </div>

                {step === 'password' && (
                  <div className="flex flex-col gap-1.5 animate-in fade-in-50 duration-200">
                    <label
                      htmlFor="student-password"
                      className="text-xs font-medium text-muted-foreground"
                    >
                      Contraseña
                    </label>
                    <input
                      id="student-password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="h-12 rounded-xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
                    />
                  </div>
                )}

                {errorMessage && (
                  <p className="text-xs text-destructive font-medium">{errorMessage}</p>
                )}

                <Button
                  id="btn-student-continue"
                  type="submit"
                  disabled={loading}
                  className="mt-2 h-12 w-full bg-primary font-bold text-primary-foreground hover:opacity-90 text-sm shadow-md active:scale-[0.98] transition"
                >
                  {loading ? 'Validando...' : step === 'email' ? 'Continuar' : 'Acceder'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </div>

            <div className="relative flex items-center justify-center">
              <div className="w-full border-t border-border" />
              <span className="absolute bg-card px-3 text-xs font-medium text-muted-foreground">
                No soy estudiante
              </span>
            </div>

            <Drawer>
              <DrawerTrigger
                render={
                  <Button
                    id="btn-other-options"
                    variant="outline"
                    className="h-12 w-full border-border bg-background font-medium text-foreground hover:bg-secondary"
                  >
                    Opciones de acceso
                  </Button>
                }
              />
              <DrawerContent className="bg-card border-border text-foreground max-w-lg mx-auto">
                <DrawerHeader>
                  <DrawerTitle className="text-foreground text-lg">
                    Acceso para Propietarios y Administradores
                  </DrawerTitle>
                  <DrawerDescription className="text-muted-foreground text-xs">
                    Selecciona tu perfil de acceso para publicar o gestionar pensiones
                    universitarias.
                  </DrawerDescription>
                </DrawerHeader>

                <div className="p-4 flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={() => loginAsDemo('LANDLORD')}
                    className="flex items-center gap-3.5 rounded-xl border border-border bg-background p-3.5 text-left transition hover:border-primary/50 hover:bg-secondary"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/30">
                      <Home className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">
                        Soy Propietario / Dueño de Pensión
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Publica habitaciones y gestiona postulaciones de estudiantes
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => loginAsDemo('ADMIN')}
                    className="flex items-center gap-3.5 rounded-xl border border-border bg-background p-3.5 text-left transition hover:border-primary/50 hover:bg-secondary"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30">
                      <Shield className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">
                        Administrador / Moderador
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Verifica acreditaciones de pensión y reportes de estudiantes
                      </p>
                    </div>
                  </button>
                </div>

                <DrawerFooter>
                  <DrawerClose
                    render={
                      <Button
                        variant="ghost"
                        className="w-full text-muted-foreground hover:text-foreground"
                      >
                        Cerrar
                      </Button>
                    }
                  />
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          </CardContent>
        </Card>

        <div className="mt-6 flex flex-col items-center justify-center">
          <Drawer>
            <DrawerTrigger
              render={
                <button
                  id="btn-continue-guest"
                  type="button"
                  className="text-center text-xs text-muted-foreground hover:text-foreground underline underline-offset-4 transition cursor-pointer"
                >
                  Explorar alojamientos como invitado
                </button>
              }
            />
            <DrawerContent className="bg-card border-border text-foreground max-w-lg mx-auto">
              <DrawerHeader>
                <DrawerTitle className="text-foreground text-lg">
                  Acceso de Prueba e Invitado
                </DrawerTitle>
                <DrawerDescription className="text-muted-foreground text-xs">
                  Selecciona cómo deseas explorar y probar la plataforma BuscaTuNido.
                </DrawerDescription>
              </DrawerHeader>

              <div className="p-4 flex flex-col gap-3">
                {onContinueAsGuest && (
                  <button
                    type="button"
                    onClick={onContinueAsGuest}
                    className="flex items-center gap-3.5 rounded-xl border border-border bg-background p-3.5 text-left transition hover:border-primary/50 hover:bg-secondary active:scale-[0.99]"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/30">
                      <Compass className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">
                        Continuar como Invitado
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Explora alojamientos, mapa y filtros sin iniciar sesión
                      </p>
                    </div>
                  </button>
                )}

                <button
                  id="btn-demo-student"
                  type="button"
                  onClick={() => loginAsDemo('STUDENT')}
                  className="flex items-center gap-3.5 rounded-xl border border-border bg-background p-3.5 text-left transition hover:border-primary/50 hover:bg-secondary active:scale-[0.99]"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">
                      Estudiante Universitario Demo
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Accede como estudiante acreditado con favoritos y reservas
                    </p>
                  </div>
                </button>

                <button
                  id="btn-demo-landlord"
                  type="button"
                  onClick={() => loginAsDemo('LANDLORD')}
                  className="flex items-center gap-3.5 rounded-xl border border-border bg-background p-3.5 text-left transition hover:border-primary/50 hover:bg-secondary active:scale-[0.99]"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/30">
                    <Home className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">
                      Propietario / Dueño Demo
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Accede con permisos para publicar y gestionar pensiones
                    </p>
                  </div>
                </button>
              </div>

              <DrawerFooter>
                <DrawerClose
                  render={
                    <Button
                      variant="ghost"
                      className="w-full text-muted-foreground hover:text-foreground"
                    >
                      Cerrar
                    </Button>
                  }
                />
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </div>
      </div>
    </div>
  );
}
