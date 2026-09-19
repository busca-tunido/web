import { Compass, HelpCircle, Home, Mail } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { PublicNavHeader } from '@/components/common/public-nav-header';
import { Card, CardContent } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Página no encontrada - 404',
  description: 'La página que buscas no existe o ha sido trasladada.',
};

type QuickLink = {
  href: string;
  title: string;
  description: string;
  icon: typeof Home;
};

const QUICK_LINKS: QuickLink[] = [
  {
    href: '/',
    title: 'Ir al Inicio',
    description: 'Explora el mapa y busca pensiones universitarias.',
    icon: Home,
  },
  {
    href: '/faq',
    title: 'Preguntas Frecuentes',
    description: 'Resuelve tus dudas sobre el funcionamiento de BuscaTuNido.',
    icon: HelpCircle,
  },
  {
    href: '/contact',
    title: 'Canales de Contacto',
    description: 'Comunícate con nuestro equipo si crees que es un error.',
    icon: Mail,
  },
];

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors">
      <PublicNavHeader title="404 - No encontrado" />

      <main className="mx-auto flex max-w-3xl flex-col items-center px-4 py-12 text-center sm:px-6 sm:py-16">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
          <Compass className="h-10 w-10 animate-pulse" />
        </div>

        <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
          Error 404
        </span>

        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Parece que este nido no está en el mapa
        </h1>

        <p className="mt-3 max-w-lg text-sm text-muted-foreground sm:text-base">
          La dirección a la que intentas acceder no existe, fue cambiada de ubicación o ya no está disponible para estudiantes.
        </p>

        <div className="mt-8 grid w-full gap-4 text-left sm:grid-cols-3">
          {QUICK_LINKS.map((item) => {
            const Icon = item.icon;
            return (
              <Card
                key={item.href}
                className="border-border bg-card shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
              >
                <CardContent className="p-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="mt-3 text-base font-bold text-foreground">
                    {item.title}
                  </h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {item.description}
                  </p>
                  <Link
                    href={item.href}
                    className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-secondary px-4 text-xs font-semibold text-secondary-foreground transition hover:bg-secondary/80 active:scale-[0.98]"
                  >
                    Acceder
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-10">
          <Link
            href="/"
            className="inline-flex min-h-12 items-center justify-center rounded-lg bg-primary px-8 text-sm font-semibold text-primary-foreground shadow transition hover:opacity-90 active:scale-[0.98]"
          >
            Volver a la página principal
          </Link>
        </div>
      </main>
    </div>
  );
}
