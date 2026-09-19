import type { Metadata } from 'next';
import Link from 'next/link';
import { PublicNavHeader } from '@/components/common/public-nav-header';
import { Card, CardContent } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Términos de Servicio',
  description:
    'Términos y condiciones de uso de la plataforma BuscaTuNido para estudiantes y arrendadores.',
  alternates: {
    canonical: '/terms',
  },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors">
      <PublicNavHeader title="Términos de Servicio" />

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <header className="mb-8 text-center sm:text-left">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Términos de Servicio
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Última actualización: Septiembre 2026
          </p>
        </header>

        <Card className="border-border bg-card shadow-sm">
          <CardContent className="space-y-6 p-6 sm:p-8">
            <section className="space-y-2">
              <h2 className="text-lg font-bold text-foreground sm:text-xl">
                1. Propósito de la Plataforma
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                BuscaTuNido es un espacio colaborativo que facilita el encuentro entre estudiantes
                universitarios y arrendadores de pensiones y residencias en Chile. No somos
                corredores ni intermediarios en los contratos de arriendo; brindamos herramientas de
                visualización, cálculo de distancias y validación comunitaria.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-foreground sm:text-xl">
                2. Veracidad y Uso Responsable
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Toda información compartida debe ser veraz y transparente. Los arrendadores
                garantizan la fidelidad de los precios, fotos y servicios informados. Los
                estudiantes se comprometen a emitir reseñas fundadas en experiencias reales y
                respetuosas.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-foreground sm:text-xl">
                3. Responsabilidad y Acuerdos Particulares
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Los acuerdos de hospedaje, pagos y visitas presenciales son convenidos directamente
                entre estudiante y dueño. BuscaTuNido no percibe comisiones por arriendo ni asume
                responsabilidad por discrepancias contractuales entre las partes.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-foreground sm:text-xl">
                4. Convivencia y Modificaciones
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Nos reservamos la facultad de suspender cuentas o dar de baja publicaciones que
                vulneren la convivencia comunitaria, difundan información engañosa o infrinjan la
                legislación vigente.
              </p>
            </section>

            <div className="pt-4 border-t border-border flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground">
              <span>¿Tienes dudas sobre los términos?</span>
              <Link
                href="/contact"
                className="inline-flex min-h-12 items-center font-semibold text-primary underline-offset-4 hover:underline"
              >
                Contáctanos aquí
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
