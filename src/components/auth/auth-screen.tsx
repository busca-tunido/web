'use client';

import { ArrowRight, CheckCircle2, GraduationCap, Home, Lock, Mail } from 'lucide-react';
import { useState } from 'react';
import { BrandLogo } from '@/components/ui/brand-logo';
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

export function AuthScreen() {
  const { login } = useAuth();
  const [studentEmail, setStudentEmail] = useState('estudiante.demo@uchile.cl');
  const [studentPassword, setStudentPassword] = useState('Password123!');
  const [studentStep, setStudentStep] = useState<'email' | 'password'>('email');
  const [studentLoading, setStudentLoading] = useState(false);
  const [studentError, setStudentError] = useState('');

  const [landlordEmail, setLandlordEmail] = useState('propietario.demo@buscatunido.cl');
  const [landlordPassword, setLandlordPassword] = useState('Password123!');
  const [landlordLoading, setLandlordLoading] = useState(false);
  const [landlordError, setLandlordError] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const isEduEmail =
    studentEmail.endsWith('.edu') ||
    studentEmail.endsWith('.cl') ||
    studentEmail.includes('alumnos') ||
    studentEmail.includes('est') ||
    studentEmail.includes('uchile') ||
    studentEmail.includes('uc');

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStudentError('');

    if (!studentEmail.trim() || !studentEmail.includes('@')) {
      setStudentError('Ingresa un correo institucional válido');
      return;
    }

    if (studentStep === 'email') {
      setStudentStep('password');
      return;
    }

    setStudentLoading(true);
    try {
      await login(studentEmail, studentPassword);
    } catch {
      setStudentError('Error al autenticar. Verifica las credenciales.');
    } finally {
      setStudentLoading(false);
    }
  };

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
      setIsDrawerOpen(false);
    } catch {
      setLandlordError('Error al autenticar. Verifica las credenciales.');
    } finally {
      setLandlordLoading(false);
    }
  };

  return (
    <div
      id="auth-screen-container"
      className="flex min-h-screen flex-col justify-between bg-background px-4 py-8 text-foreground transition-colors"
    >
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
        <div className="mb-6 flex items-center justify-center">
          <BrandLogo size="md" />
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

              <form onSubmit={handleStudentSubmit} className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="student-email"
                    className="text-xs font-medium text-muted-foreground"
                  >
                    Correo institucional universitario
                  </label>
                  <div className="relative">
                    <input
                      id="student-email"
                      type="email"
                      required
                      value={studentEmail}
                      onChange={(e) => setStudentEmail(e.target.value)}
                      placeholder="ejemplo@alumnos.uchile.cl"
                      className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
                    />
                  </div>
                  {studentEmail && isEduEmail && (
                    <div className="flex items-center gap-1.5 text-[11px] text-primary mt-1">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Dominio institucional detectado</span>
                    </div>
                  )}
                </div>

                {studentStep === 'password' && (
                  <div className="flex flex-col gap-1.5 animate-in fade-in-50 duration-200">
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="student-password"
                        className="text-xs font-medium text-muted-foreground"
                      >
                        Contraseña
                      </label>
                      <button
                        type="button"
                        onClick={() => setStudentStep('email')}
                        className="text-[11px] text-primary hover:underline"
                      >
                        Cambiar correo
                      </button>
                    </div>
                    <input
                      id="student-password"
                      type="password"
                      required
                      value={studentPassword}
                      onChange={(e) => setStudentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="h-12 rounded-xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
                    />
                  </div>
                )}

                {studentError && (
                  <p className="text-xs text-destructive font-medium">{studentError}</p>
                )}

                <Button
                  id="btn-student-continue"
                  type="submit"
                  disabled={studentLoading}
                  className="mt-2 h-12 w-full bg-primary font-bold text-primary-foreground hover:opacity-90 text-sm shadow-md active:scale-[0.98] transition"
                >
                  {studentLoading
                    ? 'Validando...'
                    : studentStep === 'email'
                      ? 'Continuar'
                      : 'Acceder'}
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

            <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
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
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/30">
                      <Home className="h-4 w-4" />
                    </div>
                    <DrawerTitle className="text-foreground text-lg">
                      Acceso para Dueños
                    </DrawerTitle>
                  </div>
                  <DrawerDescription className="text-muted-foreground text-xs">
                    Accede con tu cuenta de propietario para publicar y administrar tus pensiones
                    universitarias.
                  </DrawerDescription>
                </DrawerHeader>

                <form onSubmit={handleLandlordSubmit} className="p-4 flex flex-col gap-3.5">
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="landlord-email"
                      className="text-xs font-medium text-muted-foreground flex items-center gap-1.5"
                    >
                      <Mail className="h-3.5 w-3.5" />
                      Correo electrónico de propietario
                    </label>
                    <input
                      id="landlord-email"
                      type="email"
                      required
                      value={landlordEmail}
                      onChange={(e) => setLandlordEmail(e.target.value)}
                      placeholder="propietario@buscatunido.cl"
                      className="h-12 rounded-xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="landlord-password"
                      className="text-xs font-medium text-muted-foreground flex items-center gap-1.5"
                    >
                      <Lock className="h-3.5 w-3.5" />
                      Contraseña
                    </label>
                    <input
                      id="landlord-password"
                      type="password"
                      required
                      value={landlordPassword}
                      onChange={(e) => setLandlordPassword(e.target.value)}
                      placeholder="••••••••"
                      className="h-12 rounded-xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
                    />
                  </div>

                  {landlordError && (
                    <p className="text-xs text-destructive font-medium">{landlordError}</p>
                  )}

                  <Button
                    id="btn-landlord-submit"
                    type="submit"
                    disabled={landlordLoading}
                    className="mt-2 h-12 w-full bg-primary font-bold text-primary-foreground hover:opacity-90 text-sm shadow-md active:scale-[0.98] transition"
                  >
                    {landlordLoading ? 'Validando...' : 'Acceder como Dueño'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>

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
      </div>
    </div>
  );
}
