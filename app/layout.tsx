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
    default: 'Free Digital Business Card & QR Code Business Card Generator | CardSpark',
    template: '%s · CardSpark',
  },
  description:
    'Design your free digital business card online in minutes. Generate QR code business cards, vCard files, and mobile‑friendly landing pages for networking and teams.',
  openGraph: {
    type: 'website',
    url: siteUrl,
    siteName: 'CardSpark',
    title: 'Free Digital Business Card & QR Code Business Card Generator | CardSpark',
    description:
      'Design your free digital business card online in minutes. Generate QR code business cards, vCard files, and mobile‑friendly landing pages for networking and teams.',
    images: ['/opengraph-image'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Digital Business Card & QR Code Business Card Generator | CardSpark',
    description:
      'Design your free digital business card online in minutes. Generate QR code business cards, vCard files, and mobile‑friendly landing pages for networking and teams.',
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
