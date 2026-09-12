'use client';

import { useCallback, useMemo, useState } from 'react';
import { isApiSuccess } from '@/lib/api-response';
import { useAuth } from '@/lib/auth-context';
import { emailCheckSchema } from '@/lib/validations/auth.schema';
import { authService } from '@/services/auth.service';

export type AuthFlowStep = 'email' | 'password';

export type StudentRegisterPayload = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  universityId: string;
  phone?: string;
  termsAccepted: true;
};

export type UseAuthFlowOptions = {
  initialEmail?: string;
  onLoginSuccess?: () => void;
  onRegisterSuccess?: () => void;
};

export type UseAuthFlowReturn = {
  email: string;
  password: string;
  step: AuthFlowStep;
  isRegistered: boolean | null;
  isCheckingEmail: boolean;
  isSubmittingLogin: boolean;
  isRegisterModalOpen: boolean;
  error: string | null;
  isEduEmail: boolean;
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  setError: (error: string | null) => void;
  setIsRegisterModalOpen: (open: boolean) => void;
  checkEmail: (emailToCheck?: string) => Promise<{ exists: boolean } | null>;
  submitLogin: (event?: React.FormEvent) => Promise<boolean>;
  registerStudent: (payload: StudentRegisterPayload) => Promise<boolean>;
  resetToEmailStep: () => void;
};

export function isEducationalEmail(email: string): boolean {
  const normalized = email.toLowerCase().trim();
  return (
    normalized.endsWith('.edu') ||
    normalized.endsWith('.edu.cl') ||
    normalized.endsWith('.cl') ||
    normalized.includes('alumnos') ||
    normalized.includes('est') ||
    normalized.includes('uchile') ||
    normalized.includes('uc') ||
    normalized.includes('usach') ||
    normalized.includes('utfsm')
  );
}

export function useAuthFlow(options: UseAuthFlowOptions = {}): UseAuthFlowReturn {
  const { login } = useAuth();
  const [email, setEmailState] = useState(options.initialEmail ?? 'estudiante.demo@uchile.cl');
  const [password, setPassword] = useState('Password123!');
  const [step, setStep] = useState<AuthFlowStep>('email');
  const [isRegistered, setIsRegistered] = useState<boolean | null>(null);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [isSubmittingLogin, setIsSubmittingLogin] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEduEmail = useMemo(() => isEducationalEmail(email), [email]);

  const setEmail = useCallback((newEmail: string) => {
    setEmailState(newEmail);
    setError(null);
    setIsRegistered(null);
  }, []);

  const resetToEmailStep = useCallback(() => {
    setStep('email');
    setPassword('');
    setError(null);
  }, []);

  const checkEmail = useCallback(
    async (emailToCheck?: string): Promise<{ exists: boolean } | null> => {
      const targetEmail = (emailToCheck ?? email).trim();
      const validation = emailCheckSchema.safeParse({ email: targetEmail });
      if (!validation.success) {
        const firstError =
          validation.error.issues[0]?.message ?? 'Ingresa un correo institucional válido';
        setError(firstError);
        return null;
      }

      setError(null);
      setIsCheckingEmail(true);

      try {
        const response = await authService.checkEmailExists(targetEmail);
        if (isApiSuccess(response)) {
          const exists = Boolean(response.data.exists);
          setIsRegistered(exists);
          if (exists) {
            setStep('password');
            setIsRegisterModalOpen(false);
          } else {
            setStep('email');
            setIsRegisterModalOpen(true);
          }
          return { exists };
        }

        setError(response.message ?? 'Error de conexión con el servidor. Reintentar.');
        return null;
      } catch {
        setError('Error de conexión con el servidor. Reintentar.');
        return null;
      } finally {
        setIsCheckingEmail(false);
      }
    },
    [email],
  );

  const submitLogin = useCallback(
    async (event?: React.FormEvent): Promise<boolean> => {
      if (event) {
        event.preventDefault();
      }
      setError(null);
      setIsSubmittingLogin(true);

      try {
        await login(email.trim(), password);
        options.onLoginSuccess?.();
        return true;
      } catch (err: unknown) {
        const message =
          err instanceof Error && err.message
            ? err.message
            : 'Error al autenticar. Verifica las credenciales.';
        setError(message);
        return false;
      } finally {
        setIsSubmittingLogin(false);
      }
    },
    [email, password, login, options],
  );

  const registerStudent = useCallback(
    async (payload: StudentRegisterPayload): Promise<boolean> => {
      setError(null);
      try {
        const response = await authService.registerUser({
          email: payload.email.trim(),
          password: payload.password,
          firstName: payload.firstName.trim(),
          lastName: payload.lastName.trim(),
          universityId: payload.universityId,
          phone: payload.phone?.trim(),
          role: 'STUDENT',
        });

        if (isApiSuccess(response)) {
          try {
            await login(payload.email.trim(), payload.password);
          } catch {}

          setIsRegisterModalOpen(false);
          options.onRegisterSuccess?.();
          return true;
        }

        if (response.statusCode === 409) {
          setError('Este correo ya ha sido registrado');
          return false;
        }

        setError(response.message ?? 'Error de conexión con el servidor. Reintentar.');
        return false;
      } catch {
        setError('Error de conexión con el servidor. Reintentar.');
        return false;
      }
    },
    [login, options],
  );

  return {
    email,
    password,
    step,
    isRegistered,
    isCheckingEmail,
    isSubmittingLogin,
    isRegisterModalOpen,
    error,
    isEduEmail,
    setEmail,
    setPassword,
    setError,
    setIsRegisterModalOpen,
    checkEmail,
    submitLogin,
    registerStudent,
    resetToEmailStep,
  };
}
