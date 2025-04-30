import './globals.css';
import { Metadata } from 'next';
import { Providers } from '@/components/Providers';
import { BannerAdPlaceholder } from '@/components/BannerAdPlaceholder';

export const metadata: Metadata = {
  title: 'JemPH Cloud',
  description: 'Personal Cloud Storage',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="transition-colors duration-200 bg-[#141414]">
        <BannerAdPlaceholder />
        <Providers>
          {children}
        </Providers>
        <div className="fixed bottom-0 left-0 w-full z-50">
          <BannerAdPlaceholder />
        </div>
      </body>
    </html>
  );
}