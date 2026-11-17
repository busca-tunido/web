'use client';

import { ArrowRight, CheckCircle2, GraduationCap } from 'lucide-react';
import type React from 'react';
import { useRef } from 'react';
import { StudentRegisterModal } from '@/components/auth/student-register-modal';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { useAuthFlow } from '@/hooks/use-auth-flow';
import { useFormValidation } from '@/hooks/use-form-validation';
import { translateApiError } from '@/lib/error-translator';
import { cn } from '@/lib/utils';
import { emailCheckSchema, loginSchema } from '@/lib/validations/auth.schema';

const studentPasswordSchema = loginSchema.pick({ password: true });

export type EmailCheckStepProps = {
  className?: string;
  onSuccess?: () => void;
  initialEmail?: string;
};

export function EmailCheckStep({ className, onSuccess, initialEmail }: EmailCheckStepProps) {
  const formRef = useRef<HTMLFormElement>(null);

  const {
    email,
    password,
    step,
    isCheckingEmail,
    isSubmittingLogin,
    isRegisterModalOpen,
    error,
    isEduEmail,
    detectedUniversity,
    setEmail,
    setPassword,
    setIsRegisterModalOpen,
    checkEmail,
    submitLogin,
    resetToEmailStep,
  } = useAuthFlow({
    initialEmail,
    onLoginSuccess: onSuccess,
    onRegisterSuccess: onSuccess,
  });

  const emailValidation = useFormValidation({
    schema: emailCheckSchema,
    initialValues: { email: initialEmail ?? '' },
    formRef,
  });

  const passwordValidation = useFormValidation({
    schema: studentPasswordSchema,
    initialValues: { password: '' },
    formRef,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 'email') {
      const emailResult = emailValidation.validateForm();
      if (!emailResult.isValid) return;
      await checkEmail();
    } else {
      const passwordResult = passwordValidation.validateForm();
      if (!passwordResult.isValid) return;
      await submitLogin(e);
    }
  };

  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-3">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary">
          <GraduationCap className="h-3.5 w-3.5" />
        </div>
        <h2 className="text-base font-semibold text-foreground">Soy estudiante</h2>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <FormField
            id="student-email"
            label="Correo institucional universitario"
            labelClassName="text-xs font-medium text-muted-foreground"
            required
            error={step === 'email' ? emailValidation.errors.email : undefined}
            labelAction={
              step === 'password' ? (
                <button
                  id="btn-change-email"
                  type="button"
                  onClick={() => {
                    resetToEmailStep();
                    passwordValidation.resetForm({ password: '' });
                  }}
                  className="text-[11px] text-primary hover:underline font-medium cursor-pointer"
                >
                  Cambiar correo
                </button>
              ) : undefined
            }
          >
            <input
              id="student-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              maxLength={100}
              readOnly={step === 'password'}
              disabled={isCheckingEmail || isSubmittingLogin}
              value={email}
              onChange={(e) => {
                const nextEmail = e.target.value.trim();
                setEmail(nextEmail);
                emailValidation.handleChange('email', nextEmail);
              }}
              onBlur={() => {
                if (step === 'email') {
                  emailValidation.handleBlur('email');
                }
              }}
              placeholder="ejemplo@alumnos.uchile.cl"
              className={cn(
                'min-h-12 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors',
                step === 'password' && 'opacity-80 bg-muted/50 cursor-not-allowed',
              )}
            />
          </FormField>
          {email && isEduEmail && step === 'email' && (
            <div className="flex items-center gap-1.5 text-[11px] text-sage-foreground mt-0.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-sage-foreground" />
              <span>Dominio institucional detectado</span>
            </div>
          )}
        </div>

        {step === 'password' && (
          <div className="animate-in fade-in-50 duration-200">
            <FormField
              id="student-password"
              label="Contraseña"
              labelClassName="text-xs font-medium text-muted-foreground"
              required
              error={passwordValidation.errors.password}
            >
              <input
                id="student-password"
                type="password"
                autoComplete="current-password"
                maxLength={64}
                disabled={isSubmittingLogin}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  passwordValidation.handleChange('password', e.target.value);
                }}
                onBlur={() => passwordValidation.handleBlur('password')}
                placeholder="••••••••••••"
                className="min-h-12 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
              />
            </FormField>
          </div>
        )}

        {error && (
          <p id="student-auth-error" className="text-xs text-destructive font-medium">
            {translateApiError(error)}
          </p>
        )}

        <Button
          id="btn-student-continue"
          type="submit"
          disabled={isCheckingEmail || isSubmittingLogin}
          className="mt-2 min-h-12 w-full bg-primary font-bold text-primary-foreground hover:opacity-90 text-sm shadow-md active:scale-[0.98] transition"
        >
          {isCheckingEmail
            ? 'Validando...'
            : isSubmittingLogin
              ? 'Accediendo...'
              : step === 'email'
                ? 'Continuar'
                : 'Acceder'}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </form>

      <StudentRegisterModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        prefilledEmail={email}
        detectedUniversity={detectedUniversity}
        onSuccess={onSuccess}
      />
    </div>
  );
}
