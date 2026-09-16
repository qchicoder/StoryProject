import type { Metadata } from 'next';
import { Inter, Literata } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
  variable: '--font-inter',
});

const literata = Literata({
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
  variable: '--font-literata',
});

export const metadata: Metadata = {
  title: 'Văn Đàn — Nền Tảng Đọc Tiểu Thuyết & Truyện Tranh Đương Đại',
  description: 'Khám phá hàng ngàn tiểu thuyết dã sử, truyện tranh webtoon độc quyền sắc nét. Nền tảng đọc sách số tinh tế tôn vinh văn học Việt.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={`${inter.variable} ${literata.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#fbf9f9] text-[#1b1c1c] min-h-screen flex flex-col antialiased">
        <Header />
        <main className="flex-1 pt-16">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
