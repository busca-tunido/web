'use client';

import { AlertCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import type React from 'react';
import { cloneElement, isValidElement, useId } from 'react';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type FormFieldInjectedProps = {
  id: string;
  'aria-invalid': boolean;
  'aria-describedby'?: string;
};

export type FormFieldProps = {
  id?: string;
  label?: React.ReactNode;
  error?: string;
  required?: boolean;
  hint?: string;
  className?: string;
  labelClassName?: string;
  children: React.ReactNode | ((injected: FormFieldInjectedProps) => React.ReactNode);
};

export function FormField({
  id,
  label,
  error,
  required,
  hint,
  className,
  labelClassName,
  children,
}: FormFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const hasError = Boolean(error);
  const errorId = `${fieldId}-error`;
  const hintId = `${fieldId}-hint`;

  const describedBy = hasError ? errorId : hint ? hintId : undefined;

  const injectedProps: FormFieldInjectedProps = {
    id: fieldId,
    'aria-invalid': hasError,
    'aria-describedby': describedBy,
  };

  let renderedContent: React.ReactNode;

  if (typeof children === 'function') {
    renderedContent = children(injectedProps);
  } else if (isValidElement<Record<string, unknown>>(children)) {
    const existingProps = children.props as {
      id?: string;
      className?: string;
    };
    renderedContent = cloneElement(children, {
      id: existingProps.id ?? fieldId,
      'aria-invalid': hasError,
      'aria-describedby': describedBy,
      className: cn(
        existingProps.className,
        hasError &&
          'border-destructive focus-visible:ring-destructive aria-invalid:border-destructive',
      ),
    });
  } else {
    renderedContent = (
      <div id={fieldId} aria-invalid={hasError} aria-describedby={describedBy}>
        {children}
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col w-full text-left', className)}>
      {label && (
        <div className="flex items-center justify-between gap-2 pb-1.5">
          <label
            htmlFor={fieldId}
            className={cn(
              'text-sm font-medium leading-none text-foreground select-none cursor-pointer',
              hasError && 'text-destructive',
              labelClassName,
            )}
          >
            {label}
            {required && (
              <span className="text-destructive ml-1" aria-hidden="true">
                *
              </span>
            )}
          </label>
          {required ? (
            <Badge
              variant="outline"
              className="text-[10px] px-1.5 py-0 h-4 border-primary/20 text-muted-foreground"
            >
              Requerido
            </Badge>
          ) : (
            <Badge
              variant="secondary"
              className="text-[10px] px-1.5 py-0 h-4 text-muted-foreground"
            >
              Opcional
            </Badge>
          )}
        </div>
      )}

      {renderedContent}

      {hint && !hasError && (
        <p id={hintId} className="pt-1.5 text-xs text-muted-foreground">
          {hint}
        </p>
      )}

      <AnimatePresence mode="wait">
        {hasError && (
          <motion.div
            id={errorId}
            role="alert"
            aria-live="polite"
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="flex items-center gap-1.5 overflow-hidden pt-1.5 text-xs font-medium text-destructive"
          >
            <AlertCircle className="size-3.5 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
