// frontend/app/layout.tsx
import type { Metadata } from 'next';
import Header from '@/components/Header';
import './globals.css';

export const metadata: Metadata = {
  title: 'Pizzaria Veneto - Delivery Online',
  description: 'Peça sua pizza online e ganhe 5% de cashback em cada compra!',
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#dc2626" />
      </head>
      <body>
        <Header />
        <main className="min-h-screen bg-gray-100">
          {children}
        </main>
        <footer className="bg-black text-white text-center py-6 mt-12">
          <div className="container-custom">
            <p className="mb-2">&copy; 2026 Pizzaria Veneto. Todos os direitos reservados.</p>
            <p className="text-gray-400 text-sm">
              Desenvolvido com ❤️ para melhorar sua experiência
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}