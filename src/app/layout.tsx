import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '@/components/providers';
import { RootJsonLd } from '@/components/seo/json-ld';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://buscatunido.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: 'BuscaTuNido - Pensiones y Residencias Universitarias en Chile',
    template: '%s | BuscaTuNido',
  },
  description:
    'Encuentra tu pensión o residencia universitaria ideal en Chile. Compara precios transparentes, cercanía a campus y evaluaciones verificadas de estudiantes.',
  keywords: [
    'pensiones universitarias',
    'residencias estudiantiles',
    'arriendo estudiantes chile',
    'alojamiento santiago',
    'pensiones valparaiso',
    'pensiones concepcion',
    'pensiones valdivia',
    'alojamiento universitario chile',
  ],
  authors: [{ name: 'BuscaTuNido', url: APP_URL }],
  creator: 'BuscaTuNido',
  publisher: 'BuscaTuNido',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'es_CL',
    url: APP_URL,
    siteName: 'BuscaTuNido',
    title: 'BuscaTuNido - Pensiones y Residencias Universitarias en Chile',
    description:
      'Plataforma comunitaria para buscar, comparar y validar pensiones universitarias con precios transparentes y verificación estudiantil.',
    images: [
      {
        url: '/assets/map-dark.png',
        width: 1200,
        height: 630,
        alt: 'BuscaTuNido - Plataforma de Pensiones Universitarias',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BuscaTuNido - Pensiones Universitarias en Chile',
    description:
      'Plataforma comunitaria de arriendo y verificación para estudiantes universitarios en Chile.',
    images: ['/assets/map-dark.png'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#1C1A17' },
    { media: '(prefers-color-scheme: light)', color: '#FBF9F6' },
  ],
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="es" suppressHydrationWarning className={inter.className}>
      <head>
        <script src="/theme-init.js" />
        <RootJsonLd />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-primary selection:text-primary-foreground transition-colors duration-200">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
