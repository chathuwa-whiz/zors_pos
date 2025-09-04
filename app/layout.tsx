import type { Metadata } from 'next';
import './globals.css';
import Header from '@/app/components/Header';

export const metadata: Metadata = {
  title: 'ZORS',
  description: 'Zorscode Retail System',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Header />
        {children}
      </body>
    </html>
  );
}