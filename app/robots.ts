// app/robots.ts
// Stable robots configuration for SEO
import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/' },
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
  };
}
