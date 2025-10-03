import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Snippy',
  description: 'Tiny snippy built to make sharing code snippets easy.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100`}>
        <div className="min-h-dvh grid grid-rows-[auto_1fr_auto]">
          <nav className="border-b border-black/10 dark:border-white/15 backdrop-blur sticky top-0 z-10">
            <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
              <a href="/" className="font-semibold">Snippy</a>
             </div>
          </nav>
          <main className="px-5">{children}</main>
        </div>
      </body>
    </html>
  );
}
