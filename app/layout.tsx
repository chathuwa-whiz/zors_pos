import type { Metadata } from 'next';
import './globals.css';
import Header from '@/app/components/Header';
import connectDB from "@/app/lib/mongodb";

export const metadata: Metadata = {
  title: 'ZORS',
  description: 'Zorscode Retail System',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await connectDB();
  return (
    <html lang="en">
      <body>
        <Header />
        {children}
      </body>
    </html>
  );
}