import type { Metadata } from 'next';
import './globals.css';
import RootLayoutContent from './layout-content';
import { QueryProvider } from '@/components/providers/QueryProvider';

export const metadata: Metadata = {
  title: 'SISTEM QC BERKAS',
  description: 'Document Quality Control System',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="antialiased bg-gray-50 overflow-x-hidden">
        <QueryProvider>
          <RootLayoutContent>{children}</RootLayoutContent>
        </QueryProvider>
      </body>
    </html>
  );
}
