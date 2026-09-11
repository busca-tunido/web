'use client';

import { ArrowRight, CheckCircle2, GraduationCap } from 'lucide-react';
import type React from 'react';
import { StudentRegisterModal } from '@/components/auth/student-register-modal';
import { Button } from '@/components/ui/button';
import { useAuthFlow } from '@/hooks/use-auth-flow';

export type EmailCheckStepProps = {
  className?: string;
  onSuccess?: () => void;
  initialEmail?: string;
};

export function EmailCheckStep({ className, onSuccess, initialEmail }: EmailCheckStepProps) {
  const {
    email,
    password,
    step,
    isCheckingEmail,
    isSubmittingLogin,
    isRegisterModalOpen,
    error,
    isEduEmail,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 'email') {
      await checkEmail();
    } else {
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

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="student-email" className="text-xs font-medium text-muted-foreground">
              Correo institucional universitario
            </label>
            {step === 'password' && (
              <button
                id="btn-change-email"
                type="button"
                onClick={resetToEmailStep}
                className="text-[11px] text-primary hover:underline font-medium cursor-pointer"
              >
                Cambiar correo
              </button>
            )}
          </div>
          <div className="relative">
            <input
              id="student-email"
              type="email"
              required
              readOnly={step === 'password'}
              disabled={isCheckingEmail || isSubmittingLogin}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ejemplo@alumnos.uchile.cl"
              className={`min-h-12 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors ${
                step === 'password' ? 'opacity-80 bg-muted/50 cursor-not-allowed' : ''
              }`}
            />
          </div>
          {email && isEduEmail && step === 'email' && (
            <div className="flex items-center gap-1.5 text-[11px] text-primary mt-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Dominio institucional detectado</span>
            </div>
          )}
        </div>

        {step === 'password' && (
          <div className="flex flex-col gap-1.5 animate-in fade-in-50 duration-200">
            <label htmlFor="student-password" className="text-xs font-medium text-muted-foreground">
              Contraseña
            </label>
            <input
              id="student-password"
              type="password"
              required
              disabled={isSubmittingLogin}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="min-h-12 rounded-xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
            />
          </div>
        )}

        {error && (
          <p id="student-auth-error" className="text-xs text-destructive font-medium">
            {error}
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
        onSuccess={onSuccess}
      />
    </div>
  );
}
