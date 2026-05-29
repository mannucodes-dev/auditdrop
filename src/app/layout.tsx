import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ToastProvider } from '@/components/ui/Toast';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'AuditDrop – Website Audit Reports for Freelancers',
  description:
    'Turn any business URL into a professional website audit report. Share it on WhatsApp and convert cold leads into paying clients.',
  openGraph: {
    title: 'AuditDrop – Website Audit Reports for Freelancers',
    description:
      'Turn any business URL into a professional website audit report. Share it on WhatsApp and convert cold leads into paying clients.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-bg-primary text-text-primary font-sans" suppressHydrationWarning>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
