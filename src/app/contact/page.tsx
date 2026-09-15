import { ExternalLink, Mail, MessageSquare } from 'lucide-react';
import type { Metadata } from 'next';
import type { ComponentType } from 'react';
import { PublicNavHeader } from '@/components/common/public-nav-header';
import { Card, CardContent } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Contacto',
  description:
    'Ponte en contacto con el creador y equipo de desarrollo de BuscaTuNido por correo, GitHub o LinkedIn.',
};

type SvgIconProps = {
  className?: string;
};

function GithubIcon({ className }: SvgIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

function LinkedinIcon({ className }: SvgIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

type ContactChannel = {
  title: string;
  description: string;
  label: string;
  href: string;
  icon: ComponentType<SvgIconProps>;
  isExternal?: boolean;
};

const CONTACT_CHANNELS: ContactChannel[] = [
  {
    title: 'Correo Electrónico',
    description: 'Para consultas directas, sugerencias, soporte o reporte de inconvenientes.',
    label: 'email.joseleiva@gmail.com',
    href: 'mailto:email.joseleiva@gmail.com',
    icon: Mail,
  },
  {
    title: 'GitHub',
    description: 'Revisa el código fuente del proyecto, reporta issues y conoce el roadmap.',
    label: 'github.com/JoseIgnacioGC',
    href: 'https://github.com/JoseIgnacioGC',
    icon: GithubIcon,
    isExternal: true,
  },
  {
    title: 'LinkedIn',
    description: 'Perfil profesional y red de contactos para colaboraciones institucionales.',
    label: 'in/joseignaciogc',
    href: 'https://www.linkedin.com/in/joseignaciogc/',
    icon: LinkedinIcon,
    isExternal: true,
  },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors">
      <PublicNavHeader title="Contacto" />

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <header className="mb-8 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-3">
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Canales Oficiales</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Contacto
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            ¿Tienes sugerencias, dudas o requieres soporte sobre BuscaTuNido? Comunícate por
            cualquiera de nuestros canales oficiales.
          </p>
        </header>

        <div className="grid gap-4 sm:grid-cols-1">
          {CONTACT_CHANNELS.map((channel) => {
            const Icon = channel.icon;
            return (
              <Card
                key={channel.title}
                className="border-border bg-card shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
              >
                <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-foreground sm:text-lg">
                        {channel.title}
                      </h2>
                      <p className="text-xs text-muted-foreground sm:text-sm">
                        {channel.description}
                      </p>
                    </div>
                  </div>

                  <a
                    href={channel.href}
                    target={channel.isExternal ? '_blank' : undefined}
                    rel={channel.isExternal ? 'noopener noreferrer' : undefined}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted hover:text-primary active:scale-[0.98]"
                  >
                    <span>{channel.label}</span>
                    {channel.isExternal && <ExternalLink className="h-4 w-4 shrink-0" />}
                  </a>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
}
