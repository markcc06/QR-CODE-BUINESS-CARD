// SEO helpers (ESM, no TS types)

// Base site URL from env; default to local dev. Ensure no trailing slash.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/+$/, '');

// Build absolute URL from a path
export const absoluteUrl = (path = '/') => new URL(path, SITE_URL).toString();

// Default Open Graph payload for pages that don't override it
export const defaultOG = {
  title: 'Free Digital & QR Code Business Card Generator | CardSpark',
  description: 'Create free digital business cards online. Share via QR code, export vCards, and update anytime — no app, no paper, eco-friendly and instant.',
  url: SITE_URL,
  siteName: 'CardSpark',
  images: [{ url: absoluteUrl('/og-default.png'), width: 1200, height: 630 }],
};

// Default Twitter card settings
export const defaultTwitter = { card: 'summary_large_image' };