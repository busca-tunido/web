'use client';

import { ArrowRight, CheckCircle2, GraduationCap, Home, Shield, Sparkles } from 'lucide-react';
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
      className="flex min-h-screen flex-col justify-between bg-zinc-950 px-4 py-8 text-zinc-50"
    >
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
        <div className="mb-6 flex items-center justify-center gap-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-lg shadow-emerald-500/10">
            <Home className="h-6 w-6" />
          </div>
          <span className="text-2xl font-black tracking-tight text-white">Busca TuNido</span>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl text-zinc-100">
            Iniciar sesión o regístrate
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Plataforma comunitaria de arriendo y validación para estudiantes foráneos
          </p>
        </div>

        <Card className="border-zinc-800/80 bg-zinc-900/70 backdrop-blur-xl shadow-2xl">
          <CardContent className="p-6 flex flex-col gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                  <GraduationCap className="h-3.5 w-3.5" />
                </div>
                <h2 className="text-base font-semibold text-zinc-100">Soy estudiante</h2>
              </div>

              <form onSubmit={handleStudentContinue} className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="student-email" className="text-xs font-medium text-zinc-400">
                    Correo institucional universitario
                  </label>
                  <input
                    id="student-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ejemplo@alumnos.uchile.cl"
                    className="h-12 rounded-xl border border-zinc-700/80 bg-zinc-950/80 px-4 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                  {email && isEduEmail && (
                    <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 mt-1">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Dominio institucional detectado</span>
                    </div>
                  )}
                </div>

                {step === 'password' && (
                  <div className="flex flex-col gap-1.5 animate-in fade-in-50 duration-200">
                    <label htmlFor="student-password" className="text-xs font-medium text-zinc-400">
                      Contraseña
                    </label>
                    <input
                      id="student-password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="h-12 rounded-xl border border-zinc-700/80 bg-zinc-950/80 px-4 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                )}

                {errorMessage && (
                  <p className="text-xs text-rose-400 font-medium">{errorMessage}</p>
                )}

                <Button
                  id="btn-student-continue"
                  type="submit"
                  disabled={loading}
                  className="mt-2 h-12 w-full bg-emerald-500 font-bold text-zinc-950 hover:bg-emerald-400 text-sm shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
                >
                  {loading ? 'Validando...' : step === 'email' ? 'Continuar' : 'Acceder'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </div>

            <div className="relative flex items-center justify-center">
              <div className="w-full border-t border-zinc-800" />
              <span className="absolute bg-zinc-900 px-3 text-xs font-medium text-zinc-500">
                No soy estudiante
              </span>
            </div>

            <Drawer>
              <DrawerTrigger
                render={
                  <Button
                    id="btn-other-options"
                    variant="outline"
                    className="h-12 w-full border-zinc-700 bg-zinc-950/60 font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white"
                  >
                    Opciones de acceso
                  </Button>
                }
              />
              <DrawerContent className="bg-zinc-900 border-zinc-800 text-zinc-50 max-w-lg mx-auto">
                <DrawerHeader>
                  <DrawerTitle className="text-zinc-100 text-lg">
                    Acceso para Propietarios y Administradores
                  </DrawerTitle>
                  <DrawerDescription className="text-zinc-400 text-xs">
                    Selecciona tu perfil de acceso para publicar o gestionar pensiones
                    universitarias.
                  </DrawerDescription>
                </DrawerHeader>

                <div className="p-4 flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={() => loginAsDemo('LANDLORD')}
                    className="flex items-center gap-3.5 rounded-xl border border-zinc-800 bg-zinc-950/60 p-3.5 text-left transition hover:border-emerald-500/50 hover:bg-zinc-800/60"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
                      <Home className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-zinc-100">
                        Soy Propietario / Dueño de Pensión
                      </h3>
                      <p className="text-xs text-zinc-400">
                        Publica habitaciones y gestiona postulaciones de estudiantes
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => loginAsDemo('ADMIN')}
                    className="flex items-center gap-3.5 rounded-xl border border-zinc-800 bg-zinc-950/60 p-3.5 text-left transition hover:border-emerald-500/50 hover:bg-zinc-800/60"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30">
                      <Shield className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-zinc-100">
                        Administrador / Moderador
                      </h3>
                      <p className="text-xs text-zinc-400">
                        Verifica acreditaciones de pensión y reportes de estudiantes
                      </p>
                    </div>
                  </button>
                </div>

                <DrawerFooter>
                  <DrawerClose
                    render={
                      <Button variant="ghost" className="w-full text-zinc-400 hover:text-white">
                        Cerrar
                      </Button>
                    }
                  />
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          </CardContent>
        </Card>

        <div className="mt-6 flex flex-col gap-2">
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Acceso rápido de prueba
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              id="btn-demo-student"
              type="button"
              onClick={() => loginAsDemo('STUDENT')}
              className="flex items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20"
            >
              <GraduationCap className="h-4 w-4" />
              <span>Estudiante Demo</span>
            </button>

            <button
              id="btn-demo-landlord"
              type="button"
              onClick={() => loginAsDemo('LANDLORD')}
              className="flex items-center justify-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-2.5 text-xs font-semibold text-amber-300 hover:bg-amber-500/20"
            >
              <Home className="h-4 w-4" />
              <span>Propietario Demo</span>
            </button>
          </div>

          {onContinueAsGuest && (
            <button
              id="btn-continue-guest"
              type="button"
              onClick={onContinueAsGuest}
              className="mt-2 text-center text-xs text-zinc-400 hover:text-zinc-200 underline underline-offset-4"
            >
              Explorar alojamientos como invitado
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
