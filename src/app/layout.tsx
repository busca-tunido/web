import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '@/components/providers';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Busca TuNido - Pensiones y Residencias Universitarias',
  description:
    'Plataforma para buscar, comparar y validar pensiones universitarias con precios transparentes y verificación comunitaria.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#09090b',
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="es" className={inter.className}>
      <body className="min-h-screen bg-zinc-950 text-zinc-50 antialiased selection:bg-emerald-500 selection:text-zinc-950">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
