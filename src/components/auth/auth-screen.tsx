'use client';

import { ArrowRight, Home, Lock, Mail } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { EmailCheckStep } from '@/components/auth/email-check-step';
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
  const [landlordEmail, setLandlordEmail] = useState('propietario.demo@buscatunido.cl');
  const [landlordPassword, setLandlordPassword] = useState('Password123!');
  const [landlordLoading, setLandlordLoading] = useState(false);
  const [landlordError, setLandlordError] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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
          <BrandLogo size="md" priority={false} />
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
            <EmailCheckStep />

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
                    Ingresa con tu correo y contraseña registrados como propietario de pensión.
                  </DrawerDescription>
                </DrawerHeader>

                <form onSubmit={handleLandlordSubmit} className="p-4 flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="landlord-email"
                      className="text-xs font-semibold text-foreground flex items-center gap-1.5"
                    >
                      <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                      Correo del Propietario
                    </label>
                    <input
                      id="landlord-email"
                      type="email"
                      required
                      value={landlordEmail}
                      onChange={(e) => setLandlordEmail(e.target.value)}
                      placeholder="propietario@ejemplo.com"
                      className="h-12 rounded-xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="landlord-password"
                      className="text-xs font-semibold text-foreground flex items-center gap-1.5"
                    >
                      <Lock className="h-3.5 w-3.5 text-muted-foreground" />
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

      <footer className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-xs text-muted-foreground">
        <Link
          href="/terms"
          className="inline-flex min-h-12 items-center underline-offset-4 transition-colors hover:text-foreground hover:underline"
        >
          Términos
        </Link>
        <Link
          href="/privacy"
          className="inline-flex min-h-12 items-center underline-offset-4 transition-colors hover:text-foreground hover:underline"
        >
          Privacidad
        </Link>
        <Link
          href="/faq"
          className="inline-flex min-h-12 items-center underline-offset-4 transition-colors hover:text-foreground hover:underline"
        >
          Preguntas Frecuentes
        </Link>
        <Link
          href="/contact"
          className="inline-flex min-h-12 items-center underline-offset-4 transition-colors hover:text-foreground hover:underline"
        >
          Contacto
        </Link>
      </footer>
    </div>
  );
}
