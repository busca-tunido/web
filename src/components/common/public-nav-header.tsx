import { ArrowLeft, LogIn } from 'lucide-react';
import Link from 'next/link';
import { BrandLogo } from '@/components/ui/brand-logo';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type PublicNavHeaderProps = {
  title?: string;
};

export function PublicNavHeader({ title }: PublicNavHeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex h-12 w-12 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Volver al portal principal"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <Link href="/" className="flex items-center gap-2">
            <BrandLogo size="sm" />
          </Link>
        </div>

        {title && (
          <span className="hidden text-sm font-semibold text-muted-foreground sm:inline-block">
            {title}
          </span>
        )}

        <div className="flex items-center gap-2">
          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: 'default' }),
              'min-h-12 px-4 font-semibold text-primary-foreground shadow-sm flex items-center gap-2',
            )}
          >
            <LogIn className="h-4 w-4" />
            <span>Iniciar sesión</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
