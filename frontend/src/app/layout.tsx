import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import RootLayoutContent from './layout-content';
import { QueryProvider } from '@/components/providers/QueryProvider';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'SISTEM QC BERKAS',
  description: 'Document Quality Control System',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning className={inter.variable}>
      <body className={`antialiased bg-gray-50 overflow-x-hidden ${inter.className}`}>
        {/* Skip-to-content for keyboard/screen-reader users */}
        <a href="#main-content" className="skip-link">
          Lewati ke konten utama
        </a>
        <QueryProvider>
          <RootLayoutContent>{children}</RootLayoutContent>
        </QueryProvider>
      </body>
    </html>
  );
}
