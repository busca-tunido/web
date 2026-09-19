import { HelpCircle, ShieldCheck } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { PublicNavHeader } from '@/components/common/public-nav-header';
import { Card, CardContent } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Preguntas Frecuentes',
  description:
    'Respuestas a dudas comunes sobre el funcionamiento, autenticación, mapa y roles en BuscaTuNido.',
  alternates: {
    canonical: '/faq',
  },
};

type FaqItem = {
  question: string;
  answer: string;
};

const FAQ_ITEMS: FaqItem[] = [
  {
    question: '¿Qué es BuscaTuNido?',
    answer:
      'Es una plataforma web colaborativa desarrollada para que estudiantes universitarios en Chile encuentren residencias y pensiones estudiantiles cercanas a sus campus, comparando precios reales, servicios incluidos y opiniones de otros estudiantes.',
  },
  {
    question: '¿Por qué se requiere inicio de sesión obligatorio para acceder a la plataforma?',
    answer:
      'Para proteger a la comunidad universitaria y evitar ofertas fraudulentas o reseñas falsas. La plataforma requiere validación mediante correo institucional para estudiantes y verificación de credenciales para los propietarios de los inmuebles.',
  },
  {
    question: '¿Cómo funciona la búsqueda interactiva y el mapa?',
    answer:
      'Puedes visualizar las opciones disponibles sobre un mapa georreferenciado, aplicar filtros por precio mensual, tipo de habitación (individual o compartida) y amenidades como baño privado, internet wifi o servicio de alimentación. Además, la plataforma calcula automáticamente la distancia estimada hacia tu casa de estudios.',
  },
  {
    question: '¿Cuál es la diferencia entre el rol Estudiante y el rol Dueño?',
    answer:
      'Los estudiantes pueden explorar pensiones, guardar favoritos, registrar historial de visitas y publicar valoraciones detalladas. Los dueños cuentan con un panel especializado para dar de alta sus residencias, actualizar disponibilidad y revisar propuestas de edición emitidas por la comunidad.',
  },
  {
    question: '¿Puedo sugerir correcciones si los datos de una pensión cambiaron?',
    answer:
      'Sí. Los estudiantes verificados pueden enviar sugerencias de edición sobre servicios, reglas de convivencia o números de contacto, las cuales son notificadas al dueño para mantener la información al día.',
  },
  {
    question: '¿BuscaTuNido cobra comisión por arriendo?',
    answer:
      'No. BuscaTuNido es una herramienta de acceso comunitario libre de comisiones de intermediación o cobros ocultos. El contrato y el pago se formalizan de manera directa entre el dueño y el estudiante.',
  },
];

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors">
      <PublicNavHeader title="Preguntas Frecuentes" />

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <header className="mb-8 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-3">
            <HelpCircle className="h-3.5 w-3.5" />
            <span>Centro de Ayuda</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Preguntas Frecuentes
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Todo lo que necesitas saber antes de ingresar y utilizar BuscaTuNido.
          </p>
        </header>

        <div className="space-y-4">
          {FAQ_ITEMS.map((item) => (
            <Card key={item.question} className="border-border bg-card shadow-sm transition-colors">
              <CardContent className="p-6">
                <h2 className="text-base font-bold text-foreground sm:text-lg">{item.question}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <section className="mt-10 rounded-2xl border border-border bg-muted/30 p-6 text-center sm:p-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-3">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-bold text-foreground">¿No encontraste lo que buscabas?</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Nuestro equipo está disponible para resolver dudas técnicas o asistirte con tu cuenta.
          </p>
          <div className="mt-4 flex justify-center">
            <Link
              href="/contact"
              className="inline-flex min-h-12 items-center justify-center rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground shadow transition hover:opacity-90 active:scale-[0.98]"
            >
              Ir a canales de contacto
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
