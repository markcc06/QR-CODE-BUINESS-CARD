// app/layout.tsx — root layout only
import type { Metadata } from 'next'
import React from 'react';
import './globals.css'

const vercelUrl = process.env.NEXT_PUBLIC_VERCEL_URL || process.env.VERCEL_URL
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (vercelUrl ? `https://${vercelUrl}` : 'http://localhost:3000')

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Free Digital & QR Code Business Card Generator | CardSpark',
    template: '%s · CardSpark',
  },
  description:
    'Create free digital business cards online. Share via QR code, export vCards, and update anytime — no app, no paper, eco-friendly and instant.',
  openGraph: {
    type: 'website',
    url: siteUrl,
    siteName: 'CardSpark',
    title: 'Free Digital & QR Code Business Card Generator | CardSpark',
    description:
      'Create free digital business cards online. Share via QR code, export vCards, and update anytime — no app, no paper, eco-friendly and instant.',
    images: ['/opengraph-image'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Digital & QR Code Business Card Generator | CardSpark',
    description:
      'Create free digital business cards online. Share via QR code, export vCards, and update anytime — no app, no paper, eco-friendly and instant.',
    images: ['/opengraph-image'],
  },
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: ['/favicon.ico', { url: '/favicon.svg', type: 'image/svg+xml' }],
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="robots" content="index, follow" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body>{children}</body>
    </html>
  )
}
