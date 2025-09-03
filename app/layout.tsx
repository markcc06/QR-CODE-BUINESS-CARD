import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], preload: true, display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://cardspark.example.com'),
  title: {
    default: 'CardSpark | QR Code Business Cards',
    template: '%s | CardSpark'
  },
  description: 'Generate beautiful QR code business cards with CardSpark',
  icons: [{ rel: 'icon', url: '/favicon.svg' }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}