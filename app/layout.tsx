// app/layout.tsx — root layout only
import type { Metadata } from 'next'
import React from 'react';
import './globals.css'
import Script from 'next/script'
import CookieConsent from '@/components/CookieConsent';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.cardspark.xyz'
const gaId = process.env.NEXT_PUBLIC_GA_ID

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
        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script
              id="ga4-init"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${gaId}', { anonymize_ip: true });
                `,
              }}
            />
          </>
        )}
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
          {children}
        </div>
        <CookieConsent />
      </body>
    </html>
  )
}
