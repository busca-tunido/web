'use client';

import { Laptop, LogOut, Moon, Sun, User } from 'lucide-react';
import Image from 'next/image';
import type { ElementType, ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { BrandLogo } from '@/components/ui/brand-logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { type Theme, useTheme } from '@/lib/theme-context';
import type { UserProfile } from '@/lib/types';
import { cn } from '@/lib/utils';

export type AccountShellProps = {
  children: ReactNode;
  className?: string;
};

export function AccountShell({ children, className }: AccountShellProps) {
  return (
    <div
      id="account-screen-view"
      className={cn(
        'flex flex-col gap-6 px-4 md:px-0 max-w-2xl mx-auto w-full pb-20 md:pb-12 pt-2',
        className,
      )}
    >
      {children}
    </div>
  );
}

export type AccountProfileHeaderProps = {
  user: UserProfile;
  roleLabel: string;
  children?: ReactNode;
};

export function AccountProfileHeader({ user, roleLabel, children }: AccountProfileHeaderProps) {
  return (
    <div className="flex items-center gap-3.5">
      <div className="relative h-14 w-14 overflow-hidden rounded-2xl border-2 border-primary/40 bg-card shadow-md shrink-0">
        {user.avatarUrl ? (
          <Image
            src={user.avatarUrl}
            alt={user.firstName}
            fill
            unoptimized
            sizes="56px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
            <User className="h-6 w-6" />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-base font-bold text-foreground truncate">
            {user.firstName} {user.lastName}
          </h2>
          <Badge
            variant="outline"
            className="border-primary/40 bg-primary/10 text-primary text-[10px] font-semibold shrink-0"
          >
            {roleLabel}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 truncate">{user.email}</p>
        {children}
      </div>
    </div>
  );
}

export function AccountThemeCard() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const themeOptions: Array<{ id: Theme; label: string; icon: typeof Laptop; sublabel: string }> = [
    { id: 'system', label: 'Sistema', icon: Laptop, sublabel: 'Auto' },
    { id: 'light', label: 'Claro', icon: Sun, sublabel: 'Papel cálido' },
    { id: 'dark', label: 'Oscuro', icon: Moon, sublabel: 'Piedra cálido' },
  ];

  return (
    <Card className="border-border bg-card shadow-xs rounded-2xl">
      <CardContent className="p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Modo Visual
          </h3>
          <span className="text-[11px] text-muted-foreground">
            Activo: <strong className="text-foreground capitalize">{resolvedTheme}</strong>
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {themeOptions.map((opt) => {
            const Icon = opt.icon;
            const isSelected = theme === opt.id;
            return (
              <button
                key={opt.id}
                id={`theme-option-${opt.id}`}
                type="button"
                onClick={() => setTheme(opt.id)}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 rounded-xl border p-2.5 text-xs font-semibold transition active:scale-95 cursor-pointer',
                  isSelected
                    ? 'border-primary bg-primary/15 text-primary shadow-xs'
                    : 'border-border/80 bg-background/60 text-muted-foreground hover:text-foreground hover:bg-secondary',
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="leading-tight">{opt.label}</span>
                <span className="text-[10px] font-normal opacity-70">{opt.sublabel}</span>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export type AccountActionRowProps = {
  icon: ElementType;
  title: string;
  description?: string;
  trailing?: ReactNode;
  onClick?: () => void;
  className?: string;
};

export function AccountActionRow({
  icon: Icon,
  title,
  description,
  trailing,
  onClick,
  className,
}: AccountActionRowProps) {
  const content = (
    <>
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-4.5 w-4.5" />
        </div>
        <div className="flex flex-col text-left min-w-0">
          <span className="text-xs font-bold text-foreground truncate">{title}</span>
          {description && (
            <span className="text-[11px] text-muted-foreground truncate">{description}</span>
          )}
        </div>
      </div>
      {trailing && <div className="shrink-0 ml-2">{trailing}</div>}
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          'flex w-full min-h-[52px] items-center justify-between rounded-xl border border-border/80 bg-card p-3.5 transition hover:bg-secondary/70 shadow-xs cursor-pointer',
          className,
        )}
      >
        {content}
      </button>
    );
  }

  return (
    <div
      className={cn(
        'flex w-full min-h-[52px] items-center justify-between rounded-xl border border-border/80 bg-card p-3.5 shadow-xs',
        className,
      )}
    >
      {content}
    </div>
  );
}

export type AccountLogoutButtonProps = {
  onLogout: () => void | Promise<void>;
  className?: string;
};

export function AccountLogoutButton({ onLogout, className }: AccountLogoutButtonProps) {
  return (
    <Button
      id="btn-logout"
      variant="outline"
      onClick={onLogout}
      className={cn(
        'mt-2 h-12 w-full border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive font-semibold text-xs rounded-xl cursor-pointer',
        className,
      )}
    >
      <LogOut className="h-4 w-4 mr-2" />
      Cerrar Sesión
    </Button>
  );
}

export type AccountBrandFooterProps = {
  tagline?: string;
};

export function AccountBrandFooter({
  tagline = 'Tu hogar universitario',
}: AccountBrandFooterProps) {
  return (
    <div className="flex flex-col items-center justify-center pt-2 pb-2 text-center opacity-80">
      <BrandLogo size="sm" priority={false} />
      <p className="mt-1 text-[11px] font-semibold tracking-wider text-muted-foreground">
        {tagline}
      </p>
    </div>
  );
}
