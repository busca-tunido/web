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
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{if(typeof Element!=='undefined'&&Element.prototype.releasePointerCapture){var o=Element.prototype.releasePointerCapture;Element.prototype.releasePointerCapture=function(p){try{if(this.hasPointerCapture(p)){o.call(this,p)}}catch(err){}}}}catch(e){};try{var t=localStorage.getItem('tunido_theme');var d=t==='dark'||((!t||t==='system')&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(d){document.documentElement.classList.add('dark')}else{document.documentElement.classList.remove('dark')}}catch(e){}})()`,
          }}
        />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-primary selection:text-primary-foreground transition-colors duration-200">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
