import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const inter = Inter({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700', '800'] });

export const metadata: Metadata = {
  title: 'ZAPATOFLEX - Calzado Premium',
  description: 'Tu destino para calzado premium. Encuentra zapatos deportivos, casuales y formales con la mejor calidad y diseño.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <Providers>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
