import type { Metadata } from 'next';
import Link from 'next/link';
import { PublicNavHeader } from '@/components/common/public-nav-header';
import { Card, CardContent } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Política de Privacidad',
  description:
    'Políticas de privacidad y protección de datos personales de los usuarios en BuscaTuNido.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors">
      <PublicNavHeader title="Política de Privacidad" />

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <header className="mb-8 text-center sm:text-left">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Política de Privacidad
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Última actualización: Septiembre 2026
          </p>
        </header>

        <Card className="border-border bg-card shadow-sm">
          <CardContent className="space-y-6 p-6 sm:p-8">
            <section className="space-y-2">
              <h2 className="text-lg font-bold text-foreground sm:text-xl">
                1. Información que Recopilamos
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Solicitamos únicamente los datos estrictamente necesarios para el funcionamiento de
                la plataforma: dirección de correo electrónico institucional o personal, nombre o
                alias de usuario, y preferencias de guardado (favoritos e historial).
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-foreground sm:text-xl">
                2. Finalidad y Uso de Datos
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Tu información se utiliza exclusivamente para validar tu pertenencia a la comunidad
                estudiantil o tu condición de arrendador, permitirte calificar pensiones y
                personalizar las recomendaciones de búsqueda por cercanía universitaria.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-foreground sm:text-xl">
                3. Confidencialidad y Terceros
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Bajo ninguna circunstancia vendemos, arrendamos ni comercializamos tus datos
                personales con terceros para fines publicitarios. Las coordenadas de ubicación son
                procesadas de manera anónima para calcular distancias a los campus.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-foreground sm:text-xl">
                4. Control y Eliminación de tu Cuenta
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Conservas en todo momento el derecho a consultar, corregir o solicitar la
                eliminación definitiva de tu cuenta y los registros asociados a través de nuestros
                canales de contacto.
              </p>
            </section>

            <div className="pt-4 border-t border-border flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground">
              <span>¿Consultas sobre el tratamiento de tus datos?</span>
              <Link
                href="/contact"
                className="inline-flex min-h-12 items-center font-semibold text-primary underline-offset-4 hover:underline"
              >
                Escríbenos a soporte
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
