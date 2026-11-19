'use client';

import { AlertCircle, ArrowRight, Home, Lock, Mail, Phone, User, X } from 'lucide-react';
import Link from 'next/link';
import { useRef, useState } from 'react';
import { EmailCheckStep } from '@/components/auth/email-check-step';
import { BrandLogo } from '@/components/ui/brand-logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FormField } from '@/components/ui/form-field';
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalDescription,
  ResponsiveModalFooter,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from '@/components/ui/responsive-modal';
import { useFormValidation } from '@/hooks/use-form-validation';
import { isApiSuccess } from '@/lib/api-response';
import { useAuth } from '@/lib/auth-context';
import { translateApiError } from '@/lib/error-translator';
import { filterAlphabeticName, formatChileanPhone } from '@/lib/format-utils';
import {
  type LandlordRegisterInput,
  type LoginInput,
  landlordRegisterSchema,
  loginSchema,
} from '@/lib/validations/auth.schema';
import { authService } from '@/services/auth.service';

export type AuthScreenProps = {
  onSuccess?: () => void;
  onClose?: () => void;
  isModal?: boolean;
};

const DEFAULT_LANDLORD_LOGIN: LoginInput = {
  email: 'propietario.demo@buscatunido.cl',
  password: 'Password123!',
};

const EMPTY_LANDLORD_REGISTER: LandlordRegisterInput = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
};

