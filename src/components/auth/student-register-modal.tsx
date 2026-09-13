'use client';

import { AlertCircle, Eye, EyeOff, GraduationCap, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { UniversitySearchSelect } from '@/components/auth/university-search-select';
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
import { fetchUniversities } from '@/services/universities.service';
import type { UniversityDto } from '@/types/api-contracts';

const FALLBACK_UNIVERSITIES: UniversityDto[] = [
  {
    id: '00000000-0000-4000-8000-000000000001',
    name: 'Universidad de Chile',
    acronym: 'UCHILE',
    city: 'Santiago',
    latitude: -33.4442,
    longitude: -70.6517,
  },
  {
    id: '00000000-0000-4000-8000-000000000002',
    name: 'Pontificia Universidad Católica de Chile',
    acronym: 'UC',
    city: 'Santiago',
    latitude: -33.4975,
    longitude: -70.6128,
  },
  {
    id: '00000000-0000-4000-8000-000000000003',
    name: 'Universidad de Concepción',
    acronym: 'UdeC',
    city: 'Concepción',
    latitude: -36.8299,
    longitude: -73.0371,
  },
  {
    id: '00000000-0000-4000-8000-000000000004',
    name: 'Universidad de Santiago de Chile',
    acronym: 'USACH',
    city: 'Santiago',
    latitude: -33.4503,
    longitude: -70.6865,
  },
  {
    id: '00000000-0000-4000-8000-000000000005',
    name: 'Universidad Técnica Federico Santa María',
    acronym: 'USM',
    city: 'Valparaíso',
    latitude: -33.0355,
    longitude: -71.5954,
  },
];

export type StudentRegisterModalProps = {
  isOpen: boolean;
  onClose: () => void;
  prefilledEmail: string;
  onSuccess?: () => void;
};

export function StudentRegisterModal({
  isOpen,
  onClose,
  prefilledEmail,
  onSuccess,
}: StudentRegisterModalProps) {
  const { login } = useAuth();
  const [universities, setUniversities] = useState<UniversityDto[]>(FALLBACK_UNIVERSITIES);
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmittingManual, setIsSubmittingManual] = useState(false);

  useEffect(() => {
    async function loadUniversities() {
      try {
        const response = await fetchUniversities();
        if (isApiSuccess(response) && response.data.length > 0) {
          setUniversities(response.data);
        }
      } catch {}
    }
    if (isOpen) {
      loadUniversities();
    }
  }, [isOpen]);

  const defaultUniversityId = universities[0]?.id ?? FALLBACK_UNIVERSITIES[0].id;

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
      phone: '+56912345678',
      universityId: defaultUniversityId,
      termsAccepted: true,
    },
  });

  useEffect(() => {
    if (prefilledEmail) {
      setFieldValue('email', prefilledEmail);
    }
  }, [prefilledEmail, setFieldValue]);

  useEffect(() => {
    if (isOpen && defaultUniversityId && !values.universityId) {
      setFieldValue('universityId', defaultUniversityId);
    }
  }, [isOpen, defaultUniversityId, values.universityId, setFieldValue]);

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
        phone: validation.data.phone.trim(),
        universityId: validation.data.universityId,
        role: 'STUDENT',
      });

      if (isApiSuccess(response)) {
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
      <DrawerContent className="max-h-[92dvh] max-w-lg md:max-w-xl mx-auto md:rounded-3xl flex flex-col bg-background text-foreground">
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

          <FormField
            id="register-student-university"
            label="Universidad"
            required
            error={touched.universityId ? errors.universityId : undefined}
          >
            <UniversitySearchSelect
              id="register-student-university"
              universities={universities}
              value={values.universityId}
              onChange={(val) => handleChange('universityId', val)}
              onBlur={() => handleBlur('universityId')}
              hasError={Boolean(touched.universityId && errors.universityId)}
            />
          </FormField>

          <FormField
            id="register-student-phone"
            label="Teléfono de contacto"
            required
            hint="Formato internacional o chileno (+56912345678)"
            error={touched.phone ? errors.phone : undefined}
          >
            <input
              id="register-student-phone"
              type="tel"
              required
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
              disabled={isSubmittingManual}
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
