import type { Metadata } from 'next';
import { Playfair_Display, DM_Sans, DM_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const dmMono = DM_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Luminous — YouTube AI Summarizer',
  description:
    'Paste any YouTube link. Get AI-powered summaries, key insights, and an interactive Q&A powered by Ollama.',
  keywords: ['YouTube', 'AI', 'summarizer', 'transcript', 'Ollama', 'Q&A'],
  icons: { icon: '/favicon.svg' },
  openGraph: {
    title: 'Luminous — YouTube AI Summarizer',
    description: 'AI-powered YouTube video summaries and interactive Q&A',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${playfair.variable} ${dmSans.variable} ${dmMono.variable} font-body antialiased`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
