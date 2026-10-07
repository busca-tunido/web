'use client';

import { AlertCircle, Eye, EyeOff, GraduationCap, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { FormField } from '@/components/ui/form-field';
import { useFormValidation } from '@/hooks/use-form-validation';
import { isApiSuccess } from '@/lib/api-response';
import { useAuth } from '@/lib/auth-context';
import { type StudentRegisterInput, studentRegisterSchema } from '@/lib/validations/auth.schema';
import { authService } from '@/services/auth.service';
import type { DetectedUniversityDto } from '@/types/api-contracts';

export type StudentRegisterModalProps = {
  isOpen: boolean;
  onClose: () => void;
  prefilledEmail: string;
  detectedUniversity?: DetectedUniversityDto | null;
  onSuccess?: () => void;
};

export function StudentRegisterModal({
  isOpen,
  onClose,
  prefilledEmail,
  detectedUniversity,
  onSuccess,
}: StudentRegisterModalProps) {
  const { login, setSession } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmittingManual, setIsSubmittingManual] = useState(false);

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    setFieldValue,
    validateForm,
    resetForm,
  } = useFormValidation<StudentRegisterInput>({
    schema: studentRegisterSchema,
    initialValues: {
      email: prefilledEmail,
      password: '',
      firstName: '',
      lastName: '',
      phone: '',
      universityId: detectedUniversity?.id ?? '',
      termsAccepted: true,
    },
  });

  useEffect(() => {
    if (prefilledEmail) {
      setFieldValue('email', prefilledEmail);
    }
  }, [prefilledEmail, setFieldValue]);

  useEffect(() => {
    if (detectedUniversity?.id) {
      setFieldValue('universityId', detectedUniversity.id);
    } else if (detectedUniversity === null) {
      setFieldValue('universityId', '');
    }
  }, [detectedUniversity, setFieldValue]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    const validation = validateForm();
    if (!validation.isValid || !validation.data) {
      return;
    }

    setIsSubmittingManual(true);
    try {
      const response = await authService.registerUser({
        email: validation.data.email.trim(),
        password: validation.data.password,
        firstName: validation.data.firstName.trim(),
        lastName: validation.data.lastName.trim(),
        phone: validation.data.phone?.trim() || undefined,
        universityId: validation.data.universityId,
        role: 'STUDENT',
      });

      if (isApiSuccess(response)) {
        if (response.data?.user) {
          setSession?.(response.data.user, response.data.token);
        }
        try {
          await login(validation.data.email.trim(), validation.data.password);
        } catch {}

        resetForm();
        onClose();
        onSuccess?.();
        return;
      }

      if (response.statusCode === 409) {
        setServerError('Este correo ya ha sido registrado');
        return;
      }

      setServerError(response.message ?? 'Error de conexión con el servidor. Reintentar.');
    } catch {
      setServerError('Error de conexión con el servidor. Reintentar.');
    } finally {
      setIsSubmittingManual(false);
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent
        overlayClassName="z-[120]"
        viewportClassName="z-[120]"
        className="max-h-[92dvh] max-w-lg md:max-w-xl mx-auto md:rounded-3xl flex flex-col bg-background text-foreground z-[120]"
      >
        <DrawerHeader className="text-left px-5 pt-4 pb-2 border-b border-border">
          <div className="flex items-center gap-2 mb-1">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/20 text-primary">
              <GraduationCap className="h-4 w-4" />
            </div>
            <DrawerTitle className="text-lg font-bold text-foreground">
              Registro de Estudiante
            </DrawerTitle>
          </div>
          <DrawerDescription className="text-xs text-muted-foreground">
            Crea tu cuenta universitaria en BuscaTuNido para validar arriendos y publicar reseñas.
          </DrawerDescription>
        </DrawerHeader>

        <form
          onSubmit={handleFormSubmit}
          className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4 text-left"
        >
          {serverError && (
            <div
              id="student-register-server-error"
              className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive font-medium"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          <FormField
            id="register-student-email"
            label="Correo institucional"
            required
            error={touched.email ? errors.email : undefined}
          >
            <input
              id="register-student-email"
              type="email"
              readOnly
              value={values.email}
              className="min-h-12 w-full rounded-xl border border-border bg-muted/60 px-4 text-sm text-foreground opacity-90 cursor-not-allowed focus:outline-none"
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField
              id="register-student-firstname"
              label="Nombre"
              required
              error={touched.firstName ? errors.firstName : undefined}
            >
              <input
                id="register-student-firstname"
                type="text"
                required
                value={values.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                onBlur={() => handleBlur('firstName')}
                placeholder="Juan"
                className="min-h-12 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
              />
            </FormField>

            <FormField
              id="register-student-lastname"
              label="Apellido"
              required
              error={touched.lastName ? errors.lastName : undefined}
            >
              <input
                id="register-student-lastname"
                type="text"
                required
                value={values.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                onBlur={() => handleBlur('lastName')}
                placeholder="Pérez"
                className="min-h-12 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
              />
            </FormField>
          </div>

          <FormField
            id="register-student-password"
            label="Contraseña"
            required
            hint="Mínimo 8 caracteres"
            error={touched.password ? errors.password : undefined}
          >
            {(injected) => (
              <div className="relative flex items-center">
                <input
                  id={injected.id}
                  aria-invalid={injected['aria-invalid']}
                  aria-describedby={injected['aria-describedby']}
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={values.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  onBlur={() => handleBlur('password')}
                  placeholder="••••••••"
                  className="min-h-12 w-full rounded-xl border border-border bg-background pl-4 pr-12 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-0 flex min-h-12 min-w-12 items-center justify-center text-muted-foreground hover:text-foreground transition cursor-pointer"
                  aria-label={showPassword ? 'Ocultar clave' : 'Mostrar clave'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            )}
          </FormField>

          {detectedUniversity ? (
            <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 p-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/20 text-primary">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-bold text-foreground truncate">
                    {detectedUniversity.name}
                  </p>
                  {detectedUniversity.shortName && (
                    <Badge variant="secondary" className="text-[10px] py-0 px-1.5">
                      {detectedUniversity.shortName}
                    </Badge>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Institución verificada automáticamente por tu correo
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-2.5 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Dominio institucional no reconocido</p>
                <p className="text-[11px] opacity-90 mt-0.5">
                  El dominio del correo ingresado no coincide con ninguna universidad registrada. Por favor verifica tu correo oficial de estudiante.
                </p>
              </div>
            </div>
          )}

          <FormField
            id="register-student-phone"
            label="Teléfono de contacto"
            hint="Formato internacional o chileno (+56912345678)"
            error={touched.phone ? errors.phone : undefined}
          >
            <input
              id="register-student-phone"
              type="tel"
              value={values.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              onBlur={() => handleBlur('phone')}
              placeholder="+56912345678"
              className="min-h-12 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
            />
          </FormField>

          <div className="flex flex-col gap-1 pt-1">
            <label
              htmlFor="register-student-terms"
              className="flex items-start gap-2.5 text-xs text-muted-foreground select-none cursor-pointer"
            >
              <input
                id="register-student-terms"
                type="checkbox"
                required
                checked={values.termsAccepted === true}
                onChange={(e) => handleChange('termsAccepted', e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary/30"
              />
              <span>
                Acepto los términos y condiciones de servicio y las normas comunitarias de
                BuscaTuNido.
              </span>
            </label>
            {touched.termsAccepted && errors.termsAccepted && (
              <p className="text-xs text-destructive font-medium">{errors.termsAccepted}</p>
            )}
          </div>

          <DrawerFooter className="px-0 pt-3 pb-2 flex flex-col gap-2">
            <Button
              id="btn-complete-register"
              type="submit"
              disabled={isSubmittingManual || !detectedUniversity}
              className="min-h-12 w-full bg-primary font-bold text-primary-foreground hover:opacity-90 text-sm shadow-md transition active:scale-[0.98]"
            >
              {isSubmittingManual ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando cuenta...
                </>
              ) : (
                'Completar Registro'
              )}
            </Button>
            <DrawerClose
              render={
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onClose}
                  className="min-h-12 w-full text-xs text-muted-foreground hover:text-foreground"
                >
                  Cancelar
                </Button>
              }
            />
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
