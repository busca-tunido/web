'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { z } from 'zod';

export type UseFormValidationOptions<T extends Record<string, unknown>> = {
  schema: z.ZodType<T>;
  initialValues: T;
  debounceMs?: number;
  focusFirstInvalid?: boolean;
  formRef?: React.RefObject<HTMLElement | null>;
  onSubmit?: (values: T) => void | Promise<void>;
};

export type ValidationResult<T extends Record<string, unknown>> = {
  isValid: boolean;
  data?: T;
  errors: Partial<Record<keyof T, string>>;
};

export type UseFormValidationReturn<T extends Record<string, unknown>> = {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isValid: boolean;
  isSubmitting: boolean;
  handleChange: (field: keyof T, value: unknown) => void;
  handleBlur: (field: keyof T) => void;
  setFieldValue: (field: keyof T, value: unknown) => void;
  setFieldError: (field: keyof T, error: string | undefined) => void;
  validateField: (field: keyof T, value?: unknown) => string | undefined;
  validateForm: (overrideValues?: Partial<T>) => ValidationResult<T>;
  handleSubmit: (event?: React.FormEvent, overrideValues?: Partial<T>) => Promise<boolean>;
  resetForm: (newValues?: Partial<T>) => void;
};

export function useFormValidation<T extends Record<string, unknown>>({
  schema,
  initialValues,
  debounceMs = 300,
  focusFirstInvalid = true,
  formRef,
  onSubmit,
}: UseFormValidationOptions<T>): UseFormValidationReturn<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialValuesRef = useRef<T>(initialValues);
  initialValuesRef.current = initialValues;
  const valuesRef = useRef<T>(values);
  const touchedRef = useRef<Partial<Record<keyof T, boolean>>>(touched);
  const debounceTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    valuesRef.current = values;
  }, [values]);

  useEffect(() => {
    touchedRef.current = touched;
  }, [touched]);

  useEffect(() => {
    const timers = debounceTimers.current;
    return () => {
      for (const timer of Object.values(timers)) {
        clearTimeout(timer);
      }
    };
  }, []);

  const validateField = useCallback(
    (field: keyof T, value?: unknown): string | undefined => {
      const currentVal = value !== undefined ? value : valuesRef.current[field];
      const candidate = { ...valuesRef.current, [field]: currentVal };
      const result = schema.safeParse(candidate);
      if (result.success) {
        return undefined;
      }
      const fieldIssue = result.error.issues.find((issue) => issue.path[0] === field);
      return fieldIssue?.message;
    },
    [schema],
  );

  const handleChange = useCallback(
    (field: keyof T, value: unknown) => {
      setValues((prev) => {
        const nextValues = { ...prev, [field]: value };
        valuesRef.current = nextValues;

        if (touchedRef.current[field]) {
          const timer = debounceTimers.current[field as string];
          if (timer) {
            clearTimeout(timer);
          }
          debounceTimers.current[field as string] = setTimeout(() => {
            const result = schema.safeParse(valuesRef.current);
            if (result.success) {
              setErrors((prevErrors) => {
                if (!prevErrors[field]) {
                  return prevErrors;
                }
                const next = { ...prevErrors };
                delete next[field];
                return next;
              });
            } else {
              const fieldIssue = result.error.issues.find((issue) => issue.path[0] === field);
              setErrors((prevErrors) => {
                if (fieldIssue) {
                  return { ...prevErrors, [field]: fieldIssue.message };
                }
                if (!prevErrors[field]) {
                  return prevErrors;
                }
                const next = { ...prevErrors };
                delete next[field];
                return next;
              });
            }
          }, debounceMs);
        }

        return nextValues;
      });
    },
    [schema, debounceMs],
  );

  const handleBlur = useCallback(
    (field: keyof T) => {
      setTouched((prev) => {
        const next = { ...prev, [field]: true };
        touchedRef.current = next;
        return next;
      });

      const timer = debounceTimers.current[field as string];
      if (timer) {
        clearTimeout(timer);
      }

      const result = schema.safeParse(valuesRef.current);
      if (result.success) {
        setErrors((prev) => {
          if (!prev[field]) {
            return prev;
          }
          const next = { ...prev };
          delete next[field];
          return next;
        });
      } else {
        const fieldIssue = result.error.issues.find((issue) => issue.path[0] === field);
        setErrors((prev) => {
          if (fieldIssue) {
            return { ...prev, [field]: fieldIssue.message };
          }
          if (!prev[field]) {
            return prev;
          }
          const next = { ...prev };
          delete next[field];
          return next;
        });
      }
    },
    [schema],
  );

  const setFieldValue = useCallback((field: keyof T, value: unknown) => {
    setValues((prev) => {
      const nextValues = { ...prev, [field]: value };
      valuesRef.current = nextValues;
      return nextValues;
    });
  }, []);

  const setFieldError = useCallback((field: keyof T, error: string | undefined) => {
    setErrors((prev) => {
      if (error === undefined) {
        if (!prev[field]) {
          return prev;
        }
        const next = { ...prev };
        delete next[field];
        return next;
      }
      return { ...prev, [field]: error };
    });
  }, []);

  const validateForm = useCallback(
    (overrideValues?: Partial<T>): ValidationResult<T> => {
      const targetValues = overrideValues
        ? { ...valuesRef.current, ...overrideValues }
        : valuesRef.current;

      if (overrideValues) {
        valuesRef.current = targetValues;
        setValues(targetValues);
      }

      const allTouched: Partial<Record<keyof T, boolean>> = {};
      for (const key of Object.keys(targetValues) as Array<keyof T>) {
        allTouched[key] = true;
      }
      setTouched(allTouched);
      touchedRef.current = allTouched;

      const result = schema.safeParse(targetValues);
      if (result.success) {
        setErrors({});
        return {
          isValid: true,
          data: result.data,
          errors: {},
        };
      }

      const nextErrors: Partial<Record<keyof T, string>> = {};
      for (const issue of result.error.issues) {
        const fieldKey = issue.path[0] as keyof T;
        if (fieldKey && !nextErrors[fieldKey]) {
          nextErrors[fieldKey] = issue.message;
        }
      }
      setErrors(nextErrors);

      if (focusFirstInvalid && typeof document !== 'undefined') {
        const schedule =
          typeof requestAnimationFrame === 'function'
            ? requestAnimationFrame
            : (cb: () => void) => setTimeout(cb, 0);
        schedule(() => {
          const container = formRef?.current ?? document;
          const firstInvalid = container.querySelector<HTMLElement>('[aria-invalid="true"]');
          if (firstInvalid) {
            firstInvalid.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
            firstInvalid.focus?.({ preventScroll: true });
          }
        });
      }

      return {
        isValid: false,
        errors: nextErrors,
      };
    },
    [schema, focusFirstInvalid, formRef],
  );

  const handleSubmit = useCallback(
    async (event?: React.FormEvent, overrideValues?: Partial<T>): Promise<boolean> => {
      if (event) {
        event.preventDefault();
      }
      const validation = validateForm(overrideValues);
      if (!validation.isValid || !validation.data) {
        return false;
      }
      if (onSubmit) {
        setIsSubmitting(true);
        try {
          await onSubmit(validation.data);
        } finally {
          setIsSubmitting(false);
        }
      }
      return true;
    },
    [validateForm, onSubmit],
  );

  const resetForm = useCallback((newValues?: Partial<T>) => {
    for (const timer of Object.values(debounceTimers.current)) {
      clearTimeout(timer);
    }
    debounceTimers.current = {};
    const resetVals = { ...initialValuesRef.current, ...newValues };
    setValues(resetVals);
    valuesRef.current = resetVals;
    setErrors({});
    setTouched({});
    touchedRef.current = {};
    setIsSubmitting(false);
  }, []);

  const isValid = useMemo(() => Object.keys(errors).length === 0, [errors]);

  return {
    values,
    errors,
    touched,
    isValid,
    isSubmitting,
    handleChange,
    handleBlur,
    setFieldValue,
    setFieldError,
    validateField,
    validateForm,
    handleSubmit,
    resetForm,
  };
}
