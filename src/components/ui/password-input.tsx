'use client';

import { Eye, EyeOff } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export type PasswordInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  ref?: React.Ref<HTMLInputElement>;
  wrapperClassName?: string;
};

export function PasswordInput({
  className,
  wrapperClassName,
  disabled,
  ref,
  ...props
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={cn('relative flex items-center w-full', wrapperClassName)}>
      <input
        ref={ref}
        type={showPassword ? 'text' : 'password'}
        disabled={disabled}
        className={cn(
          'min-h-12 w-full rounded-xl border border-border bg-background pl-4 pr-12 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 aria-invalid:border-destructive aria-invalid:focus:ring-destructive/20 [&::-ms-reveal]:hidden [&::-ms-clear]:hidden transition-colors',
          className,
        )}
        {...props}
      />
      <button
        type="button"
        disabled={disabled}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setShowPassword((prev) => !prev)}
        aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        aria-pressed={showPassword}
        className="absolute right-1 flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:pointer-events-none disabled:opacity-50 transition-colors cursor-pointer"
      >
        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}
