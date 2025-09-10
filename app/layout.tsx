// app/layout.tsx — root layout only
import type { Metadata } from 'next'
import React from 'react';
import './globals.css'

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'CardSpark — QR Digital Business Card',
    template: '%s · CardSpark',
  },
  description:
    'Create a never-expiring digital business card with QR code and vCard. Update anytime and share instantly.',
  openGraph: {
    type: 'website',
    url: siteUrl,
    siteName: 'CardSpark',
    title: 'CardSpark — QR Digital Business Card',
    description:
      'Create a never-expiring digital business card with QR code and vCard. Update anytime and share instantly.',
    images: ['/opengraph-image'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CardSpark — QR Digital Business Card',
    description:
      'Create a never-expiring digital business card with QR code and vCard. Update anytime and share instantly.',
    images: ['/opengraph-image'],
  },
  alternates: {
    canonical: siteUrl,
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
