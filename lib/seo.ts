

// SEO helpers (ESM, no TS types)

// Base site URL from env; default to local dev. Ensure no trailing slash.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/+$/, '');

// Build absolute URL from a path
export const absoluteUrl = (path = '/') => new URL(path, SITE_URL).toString();

// Default Open Graph payload for pages that don't override it
export const defaultOG = {
  title: 'Free Digital Business Card & QR Code Business Card Generator | CardSpark',
  description: 'Design your free digital business card online in minutes. Generate QR code business cards, vCard files, and mobile-friendly landing pages for networking and teams.',
  url: SITE_URL,
  siteName: 'CardSpark',
  images: [{ url: absoluteUrl('/og-default.png'), width: 1200, height: 630 }],
};

// Default Twitter card settings
export const defaultTwitter = { card: 'summary_large_image' };