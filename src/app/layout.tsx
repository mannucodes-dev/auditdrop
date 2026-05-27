import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
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
      <body className="min-h-full flex flex-col bg-slate-950 text-white" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