export function AuthScreen({ onSuccess, onClose, isModal = false }: AuthScreenProps = {}) {
  const { login, setSession } = useAuth();
  const [landlordMode, setLandlordMode] = useState<'login' | 'register'>('login');
  const [landlordError, setLandlordError] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const loginFormRef = useRef<HTMLFormElement>(null);
  const registerFormRef = useRef<HTMLFormElement>(null);

  const loginValidation = useFormValidation<LoginInput>({
    schema: loginSchema,
    initialValues: DEFAULT_LANDLORD_LOGIN,
    formRef: loginFormRef,
    onSubmit: async (validData) => {
      setLandlordError('');
      try {
        await login(validData.email.trim().toLowerCase(), validData.password);
        setIsDrawerOpen(false);
        onSuccess?.();
        if (typeof window !== 'undefined') {
          window.location.replace('/landlord');
        }
      } catch (err: unknown) {
        setLandlordError(translateApiError(err, 'Error al autenticar. Verifica las credenciales.'));
      }
    },
  });

  const registerValidation = useFormValidation<LandlordRegisterInput>({
    schema: landlordRegisterSchema,
    initialValues: EMPTY_LANDLORD_REGISTER,
    formRef: registerFormRef,
    onSubmit: async (validData) => {
      setLandlordError('');
      const cleanEmail = validData.email.trim().toLowerCase();
      try {
        const res = await authService.registerUser({
          firstName: validData.firstName.trim(),
          lastName: validData.lastName.trim(),
          email: cleanEmail,
          password: validData.password,
          phone: validData.phone?.trim() || undefined,
          role: 'LANDLORD',
        });

        if (isApiSuccess(res)) {
          if (res.data?.user) {
            setSession?.(res.data.user, res.data.token);
          }
          try {
            await login(cleanEmail, validData.password);
          } catch {}

          setIsDrawerOpen(false);
          onSuccess?.();
          if (typeof window !== 'undefined') {
            window.location.replace('/landlord');
          }
          return;
        }

        setLandlordError(translateApiError(res.message, 'No fue posible registrar la cuenta.'));
      } catch (err: unknown) {
        setLandlordError(translateApiError(err, 'Error al procesar el registro.'));
      }
    },
  });

  const handleCloseModal = () => {
    setIsDrawerOpen(false);
    setLandlordMode('login');
    setLandlordError('');
    loginValidation.resetForm(DEFAULT_LANDLORD_LOGIN);
    registerValidation.resetForm(EMPTY_LANDLORD_REGISTER);
  };

  const handleLandlordLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailInput = loginFormRef.current?.querySelector<HTMLInputElement>('#landlord-email');
    const passwordInput =
      loginFormRef.current?.querySelector<HTMLInputElement>('#landlord-password');
    const currentEmail = (emailInput?.value ?? loginValidation.values.email).trim();
    const currentPassword = passwordInput?.value ?? loginValidation.values.password;
    await loginValidation.handleSubmit(e, {
      email: currentEmail,
      password: currentPassword,
    });
  };

  return (
    <div
      id="auth-screen-container"
      className="flex min-h-full w-full flex-col justify-between py-6 px-4 text-foreground transition-colors"
    >
      {isModal && onClose && (
        <button
          id="btn-close-auth-screen"
          type="button"
          onClick={onClose}
          aria-label="Cerrar ventana de autenticación"
          className="fixed top-5 right-5 sm:top-6 sm:right-6 z-[110] flex h-10 w-10 items-center justify-center rounded-full border border-border/80 bg-card/80 text-muted-foreground backdrop-blur-sm hover:text-foreground hover:bg-secondary transition cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>
      )}

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center my-auto py-4">
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
            <EmailCheckStep onSuccess={onSuccess} />

            <div className="relative flex items-center justify-center">
              <div className="w-full border-t border-border" />
              <span className="absolute bg-card px-3 text-xs font-medium text-muted-foreground">
                No soy estudiante
              </span>
            </div>

            <Button
              id="btn-other-options"
              type="button"
              variant="outline"
              onClick={() => setIsDrawerOpen(true)}
              className="h-12 w-full border-border bg-background font-medium text-foreground hover:bg-secondary cursor-pointer"
            >
              Acceso para dueños
            </Button>

            <ResponsiveModal
              open={isDrawerOpen}
              onOpenChange={(open) => {
                if (open) {
                  setIsDrawerOpen(true);
                } else {
                  handleCloseModal();
                }
              }}
            >
              <ResponsiveModalContent
                showClose={false}
                overlayClassName="z-[120]"
                viewportClassName="z-[120]"
                className="z-[120] bg-card border-border text-foreground max-w-lg max-h-[92dvh] flex flex-col md:rounded-3xl p-0 overflow-hidden"
              >
                <ResponsiveModalHeader className="px-6 pt-5 pb-3 border-b border-border/50 text-left">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/30">
                      <Home className="h-4 w-4" />
                    </div>
                    <ResponsiveModalTitle className="text-foreground text-lg">
                      {landlordMode === 'login' ? 'Acceso para Dueños' : 'Registro de Dueño'}
                    </ResponsiveModalTitle>
                  </div>
                  <ResponsiveModalDescription className="text-muted-foreground text-xs">
                    {landlordMode === 'login'
                      ? 'Ingresa con tu correo y contraseña registrados como propietario de pensión.'
                      : 'Crea tu cuenta de propietario para publicar y administrar tus pensiones.'}
                  </ResponsiveModalDescription>
                </ResponsiveModalHeader>

                {landlordMode === 'login' ? (
                  <form
                    ref={loginFormRef}
                    onSubmit={handleLandlordLoginSubmit}
                    noValidate
                    className="p-6 flex flex-col gap-4 overflow-y-auto"
                  >
                    {landlordError && (
                      <div className="flex items-center gap-2.5 rounded-xl bg-destructive/15 border border-destructive/30 px-3.5 py-2.5 text-xs text-destructive">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>{landlordError}</span>
                      </div>
                    )}

                    <FormField
                      id="landlord-email"
                      label={
                        <span className="inline-flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                          Correo del Propietario
                        </span>
                      }
                      labelClassName="text-xs font-semibold text-foreground"
                      required
                      error={loginValidation.errors.email}
                    >
                      <input
                        id="landlord-email"
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck={false}
                        maxLength={100}
                        value={loginValidation.values.email}
                        onChange={(e) => {
                          setLandlordError('');
                          loginValidation.handleChange('email', e.target.value.trim());
                        }}
                        onBlur={() => loginValidation.handleBlur('email')}
                        placeholder="propietario@ejemplo.com"
                        className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
                      />
                    </FormField>

                    <FormField
                      id="landlord-password"
                      label={
                        <span className="inline-flex items-center gap-1.5">
                          <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                          Contraseña
                        </span>
                      }
                      labelClassName="text-xs font-semibold text-foreground"
                      required
                      error={loginValidation.errors.password}
                    >
                      <input
                        id="landlord-password"
                        type="password"
                        autoComplete="current-password"
                        maxLength={64}
                        value={loginValidation.values.password}
                        onChange={(e) => {
                          setLandlordError('');
                          loginValidation.handleChange('password', e.target.value);
                        }}
                        onBlur={() => loginValidation.handleBlur('password')}
                        placeholder="••••••••"
                        className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
                      />
                    </FormField>

                    <Button
                      id="btn-landlord-submit"
                      type="submit"
                      disabled={loginValidation.isSubmitting}
                      className="mt-2 h-12 w-full bg-primary font-bold text-primary-foreground hover:opacity-90 text-sm shadow-md active:scale-[0.98] transition cursor-pointer"
                    >
                      {loginValidation.isSubmitting ? 'Validando...' : 'Acceder como Dueño'}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>

                    <div className="text-center pt-1">
                      <p className="text-xs text-muted-foreground">
                        ¿No estás registrado?{' '}
                        <button
                          type="button"
                          onClick={() => {
                            setLandlordError('');
                            loginValidation.resetForm(DEFAULT_LANDLORD_LOGIN);
                            registerValidation.resetForm(EMPTY_LANDLORD_REGISTER);
                            setLandlordMode('register');
                          }}
                          className="font-semibold text-primary underline underline-offset-4 hover:opacity-80 transition cursor-pointer inline-flex items-center min-h-[44px]"
                        >
                          Regístrate como dueño
                        </button>
                      </p>
                    </div>
                  </form>
                ) : (
                  <form
                    ref={registerFormRef}
                    onSubmit={registerValidation.handleSubmit}
                    noValidate
                    className="p-6 flex flex-col gap-3.5 overflow-y-auto"
                  >
                    {landlordError && (
                      <div className="flex items-center gap-2.5 rounded-xl bg-destructive/15 border border-destructive/30 px-3.5 py-2.5 text-xs text-destructive">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>{landlordError}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <FormField
                        id="landlord-register-firstname"
                        label={
                          <span className="inline-flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5 text-muted-foreground" />
                            Nombre
                          </span>
                        }
                        labelClassName="text-xs font-semibold text-foreground"
                        required
                        error={registerValidation.errors.firstName}
                      >
                        <input
                          id="landlord-register-firstname"
                          type="text"
                          autoComplete="given-name"
                          autoCapitalize="words"
                          maxLength={50}
                          value={registerValidation.values.firstName}
                          onChange={(e) =>
                            registerValidation.handleChange(
                              'firstName',
                              filterAlphabeticName(e.target.value),
                            )
                          }
                          onBlur={() => registerValidation.handleBlur('firstName')}
                          placeholder="Ej. Roberto"
                          className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
                        />
                      </FormField>

                      <FormField
                        id="landlord-register-lastname"
                        label={
                          <span className="inline-flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5 text-muted-foreground" />
                            Apellido
                          </span>
                        }
                        labelClassName="text-xs font-semibold text-foreground"
                        required
                        error={registerValidation.errors.lastName}
                      >
                        <input
                          id="landlord-register-lastname"
                          type="text"
                          autoComplete="family-name"
                          autoCapitalize="words"
                          maxLength={50}
                          value={registerValidation.values.lastName}
                          onChange={(e) =>
                            registerValidation.handleChange(
                              'lastName',
                              filterAlphabeticName(e.target.value),
                            )
                          }
                          onBlur={() => registerValidation.handleBlur('lastName')}
                          placeholder="Ej. Gómez"
                          className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
                        />
                      </FormField>
                    </div>

                    <FormField
                      id="landlord-register-email"
                      label={
                        <span className="inline-flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                          Correo del Propietario
                        </span>
                      }
                      labelClassName="text-xs font-semibold text-foreground"
                      required
                      error={registerValidation.errors.email}
                    >
                      <input
                        id="landlord-register-email"
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck={false}
                        maxLength={100}
                        value={registerValidation.values.email}
                        onChange={(e) => {
                          setLandlordError('');
                          registerValidation.handleChange('email', e.target.value.trim());
                        }}
                        onBlur={() => registerValidation.handleBlur('email')}
                        placeholder="propietario@ejemplo.com"
                        className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
                      />
                    </FormField>

                    <FormField
                      id="landlord-register-phone"
                      label={
                        <span className="inline-flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                          Teléfono
                        </span>
                      }
                      labelClassName="text-xs font-semibold text-foreground"
                      hint="Formato chileno (+56 9 1234 5678)"
                      error={registerValidation.errors.phone}
                    >
                      <input
                        id="landlord-register-phone"
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        maxLength={16}
                        value={registerValidation.values.phone ?? ''}
                        onChange={(e) =>
                          registerValidation.handleChange(
                            'phone',
                            formatChileanPhone(e.target.value),
                          )
                        }
                        onBlur={() => registerValidation.handleBlur('phone')}
                        placeholder="+56 9 1234 5678"
                        className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
                      />
                    </FormField>

                    <FormField
                      id="landlord-register-password"
                      label={
                        <span className="inline-flex items-center gap-1.5">
                          <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                          Contraseña
                        </span>
                      }
                      labelClassName="text-xs font-semibold text-foreground"
                      required
                      hint="Mínimo 8 caracteres"
                      error={registerValidation.errors.password}
                    >
                      <input
                        id="landlord-register-password"
                        type="password"
                        autoComplete="new-password"
                        maxLength={64}
                        value={registerValidation.values.password}
                        onChange={(e) =>
                          registerValidation.handleChange('password', e.target.value)
                        }
                        onBlur={() => registerValidation.handleBlur('password')}
                        placeholder="Mínimo 8 caracteres"
                        className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
                      />
                    </FormField>

                    <Button
                      id="btn-landlord-register-submit"
                      type="submit"
                      disabled={registerValidation.isSubmitting}
                      className="mt-2 h-12 w-full bg-primary font-bold text-primary-foreground hover:opacity-90 text-sm shadow-md active:scale-[0.98] transition cursor-pointer"
                    >
                      {registerValidation.isSubmitting
                        ? 'Creando cuenta...'
                        : 'Crear cuenta de Dueño'}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>

                    <div className="text-center pt-1">
                      <p className="text-xs text-muted-foreground">
                        ¿Ya tienes cuenta de dueño?{' '}
                        <button
                          type="button"
                          onClick={() => {
                            setLandlordError('');
                            loginValidation.resetForm(DEFAULT_LANDLORD_LOGIN);
                            registerValidation.resetForm(EMPTY_LANDLORD_REGISTER);
                            setLandlordMode('login');
                          }}
                          className="font-semibold text-primary underline underline-offset-4 hover:opacity-80 transition cursor-pointer inline-flex items-center min-h-[44px]"
                        >
                          Inicia sesión
                        </button>
                      </p>
                    </div>
                  </form>
                )}

                <ResponsiveModalFooter className="px-6 py-3 border-t border-border/50">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleCloseModal}
                    className="w-full text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    Cerrar
                  </Button>
                </ResponsiveModalFooter>
              </ResponsiveModalContent>
            </ResponsiveModal>
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
